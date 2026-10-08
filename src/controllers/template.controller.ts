import { Request, Response } from "express";
import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    createTemplateVersion,
    deleteTemplate,
    previewTemplate,
    testSendTemplate,
} from "../services/template.service";

export const getTemplatesController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const templates = await getTemplates(tenantId);
    return res.status(200).json({ message: "Berhasil mengambil daftar template", data: templates });
};

export const getTemplateByIdController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const templateId = Number(req.params.id);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const template = await getTemplateById(tenantId, templateId);
    return res.status(200).json({ message: "Berhasil mengambil detail template", data: template });
};

export const createTemplateController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const template = await createTemplate(tenantId, actorId, req.body);
    return res.status(201).json({ message: "Template berhasil dibuat", data: template });
};

export const updateTemplateController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const templateId = Number(req.params.id);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const updated = await updateTemplate(tenantId, actorId, templateId, req.body);
    return res.status(200).json({ message: "Template berhasil diperbarui", data: updated });
};

export const createTemplateVersionController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const templateId = Number(req.params.id);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const newVersion = await createTemplateVersion(tenantId, actorId, templateId, req.body);
    return res.status(201).json({ message: "Versi template baru berhasil dibuat", data: newVersion });
};

export const deleteTemplateController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const templateId = Number(req.params.id);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const result = await deleteTemplate(tenantId, actorId, templateId);
    return res.status(200).json(result);
};

export const previewTemplateController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const templateId = Number(req.params.id);

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "ID template tidak valid" });
    }

    const preview = await previewTemplate(tenantId, templateId, req.body);
    return res.status(200).json({
        message: "Berhasil membuat pratinjau template",
        data: preview,
    });
};

export const testSendTemplateController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const templateId = req.params.id ? Number(req.params.id) : null;

    const result = await testSendTemplate(tenantId, actorId, templateId, req.body);
    return res.status(200).json(result);
}
