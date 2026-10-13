import { z } from "zod";


// schema untuk uji coba pesan
export const testWhatsappMessageSchema = z.object({
    recipientPhone: z
        .string()
        .trim()
        .min(8, "Nomor WhatsApp minimal 8 digit")
        .max(20, "Nomor WhatsApp maksimal 20 digit")
        .regex(/^\+?\d+$/, "Nomor WhatsApp hanya boleh berisi angka dan tanda + di awal"),
    message: z
        .string()
        .trim()
        .min(1, "Pesan tidak boleh kosong")
        .max(4096, "Pesan maksimal 4096 karakter"),
});

export type TestWhatsappMessageInput = z.infer<typeof testWhatsappMessageSchema>;