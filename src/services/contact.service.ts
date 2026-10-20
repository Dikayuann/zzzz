import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import {
    CreateContactInput,
    UpdateContactInput,
    ContactQueryInput,
    BulkDeleteContactInput,
    ImportContactsInput,
} from "../schemas/contact.schema";

export const normalizePhoneNumber = (phone?: string): string | undefined => {
    if ( !phone ) return undefined;
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "62" + cleaned.slice(1);
    }
    return cleaned.length > 0 ? cleaned : undefined;
}

const formatContactResponse = (contact: any) => {
    const consentsMap = {
        email: false,
        whatsapp: false,
        telegram: false,
    };

    if (contact.consents && Array.isArray(contact.consents)) {
        contact.consents.forEach((c:any) => {
            if (c.channel === "email")
                consentsMap.email = c.status === "opted_in";
            if (c.channel === "whatsapp")
                consentsMap.whatsapp = c.status === "opted_in";
            if (c.channel === "telegram")
                consentsMap.telegram = c.status === "opted_in";
        });
    }

    return {
        id: contact.id,
        tenantId: contact.tenantId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        whatsappNumber: contact.whatsappNumber,
        teleChatId: contact.teleChatId,
        status: contact.status,
        customFields: contact.customFields,
        lastInboundAt: contact.lastInboundAt,
        createdAt: contact.createdAt,
        consent: consentsMap,
        lists: contact.listContacts ? contact.listContacts.map((lc: any) => ({
            id: lc.list.id,
            name: lc.list.name,
        })) : [],
        tags: contact.contactTags ? contact.contactTags.map((ct: any) => ({
            id: ct.tag.id,
            name: ct.tag.name,
        })) : [],
    };
};

// ambil daftar kontak
export const getContacts = async (tenantId: number, query: ContactQueryInput) => {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
        tenantId,
        deletedAt: null,
    };

    if (query.status) {
        where.status = query.status;
    }

    if (query.search) {
        where.OR = [
            { name: { contains: query.search }},
            { email: { contains: query.search }},
            { whatsappNumber: { contains: query.search }},
        ];
    }

    if (query.listId) {
        where.listContacts = {
            some: { listId: query.listId },
        };
    }

    if (query.tagId) {
        where.contactTags = {
            some: { tagId: query.tagId },
        };
    }

    const [total, contacts] = await Promise.all([
        prisma.contact.count({ where }),
        prisma.contact.findMany({
            where,
            skip,
            take: limit,
            include: {
                consents: true,
                listContacts: { include: {list: true}},
                contactTags: { include: {tag: true}},
            },
            orderBy: { id: "desc" },
        }),
    ]);

    return {
        contacts: contacts.map(formatContactResponse),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Ambil detail 1 kontak
export const getContactById = async (tenantId: number, contactId: number) => {
    const contact = await prisma.contact.findFirst({
        where: {
            id: contactId,
            tenantId,
            deletedAt: null
        },
        include: {
            consents: true,
            listContacts: { include: { list: true }},
            contactTags: { include: { tag: true }}
        },
    });

    if (!contact) {
        throw new AppError("Kontak tidak ditemukan", 404);
    }

    return formatContactResponse(contact);
};

// membuat contact baru
export const createContact = async ( tenantId: number, actorId: number, data: CreateContactInput ) => {
    const normalizeWA = normalizePhoneNumber(data.whatsappNumber);

    // cek duplikat kontak aktif di tenant sama
    const duplicateOr: any[] = [];
    if (data.email) duplicateOr.push({ email: data.email });
    if (normalizeWA) duplicateOr.push({ whatsappNumber: normalizeWA });

    if (duplicateOr.length > 0) {
        const existing = await prisma.contact.findFirst({
            where: {
                tenantId,
                deletedAt: null,
                OR: duplicateOr
            },
        });

        if (existing) {
            throw new AppError("Kontak dengan email atau nomor WhatsApp ini sudah terdaftar", 409);
        }
    }

    // validasi multi-tenant untuk listId dan tagId

    if (data.listId) {
        const listExist = await prisma.list.findFirst({
           where: { id: data.listId, tenantId },
        });
        if (!listExist) throw new AppError("List yang dipilih tidak ditemukan", 400);
    }

    if (data.tagIds && data.tagIds.length > 0 ) {
        const validTags = await prisma.tag.findMany({
            where: { id: { in: data.tagIds }, tenantId },
        });
        if (validTags.length !== data.tagIds.length) {
            throw new AppError("Satu atau lebih tag yang dipilih tidak valid", 400);
        }
    }

    const newContact = await prisma.$transaction(async (tx) => {
        const created = await tx.contact.create({
            data: {
                tenantId,
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                whatsappNumber: normalizeWA || null,
                teleChatId: data.teleChatId || null,
                status: data.status || "active",
                customFields: data.customFields || undefined,
            },
        });
        const consentsData: any[] = [];
        if (data.email) {
            consentsData.push({ contactId: created.id, channel: "email", status: "opted_in"});
        }
        if (normalizeWA) {
            consentsData.push({ contactId: created.id, channel: "whatsapp", status: "opted_in"})
        }
        consentsData.push({ contactId: created.id, channel: "telegram", status: "opted_out"})

        await tx.consent.createMany({ data: consentsData });

        // menghubungkan ke list
        if (data.listId) {
            await tx.listContact.create({
                data: { listId: data.listId, contactId: created.id }
            });
        }

        // menghubungkan ke Tags
        if (data.tagIds && data.tagIds.length > 0) {
            await tx.contactTag.createMany({
                data: data.tagIds.map((tagId) => ({
                    contactId: created.id,
                    tagId
                })),
            });
        }
        return created;
    });

    await logAudit({
        tenantId,
        actorId,
        action: "CONTACT_CREATE",
        entityType: "Contact",
        entityId: newContact.id,
        details: { name: newContact.name, email: newContact.email, whatsapp: newContact.whatsappNumber },
    });

    return getContactById(tenantId, newContact.id);
};

// update kontak
export const updateContact = async ( tenantId: number, actorId: number, contactId: number, data: UpdateContactInput) => {
    const existing = await prisma.contact.findFirst({
        where: { id: contactId, tenantId, deletedAt: null },
    });

    if (!existing) {
        throw new AppError("Kontak tidak ditemukan", 404);
    }

    const normalizedWA = normalizePhoneNumber(data.whatsappNumber);

    // cek apakah nomor wa atau email baru bentrok dengan kontak lain
    const conflicOr: any[] = [];
    if (data.email && data.email !== existing.email)
        conflicOr.push({ email: data.email });
    if (normalizedWA && normalizedWA !== existing.whatsappNumber) conflicOr.push({ whatsappNumber: normalizedWA
    });

    if (conflicOr.length > 0) {
        const conflict = await prisma.contact.findFirst({
            where: {
                tenantId,
                deletedAt: null,
                id: { not: contactId },
                OR: conflicOr
            },
        });
        if (conflict) {
            throw new AppError("Kontak dengan email atau nomor WhatsApp ini sudah terdaftar", 409);
        }
    }

    // validasi list
    if ( data.listId ) {
        const listExist = await prisma.list.findFirst({
            where: { id: data.listId, tenantId },
        });
        if (!listExist) throw new AppError("List yang dipilih tidak ditemukan", 400);
    }

    // validasi tags jika dikirim
    if (data.tagIds && data.tagIds.length > 0) {
        const validTags = await prisma.tag.findMany({
            where: { id: { in: data.tagIds }, tenantId },
        });
        if (validTags.length !== data.tagIds.length) {
            throw new AppError("Satu atau lebih tag yang dipilih tidak valid", 400);
        }
    }

    // update profil & sinkronisasi list / tags
    await prisma.$transaction(async (tx) => {
        await tx.contact.update({
            where: { id: contactId },
            data: {
                name: data.name,
                email: data.email !== undefined ? (data.email || null) : undefined,
                phone: data.phone !== undefined ? (data.phone || null) : undefined,
                whatsappNumber: normalizedWA !== undefined ? normalizedWA : undefined,
                teleChatId: data.teleChatId !== undefined ? (data.teleChatId || null) : undefined,
                status: data.status,
                customFields: data.customFields !== undefined ? data.customFields : undefined,
            },
        });

        // sikronisasi dengan list jika dikirim
        if (data.listId !== undefined) {
            await tx.listContact.deleteMany({ where: { contactId } });
            if (data.listId) {
                await tx.listContact.create({
                    data: { listId: data.listId, contactId },
                });
            }
        }

        // Sinkronisasi tags jika dikirim
        if (data.tagIds !== undefined) {
            await tx.contactTag.deleteMany({ where: { contactId } });
            if (data.tagIds.length > 0) {
                await tx.contactTag.createMany({
                    data: data.tagIds.map((tagId) => ({
                        contactId,
                        tagId,
                    })),
                });
            }
        }
    });

    await logAudit({
        tenantId,
        actorId,
        action: "CONTACT_UPDATE",
        entityType: "Contact",
        entityId: contactId,
        details: { changes: data },
    });

    return getContactById(tenantId, contactId);
}

// delete kontak
export const deleteContact = async (tenantId: number, actorId: number, contactId: number) => {
    const existing = await prisma.contact.findFirst({
        where: { id: contactId, tenantId, deletedAt: null },
    });

    if (!existing) {
        throw new AppError("Kontak tidak ditemukan", 404);
    }

    await prisma.contact.update({
        where: { id: contactId },
        data: { deletedAt: new Date() },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "CONTACT_DELETE",
        entityType: "Contact",
        entityId: contactId,
        details: { name: existing.name },
    });
    return { success: true };
};

// bulk delete kontak
export const bulkDeleteContacts = async (
    tenantId:number,
    actorId: number,
    contactIds: number[],
) => {
    const result = await prisma.contact.updateMany({
        where: {
            id: { in: contactIds },
            tenantId,
            deletedAt: null,
        },
        data: { deletedAt: new Date() },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "CONTACT_BULK_DELETE",
        entityType: "Contact",
        details: { count: result.count, contactIds },
    });

    return { success: true, count: result.count };
};

// bulk import kontak (csv / excel)
export const importContacts = async ( tenantId:number, actorId: number, data: ImportContactsInput )=> {
    // validasi apakah listId valid milik tenant ini
    if (data.listId) {
        const listExist = await prisma.list.findFirst({ where: { id: data.listId, tenantId } });

        if (!listExist) throw new AppError("List yang dipilih tidak ditemukan", 400);
    }

    // validasi apakah semua tagIds valid milik tenant ini
    if (data.tagsIds && data.tagsIds.length > 0) {
        const validTags = await prisma.tag.findMany({ where: {id: { in: data.tagsIds }, tenantId},
        });
        if (validTags.length !== data.tagsIds.length) {
            throw new AppError("Satu atau lebih tag yang dipilih tidak valid", 400);
        }
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ row: number; name?: string; error: string }> = [];

    // 1. Kumpulkan semua email dan nomor telepon untuk pre-fetch sekaligus (1 Query SQL)
    const candidateEmails: string[] = [];
    const candidatePhones: string[] = [];

    for (const r of data.contacts) {
        const normWA = normalizePhoneNumber(r.whatsappNumber || r.phone);
        if (normWA) candidatePhones.push(normWA);
        if (r.email && r.email.trim().length > 0) candidateEmails.push(r.email.trim().toLowerCase());
    }

    // 2. Pre-fetch seluruh kontak yang berpotensi duplikat dalam 1 KALI QUERY
    const conflictConditions: any[] = [];
    if (candidateEmails.length > 0) conflictConditions.push({ email: { in: candidateEmails } });
    if (candidatePhones.length > 0) conflictConditions.push({ whatsappNumber: { in: candidatePhones } });

    const existingContacts = conflictConditions.length > 0
        ? await prisma.contact.findMany({
            where: {
                tenantId,
                deletedAt: null,
                OR: conflictConditions,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsappNumber: true,
                teleChatId: true,
            },
        })
        : [];

    // Buat index pencarian instan O(1) di memori RAM
    const existingByEmail = new Map<string, typeof existingContacts[0]>();
    const existingByPhone = new Map<string, typeof existingContacts[0]>();

    for (const c of existingContacts) {
        if (c.email) existingByEmail.set(c.email.toLowerCase(), c);
        if (c.whatsappNumber) existingByPhone.set(c.whatsappNumber, c);
    }

    // 3. Proses kontak dalam batch chunk (50 baris per transaksi) agar cepat dan hemat round trip
    const BATCH_SIZE = 50;

    for (let batchStart = 0; batchStart < data.contacts.length; batchStart += BATCH_SIZE) {
        const batch = data.contacts.slice(batchStart, batchStart + BATCH_SIZE);

        await prisma.$transaction(async (tx) => {
            for (let j = 0; j < batch.length; j++) {
                const row = batch[j];
                const rowNum = batchStart + j + 1;

                const normalizedWA = normalizePhoneNumber(row.whatsappNumber || row.phone);
                const email = row.email && row.email.trim().length > 0 ? row.email.trim() : null;

                // wajib minimal ada email atau whatsApp
                if (!email && !normalizedWA) {
                    errors.push({
                        row: rowNum,
                        name: row.name,
                        error: "Minimal salah satu dari Email atau WhatsApp harus diisi",
                    });
                    skippedCount++;
                    continue;
                }

                // Cek duplikat via memory lookup O(1)
                const existing =
                    (email ? existingByEmail.get(email.toLowerCase()) : null) ||
                    (normalizedWA ? existingByPhone.get(normalizedWA) : null);

                if (existing) {
                    if (data.duplicateStrategy === "skip") {
                        skippedCount++;
                        continue;
                    } else if (data.duplicateStrategy === "update") {
                        await tx.contact.update({
                            where: { id: existing.id },
                            data: {
                                name: row.name || existing.name,
                                phone: row.phone || existing.phone,
                                teleChatId: row.teleChatId || existing.teleChatId,
                                customFields: row.customFields !== undefined ? row.customFields : undefined,
                            },
                        });

                        if (data.listId) {
                            await tx.listContact.upsert({
                                where: { listId_contactId: { listId: data.listId, contactId: existing.id } },
                                update: {},
                                create: { listId: data.listId, contactId: existing.id },
                            });
                        }

                        const targetTags = data.tagsIds;
                        if (targetTags && targetTags.length > 0) {
                            for (const tagId of targetTags) {
                                await tx.contactTag.upsert({
                                    where: { contactId_tagId: { contactId: existing.id, tagId } },
                                    update: {},
                                    create: { contactId: existing.id, tagId },
                                });
                            }
                        }
                        updatedCount++;
                    }
                } else {
                    // Kontak baru
                    const created = await tx.contact.create({
                        data: {
                            tenantId,
                            name: row.name,
                            email,
                            phone: row.phone || null,
                            whatsappNumber: normalizedWA || null,
                            teleChatId: row.teleChatId || null,
                            status: "active",
                            customFields: row.customFields || undefined,
                        },
                    });

                    // Simpan ke memori agar row duplikat berikutnya dalam file yang sama langsung terdeteksi
                    if (email) existingByEmail.set(email.toLowerCase(), created as any);
                    if (normalizedWA) existingByPhone.set(normalizedWA, created as any);

                    const consentsData: any[] = [];
                    if (email)
                        consentsData.push({ contactId: created.id, channel: "email", status: "opted_in" });
                    if (normalizedWA)
                        consentsData.push({ contactId: created.id, channel: "whatsapp", status: "opted_in" });
                    if (row.teleChatId)
                        consentsData.push({ contactId: created.id, channel: "telegram", status: "opted_in" });

                    if (consentsData.length > 0) {
                        await tx.consent.createMany({ data: consentsData });
                    }

                    if (data.listId) {
                        await tx.listContact.create({
                            data: { listId: data.listId, contactId: created.id },
                        });
                    }

                    const targetTags = data.tagsIds;
                    if (targetTags && targetTags.length > 0) {
                        await tx.contactTag.createMany({
                            data: targetTags.map((tagId) => ({ contactId: created.id, tagId })),
                        });
                    }
                    importedCount++;
                }
            }
        });
    }

    // Catat riwayat import ke tabel audit_logs setelah SEMUA baris selesai diproses
    await logAudit({
        tenantId,
        actorId,
        action: "CONTACT_IMPORT",
        entityType: "Contact",
        details: {
            totalRows: data.contacts.length,
            importedCount,
            updatedCount,
            skippedCount,
            errorsCount: errors.length,
            strategy: data.duplicateStrategy,
            listId: data.listId,
        },
    });

    return {
        totalRows: data.contacts.length,
        importedCount,
        updatedCount,
        skippedCount,
        errors,
    };
};


