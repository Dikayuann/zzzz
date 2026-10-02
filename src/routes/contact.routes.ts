import { Router } from "express";
import {
    getContactsController,
    getContactByIdController,
    createContactController,
    updateContactController,
    deleteContactController,
    bulkDeleteContactsController,
    importContactsController,
} from "../controllers/contact.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

// Semua endpoint kontak wajib login
router.use(authenticateJWT);

/**
 * @openapi
 * /contacts:
 *   get:
 *     summary: Daftar kontak dengan paginasi, pencarian, dan filter list/tag
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: listId
 *         schema: { type: integer }
 *       - in: query
 *         name: tagId
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, unsubscribed, bounced] }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar kontak
 */
router.get("/", requirePermission("contacts", "view"), getContactsController);

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     summary: Detail kontak berdasarkan ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detail kontak berhasil diambil
 *       404:
 *         description: Kontak tidak ditemukan
 */
router.get("/:id", requirePermission("contacts", "view"), getContactByIdController);

/**
 * @openapi
 * /contacts:
 *   post:
 *     summary: Buat kontak baru
 *     tags: [Contacts]
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
 *               name: { type: string, example: "Budi Santoso" }
 *               email: { type: string, example: "budi@example.com" }
 *               phone: { type: string, example: "08123456789" }
 *               whatsappNumber: { type: string, example: "08123456789" }
 *               teleChatId: { type: string, example: "123456789" }
 *               status: { type: string, enum: [active, unsubscribed, bounced], default: active }
 *               customFields: { type: object, example: { company: "PT Sukses" } }
 *               listId: { type: integer, example: 1 }
 *               tagIds: { type: array, items: { type: integer }, example: [1, 2] }
 *     responses:
 *       201:
 *         description: Kontak berhasil dibuat
 *       400:
 *         description: Validasi input gagal
 *       409:
 *         description: Kontak duplikat
 */
router.post("/", requirePermission("contacts", "create"), createContactController);

/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     summary: Update data kontak
 *     tags: [Contacts]
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
 *               name: { type: string, example: "Budi Santoso Update" }
 *               email: { type: string, example: "budi.new@example.com" }
 *               phone: { type: string, example: "08123456789" }
 *               whatsappNumber: { type: string, example: "08123456789" }
 *               teleChatId: { type: string, example: "123456789" }
 *               status: { type: string, enum: [active, unsubscribed, bounced] }
 *               customFields: { type: object }
 *               listId: { type: integer }
 *               tagIds: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: Kontak berhasil diperbarui
 *       404:
 *         description: Kontak tidak ditemukan
 */
router.put("/:id", requirePermission("contacts", "edit"), updateContactController);

/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     summary: Hapus satu kontak (Soft Delete)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Kontak berhasil dihapus
 *       404:
 *         description: Kontak tidak ditemukan
 */
/**
 * @openapi
 * /contacts/import:
 *   post:
 *     summary: Bulk import kontak (CSV / Excel data)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contacts]
 *             properties:
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name]
 *                   properties:
 *                     name: { type: string, example: "Andi Pratama" }
 *                     email: { type: string, example: "andi@example.com" }
 *                     phone: { type: string, example: "081298765432" }
 *                     whatsappNumber: { type: string, example: "081298765432" }
 *               listId: { type: integer, example: 1 }
 *               tagsIds: { type: array, items: { type: integer }, example: [1] }
 *               duplicateStrategy: { type: string, enum: [skip, update], default: skip }
 *     responses:
 *       200:
 *         description: Proses import kontak selesai
 */
router.post("/import", requirePermission("contacts", "create"), importContactsController);


router.delete("/:id", requirePermission("contacts", "delete"), deleteContactController);

/**
 * @openapi
 * /contacts/bulk-delete:
 *   post:
 *     summary: Hapus massal kontak (Soft Delete)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
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
 *         description: Kontak berhasil dihapus massal
 */
router.post("/bulk-delete", requirePermission("contacts", "delete"), bulkDeleteContactsController);

export default router;
