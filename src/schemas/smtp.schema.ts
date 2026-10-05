import { z } from "zod";

export const saveSmtpSchema = z.object({
    host: z.string().trim().min(1, "Host SMTP wajib diisi").max(255),
    port: z.coerce.number().int().positive("Port harus berupa angka positif").default(587),
    username: z.string().trim().min(1, "Username SMTP wajib diisi").max(255),
    password: z.string().max(255).optional().or(z.literal("")),
    fromName: z.string().trim().max(255).optional(),
    fromEmail: z.string().trim().email("Format email pengirim tidak valid").optional().or(z.literal("")),
    encryption: z.enum(["SSL", "TLS", "none", "None"]).transform((v) => (v.toLowerCase() === "none" ? "none" : v)).default("TLS"),
});

// Schema untuk menguji koneksi & kirim email percobaan
export const testSmtpSchema = z.object({
    testEmail: z.string().trim().email("Email tujuan pengujian harus valid"),
});

export type SaveSmtpInput = z.infer<typeof saveSmtpSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
