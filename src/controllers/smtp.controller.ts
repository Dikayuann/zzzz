import { Request, Response } from "express";
import { saveSmtpSchema, testSmtpSchema } from "../schemas/smtp.schema";
import { 
    getSmtpConfig,
    saveSmtpConfig,
    testSmtpConnection,
    deleteSmtpConfig,
 } from "../services/smtp.service";

// GET /settings/smtp - Ambil konfigurasi SMTP tenant
export const getSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
   if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }

    try {
        const config = await getSmtpConfig(tenantId);
        return res.status(200).json({
            message: "Berhasil mengambil konfigurasi SMTP",
            data: config,
        });
    } catch (error) {
        console.error("[Get SMTP Config Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
 };

 // POST /settings/smtp - Simpan/Update konfigurasi SMTP
 export const saveSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }
    const parsed = saveSmtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Data konfigurasi SMTP tidak valid",
            errors: parsed.error.issues.map((i) => i.message),
        });
    }
    try {
        const savedConfig = await saveSmtpConfig(tenantId, actorId, parsed.data);
        return res.status(200).json({
            message: "Konfigurasi SMTP berhasil disimpan",
            data: savedConfig,
        });
    } catch (error: any) {
        if (error.message === "PASSWORD_REQUIRED") {
            return res.status(400).json({
                message: "Password / App Password wajib diisi untuk konfigurasi awal",
            });
        }
        console.error("[Save SMTP Config Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// POST /settings/smtp/test - Uji handshake & kirim email percobaan
export const testSmtpConnectionController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }
    const parsed = testSmtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Email tujuan pengujian tidak valid",
            errors: parsed.error.issues.map((i) => i.message),
        });
    }
    try {
        const result = await testSmtpConnection(tenantId, actorId, parsed.data.testEmail);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "SMTP_NOT_CONFIGURED") {
            return res.status(400).json({
                message: "Server SMTP belum dikonfigurasi. Harap simpan pengaturan terlebih dahulu.",
            });
        }
         if (error.message.startsWith("SMTP_HANDSHAKE_FAILED")) {
            return res.status(400).json({
                message: "Gagal terhubung ke server SMTP. Periksa Host, Port, atau Username/Password Anda.",
                detail: error.message,
            });
        }
        console.error("[Test SMTP Error]:", error);
        return res.status(500).json({
            message: "Pengiriman email uji coba gagal",
            detail: error.message,
        });
    }
};

// 4. DELETE /settings/smtp - Hapus konfigurasi SMTP
export const deleteSmtpConfigController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorId = req.user?.userId;
    if (!tenantId || !actorId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }
    try {
        await deleteSmtpConfig(tenantId, actorId);
        return res.status(200).json({ message: "Konfigurasi SMTP berhasil dihapus" });
    } catch (error: any) {
        if (error.message === "SMTP_NOT_CONFIGURED") {
            return res.status(400).json({ message: "Konfigurasi SMTP memang belum ada" });
        }
        console.error("[Delete SMTP Config Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};




 