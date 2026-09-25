import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { listRolesController,
    listPermissionsController,
    createRoleController
} from "../controllers/role.controller";

const router = Router();

// GET /api/v1/roles
router.get("/", authenticateJWT, listRolesController);

// GET /api/v1/roles/permissions
router.get("/permissions", authenticateJWT, listPermissionsController);

// POST /api/v1/roles
router.post("/", authenticateJWT, requirePermission("role","create"), createRoleController);

export default router;
