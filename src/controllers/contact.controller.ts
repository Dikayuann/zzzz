import { Request, Response } from "express";
import {
    createContactSchema,
    updateContactSchema,
    contactQuerySchema,
    bulkDeleteContactSchema,
} from "../schemas/contact.schema";

import {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
} from "../services/contact.services";

export const getContactsController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({message: "Akses tidak diizinkan "});
    }

    const queryResult = contactQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return res.status(400).json({
            message: "Parameter query tidak valid",
            errors: queryResult.error.issues.map((i) => i.message),
        });
    }
    try {
        const result = await getContacts(tenantId, queryResult.data);
        return res.status(200).json({ message: "Berhasil mengambil daftar kontak", ...result });
    } catch (error) {
        console.error("[Get Contacts Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

//  GET /contacts/:id - Detail 1 kontak
export const getContactByIdController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const contactId = Number(req.params.id);

    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "ID kontak tidak valid" });
    }

    try {
        const contact = await getContactById(tenantId, contactId);
        return res.status(200).json({
            message: "Berhasil mengambil detail kontak",
            data: contact,
        });
    } catch (error: any) {
        if (error.message === "CONTACT_NOT_FOUND") {
            return res.status(404).json({ message: "Kontak tidak ditemukan "});
        }
        console.error("[Get Contact By ID Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" })
    }
};

// POST /contacts - Buat kontak baru
export const createContactController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Data kontak tidak valid",
            errors: parsed.error.issues.map((i) => i.message
            )
        });
    }

    try {
        const newContact = await createContact(tenantId, actorId, parsed.data);
        return res.status(201).json({ message: "Kontak berhasil dibuat", data: newContact });
    } catch (error: any) {
        if (error.message === "CONTACT_DUPLICATE") {
            return res.status(409).json({message: "Kontak dengan email atau nomor WhatsApp ini sudah terdaftar" });
        }

        if ( error.message === "INVALID_LIST") {
            return res.status(400).json({ message: "List yang dipilih tidak ditemukan" });
        }
        if (error.message === "INVALID_TAGS") {
            return res.status(400).json({ message: "Satu atau lebih tag yang dipilih tidal valid" });
        }
        console.error("[Create Contact Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// PUT /contacts/:id - Update kontak
export const updateContactController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const contactId = Number(req.params.id);

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "Data update tidak valid" });
    }

    const parsed = updateContactSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data update tidak valid",
            errors: parsed.error.issues.map((i) => i.message)
        });
    }

    try {
        const update = await updateContact(tenantId, actorId, contactId, parsed.data);
        return res.status(200).json({ message: "Kontak berhasil diperbarui", data:update });
    } catch (error: any) {
        if (error.message === "CONTACT_NOT_FOUND") {
            return res.status(404).json({message: "Kontak tidak ditemukan"});
        }

        if (error.message === "CONTACT_DUPLICATE") {
            return res.status(409).json({message: "Kontak dengan email atau nomor WhatsApp ini sudah terdaftar" });
        }
        if (error.message === "INVALID_LIST") {
            return res.status(400).json({ message: "Satu atau lebih tag yang dipilih tidak valid" });
        }
        console.error("[Update Contact Error]:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan internal"
        });
    }
};

// DELETE /contacts/:id - Hapus single kontak (Soft delete)
export const deleteContactController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    const contactId = Number(req.params.id);

    if (!tenantId || !actorId ) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    if (isNaN(contactId)) {
        return res.status(400).json({ message: "ID kontak tidak valid" })
    }

    try {
        await deleteContact(tenantId, actorId, contactId);
        return res.status(200).json({ message: "Kontak berhasil dihapus" });
    } catch (error: any) {
        if (error.message === "CONTACT_NOT_FOUND") {
            return res.status(404).json({ message:"Kontak tidak ditemukan" })
        }
        console.error("[Delete Contact Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// POST /contacts/bulk-delete - Hapus banyak kontak (Soft delete)
export const bulkDeleteContactsController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const parsed = bulkDeleteContactSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: "Data bulk delete tidak valid", errors: parsed.error.issues.map((i) => i.message) });
    }

    try {
        const result = await bulkDeleteContacts (tenantId, actorId, parsed.data.contactIds);
        return res.status(200).json({ message: `${result.count} kontak berhasil dihapus` , count: result.count });
    } catch (error) {
        console.error("[Bulk Delete Contact Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};