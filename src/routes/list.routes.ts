import { Router } from "express";
import {
    getListsController,
    getListByIdController,
    createListController,
    updateListController,
    deleteListController,
    addContactsToListController,
    removeContactFromListController,
} from "../controllers/list.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import {
    createListSchema,
    updateListSchema,
    addContactsToListSchema,
} from "../schemas/list.schema";

const router = Router();

// Semua endpoint list wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /lists:
 *   get:
 *     summary: Daftar semua list kontak beserta jumlah kontaknya
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar list
 */
router.get("/", requirePermission("contacts", "view"), asyncHandler(getListsController));

/**
 * @openapi
 * /lists/{id}:
 *   get:
 *     summary: Detail 1 list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail list berhasil diambil
 *       404:
 *         description: List tidak ditemukan
 */
router.get("/:id", requirePermission("contacts", "view"), asyncHandler(getListByIdController));

/**
 * @openapi
 * /lists:
 *   post:
 *     summary: Buat list baru
 *     tags: [Lists]
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
 *               name: { type: string, example: "Pelanggan VIP" }
 *               description: { type: string, example: "Daftar pelanggan prioritas" }
 *     responses:
 *       201:
 *         description: List berhasil dibuat
 *       409:
 *         description: Nama list sudah digunakan
 */
router.post(
    "/",
    requirePermission("contacts", "create"),
    validate({ body: createListSchema }),
    asyncHandler(createListController)
);

/**
 * @openapi
 * /lists/{id}:
 *   put:
 *     summary: Update data list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Pelanggan VIP Update" }
 *               description: { type: string, example: "Deskripsi baru" }
 *     responses:
 *       200:
 *         description: List berhasil diperbarui
 *       404:
 *         description: List tidak ditemukan
 */
router.put(
    "/:id",
    requirePermission("contacts", "edit"),
    validate({ body: updateListSchema }),
    asyncHandler(updateListController)
);

/**
 * @openapi
 * /lists/{id}:
 *   delete:
 *     summary: Hapus list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List berhasil dihapus
 *       404:
 *         description: List tidak ditemukan
 */
router.delete("/:id", requirePermission("contacts", "delete"), asyncHandler(deleteListController));

/**
 * @openapi
 * /lists/{id}/contacts:
 *   post:
 *     summary: Masukkan kontak ke dalam list (bulk)
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contactIds]
 *             properties:
 *               contactIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Kontak berhasil ditambahkan ke list
 *       404:
 *         description: List tidak ditemukan
 */
router.post(
    "/:id/contacts",
    requirePermission("contacts", "edit"),
    validate({ body: addContactsToListSchema }),
    asyncHandler(addContactsToListController)
);

/**
 * @openapi
 * /lists/{id}/contacts/{contactId}:
 *   delete:
 *     summary: Keluarkan kontak dari list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Kontak berhasil dikeluarkan dari list
 *       404:
 *         description: List tidak ditemukan
 */
router.delete(
    "/:id/contacts/:contactId",
    requirePermission("contacts", "edit"),
    asyncHandler(removeContactFromListController)
);

export default router;
