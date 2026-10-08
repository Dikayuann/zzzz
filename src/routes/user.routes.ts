import { Router } from "express";
import {
    listUsersController,
    inviteUserController,
    changeUserRoleController,
    deactivateUserController,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import {
    userQuerySchema,
    inviteUserSchema,
    updateUserRoleSchema,
} from "../schemas/user.schema";

const router = Router();

// Semua route user memerlukan login (authenticateJWT)
router.use(authenticateJWT);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List seluruh anggota tim di organisasi (Tenant)
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Berhasil mengambil data user
 */
router.get(
    "/",
    requirePermission("users", "view"),
    validate({ query: userQuerySchema }),
    asyncHandler(listUsersController)
);

/**
 * @openapi
 * /users/invite:
 *   post:
 *     summary: Mengundang anggota tim baru dengan role tertentu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, roleId]
 *             properties:
 *               name: { type: string, example: "Siti Rahma" }
 *               email: { type: string, example: "siti@example.com" }
 *               roleId: { type: integer, example: 2, description: "1: Org Admin, 2: Campaign Mgr, 3: Editor, 4: Viewer" }
 *     responses:
 *       201:
 *         description: Undangan berhasil dibuat
 */
router.post(
    "/invite",
    requirePermission("users", "create"),
    validate({ body: inviteUserSchema }),
    asyncHandler(inviteUserController)
);

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     summary: Mengubah role anggota tim
 *     tags: [Users]
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
 *             required: [roleId]
 *             properties:
 *               roleId: { type: integer, example: 3 }
 *     responses:
 *       200:
 *         description: Role berhasil diubah
 */
router.patch(
    "/:id/role",
    requirePermission("users", "edit"),
    validate({ body: updateUserRoleSchema }),
    asyncHandler(changeUserRoleController)
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Menonaktifkan anggota tim
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User berhasil dinonaktifkan
 */
router.delete("/:id", requirePermission("users", "delete"), asyncHandler(deactivateUserController));

export default router;
