import { Request, Response } from "express";
import {
    listUser,
    inviteUser,
    changeUserRole,
    deactivateUser,
} from "../services/user.service";

// /users GET list anggota tim
export const listUsersController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const { page, limit, search } = req.query as any;

    const result = await listUser(tenantId, page, limit, search);
    return res.status(200).json({
        message: "Berhasil mengambil dari daftar anggota tim",
        ...result,
    });
};

// POST /users/invite (undang user baru)
export const inviteUserController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorUserId = req.user!.userId;

    const data = await inviteUser(tenantId, actorUserId, req.body);
    return res.status(201).json({
        message: "Undangan anggota tim berhasil dikirim",
        ...data,
    });
};

// PATCH /users/:id/role
export const changeUserRoleController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorUserId = req.user!.userId;
    const targetUserId = Number(req.params.id);

    if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID pengguna tidak valid" });
    }

    const data = await changeUserRole(tenantId, actorUserId, targetUserId, req.body);
    return res.status(200).json({
        message: "Role anggota tim berhasil diperbarui",
        ...data,
    });
};

// DELETE /users/{id} (nonaktifkan user)
export const deactivateUserController = async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const actorUserId = req.user!.userId;
    const targetUserId = Number(req.params.id);

    if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID pengguna tidak valid" });
    }

    await deactivateUser(tenantId, actorUserId, targetUserId);
    return res.status(200).json({ message: "Anggota tim berhasil dinonaktifkan" });
};