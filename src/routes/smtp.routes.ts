import { Router } from "express";
import {
    getSmtpConfigController,
    saveSmtpConfigController,
    testSmtpConnectionController,
    deleteSmtpConfigController,
} from "../controllers/smtp.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

// Semua rute SMTP wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /settings/smtp:
 *   get:
 *     summary: Ambil konfigurasi SMTP milik organisasi (Tenant)
 *     tags: [Channels - SMTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Konfigurasi SMTP berhasil diambil
 */
router.get("/", requirePermission("channels", "view"), getSmtpConfigController);

/**
 * @openapi
 * /settings/smtp:
 *   post:
 *     summary: Simpan atau perbarui konfigurasi server SMTP
 *     tags: [Channels - SMTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [host, port, username, password]
 *             properties:
 *               host: { type: string, example: "smtp.gmail.com" }
 *               port: { type: integer, example: 587 }
 *               username: { type: string, example: "user@gmail.com" }
 *               password: { type: string, example: "app_password_here" }
 *               fromName: { type: string, example: "Campaign Blast" }
 *               fromEmail: { type: string, example: "no-reply@gmail.com" }
 *               encryption: { type: string, enum: [SSL, TLS, none], default: TLS }
 *     responses:
 *       200:
 *         description: Konfigurasi SMTP berhasil disimpan
 */
router.post("/", requirePermission("channels", "edit"), saveSmtpConfigController);

/**
 * @openapi
 * /settings/smtp/test:
 *   post:
 *     summary: Uji koneksi handshake server SMTP & kirim email percobaan sungguhan
 *     tags: [Channels - SMTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [testEmail]
 *             properties:
 *               testEmail: { type: string, example: "emailpribadi@gmail.com" }
 *     responses:
 *       200:
 *         description: Email pengujian berhasil dikirim ke inbox tujuan
 *       400:
 *         description: Handshake SMTP gagal atau belum dikonfigurasi
 */
router.post("/test", requirePermission("channels", "edit"), testSmtpConnectionController);

/**
 * @openapi
 * /settings/smtp:
 *   delete:
 *     summary: Hapus konfigurasi SMTP
 *     tags: [Channels - SMTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Konfigurasi SMTP berhasil dihapus
 */
router.delete("/", requirePermission("channels", "delete"), deleteSmtpConfigController);

export default router;
