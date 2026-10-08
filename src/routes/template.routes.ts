import { Router } from "express";
import {
    getTemplatesController,
    getTemplateByIdController,
    createTemplateController,
    updateTemplateController,
    createTemplateVersionController,
    deleteTemplateController,
    previewTemplateController,
    testSendTemplateController,
} from "../controllers/template.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import {
    createTemplateSchema,
    updateTemplateSchema,
    createTemplateVersionSchema,
    previewTemplateSchema,
    testSendTemplateSchema,
} from "../schemas/template.schema";

const router = Router();

// Semua endpoint template wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /templates:
 *   get:
 *     summary: Daftar semua template milik tenant
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar template
 */
router.get("/", requirePermission("templates", "view"), asyncHandler(getTemplatesController));

/**
 * @openapi
 * /templates/{id}:
 *   get:
 *     summary: Detail template beserta riwayat versinya
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail template berhasil diambil
 *       404:
 *         description: Template tidak ditemukan
 */
router.get("/:id", requirePermission("templates", "view"), asyncHandler(getTemplateByIdController));

/**
 * @openapi
 * /templates:
 *   post:
 *     summary: Buat template baru beserta versi 1
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Promo Diskon Gajian" }
 *               channelMode: { type: string, enum: [email, whatsapp, telegram, multiple], default: whatsapp }
 *               category: { type: string, example: "promotion" }
 *               subject: { type: string, example: "Promo Spesial Hari Ini!" }
 *               contentWhatsapp: { type: string, example: "Halo {{nama}}, ada diskon 50%!" }
 *     responses:
 *       201:
 *         description: Template berhasil dibuat
 */
router.post(
    "/",
    requirePermission("templates", "create"),
    validate({ body: createTemplateSchema }),
    asyncHandler(createTemplateController)
);

/**
 * @openapi
 * /templates/{id}:
 *   put:
 *     summary: Perbarui informasi dasar template (nama, channelMode, category)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Template berhasil diperbarui
 */
router.put(
    "/:id",
    requirePermission("templates", "edit"),
    validate({ body: updateTemplateSchema }),
    asyncHandler(updateTemplateController)
);

/**
 * @openapi
 * /templates/{id}/versions:
 *   post:
 *     summary: Tambah versi baru pada template (saat isi konten diedit)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Versi template baru berhasil dibuat
 */
router.post(
    "/:id/versions",
    requirePermission("templates", "edit"),
    validate({ body: createTemplateVersionSchema }),
    asyncHandler(createTemplateVersionController)
);

/**
 * @openapi
 * /templates/{id}/preview:
 *   post:
 *     summary: Pratinjau render template dengan substitusi merge tags
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil membuat pratinjau template
 */
router.post(
    "/:id/preview",
    requirePermission("templates", "view"),
    validate({ body: previewTemplateSchema }),
    asyncHandler(previewTemplateController)
);

/**
 * @openapi
 * /templates/{id}:
 *   delete:
 *     summary: Hapus template (soft delete)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Template berhasil dihapus
 */
router.delete("/:id", requirePermission("templates", "delete"), asyncHandler(deleteTemplateController));


// 1. Kirim test email dari draf yang sedang diedit (tanpa harus save dulu)
router.post(
    "/test-send",
    requirePermission("templates", "view"),
    validate({ body: testSendTemplateSchema }),
    asyncHandler(testSendTemplateController)
);

// 2. Kirim test email dari template yang sudah tersimpan di database
router.post(
    "/:id/test-send",
    requirePermission("templates", "view"),
    validate({ body: testSendTemplateSchema }),
    asyncHandler(testSendTemplateController)
);


export default router;
