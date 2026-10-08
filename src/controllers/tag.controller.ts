import { Request, Response } from "express";
import { getTags, createTag, deleteTag } from "../services/tag.service";

// GET /tags - Ambil semua tag milik tenant
export const getTagsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const tags = await getTags(tenantId);
    return res.status(200).json({ message: "Berhasil mengambil daftar tag", data: tags });
};

// POST /tags - Buat tag baru
export const createTagController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const newTag = await createTag(tenantId, actorId, req.body);
    return res.status(201).json({ message: "Tag berhasil dibuat", data: newTag });
};

// DELETE /tags/:id - Hapus tag
export const deleteTagController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const tagId = Number(req.params.id);

    if (isNaN(tagId)) {
        return res.status(400).json({ message: "ID tag tidak valid" });
    }

    await deleteTag(tenantId, actorId, tagId);
    return res.status(200).json({ message: "Tag berhasil dihapus" });
};
