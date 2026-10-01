import { Request, Response } from "express"
import { createListSchema, updateListSchema, addContactsToListSchema } from "../schemas/list.schema";
import { getList,
    getListById,
    createList,
    updateList,
    deleteList,
    addContactToList,
    removeContactFromList } from "../services/list.service";

// GET /lists - Ambil semua list milik tenant
export const getListsController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    try {
        const lists = await getList(tenantId);
        return res.status(200).json({ message: "Berhasil mengambil daftar list", data: lists });
    } catch (error) {
        console.error("[Get List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};


// GET /lists/:id - Detail 1 list
export const getListByIdController = async (req:Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const listId = Number(req.params.id);

    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    try {
        const list = await getListById(tenantId, listId);
        return res.status(200).json({ message: "Berhasil mengambil detail list", data: list });
    } catch (error: any) {
        if (error.message === "LIST_NOT_FOUND") {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }
        console.error("[Get List By ID Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// POST /lists - Buat list baru
export const createListController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const parsed = createListSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data list tidak valid", errors: parsed.error.issues.map((i) => i.message) });
    }

    try {
        const newList = await createList(tenantId, actorId, parsed.data);
        return res.status(201).json({ message: "List berhasil dibuat", data: newList });
    } catch (error: any) {
        if (error.message === "LIST_DUPLICATE") {
            return res.status(409).json({ message: "Nama list sudah digunakan" });
        }
        console.error("[Create List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};


// PUT /lists/:id - Update list
export const updateListController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const listId = Number(req.params.id);

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid",  });
    }

    const parsed = updateListSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data update tidak valid", errors: parsed.error.issues.map((i) => i.message) });
    }

    try {
        const updated = await updateList(tenantId, actorId, listId, parsed.data);
        return res.status(200).json({ message: "List berhasil diperbarui", data: updated });
    } catch (error: any) {
        if (error.message === "LIST_NOT_FOUND") {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }

        if (error.message === "LIST_DUPLICATE") {
            return res.status(409).json({ message: "Nama list sudah digunakan" });
        }
        console.error("[Update List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// DELETE /lists/:id - Hapus list
export const deleteListController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const listId = Number(req.params.id);

    if (!tenantId || !actorId) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    try {
        await deleteList(tenantId, actorId, listId);
        return res.status(200).json({ message: "List berhasil dihapus" });
    } catch (error: any) {
        if (error.message === "LIST_NOT_FOUND") {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }
        console.error("[Delete List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// POST /lists/:id/contacts - Masukkan kumpulan kontak ke dalam list
export const addContactsToListController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const listId = Number(req.params.id);

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak dizinkan" });
    }

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    const parsed = addContactsToListSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data kontak tidak valid", errors: parsed.error.issues.map((i) => i.message) });
    }

    try {
        const result = await addContactToList(tenantId, actorId, listId, parsed.data.contactIds);
        return res.status(200).json({ message: `${result.addedCount} kontak berhasil ditambahkan ke list`, ...result, });
    }catch (error: any) {
        if (error.message === "LIST_NOT_FOUND") {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }
        console.error("[Add Contacts To List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan Internal" });

    }
};

// DELETE /lists/:id/contacts/:contactId - Keluarkan kontak dari list
export const removeContactFromListController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const listId = Number(req.params.id);
    const contactId = Number(req.params.contactId);

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(listId) || isNaN(contactId)) {
        return res.status(400).json({ message: "ID list atau ID kontak tidak valid" });
    }

    try {
        await removeContactFromList(tenantId, actorId, listId, contactId);
        return res.status(200).json({ message: "Kontak berhasil dikeluarkan dari list"});
    } catch (error: any) {
        if (error.message === "LIST_NOT_FOUND") {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }
        console.error("[Remove Contact From List Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
}