import { Request, Response } from "express";
import { createTagSchema } from "../schemas/tag.schema";
import { getTags, createTag, deleteTag } from "../services/tag.service";

// GET /tags - Ambil semua tag milik tenant
export const getTagsController = async (req:Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    try {
        const tags = await getTags(tenantId);
        return res.status(200).json({ message: "Berhasil mengambil daftar tag", data: tags, });
    } catch (error) {
        console.error("[Get Tags Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// POST /tags - Buat tag baru
export const createTagController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const parsed = createTagSchema.safeParse(req.body);
    if (!parsed.success) {
       return res.status(400).json({
           message: "Data tag tidak valid",
           errors: parsed.error.issues.map((i) => i.message),
       });
    }

    try {
        const newTag = await createTag(tenantId, actorId, parsed.data);
        return res.status(201).json({ message: "Tag berhasil dibuat", data: newTag });
    } catch (error: any) {
        if (error.message === "TAG_DUPLICATE") {
            return res.status(409).json({ message: "Nama tag sudah digunakan" });
        }
        console.error("[Create Tag Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// DELETE /tags/:id - Hapus tag
export const deleteTagController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const tagId = Number(req.params.id);

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(tagId)) {
        return res.status(400).json({ message: "ID tag tidak valid" });
    }
    try {
        await deleteTag(tenantId, actorId, tagId);
        return res.status(200).json({ message: "Tag tidak ditemukan" });
    } catch (error: any) {
        console.error("[Delete Tag Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal"});
    }
};
