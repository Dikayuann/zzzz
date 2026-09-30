import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { CreateTagInput } from "../schemas/tag.schema";

// ambil semua tag milik tenant beserta jumlah kontaknya
export const getTags = async (tenantId: number) => {
    const tags = await prisma.tag.findMany({
        where: { tenantId },
        include: {
            _count: {
                select: { contactTags: true },
            },
        },
        orderBy: { name: "asc" },
    });

    return tags.map((t) => ({
        id: t.id,
        tenantId: t.tenantId,
        name: t.name,
        contactCount: t._count.contactTags,
        createdAt: t.createdAt,
    }));
};

// buat tag baru
export const createTag = async (tenantId: number, actorId: number, data: CreateTagInput ) => {
    const existing = await prisma.tag.findFirst({ where: {tenantId, name: data.name } });

    if (existing) {
        throw new Error("TAG_DUPLICATE");
    }

    const tag = await prisma.tag.create({
        data: {
            tenantId,
            name: data.name,
        },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "TAG_CREATE",
        entityType: "Tag",
        entityId: tag.id,
        details: { name: tag.name },
    });

    return tag;
}

// hapus tag
export const deleteTag = async (tenantId: number, actorId: number, tagId: number ) => {
    const existing = await prisma.tag.findFirst({ where: {id: tagId, tenantId }});

    if (!existing) {
        throw new Error("TAG_NOT_FOUND");
    }

    // Cascade delete akan otomatis menghapus relasi di contact_tags
    await prisma.tag.delete({
        where: { id: tagId },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "TAG_DELETE",
        entityType: "Tag",
        entityId: tagId,
        details: { name: existing.name },
    });

    return { success: true };
}