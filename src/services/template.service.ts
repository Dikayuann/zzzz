import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { applyMergeTags } from "../lib/merge-tags";
import { AppError } from "../shared/errors/AppError";
import {
    CreateTemplateInput,
    UpdateTemplateInput,
    CreateTemplateVersionInput,
    PreviewTemplateInput,
} from "../schemas/template.schema";

export const getTemplates = async (tenantId: number) => {
    const templates = await prisma.template.findMany({
        where: {
            tenantId,
            deletedAt: null,
        },
        include: {
            versions: {
                orderBy: { versionNo: "desc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return templates;
};

export const getTemplateById = async (tenantId: number, templateId: number) => {
    const template = await prisma.template.findFirst({
        where: { id: templateId, tenantId, deletedAt: null },
        include: { versions: { orderBy: { versionNo: "desc" } } }
    });
    if (!template) {
        throw new AppError("Template tidak ditemukan", 404);
    }
    return template;
};

export const createTemplate = async (tenantId: number, actorId: number, data: CreateTemplateInput) => {
    const existing = await prisma.template.findFirst({
        where: { tenantId, name: data.name, deletedAt: null },
    });
    if (existing) {
        throw new AppError("Nama template sudah digunakan", 409);
    }

    const template = await prisma.template.create({
        data: {
            tenantId,
            name: data.name,
            channelMode: data.channelMode,
            category: data.category,
            versions: {
                create: {
                    versionNo: 1,
                    subject: data.subject,
                    preheader: data.preheader,
                    contentJson: data.contentJson,
                    contentHtml: data.contentHtml,
                    contentWhatsapp: data.contentWhatsapp,
                    contentTelegram: data.contentTelegram,
                    createdById: actorId,
                },
            },
        },
        include: { versions: true }
    });

    await logAudit({
        tenantId,
        actorId,
        action: "CREATE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: template.id,
        details: { name: template.name, channelMode: template.channelMode }
    });

    return template;
};

export const updateTemplate = async (tenantId: number, actorId: number, templateId: number, data: UpdateTemplateInput) => {
    // cek apakah template ada
    await getTemplateById(tenantId, templateId);

    // jika nama diubah apakah nama baru sama dengan template lain
    if (data.name) {
        const existing = await prisma.template.findFirst({
            where: {
                tenantId,
                name: data.name,
                id: { not: templateId },
                deletedAt: null,
            },
        });
        if (existing) {
            throw new AppError("Nama template sudah digunakan", 409);
        }
    }

    const updated = await prisma.template.update({
        where: { id: templateId },
        data: {
            name: data.name,
            channelMode: data.channelMode,
            category: data.category,
        },
    });

    // audit log
    await logAudit({
        tenantId,
        actorId,
        action: "UPDATE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: updated.id,
        details: data,
    });

    return updated;
};

export const createTemplateVersion = async (tenantId: number, actorId: number, templateId: number, data: CreateTemplateVersionInput) => {
    // cek template milik tenant
    await getTemplateById(tenantId, templateId);

    // cek versi terakhir menentukan version
    const lastVersion = await prisma.templateVersion.findFirst({
        where: { templateId },
        orderBy: { versionNo: "desc" },
    });

    const nextVersionNo = (lastVersion?.versionNo ?? 0) + 1;

    // membuat versi baru
    const newVersion = await prisma.templateVersion.create({
        data: {
            templateId,
            versionNo: nextVersionNo,
            subject: data.subject,
            preheader: data.preheader,
            contentJson: data.contentJson,
            contentHtml: data.contentHtml,
            contentWhatsapp: data.contentWhatsapp,
            contentTelegram: data.contentTelegram,
            createdById: actorId,
        },
    });

    // audit log
    await logAudit({
        tenantId,
        actorId,
        action: "CREATE_TEMPLATE_VERSION",
        entityType: "TEMPLATE_VERSION",
        entityId: newVersion.id,
        details: data,
    });

    return newVersion;
};

export const deleteTemplate = async (tenantId: number, actorId: number, templateId: number) => {
    const existing = await getTemplateById(tenantId, templateId);

    const deleted = await prisma.template.update({
        where: { id: templateId },
        data: { deletedAt: new Date() },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "DELETE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: templateId,
        details: { name: deleted.name },
    });

    return { message: "Template berhasil dihapus" };
};

export const previewTemplate = async (tenantId: number, templateId: number, data: PreviewTemplateInput) => {
    const template = await getTemplateById(tenantId, templateId);

    const latestVersion = template.versions[0];
    if (!latestVersion) {
        throw new AppError("Template belum memiliki versi konten", 400);
    }

    let contactData = data.sampleContact || null;
    if (data.contactId) {
        const foundContact = await prisma.contact.findFirst({
            where: { id: Number(data.contactId), tenantId },
        });

        if (foundContact) {
            const nameParts = (foundContact.name || "").trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            contactData = {
                firstName,
                lastName,
                name: foundContact.name,
                email: foundContact.email,
                phone: foundContact.phone || foundContact.whatsappNumber,
                customFields: foundContact.customFields as Record<string, any>,
            };
        }
    }

    const orgName = data.orgName || "Campaign Blast";

    return {
        subject: applyMergeTags(latestVersion.subject, contactData, { orgName }),
        contentHtml: applyMergeTags(latestVersion.contentHtml, contactData, { orgName }),
        contentWhatsapp: applyMergeTags(latestVersion.contentWhatsapp, contactData, { orgName }),
        contentTelegram: applyMergeTags(latestVersion.contentTelegram, contactData, { orgName }),
    };
};
