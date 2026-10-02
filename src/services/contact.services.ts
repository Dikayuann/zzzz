import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
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
        throw new Error("CONTACT_NOT_FOUND");
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
            throw new Error("CONTACT_DUPLICATE");
        }
    }

    // validasi multi-tenant untuk listId dan tagId

    if (data.listId) {
        const listExist = await prisma.list.findFirst({
           where: { id: data.listId, tenantId },
        });
        if (!listExist) throw new Error("INVALID_LIST");
    }

    if (data.tagIds && data.tagIds.length > 0 ) {
        const validTags = await prisma.tag.findMany({
            where: { id: { in: data.tagIds }, tenantId },
        });
        if (validTags.length !== data.tagIds.length) {
            throw new Error("INVALID_TAGS");
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
        throw new Error("CONTACT_NOT_FOUND");
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
            throw new Error("CONTACT_DUPLICATE");
        }
    }

    // validasi list
    if ( data.listId ) {
        const listExist = await prisma.list.findFirst({
            where: { id: data.listId, tenantId },
        });
        if (!listExist) throw new Error("INVALID_LIST");
    }

    // validasi tags jika dikirim
    if (data.tagIds && data.tagIds.length > 0) {
        const validTags = await prisma.tag.findMany({
            where: { id: { in: data.tagIds }, tenantId },
        });
        if (validTags.length !== data.tagIds.length) {
            throw new Error("INVALID_TAGS");
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
        throw new Error("CONTACT_NOT_FOUND");
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

        if (!listExist) throw new Error("INVALID_LIST");
    }

    // validasi apakah semua tagIds valid milik tenant ini
    if (data.tagsIds && data.tagsIds.length > 0) {
        const validTags = await prisma.tag.findMany({ where: {id: { in: data.tagsIds }, tenantId},
        });
        if (validTags.length !== data.tagsIds.length) {
            throw new Error("INVALID_TAGS");
        }
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ row: number; name?: string; error: string }> = [];

    // proses setiap baris kontak
    for (let i = 0; i < data.contacts.length; i++) {
        const row = data.contacts[i];
        const rowNum = i + 1;

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

        // Cek apakah sudah ada kontak aktif dengan nomor/email yang sama di tenant ini
        const conflictOr: any[] = [];
        if (email) conflictOr.push({ email });
        if (normalizedWA) conflictOr.push({ whatsappNumber: normalizedWA  });

        const existing = await prisma.contact.findFirst({
            where: { tenantId, deletedAt: null, OR: conflictOr }
        });

        if (existing) {
            if (data.duplicateStrategy === "skip") {
                skippedCount++;
                continue;
            } else if (data.duplicateStrategy === "update") {
                // update profil kontak yang sudah ada
                await prisma.$transaction(async (tx) => {
                    await tx.contact.update({
                        where: { id: existing.id },
                        data: {
                            name: row.name || existing.name,
                            phone: row.phone || existing.phone,
                            teleChatId: row.teleChatId || existing.teleChatId,
                            customFields: row.customFields !== undefined ? row.customFields : undefined,
                        },
                    });
                    // menghubungkan ke list target jika belum tergabung
                    if (data.listId) {
                        await tx.listContact.upsert({
                            where: { listId_contactId: { listId: data.listId, contactId: existing.id } },
                            update: {},
                            create: { listId: data.listId, contactId: existing.id },
                        });
                    }
                    // hubungkan ke tag target jika belum ada
                    const targetTags = data.tagsIds;
                    if (targetTags && targetTags.length > 0) {
                        for (const tagId of targetTags) {
                            await tx.contactTag.upsert({
                                where: {
                                    contactId_tagId: { contactId: existing.id, tagId },
                                },
                                update: {},
                                create: { contactId: existing.id, tagId },
                            });
                        }
                    }
                });
                updatedCount++;
            }
        } else {
            // kontak baru
            await prisma.$transaction(async (tx) => {
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

                // catat status persetujuan (consent) otomatis
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

                // hubungkan ke list jika ada
                if (data.listId) {
                    await tx.listContact.create({
                        data: { listId: data.listId, contactId: created.id },
                    });
                }

                // hubungkan ke tag jika ada
                const targetTags = data.tagsIds;
                if (targetTags && targetTags.length > 0) {
                    await tx.contactTag.createMany({
                        data: targetTags.map((tagId) => ({ contactId: created.id, tagId })),
                    });
                }
            });
            importedCount++;
        }
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


