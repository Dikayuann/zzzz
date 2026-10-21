import { Router } from "express";
import {
    getCampaignsController,
    getCampaignByIdController,
    createCampaignController,
    updateCampaignController,
    scheduleCampaignController,
    cancelCampaignController,
    deleteCampaignController,
    getCampaignRecipientsController,
    previewAudienceController,
    sendCampaignNowController,
} from "../controllers/campaign.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import {
    createCampaignSchema,
    updateCampaignSchema,
    campaignQuerySchema,
    scheduleCampaignSchema,
} from "../schemas/campaign.schema";

const router = Router();

// Semua endpoint campaign wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: Daftar campaign dengan filter dan paginasi
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: channel
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar campaign
 */
router.get(
    "/",
    requirePermission("campaigns", "view"),
    validate({ query: campaignQuerySchema }),
    asyncHandler(getCampaignsController)
);

/**
 * @openapi
 * /campaigns/preview-audience:
 *   get:
 *     summary: Estimasi jumlah audience berdasarkan filter target
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: audienceType
 *         schema: { type: string, enum: [all, list, tag] }
 *       - in: query
 *         name: audienceRef
 *         schema: { type: string }
 *       - in: query
 *         name: channel
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Berhasil menghitung estimasi audience
 */
router.get(
    "/preview-audience",
    requirePermission("campaigns", "view"),
    asyncHandler(previewAudienceController)
);

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     summary: Detail campaign berdasarkan ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail campaign berhasil diambil
 *       404:
 *         description: Campaign tidak ditemukan
 */
router.get(
    "/:id",
    requirePermission("campaigns", "view"),
    asyncHandler(getCampaignByIdController)
);

/**
 * @openapi
 * /campaigns/{id}/recipients:
 *   get:
 *     summary: Daftar penerima dan status log pengiriman campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar penerima
 */
router.get(
    "/:id/recipients",
    requirePermission("campaigns", "view"),
    asyncHandler(getCampaignRecipientsController)
);

/**
 * @openapi
 * /campaigns:
 *   post:
 *     summary: Buat campaign baru (status draft)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, channel]
 *             properties:
 *               name: { type: string }
 *               channel: { type: string, enum: [whatsapp_qr, whatsapp_business, telegram, email] }
 *               templateId: { type: integer }
 *               audienceType: { type: string, enum: [all, list, tag] }
 *               audienceRef: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Campaign berhasil dibuat
 */
router.post(
    "/",
    requirePermission("campaigns", "create"),
    validate({ body: createCampaignSchema }),
    asyncHandler(createCampaignController)
);

/**
 * @openapi
 * /campaigns/{id}:
 *   put:
 *     summary: Perbarui campaign draft atau scheduled
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campaign berhasil diperbarui
 */
router.put(
    "/:id",
    requirePermission("campaigns", "edit"),
    validate({ body: updateCampaignSchema }),
    asyncHandler(updateCampaignController)
);

/**
 * @openapi
 * /campaigns/{id}/schedule:
 *   post:
 *     summary: Jadwalkan dan antrikan penerima campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campaign berhasil dijadwalkan
 */
router.post(
    "/:id/schedule",
    requirePermission("campaigns", "edit"),
    validate({ body: scheduleCampaignSchema }),
    asyncHandler(scheduleCampaignController)
);

/**
 * @openapi
 * /campaigns/{id}/cancel:
 *   post:
 *     summary: Batalkan jadwal campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campaign berhasil dibatalkan
 */
router.post(
    "/:id/cancel",
    requirePermission("campaigns", "edit"),
    asyncHandler(cancelCampaignController)
);

/**
 * @openapi
 * /campaigns/{id}:
 *   delete:
 *     summary: Hapus campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Campaign berhasil dihapus
 */

router.delete(
    "/:id",
    requirePermission("campaigns", "delete"),
    asyncHandler(deleteCampaignController)
);

/**
 * @openapi
 * /campaigns/{id}/send-now:
 *   post:
 *     summary: Eksekusi blast campaign sekarang secara instan
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pengiriman campaign berhasil dimulai
 */
router.post(
    "/:id/send-now",
    requirePermission("campaigns", "edit"),
    asyncHandler(sendCampaignNowController)
);


export default router;
