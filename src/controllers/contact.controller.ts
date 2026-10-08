import { Request, Response } from "express";
import {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
    importContacts,
} from "../services/contact.service";

// GET /contacts - Daftar kontak dengan paginasi, pencarian, dan filter
export const getContactsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getContacts(tenantId, req.query as any);
    return res.status(200).json({ message: "Berhasil mengambil daftar kontak", ...result });
};

// GET /contacts/:id - Detail 1 kontak
export const getContactByIdController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const contactId = Number(req.params.id);

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "ID kontak tidak valid" });
    }

    const contact = await getContactById(tenantId, contactId);
    return res.status(200).json({ message: "Berhasil mengambil detail kontak", data: contact });
};

// POST /contacts - Buat kontak baru
export const createContactController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const newContact = await createContact(tenantId, actorId, req.body);
    return res.status(201).json({ message: "Kontak berhasil dibuat", data: newContact });
};

// PUT /contacts/:id - Update kontak
export const updateContactController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const contactId = Number(req.params.id);

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "Data update tidak valid" });
    }

    const updated = await updateContact(tenantId, actorId, contactId, req.body);
    return res.status(200).json({ message: "Kontak berhasil diperbarui", data: updated });
};

// DELETE /contacts/:id - Hapus single kontak (Soft delete)
export const deleteContactController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const contactId = Number(req.params.id);

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "ID kontak tidak valid" });
    }

    await deleteContact(tenantId, actorId, contactId);
    return res.status(200).json({ message: "Kontak berhasil dihapus" });
};

// POST /contacts/bulk-delete - Hapus banyak kontak (Soft delete)
export const bulkDeleteContactsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const result = await bulkDeleteContacts(tenantId, actorId, req.body.contactIds);
    return res.status(200).json({ message: `${result.count} kontak berhasil dihapus`, count: result.count });
};

// POST /contacts/import - Bulk import kontak (CSV / Excel batch data)
export const importContactsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const result = await importContacts(tenantId, actorId, req.body);
    return res.status(200).json({ message: "Proses import kontak selesai", data: result });
};