import { Request, Response} from "express";
import { createRoleSchema } from "../schemas/role.schema";
import { getRoles, getPermissions, createCustomRole } from "../services/role.service";

// controller untuk mengambil daftar role
export const listRolesController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
        return res.status(401).json({ message: "Tenant tidak ditemukan dalam token" });
    }

    try {
        const roles = await getRoles(tenantId);
        return res.status(200).json({
           message: "Berhasil mengambil daftar role",
            data: roles,
        });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// Controller untuk mengambil seluruh daftar permission
export const listPermissionsController = async (req: Request, res: Response) => {
    try {
        const permissions = await getPermissions();
        return res.status(200).json({
            message: "Berhasil mengambil daftar permission",
            data:permissions,
        });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

// Controller untuk membuat role kustom baru
export const createRoleController = async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const actorUserId = req.user?.userId;

    if (!tenantId || !actorUserId) {
        return res.status(401).json({ message: "Akses tidak sah" });
    }

    const result = createRoleSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ message: "Data role tidak valid", errors: result.error.issues.map((issue) => issue.message)
        });
    }

    try {
        const newRole = await createCustomRole(tenantId, actorUserId, result.data);
        return res.status(201).json({
            message: "Role kustom berhasil dibuat",
            data: newRole,
        });
    }catch (error: any) {
       if (error.message === "ROLE_NAME_DUPLICATE") {
           return res.status(409).json({
               message: "Nama role sudah digunakan di organisasi ini " });
       }
       if (error.message === "INVALID_PERMISSION_IDS") {
           return res.status(400).json({
               message: "Satu atau lebih ID permission yang dipilih tidak valid"});
       }
       return res.status(500).json({ message: "Terjadi kesalahan internal saat membuat role" });
    }
};
