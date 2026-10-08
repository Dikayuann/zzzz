import { Router } from "express";
import {
    getTagsController,
    createTagController,
    deleteTagController,
} from "../controllers/tag.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import { createTagSchema } from "../schemas/tag.schema";

const router = Router();

// Semua endpoint tag wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: Daftar semua tag kontak beserta jumlah penggunaannya
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar tag
 */
router.get("/", requirePermission("contacts", "view"), asyncHandler(getTagsController));

/**
 * @openapi
 * /tags:
 *   post:
 *     summary: Buat tag baru
 *     tags: [Tags]
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
 *               name: { type: string, example: "Potential Customer" }
 *     responses:
 *       201:
 *         description: Tag berhasil dibuat
 *       409:
 *         description: Nama tag sudah digunakan
 */
router.post(
    "/",
    requirePermission("contacts", "create"),
    validate({ body: createTagSchema }),
    asyncHandler(createTagController)
);

/**
 * @openapi
 * /tags/{id}:
 *   delete:
 *     summary: Hapus tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tag berhasil dihapus
 *       404:
 *         description: Tag tidak ditemukan
 */
router.delete("/:id", requirePermission("contacts", "delete"), asyncHandler(deleteTagController));

export default router;
