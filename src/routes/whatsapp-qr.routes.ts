import { Router } from "express";
import {
     initWhatsappQrController,
    getWhatsappQrStatusController,
    disconnectWhatsappQrController,
    sendTestWhatsappQrMessageController,
} from "../controllers/whatsapp-qr.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import { testWhatsappMessageSchema } from "../schemas/whatsapp.schema";


const router = Router();

// semua route whatsapp wajib login (JWT)
router.use(authenticateJWT)

/**
 * @openapi
 * /channels/whatsapp/qr/status:
 *   get:
 *     summary: Ambil status koneksi Baileys & QR Code aktif
 *     tags: [Channels - WhatsApp QR]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/status",
    requirePermission("channels", "view"),
    asyncHandler(getWhatsappQrStatusController)
);
/**
 * @openapi
 * /channels/whatsapp/qr/init:
 *   post:
 *     summary: Inisialisasi sesi Baileys dan mulai emit QR Code baru
 *     tags: [Channels - WhatsApp QR]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/init",
    requirePermission("channels", "edit"),
    asyncHandler(initWhatsappQrController)
);
/**
 * @openapi
 * /channels/whatsapp/qr/test:
 *   post:
 *     summary: Kirim pesan uji coba ke nomor WhatsApp tujuan
 *     tags: [Channels - WhatsApp QR]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/test",
    requirePermission("channels", "edit"),
    validate({ body: testWhatsappMessageSchema }),
    asyncHandler(sendTestWhatsappQrMessageController)
);
/**
 * @openapi
 * /channels/whatsapp/qr:
 *   delete:
 *     summary: Putuskan koneksi WhatsApp Web (logout) dan bersihkan sesi
 *     tags: [Channels - WhatsApp QR]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/",
    requirePermission("channels", "delete"),
    asyncHandler(disconnectWhatsappQrController)
);
export default router;



