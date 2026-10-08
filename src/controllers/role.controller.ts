import { Request, Response } from "express";
import { getRoles, getPermissions, createCustomRole } from "../services/role.service";

// Controller untuk mengambil daftar role
export const listRolesController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const roles = await getRoles(tenantId);
    return res.status(200).json({
        message: "Berhasil mengambil daftar role",
        data: roles,
    });
};

// Controller untuk mengambil seluruh daftar permission
export const listPermissionsController = async (req: Request, res: Response) => {
    const permissions = await getPermissions();
    return res.status(200).json({
        message: "Berhasil mengambil daftar permission",
        data: permissions,
    });
};

// Controller untuk membuat role kustom baru
export const createRoleController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorUserId = req.user!.userId;

    const newRole = await createCustomRole(tenantId, actorUserId, req.body);
    return res.status(201).json({
        message: "Role kustom berhasil dibuat",
        data: newRole,
    });
};
