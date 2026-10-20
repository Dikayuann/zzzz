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

// Konversi format Markdown chat (*bold*, _italic_, ~strike~, ```code```) ke tag HTML Telegram
export const formatTelegramText = (text: string): string => {
    if (!text) return "";
    let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    escaped = escaped.replace(/```([\s\S]*?)```/g, "<pre>$1</pre>");
    escaped = escaped.replace(/\*\*([^*\n]+?)\*\*/g, "<b>$1</b>");
    escaped = escaped.replace(/\*([^*\n]+?)\*/g, "<b>$1</b>");
    escaped = escaped.replace(/_([^_\n]+?)_/g, "<i>$1</i>");
    escaped = escaped.replace(/~([^~\n]+?)~/g, "<s>$1</s>");
    return escaped;
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

    // Jalankan sync instan agar jika user sudah klik /start segera terdeteksi
    syncTelegramSubscribers(tenantId).catch(() => {});

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
    input: TestTelegramMessageInput & { mediaUrl?: string }
)=> {
    const bot = await prisma.telegramBot.findUnique({
        where: {tenantId},
    });

    if (!bot || bot.status !== "connected") {
        throw new AppError("Bot Telegram belum terhubung. Silakan hubungkan token bot terlebih dahulu.", 400);
    }

    // convert username jadi chat id
    let effectiveChatId = input.chatId.trim();
    if (!/^-?\d+$/.test(effectiveChatId)) {
        const cleanUsername = effectiveChatId.replace(/^@/, "").toLowerCase();
        const contactsWithTele = await prisma.contact.findMany({
            where: {
                tenantId,
                teleChatId: { not: null },
                deletedAt: null
            },
            select: { id: true, name: true, teleChatId: true, customFields: true },
        });

        const matched = contactsWithTele.find((c) => {
            const u = (c.customFields as any)?.telegramUsername?.replace(/^@/,"").toLowerCase();
            const n = c.name?.toLowerCase().trim();
            return u === cleanUsername || n === cleanUsername;
        });
        if (matched && matched.teleChatId) {
            effectiveChatId = matched.teleChatId;
        } else if (!effectiveChatId.startsWith("@")) {
            throw new AppError(`Kontak "${input.chatId}" tidak ditemukan atau belum pernah klik /start pada bot Anda.`, 404);
        }
    }

    // kirim pesan dan gambar
    let telegramResponse: any;
    try {
        const isPhoto = Boolean(input.mediaUrl && input.mediaUrl.trim());
        const formattedMessage = input.message
            ? (input.parseMode === "Markdown" ? input.message : formatTelegramText(input.message))
            : undefined;

        if (isPhoto) {
            const rawMedia = input.mediaUrl!.trim();
            // Jika gambar berupa data URI Base64 (upload banner lokal)
            if (rawMedia.startsWith("data:")) {
                const matches = rawMedia.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const buffer = Buffer.from(matches[2], "base64");
                    const ext = mimeType.split("/")[1] || "jpg";
                    const formData = new FormData();
                    formData.append("chat_id", effectiveChatId);
                    formData.append("photo", new Blob([buffer], { type: mimeType }), `image.${ext}`);
                    if (formattedMessage) {
                        formData.append("caption", formattedMessage);
                        formData.append("parse_mode", input.parseMode || "HTML");
                    }
                    const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendPhoto`, {
                        method: "POST",
                        body: formData,
                    });
                    telegramResponse = await res.json();
                } else {
                    throw new AppError("Format gambar base64 tidak valid", 400);
                }
            } else {
                // Jika berupa URL internet publik (http/https)
                const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendPhoto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: effectiveChatId,
                        photo: rawMedia,
                        caption: formattedMessage,
                        parse_mode: input.parseMode || "HTML",
                    }),
                });
                telegramResponse = await res.json();
            }
        } else {
            // Pesan teks biasa
            const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: effectiveChatId,
                    text: formattedMessage || "",
                    parse_mode: input.parseMode || "HTML",
                }),
            });
            telegramResponse = await res.json();
        }
    } catch (err: any) {
        if (err instanceof AppError) throw err;
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

// 8. Background Poller untuk Bot Telegram yang Aktif
let telegramPollingInterval: NodeJS.Timeout | null = null;
let isPollingActive = false;

export const pollAllConnectedBots = async () => {
    if (isPollingActive) return;
    isPollingActive = true;
    try {
        const activeBots = await prisma.telegramBot.findMany({
            where: { status: "connected" },
            select: { tenantId: true },
        });

        for (const bot of activeBots) {
            try {
                await syncTelegramSubscribers(bot.tenantId);
            } catch (_) {
                // Abaikan error per bot agar tidak memutus polling bot lain
            }
        }
    } catch (_) {
    } finally {
        isPollingActive = false;
    }
};

export const startTelegramPolling = () => {
    if (telegramPollingInterval) return;
    pollAllConnectedBots();
    // Cek update setiap 3 detik secara background
    telegramPollingInterval = setInterval(pollAllConnectedBots, 3000);
    console.log("🤖 [Telegram] Background polling aktif (otomatis balas /start)");
};

export const stopTelegramPolling = () => {
    if (telegramPollingInterval) {
        clearInterval(telegramPollingInterval);
        telegramPollingInterval = null;
    }
};




