import prisma from "../lib/prisma"
import { applyMergeTags } from "../lib/merge-tags";
import { Request, Response } from "express";
import { createTemplateSchema, updateTemplateSchema, createTemplateVersionSchema } from "../schemas/template.schema";
import { getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    createTemplateVersion,
    deleteTemplate} from "../services/template.service";


export const getTemplatesController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    try {
        const  templates = await getTemplates(tenantId);
        return res.status(200).json({ message: "Berhasil mengambil daftar template", data: templates });
    } catch (error) {
        console.error("[Get Templates Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

export const getTemplateByIdController  = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const templateId = Number(req.params.id);
    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    try {
        const template = await getTemplateById(tenantId, templateId);
        return res.status(200).json({ message: "Berhasil mengambil detail template", data: template });
    } catch (error: any) {
       if (error.message == "TEMPLATE_NOT_FOUND") {
           return res.status(404).json({ message: "Template tidak ditemukan" });
       }
       console.error("[Get Template By ID Error]:", error);
       return res.status(500).json({ message: "Terjadi kesalahan internal" })
    }
};


export const createTemplateController  = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Data template tidak valid",
            errors: parsed.error.issues.map((i) => i.message)
        });
    }

    try {
        const  template = await createTemplate(tenantId, actorId, parsed.data);
        return res.status(201).json({ message: "Template berhasil dibuat", data: template, });
    } catch (error: any) {
        if (error.message == "TEMPLATE_NAME_DUPLICATE" ) {
            return res.status(409).json({ message: "Nama template sudah digunakan" });
        }
        console.error("[Create Template Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

export const updateTemplateController  = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const templateId = Number(req.params.id);
    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data update template tidak valid",
        errors: parsed.error.issues.map((i) => i.message)
        });
    }

    try {
        const updated = await updateTemplate(tenantId, actorId, templateId, parsed.data);
        return res.status(200).json({ message: "Template berhasil diperbarui", data: updated
        });
    } catch (error: any) {
        if (error.message === "TEMPLATE_NOT_FOUND") {
            return res.status(404).json({ message: "Template tidak ditemukan" });
        }
        if (error.message == "TEMPLATE_NAME_DUPLICATE") {
            return res.status(409).json({ message: "Nama template sudah digunakan" });
        }
        console.error("[Update Template Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }

}

export const createTemplateVersionController  = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    const templateId = Number(req.params.id);
    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const parsed = createTemplateVersionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Data versi template tidak valid",
            errors: parsed.error.issues.map((i) => i.message),
        });
    }

    try {
        const newVersion = await createTemplateVersion(tenantId, actorId, templateId, parsed.data);
        return res.status(201).json({ message: "Versi template baru berhasil dibuat", data: newVersion });
    } catch (error: any) {
        if (error.message === "TEMPLATE_NOT_FOUND" ) {
            return res.status(404).json({ message: "Template tidak ditemukan" });
        }
        console.error("[Create Template Version Error]:", error);

        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

export const deleteTemplateController   = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;

    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan"
        });
    }

    const templateId = Number(req.params.id);
    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    try {
        const result = await deleteTemplate(tenantId, actorId, templateId);
        return res.status(200).json(result);

    } catch (error: any) {
        if (error.message === "TEMPLATE_NOT_FOUND") {
            return res.status(404).json({ message: "Template tidak ditemukan" });
        }
        console.error("[Delete Template Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" })
    }
}



    export const previewTemplateController = async (req: Request, res: Response) => {
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(401).json({message: "Akses tidak diizinkan"});
        }

        const templateId = Number(req.params.id);
        if (isNaN(templateId)) {
            return res.status(400).json({message: "ID template tidak valid"});
        }

        try {
            const template = await getTemplateById(tenantId, templateId);

            const latestVersion = template.versions[0];
            if (!latestVersion) {
                return res.status(400).json({message: "Template belum memiliki versi konten"});
            } // <--- KURUNG KURAWAL INI TADI KETINGGALAN

            // Ambil data kontak sampel dari body atau dari kontak di database
            let contactData = req.body.sampleContact || null;
            if (req.body.contactId) {
                const foundContact = await prisma.contact.findFirst({
                    where: {id: Number(req.body.contactId), tenantId},
                });

                if (foundContact) {
                    // Pecah nama lengkap menjadi nama depan dan nama belakang
                    const nameParts = (foundContact.name || "").trim().split(/\s+/);
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(" ") || "";

                    contactData = {
                        firstName,
                        lastName,
                        name: foundContact.name,
                        email: foundContact.email,
                        phone: foundContact.phone || foundContact.whatsappNumber,
                        customFields: foundContact.customFields as Record<string, any>,
                    };
                }
            }

            const orgName = req.body.orgName || "Campaign Blast";

            const preview = {
                subject: applyMergeTags(latestVersion.subject, contactData, {orgName}),
                contentHtml: applyMergeTags(latestVersion.contentHtml, contactData, {orgName}),
                contentWhatsapp: applyMergeTags(latestVersion.contentWhatsapp, contactData, {orgName}),
                contentTelegram: applyMergeTags(latestVersion.contentTelegram, contactData, {orgName}),
            };

            return res.status(200).json({
                message: "Berhasil membuat pratinjau template",
                data: preview,
            });
        } catch (error: any) {
            if (error.message === "TEMPLATE_NOT_FOUND") {
                return res.status(404).json({message: "Template tidak ditemukan"});
            }
            console.error("[Preview Template Error]:", error);
            return res.status(500).json({message: "Terjadi kesalahan internal"});
        }
    };
