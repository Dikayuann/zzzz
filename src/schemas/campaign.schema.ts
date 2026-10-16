import { z } from "zod";

export const campaignChannelEnum = z.enum([
    "whatsapp_qr",
    "whatsapp_business",
    "telegram",
    "email",
    "whatsapp", // alias mapped to whatsapp_qr
]);

export const campaignStatusEnum = z.enum([
    "draft",
    "scheduled",
    "sending",
    "sent",
    "failed",
    "paused",
    "cancelled",
]);

export const audienceTypeEnum = z.enum(["all", "list", "tag"]);

export const createCampaignSchema = z.object({
    name: z.string().trim().min(2, "Nama campaign minimal 2 karakter").max(255),
    channel: campaignChannelEnum.default("whatsapp_qr"),
    templateId: z.coerce.number().int().positive("Template ID harus berupa angka positif").optional().nullable(),
    templateVersionId: z.coerce.number().int().positive().optional().nullable(),
    audienceType: audienceTypeEnum.default("all"),
    audienceRef: z.string().trim().max(100).optional().nullable(),
    scheduledAt: z.string().datetime({ message: "Format scheduledAt harus ISO 8601 string" }).optional().nullable(),
    recurrenceRule: z.string().trim().max(100).optional().nullable(),
});

export const updateCampaignSchema = z.object({
    name: z.string().trim().min(2, "Nama campaign minimal 2 karakter").max(255).optional(),
    channel: campaignChannelEnum.optional(),
    templateId: z.coerce.number().int().positive().optional().nullable(),
    templateVersionId: z.coerce.number().int().positive().optional().nullable(),
    audienceType: audienceTypeEnum.optional(),
    audienceRef: z.string().trim().max(100).optional().nullable(),
    scheduledAt: z.string().datetime({ message: "Format scheduledAt harus ISO 8601 string" }).optional().nullable(),
    recurrenceRule: z.string().trim().max(100).optional().nullable(),
});

export const campaignQuerySchema = z.object({
    search: z.string().trim().optional(),
    channel: z.string().trim().optional(),
    status: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const scheduleCampaignSchema = z.object({
    scheduledAt: z.string().datetime({ message: "Format scheduledAt harus ISO 8601 string" }).optional().nullable(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
