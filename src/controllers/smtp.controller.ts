import { Request, Response } from "express";
import {
    getSmtpConfig,
    saveSmtpConfig,
    testSmtpConnection,
    deleteSmtpConfig,
} from "../services/smtp.service";

// GET /settings/smtp - Ambil konfigurasi SMTP tenant
export const getSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const config = await getSmtpConfig(tenantId);
    return res.status(200).json({
        message: "Berhasil mengambil konfigurasi SMTP",
        data: config,
    });
};

// POST /settings/smtp - Simpan/Update konfigurasi SMTP
export const saveSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const savedConfig = await saveSmtpConfig(tenantId, actorId, req.body);
    return res.status(200).json({
        message: "Konfigurasi SMTP berhasil disimpan",
        data: savedConfig,
    });
};

// POST /settings/smtp/test - Uji handshake & kirim email percobaan
export const testSmtpConnectionController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    const result = await testSmtpConnection(tenantId, actorId, req.body.testEmail);
    return res.status(200).json(result);
};

// DELETE /settings/smtp - Hapus konfigurasi SMTP
export const deleteSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorId = req.user!.userId;

    await deleteSmtpConfig(tenantId, actorId);
    return res.status(200).json({ message: "Konfigurasi SMTP berhasil dihapus" });
};