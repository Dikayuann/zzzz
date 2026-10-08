import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import { CreateListInput, UpdateListInput } from "../schemas/list.schema";

export const getList = async (tenantId: number) => {
    const lists = await prisma.list.findMany({
        where: { tenantId },
        include: {
            _count: {
                select: { listContacts: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return lists.map((l) => ({
        id: l.id,
        tenantId: l.tenantId,
        name: l.name,
        description: l.description,
        status: l.status,
        contactCount: l._count.listContacts,
        createdAt: l.createdAt,
    }));
};

// Ambil detail 1 list
export const getListById = async (tenantId: number, listId: number) => {
    const list = await prisma.list.findFirst({
        where: { id: listId, tenantId },
        include: {
            _count: {
                select: { listContacts: true },
            },
        },
    });

    if (!list) {
        throw new AppError("List tidak ditemukan", 404);
    }

    return {
        id: list.id,
        tenantId: list.tenantId,
        name: list.name,
        description: list.description,
        status: list.status,
        contactCount: list._count.listContacts,
        createdAt: list.createdAt,
    };
};

// membuat list baru
export const createList = async (tenantId: number, actorId: number, data: CreateListInput) => {
    const existing = await prisma.list.findFirst({
        where: { tenantId, name: data.name },
    });

    if (existing) {
        throw new AppError("Nama list sudah digunakan", 409);
    }

    const list = await prisma.list.create({
        data: {
            tenantId,
            name: data.name,
            description: data.description || null,
        },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "LIST_CREATE",
        entityType: "List",
        entityId: list.id,
        details: { name: list.name },
    });

    return list;
};

// Update list
export const updateList = async (
    tenantId: number,
    actorId: number,
    listId: number,
    data: UpdateListInput
) => {
    const existing = await prisma.list.findFirst({
        where: { id: listId, tenantId },
    });

    if (!existing) {
        throw new AppError("List tidak ditemukan", 404);
    }

    if (data.name && data.name !== existing.name) {
        const duplicate = await prisma.list.findFirst({
            where: { tenantId, name: data.name, id: { not: listId } },
        });
        if (duplicate) {
            throw new AppError("Nama list sudah digunakan", 409);
        }
    }

    const updated = await prisma.list.update({
        where: { id: listId },
        data: {
            name: data.name,
            description: data.description !== undefined ? data.description : undefined,
        },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "LIST_UPDATE",
        entityType: "List",
        entityId: listId,
        details: { name: updated.name },
    });

    return updated;
};

// hapus list
export const deleteList = async (tenantId: number, actorId: number, listId: number) => {
    const existing = await prisma.list.findFirst({
        where: { id: listId, tenantId },
    });

    if (!existing) {
        throw new AppError("List tidak ditemukan", 404);
    }

    await prisma.list.delete({
        where: { id: listId },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "LIST_DELETE",
        entityType: "list",
        entityId: listId,
        details: { name: existing.name },
    });

    return { success: true };
};

// masukkan kontak ke dalam list
export const addContactToList = async (
    tenantId: number,
    actorId: number,
    listId: number,
    contactIds: number[]
) => {
    const list = await prisma.list.findFirst({
        where: { id: listId, tenantId },
    });

    if (!list) {
        throw new AppError("List tidak ditemukan", 404);
    }

    const validContacts = await prisma.contact.findMany({
        where: { id: { in: contactIds }, tenantId, deletedAt: null },
        select: { id: true },
    });

    const dataToInsert = validContacts.map((c) => ({
        listId,
        contactId: c.id,
    }));

    // skipDuplicates agar tidak error jika kontak sudah ada di list
    const result = await prisma.listContact.createMany({
        data: dataToInsert,
        skipDuplicates: true,
    });

    await logAudit({
        tenantId,
        actorId,
        action: "LIST_ADD_CONTACTS",
        entityType: "List",
        entityId: listId,
        details: { addedCount: result.count, requested: contactIds.length },
    });

    return { addedCount: result.count };
};

export const removeContactFromList = async (
    tenantId: number,
    actorId: number,
    listId: number,
    contactId: number
) => {
    const list = await prisma.list.findFirst({
        where: { id: listId, tenantId },
    });

    if (!list) {
        throw new AppError("List tidak ditemukan", 404);
    }

    await prisma.listContact.deleteMany({
        where: {
            listId,
            contactId,
        },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "LIST_REMOVE_CONTACT",
        entityType: "List",
        entityId: listId,
        details: { contactId },
    });

    return { success: true };
};