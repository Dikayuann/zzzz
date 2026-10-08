import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../shared/middleware/asyncHandler";
import { validate } from "../shared/middleware/validate";
import { createRoleSchema } from "../schemas/role.schema";
import {
    listRolesController,
    listPermissionsController,
    createRoleController,
} from "../controllers/role.controller";

const router = Router();

// Semua route role membutuhkan login
router.use(authenticateJWT);

// GET /api/v1/roles
router.get("/", asyncHandler(listRolesController));

// GET /api/v1/roles/permissions
router.get("/permissions", asyncHandler(listPermissionsController));

// POST /api/v1/roles
router.post(
    "/",
    requirePermission("role", "create"),
    validate({ body: createRoleSchema }),
    asyncHandler(createRoleController)
);

export default router;
