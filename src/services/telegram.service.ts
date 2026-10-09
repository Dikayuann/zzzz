import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import { SaveTelegramBotInput, TestTelegramMessageInput } from "../schemas/telegram.schema";

//helper masking token
const maskBotToken = (token: string): string => {
    if (!token || token.length < 10) return "••••••••••••";
    const parts = token.split(":");
    if (parts.length === 2) {
        return `${parts[0]}:••••••••••••${token.slice(-4)}`;
    }
    return `${token.slice(0, 4)}••••••••••••${token.slice(-4)}`;
};

// ambil informasi bot telegram tenant
export const getTelegramBotConfig = async (tenantId: number) => {
    const bot = await prisma.telegramBot.findUnique({
        where: {
            tenantId
        }
    });

    if (!bot) {
        return {
            connected: false,
            bot: null,
        };
    }

    return {
        connected: bot.status === "connected",
        bot: {
            id: bot.id,
            botUsername: bot.botUsername,
            botName: bot.botName,
            targetChatId: bot.targetChatId,
            status: bot.status,
            connectedAt: bot.connectedAt,
            maskedToken: maskBotToken(bot.botToken),
        },
    };
};

// menghubungkan / verifikasi token bot
export const connectTelegramBot = async (
    tenantId: number,
    actorUserId: number,
    input: SaveTelegramBotInput
)=> {
    const cleanToken = input.botToken.trim();

    // verifikasi token langsung ke API telegram
    let telegramResponse: any;
    try {
        const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
        telegramResponse = await res.json();
    } catch (err: any) {
        throw new AppError("Gagal menghubungi server Telegram. Periksa koneksi internet server.", 502);
    }

    if (!telegramResponse.ok) {
        const errorDesc = telegramResponse.description || "Token bot tidak valid";
        throw new AppError(`Verifikasi Bot telegram gagal: ${errorDesc}`,400);
    }

    const botInfo = telegramResponse.result;
    const botUsername = botInfo.username ? `@${botInfo.username}` : null;
    const botName = botInfo.first_name || "Telegram Bot";


    // simpan update ke database
    const savedBot = await prisma.telegramBot.upsert({
        where: {tenantId},
        update: {
            botToken: cleanToken,
            botUsername,
            botName,
            targetChatId: input.targetChatId || null,
            status: "connected",
            connectedAt: new Date(),
        },
        create: {
            tenantId,
            botToken: cleanToken,
            botUsername,
            botName,
            targetChatId: input.targetChatId || null,
            status: "connected",
            connectedAt: new Date(),
        },
    });

    // catat auditlog
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "TELEGRAM_BOT_CONNECT",
        entityType: "TelegramBot",
        entityId: savedBot.id,
        details: { botUsername, botName },
    });

    return {
        success: true,
        message: `Bot ${botUsername || botName} berhasil terhubung!`,
        bot: {
            id: savedBot.id,
            botUsername: savedBot.botUsername,
            botName: savedBot.botName,
            targetChatId: savedBot.targetChatId,
            status: savedBot.status,
            connectedAt: savedBot.connectedAt,
            maskedToken: maskBotToken(savedBot.botToken),
        },
    };
};


// Kirim Pesan Uji Coba ke Chat / Channel Telegram
export const sendTestTelegramMessage = async (
    tenantId: number,
    input: TestTelegramMessageInput
)=> {
    const bot = await prisma.telegramBot.findUnique({
        where: {tenantId},
    });

    if (!bot || bot.status !== "connected") {
        throw new AppError("Bot Telegram belum terhubung. Silakan hubungkan token bot terlebih dahulu.", 400);
    }

    let telegramResponse: any;
    try {
        const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: input.chatId.trim(),
                text: input.message,
                parse_mode: input.parseMode || "HTML",
            }),
        });
        telegramResponse = await res.json();
    } catch (err: any) {
        throw new AppError("Gagal menghubungi server Telegram saat mengirim pesan", 502);
    }

    if (!telegramResponse.ok) {
        const errorDesc = telegramResponse.description || "Gagal mengirim pesan";
        throw new AppError(`Gagal mengirim ke Telegram: ${errorDesc}`, 400);
    }

    return {
        success: true,
        message: `Pesan uji coba berhasil terkirim ke ${input.chatId}`,
        messageId: telegramResponse.result.message_id,
    };
};

// Putuskan (Disconnect) Bot Telegram
export const disconnectTelegramBot = async (tenantId: number, actorUserId: number) => {
    const bot = await prisma.telegramBot.findUnique({ where: {tenantId} });

    if (!bot) {
        throw new AppError("Bot Telegram belum pernah dikonfigurasi", 404);
    }

    await prisma.telegramBot.delete({ where: {tenantId} });

    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "TELEGRAM_BOT_DISCONNECT",
        entityType: "TelegramBot",
        entityId: bot.id,
        details: { botUsername: bot.botUsername },
    });

    return {
        success: true,
        message: "Bot Telegram berhasil diputuskan",
    };
};




