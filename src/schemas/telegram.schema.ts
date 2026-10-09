import { z } from "zod";

// schema untuk menyimpan menghubungkan bot token telegram
export const saveTelegramBotSchema =  z.object({
    botToken: z.string().trim().min(1, "Bot Token Telegram wajib diisi").max(255),
    targetChatId: z.string().trim().max(100).optional().or(z.literal("")),
});

// schema untuk menguji kirim pesan siaran ke telegram
export const testTelegramMessageSchema = z.object({
    chatId: z.string().trim().min(1, "Target Chat ID / Username Telegram wajib diisi").max(100),
    message: z.string().trim().min(1, "Pesan tidak boleh kosong").max(4096, "Pesan maksimal 4096 karakter"),
    parseMode: z.enum(["HTML", "Markdown", "MarkdownV2"]).default("HTML"),
});

export type SaveTelegramBotInput = z.infer<typeof saveTelegramBotSchema>;
export type TestTelegramMessageInput = z.infer<typeof testTelegramMessageSchema>;
