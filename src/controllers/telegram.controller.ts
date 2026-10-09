import { Request, Response } from "express";
import {
    getTelegramBotConfig,
    connectTelegramBot,
    sendTestTelegramMessage,
    disconnectTelegramBot
} from "../services/telegram.service";


// GET /channels/telegram - Ambil info bot yang terhubung
export const getTelegramBotConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getTelegramBotConfig(tenantId);
    return res.status(200).json({ message: "Berhasil mengambil konfigurasi Telegram Bot", data: result });
};

// POST /channels/telegram - Hubungkan / simpan bot token dari BotFather
export const connectTelegramBotController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const result = await connectTelegramBot(tenantId, actorId, req.body);
    return res.status(200).json(result);
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
