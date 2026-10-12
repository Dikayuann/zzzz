import { Request, Response } from "express";
import {
    getTelegramBotConfig,
    connectTelegramBot,
    sendTestTelegramMessage,
    disconnectTelegramBot,
    syncTelegramSubscribers,
    getTelegramSubscribers,
    processTelegramInboundUpdate,
} from "../services/telegram.service";


// GET /channels/telegram - Ambil info bot yang terhubung
export const getTelegramBotConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getTelegramBotConfig(tenantId);
    return res.status(200).json({
        message: "Berhasil mengambil konfigurasi Telegram Bot",
        data: {
            ...result,
            botUsername: result.bot?.botUsername || null,
            botName: result.bot?.botName || null,
            botToken: result.bot?.maskedToken || null,
            targetChatId: result.bot?.targetChatId || null,
            status: result.bot?.status || "disconnected",
        },
    });
};

// POST /channels/telegram - Hubungkan / simpan bot token dari BotFather
export const connectTelegramBotController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const result = await connectTelegramBot(tenantId, actorId, req.body);
    return res.status(200).json({
        message: result.message,
        data: {
            ...result,
            botUsername: result.bot?.botUsername || null,
            botName: result.bot?.botName || null,
            botToken: result.bot?.maskedToken || null,
            targetChatId: result.bot?.targetChatId || null,
            status: result.bot?.status || "connected",
        },
    });
};

// POST /channels/telegram/test - Kirim pesan broadcast uji coba
export const sendTestTelegramMessageController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await sendTestTelegramMessage(tenantId, req.body);
    return res.status(200).json(result);
};

// DELETE /channels/telegram - Putuskan integrasi bot
export const disconnectTelegramBotController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;
    const result = await disconnectTelegramBot(tenantId, actorId);
    return res.status(200).json(result);
};

// POST /channels/telegram/sync - Tarik update /start dari Telegram
export const syncTelegramSubscribersController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await syncTelegramSubscribers(tenantId);
    return res.status(200).json(result);
};

// GET /channels/telegram/subscribers - Ambil daftar subscriber yang tersimpan
export const getTelegramSubscribersController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getTelegramSubscribers(tenantId);
    return res.status(200).json({
        message: "Berhasil mengambil subscriber Telegram",
        data: result,
    });
};

// POST /channels/telegram/webhook/:tenantId - Webhook publik penerima event real-time dari Telegram
export const telegramWebhookController = async (req: Request, res: Response) => {
    const rawTenantId = Array.isArray(req.params.tenantId) ? req.params.tenantId[0] : req.params.tenantId;
    const tenantId = parseInt(String(rawTenantId), 10);
    if (!isNaN(tenantId) && req.body) {
        processTelegramInboundUpdate(tenantId, req.body).catch(console.error);
    }
    return res.status(200).json({ ok: true });
};
