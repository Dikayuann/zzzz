import { z } from "zod";

export const channelModeEnum = z.enum(["email", "whatsapp", "telegram", "multiple"]);

export const createTemplateSchema = z.object({


    name: z.string().trim().min(2, "Nama template minimal 2 karakter").max(255),
    channelMode: channelModeEnum.default("whatsapp"),
    category: z.string().trim().max(100).optional(),

    // konten versi awal
    subject: z.string().trim().max(255).optional(),
    preheader: z.string().trim().max(255).optional(),
    contentJson: z.any().optional(),
    contentHtml: z.string().optional(),
    contentWhatsapp: z.string().optional(),
    contentTelegram: z.string().optional(),
})

export const updateTemplateSchema = z.object({
    name: z.string().trim().min(2, "Nama template minimal 2 karakter").max(255).optional(),
    channelMode: channelModeEnum.optional(),
    category: z.string().trim().max(100).optional()
})

export const createTemplateVersionSchema = z.object({
    subject: z.string().trim().max(255).optional(),
    preheader: z.string().trim().max(255).optional(),
    contentJson: z.any().optional(),
    contentHtml: z.string().optional(),
    contentWhatsapp: z.string().optional(),
    contentTelegram: z.string().optional(),
})



export const previewTemplateSchema = z.object({
    contactId: z.coerce.number().optional(),
    sampleContact: z.any().optional(),
    orgName: z.string().optional(),
});

export const testSendTemplateSchema = z.object({
    channel: z.enum(["email", "whatsapp", "telegram"]).default("email"),
    targetEmail: z.string().trim().email("Format email tujuan tidak valid").optional(),
    targetPhone: z.string().trim().optional(),
    targetChatId: z.string().trim().optional(),
    subject: z.string().trim().optional(),
    contentHtml: z.string().optional(),
    contentWhatsapp: z.string().optional(),
    contentTelegram: z.string().optional(),
    mediaUrl: z.string().trim().optional(),
    contactId: z.coerce.number().optional(),
    sampleContact: z.any().optional(),
    orgName: z.string().trim().optional(),
}).refine((data) => {
    // validasi berdasarkan channel yang dipilih
    if (data.channel === "email" && !data.targetEmail) {
        return false;
    }
    if (data.channel === "whatsapp" && !data.targetPhone && !data.contactId) {
        return false;
    }
    if (data.channel === "telegram" && !data.targetChatId && !data.contactId) {
        return false;
    }
    return true;
}, {
    message: "Tujuan pengiriman (email / nomor telepon / chat ID) wajib diisi sesuai saluran yang dipilih",
    path: ["targetEmail"],
});


export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CreateTemplateVersionInput = z.infer<typeof createTemplateVersionSchema>;
export type PreviewTemplateInput = z.infer<typeof previewTemplateSchema>;
export type TestSendTemplateInput = z.infer<typeof testSendTemplateSchema>;
