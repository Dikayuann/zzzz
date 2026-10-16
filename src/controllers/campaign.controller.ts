import { Request, Response } from "express";
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    scheduleCampaign,
    cancelCampaign,
    deleteCampaign,
    getCampaignRecipients,
    expandAudience,
} from "../services/campaign.service";

export const getCampaignsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getCampaigns(tenantId, req.query as any);
    return res.status(200).json({
        message: "Berhasil mengambil daftar campaign",
        ...result,
    });
};

export const getCampaignByIdController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const campaign = await getCampaignById(tenantId, campaignId);
    return res.status(200).json({
        message: "Berhasil mengambil detail campaign",
        data: campaign,
    });
};

export const createCampaignController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;

    const campaign = await createCampaign(tenantId, userId, req.body);
    return res.status(201).json({
        message: "Campaign berhasil dibuat",
        data: campaign,
    });
};

export const updateCampaignController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const updated = await updateCampaign(tenantId, campaignId, userId, req.body);
    return res.status(200).json({
        message: "Campaign berhasil diperbarui",
        data: updated,
    });
};

export const scheduleCampaignController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const scheduled = await scheduleCampaign(tenantId, campaignId, userId, req.body);
    return res.status(200).json({
        message: "Campaign berhasil dijadwalkan",
        data: scheduled,
    });
};

export const cancelCampaignController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const cancelled = await cancelCampaign(tenantId, campaignId, userId);
    return res.status(200).json({
        message: "Campaign berhasil dibatalkan",
        data: cancelled,
    });
};

export const deleteCampaignController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const result = await deleteCampaign(tenantId, campaignId, userId);
    return res.status(200).json(result);
};

export const getCampaignRecipientsController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const campaignId = Number(req.params.id);

    if (isNaN(campaignId)) {
        return res.status(400).json({ message: "ID campaign tidak valid" });
    }

    const recipients = await getCampaignRecipients(tenantId, campaignId, req.query as any);
    return res.status(200).json({
        message: "Berhasil mengambil daftar penerima campaign",
        ...recipients,
    });
};

export const previewAudienceController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const audienceType = (req.query.audienceType as string) || "all";
    const audienceRef = (req.query.audienceRef as string) || null;
    const channel = (req.query.channel as string) || "whatsapp_qr";

    const contacts = await expandAudience(tenantId, audienceType, audienceRef, channel);
    return res.status(200).json({
        message: "Berhasil menghitung estimasi audience",
        data: {
            total: contacts.length,
            sample: contacts.slice(0, 5).map((c) => ({
                id: c.id,
                name: c.name,
                phone: c.whatsappNumber || c.phone,
                email: c.email,
                teleChatId: c.teleChatId,
            })),
        },
    });
};
