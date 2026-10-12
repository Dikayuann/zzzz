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
    let cleanToken = input.botToken.trim();
    // Otomatis bersihkan jika user menyertakan prefix "bot" atau tanda kutip
    if (cleanToken.toLowerCase().startsWith("bot")) {
        cleanToken = cleanToken.slice(3).trim();
    }
    cleanToken = cleanToken.replace(/^["']|["']$/g, "").trim();

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

// 5. Proses Pesan Inbound (User Klik /start atau kirim pesan ke Bot)
export const processTelegramInboundUpdate = async (
    tenantId: number,
    update: any,
    botToken?: string
) => {
    const message = update.message || update.edited_message;
    if (!message) return null;

    const from = message.from;
    if (!from || from.is_bot) return null;

    const teleChatId = String(from.id);
    const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || `User ${from.id}`;

    // Cari atau buat kontak di database
    const existing = await prisma.contact.findFirst({
        where: {
            tenantId,
            teleChatId,
        },
    });

    let contact;
    if (existing) {
        contact = await prisma.contact.update({
            where: { id: existing.id },
            data: {
                name: existing.name || fullName,
                lastInboundAt: new Date(),
                status: "active",
            },
        });
    } else {
        contact = await prisma.contact.create({
            data: {
                tenantId,
                name: fullName,
                teleChatId,
                customFields: {
                    telegramUsername: from.username ? `@${from.username}` : null,
                    languageCode: from.language_code || null,
                },
                status: "active",
                lastInboundAt: new Date(),
            },
        });

        // Catat consent otomatis untuk saluran telegram
        await prisma.consent.upsert({
            where: {
                contactId_channel: {
                    contactId: contact.id,
                    channel: "telegram",
                },
            },
            update: {
                status: "opted_in",
                updatedAt: new Date(),
            },
            create: {
                contactId: contact.id,
                channel: "telegram",
                status: "opted_in",
            },
        });
    }

    // Jika pesan adalah /start, kirim balasan sambutan otomatis jika botToken tersedia
    const text = (message.text || "").trim();
    if (text.startsWith("/start") && botToken) {
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: from.id,
                    text: `Halo ${from.first_name || ""}! 👋\n\nAkun Telegram Anda telah berhasil terhubung dan terdaftar untuk menerima siaran informasi dari Campaign Blast.`,
                }),
            });
        } catch (_) {
            // Ignore error kirim auto-reply agar tidak memutus proses save
        }
    }

    return contact;
};

// 6. Tarik dan Sinkronkan Subscriber yang klik /start dari Telegram API
export const syncTelegramSubscribers = async (tenantId: number) => {
    const bot = await prisma.telegramBot.findUnique({ where: { tenantId } });
    if (!bot || bot.status !== "connected") {
        throw new AppError("Bot Telegram belum terhubung", 400);
    }

    let telegramResponse: any;
    try {
        const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/getUpdates`);
        telegramResponse = await res.json();
    } catch (err: any) {
        throw new AppError("Gagal menghubungi server Telegram saat sinkronisasi", 502);
    }

    if (!telegramResponse.ok) {
        throw new AppError(`Gagal mengambil update Telegram: ${telegramResponse.description}`, 400);
    }

    const updates: any[] = telegramResponse.result || [];
    let syncedCount = 0;
    let maxUpdateId = 0;

    for (const update of updates) {
        if (update.update_id > maxUpdateId) {
            maxUpdateId = update.update_id;
        }
        const saved = await processTelegramInboundUpdate(tenantId, update, bot.botToken);
        if (saved) {
            syncedCount++;
        }
    }

    // Acknowledge update queue agar tidak diproses berulang
    if (maxUpdateId > 0) {
        try {
            await fetch(`https://api.telegram.org/bot${bot.botToken}/getUpdates?offset=${maxUpdateId + 1}`);
        } catch (_) {}
    }

    const totalSubscribers = await prisma.contact.count({
        where: {
            tenantId,
            teleChatId: { not: null },
        },
    });

    return {
        success: true,
        message: `Sinkronisasi berhasil. Memproses ${syncedCount} interaksi baru. Total subscriber terdaftar: ${totalSubscribers}.`,
        syncedCount,
        totalSubscribers,
    };
};

// 7. Ambil Daftar Subscriber Telegram yang Terdaftar
export const getTelegramSubscribers = async (tenantId: number) => {
    const contacts = await prisma.contact.findMany({
        where: {
            tenantId,
            teleChatId: { not: null },
            status: "active",
        },
        select: {
            id: true,
            name: true,
            teleChatId: true,
            customFields: true,
            createdAt: true,
            lastInboundAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return {
        total: contacts.length,
        contacts,
    };
};




