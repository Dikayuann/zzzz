import { Request, Response } from "express";
import {
    initWhatsappQrSession,
    getWhatsappQrStatus,
    disconnectWhatsappQrSession,
    sendWhatsappQrMessage,
} from "../services/whatsapp-qr.service";


//  POST /channels/whatsapp/qr/init - Memulai sesi Baileys dan generate QR Code
export const initWhatsappQrController = async (req: Request, res:Response) => {
    const  tenantId = req.user!.tenantId
    const result = await initWhatsappQrSession(tenantId);
    return res.status(200).json({
        message: "Inisialisasi sesi WhatsApp berhasil", data: result,
    });
};

// GET /channels/whatsapp/qr/status - Cek status koneksi & ambil QR image (data URL)
export const getWhatsappQrStatusController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await getWhatsappQrStatus(tenantId);
    return res.status(200).json({
        message: "Berhasil mengambil status WhatsApp",
        data: result,
    });
};

// POST /channels/whatsapp/qr/test - Kirim pesan broadcast uji coba via nomor WA yang terhubung
export const sendTestWhatsappQrMessageController = async (req: Request, res:Response)=> {
    const tenantId = req.user!.tenantId;
    const { recipientPhone, message } = req.body;
    const result = await sendWhatsappQrMessage(tenantId, recipientPhone, message)
    return res.status(200).json(result);
};

// DELETE /channels/whatsapp/qr - Logout dan hapus sesi WhatsApp Web
export const disconnectWhatsappQrController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const result = await disconnectWhatsappQrSession(tenantId);
    return res.status(200).json(result);
}
