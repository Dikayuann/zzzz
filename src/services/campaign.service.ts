import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import {
    CreateCampaignInput,
    UpdateCampaignInput,
    CampaignQueryInput,
    ScheduleCampaignInput,
} from "../schemas/campaign.schema";

/**
 * Normalisasi channel identifier:
 * Jika 'whatsapp', diarahkan ke 'whatsapp_qr'.
 */
export const normalizeChannel = (channel: string): string => {
    if (channel === "whatsapp") return "whatsapp_qr";
    return channel;
};

/**
 * Memetakan channel campaign ke jenis channel consent:
 * whatsapp_qr / whatsapp_business -> 'whatsapp'
 * telegram -> 'telegram'
 * email -> 'email'
 */
const getConsentChannel = (channel: string): string => {
    if (channel.startsWith("whatsapp")) return "whatsapp";
    return channel;
};

/**
 * Filter audience berdasarkan tipe (all / list / tag),
 * serta mengecek kelayakan kontak pada channel tersebut (nomor WA / Chat ID / Email)
 * dan kepatuhan consent (tidak opted-out).
 */
export const expandAudience = async (
    tenantId: number,
    audienceType: string,
    audienceRef: string | null | undefined,
    channel: string
) => {
    const normalizedChannel = normalizeChannel(channel);
    const consentChannel = getConsentChannel(normalizedChannel);

    let contacts: Array<{
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        whatsappNumber: string | null;
        teleChatId: string | null;
        status: string;
        consents: Array<{ channel: string; status: string }>;
    }> = [];

    if (audienceType === "list") {
        if (!audienceRef) {
            throw new AppError("List audience belum ditentukan", 400);
        }
        // Parsing ref: e.g. "list:5" atau "5"
        const listId = parseInt(audienceRef.replace(/[^0-9]/g, ""), 10);
        if (isNaN(listId)) {
            throw new AppError("Format list ID pada audience tidak valid", 400);
        }

        const listContacts = await prisma.listContact.findMany({
            where: {
                listId,
                list: { tenantId },
                contact: {
                    tenantId,
                    status: "active",
                    deletedAt: null,
                },
            },
            include: {
                contact: {
                    include: {
                        consents: {
                            where: { channel: consentChannel },
                        },
                    },
                },
            },
        });

        contacts = listContacts.map((lc) => lc.contact);
    } else if (audienceType === "tag") {
        if (!audienceRef) {
            throw new AppError("Tag audience belum ditentukan", 400);
        }
        const tagId = parseInt(audienceRef.replace(/[^0-9]/g, ""), 10);
        if (isNaN(tagId)) {
            throw new AppError("Format tag ID pada audience tidak valid", 400);
        }

        const contactTags = await prisma.contactTag.findMany({
            where: {
                tagId,
                tag: { tenantId },
                contact: {
                    tenantId,
                    status: "active",
                    deletedAt: null,
                },
            },
            include: {
                contact: {
                    include: {
                        consents: {
                            where: { channel: consentChannel },
                        },
                    },
                },
            },
        });

        contacts = contactTags.map((ct) => ct.contact);
    } else {
        // "all" - Seluruh kontak aktif milik tenant
        contacts = await prisma.contact.findMany({
            where: {
                tenantId,
                status: "active",
                deletedAt: null,
            },
            include: {
                consents: {
                    where: { channel: consentChannel },
                },
            },
        });
    }

    // 1. Filter out kontak yang status consent = "opted_out"
    const withoutOptedOut = contacts.filter((c) => {
        const consent = c.consents.find((cs) => cs.channel === consentChannel);
        return consent ? consent.status !== "opted_out" : true;
    });

    // 2. Filter hanya kontak yang memiliki nomor/id tujuan yang valid untuk channel terkait
    const qualifiedContacts = withoutOptedOut.filter((c) => {
        if (consentChannel === "whatsapp") {
            const hasPhone = (c.whatsappNumber && c.whatsappNumber.trim().length > 0) ||
                             (c.phone && c.phone.trim().length > 0);
            return !!hasPhone;
        }
        if (consentChannel === "telegram") {
            return !!(c.teleChatId && c.teleChatId.trim().length > 0);
        }
        if (consentChannel === "email") {
            return !!(c.email && c.email.trim().length > 0);
        }
        return false;
    });

    // 3. De-duplicate berdasarkan ID kontak
    const uniqueMap = new Map<number, (typeof qualifiedContacts)[0]>();
    for (const c of qualifiedContacts) {
        uniqueMap.set(c.id, c);
    }

    return Array.from(uniqueMap.values());
};

/**
 * Membuat Campaign baru (default status 'draft')
 */
export const createCampaign = async (
    tenantId: number,
    userId: number,
    input: CreateCampaignInput
) => {
    const channel = normalizeChannel(input.channel);

    // Validasi template jika diberikan
    let templateVersionId = input.templateVersionId;
    if (input.templateId) {
        const template = await prisma.template.findFirst({
            where: { id: input.templateId, tenantId, deletedAt: null },
            include: { versions: { orderBy: { versionNo: "desc" }, take: 1 } },
        });

        if (!template) {
            throw new AppError("Template tidak ditemukan", 404);
        }

        if (!templateVersionId && template.versions.length > 0) {
            templateVersionId = template.versions[0].id;
        }
    }

    // Hitung estimasi penerima
    let totalRecipients = 0;
    try {
        const audience = await expandAudience(
            tenantId,
            input.audienceType || "all",
            input.audienceRef,
            channel
        );
        totalRecipients = audience.length;
    } catch {
        totalRecipients = 0;
    }

    const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;
    const initialStatus = scheduledDate && scheduledDate.getTime() > Date.now() ? "scheduled" : "draft";

    const campaign = await prisma.campaign.create({
        data: {
            tenantId,
            ownerUserId: userId,
            name: input.name,
            channel,
            templateId: input.templateId || null,
            templateVersionId: templateVersionId || null,
            audienceType: input.audienceType || "all",
            audienceRef: input.audienceRef || null,
            scheduledAt: scheduledDate,
            recurrenceRule: input.recurrenceRule || null,
            status: initialStatus,
            totalRecipients,
        },
        include: {
            template: { select: { id: true, name: true, channelMode: true } },
            templateVersion: { select: { id: true, versionNo: true, subject: true } },
            owner: { select: { id: true, name: true, email: true } },
        },
    });

    await logAudit({
        tenantId,
        actorId: userId,
        action: "create",
        entityType: "campaign",
        entityId: campaign.id,
        details: { name: campaign.name, channel: campaign.channel, status: campaign.status },
    });

    return campaign;
};

/**
 * Mengambil daftar campaign dengan filter dan paginasi
 */
export const getCampaigns = async (tenantId: number, query: CampaignQueryInput) => {
    const { search, channel, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (status) {
        where.status = status;
    }
    if (channel) {
        where.channel = normalizeChannel(channel);
    }
    if (search) {
        where.name = { contains: search };
    }

    const [total, data] = await Promise.all([
        prisma.campaign.count({ where }),
        prisma.campaign.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                template: { select: { id: true, name: true, channelMode: true } },
                templateVersion: { select: { id: true, versionNo: true } },
                owner: { select: { id: true, name: true, email: true } },
            },
        }),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

/**
 * Mengambil detail campaign berdasarkan ID
 */
export const getCampaignById = async (tenantId: number, campaignId: number) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: {
            template: {
                include: {
                    versions: { orderBy: { versionNo: "desc" }, take: 1 },
                },
            },
            templateVersion: true,
            owner: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
            _count: { select: { recipients: true } },
        },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    return campaign;
};

/**
 * Mengubah detail campaign (hanya draft atau scheduled yang boleh diubah)
 */
export const updateCampaign = async (
    tenantId: number,
    campaignId: number,
    userId: number,
    input: UpdateCampaignInput
) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    if (campaign.status === "sending" || campaign.status === "sent") {
        throw new AppError("Campaign yang sedang berjalan atau sudah selesai tidak dapat diubah", 400);
    }

    const channel = input.channel ? normalizeChannel(input.channel) : campaign.channel;
    const audienceType = input.audienceType !== undefined ? input.audienceType : campaign.audienceType;
    const audienceRef = input.audienceRef !== undefined ? input.audienceRef : campaign.audienceRef;

    let templateVersionId = input.templateVersionId;
    if (input.templateId) {
        const template = await prisma.template.findFirst({
            where: { id: input.templateId, tenantId, deletedAt: null },
            include: { versions: { orderBy: { versionNo: "desc" }, take: 1 } },
        });

        if (!template) {
            throw new AppError("Template tidak ditemukan", 404);
        }

        if (!templateVersionId && template.versions.length > 0) {
            templateVersionId = template.versions[0].id;
        }
    }

    // Hitung ulang estimasi audience jika tipe/ref/channel diubah
    let totalRecipients = campaign.totalRecipients;
    try {
        const audience = await expandAudience(
            tenantId,
            audienceType || "all",
            audienceRef,
            channel
        );
        totalRecipients = audience.length;
    } catch {
        // Tetap gunakan angka lama jika lookup gagal
    }

    const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            name: input.name ?? campaign.name,
            channel,
            templateId: input.templateId !== undefined ? input.templateId : campaign.templateId,
            templateVersionId: templateVersionId !== undefined ? templateVersionId : campaign.templateVersionId,
            audienceType,
            audienceRef,
            scheduledAt: input.scheduledAt !== undefined ? (input.scheduledAt ? new Date(input.scheduledAt) : null) : campaign.scheduledAt,
            recurrenceRule: input.recurrenceRule !== undefined ? input.recurrenceRule : campaign.recurrenceRule,
            totalRecipients,
        },
        include: {
            template: { select: { id: true, name: true, channelMode: true } },
            templateVersion: { select: { id: true, versionNo: true } },
            owner: { select: { id: true, name: true, email: true } },
        },
    });

    await logAudit({
        tenantId,
        actorId: userId,
        action: "update",
        entityType: "campaign",
        entityId: campaignId,
        details: { changes: input },
    });

    return updated;
};

/**
 * Menjadwalkan atau menyiapkan campaign untuk broadcast
 */
export const scheduleCampaign = async (
    tenantId: number,
    campaignId: number,
    userId: number,
    input?: ScheduleCampaignInput
) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: { template: true },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    if (campaign.status === "sending" || campaign.status === "sent") {
        throw new AppError("Campaign sudah sedang berjalan atau selesai", 400);
    }

    if (!campaign.templateId) {
        throw new AppError("Pilih template terlebih dahulu sebelum menjadwalkan campaign", 400);
    }

    // Expand kontak yang memenuhi syarat
    const audience = await expandAudience(
        tenantId,
        campaign.audienceType || "all",
        campaign.audienceRef,
        campaign.channel
    );

    if (audience.length === 0) {
        throw new AppError("Audience campaign kosong atau tidak ada kontak yang memenuhi syarat saluran", 400);
    }

    const scheduledDate = input?.scheduledAt ? new Date(input.scheduledAt) : campaign.scheduledAt || new Date();

    // Buat batch CampaignRecipient dengan status 'queued' (idempotent / skip duplicates)
    const recipientRecords = audience.map((c) => ({
        campaignId: campaign.id,
        contactId: c.id,
        channel: campaign.channel,
        status: "queued",
    }));

    await prisma.campaignRecipient.createMany({
        data: recipientRecords,
        skipDuplicates: true,
    });

    const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            status: "scheduled",
            scheduledAt: scheduledDate,
            totalRecipients: audience.length,
        },
        include: {
            template: { select: { id: true, name: true } },
            owner: { select: { id: true, name: true, email: true } },
        },
    });

    await logAudit({
        tenantId,
        actorId: userId,
        action: "schedule",
        entityType: "campaign",
        entityId: campaignId,
        details: { scheduledAt: scheduledDate, totalRecipients: audience.length },
    });

    return updated;
};

/**
 * Membatalkan jadwal campaign
 */
export const cancelCampaign = async (tenantId: number, campaignId: number, userId: number) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    if (campaign.status === "sent") {
        throw new AppError("Campaign sudah selesai dan tidak dapat dibatalkan", 400);
    }

    const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "cancelled" },
    });

    await logAudit({
        tenantId,
        actorId: userId,
        action: "cancel",
        entityType: "campaign",
        entityId: campaignId,
    });

    return updated;
};

/**
 * Menghapus campaign (hanya draft, cancelled, atau failed)
 */
export const deleteCampaign = async (tenantId: number, campaignId: number, userId: number) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    if (campaign.status === "sending") {
        throw new AppError("Tidak dapat menghapus campaign yang sedang dalam proses pengiriman", 400);
    }

    await prisma.campaign.delete({
        where: { id: campaignId },
    });

    await logAudit({
        tenantId,
        actorId: userId,
        action: "delete",
        entityType: "campaign",
        entityId: campaignId,
        details: { name: campaign.name },
    });

    return { message: "Campaign berhasil dihapus" };
};

/**
 * Mengambil daftar recipient kontak beserta delivery log-nya untuk monitoring campaign
 */
export const getCampaignRecipients = async (
    tenantId: number,
    campaignId: number,
    query: { status?: string; search?: string; page?: number; limit?: number }
) => {
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
    });

    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = { campaignId };
    if (query.status) {
        where.status = query.status;
    }
    if (query.search) {
        where.contact = {
            OR: [
                { name: { contains: query.search } },
                { phone: { contains: query.search } },
                { whatsappNumber: { contains: query.search } },
                { email: { contains: query.search } },
            ],
        };
    }

    const [total, data] = await Promise.all([
        prisma.campaignRecipient.count({ where }),
        prisma.campaignRecipient.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                contact: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        whatsappNumber: true,
                        email: true,
                        teleChatId: true,
                    },
                },
                deliveryLogs: {
                    orderBy: { eventAt: "desc" },
                    take: 3,
                },
            },
        }),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};
