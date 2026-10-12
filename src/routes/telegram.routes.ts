import { Router } from "express";
import {
    getTelegramBotConfigController,
    connectTelegramBotController,
    sendTestTelegramMessageController,
    disconnectTelegramBotController,
    syncTelegramSubscribersController,
    getTelegramSubscribersController,
    telegramWebhookController,
} from "../controllers/telegram.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import { saveTelegramBotSchema, testTelegramMessageSchema } from "../schemas/telegram.schema";

const router = Router();

// Endpoint webhook publik Telegram (tidak perlu JWT)
router.post("/webhook/:tenantId", asyncHandler(telegramWebhookController));

// Semua rute Telegram Bot internal wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /channels/telegram:
 *   get:
 *     summary: Ambil status dan informasi Bot Telegram tenant
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", requirePermission("channels", "view"), asyncHandler(getTelegramBotConfigController));

/**
 * @openapi
 * /channels/telegram:
 *   post:
 *     summary: Hubungkan atau perbarui Bot Token dari BotFather
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    requirePermission("channels", "edit"),
    validate({ body: saveTelegramBotSchema }),
    asyncHandler(connectTelegramBotController)
);

/**
 * @openapi
 * /channels/telegram/test:
 *   post:
 *     summary: Kirim pesan uji coba ke chat ID / channel Telegram
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/test",
    requirePermission("channels", "edit"),
    validate({ body: testTelegramMessageSchema }),
    asyncHandler(sendTestTelegramMessageController)
);

/**
 * @openapi
 * /channels/telegram:
 *   delete:
 *     summary: Putuskan koneksi Bot Telegram
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/", requirePermission("channels", "delete"), asyncHandler(disconnectTelegramBotController));

/**
 * @openapi
 * /channels/telegram/sync:
 *   post:
 *     summary: Tarik update /start dari antrean Telegram API dan rekam sebagai Kontak
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.post("/sync", requirePermission("channels", "edit"), asyncHandler(syncTelegramSubscribersController));

/**
 * @openapi
 * /channels/telegram/subscribers:
 *   get:
 *     summary: Ambil daftar subscriber Telegram yang tersimpan
 *     tags: [Channels - Telegram]
 *     security:
 *       - bearerAuth: []
 */
router.get("/subscribers", requirePermission("channels", "view"), asyncHandler(getTelegramSubscribersController));

export default router;
