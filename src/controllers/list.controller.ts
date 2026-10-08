import { Request, Response } from "express";
import {
    getList,
    getListById,
    createList,
    updateList,
    deleteList,
    addContactToList,
    removeContactFromList,
} from "../services/list.service";

// GET /lists - Ambil semua list milik tenant
export const getListsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const lists = await getList(tenantId);
    return res.status(200).json({ message: "Berhasil mengambil daftar list", data: lists });
};

// GET /lists/:id - Detail 1 list
export const getListByIdController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const listId = Number(req.params.id);

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    const list = await getListById(tenantId, listId);
    return res.status(200).json({ message: "Berhasil mengambil detail list", data: list });
};

// POST /lists - Buat list baru
export const createListController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const newList = await createList(tenantId, actorId, req.body);
    return res.status(201).json({ message: "List berhasil dibuat", data: newList });
};

// PUT /lists/:id - Update list
export const updateListController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const listId = Number(req.params.id);

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    const updated = await updateList(tenantId, actorId, listId, req.body);
    return res.status(200).json({ message: "List berhasil diperbarui", data: updated });
};

// DELETE /lists/:id - Hapus list
export const deleteListController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const listId = Number(req.params.id);

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    await deleteList(tenantId, actorId, listId);
    return res.status(200).json({ message: "List berhasil dihapus" });
};

// POST /lists/:id/contacts - Masukkan kumpulan kontak ke dalam list
export const addContactsToListController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const listId = Number(req.params.id);

    if (isNaN(listId)) {
        return res.status(400).json({ message: "ID list tidak valid" });
    }

    const result = await addContactToList(tenantId, actorId, listId, req.body.contactIds);
    return res.status(200).json({ message: `${result.addedCount} kontak berhasil ditambahkan ke list`, ...result });
};

// DELETE /lists/:id/contacts/:contactId - Keluarkan kontak dari list
export const removeContactFromListController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const listId = Number(req.params.id);
    const contactId = Number(req.params.contactId);

    if (isNaN(listId) || isNaN(contactId)) {
        return res.status(400).json({ message: "ID list atau ID kontak tidak valid" });
    }

    await removeContactFromList(tenantId, actorId, listId, contactId);
    return res.status(200).json({ message: "Kontak berhasil dikeluarkan dari list" });
};