import { inviteUserSchema, updateUserRoleSchema, userQuerySchema, } from "../schemas/user.schema";
import { listUser, inviteUser, changeUserRole, deactivateUser } from "../services/user.service";
// /users GET list anggota tim
export const listUsersController = async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ message: "Akses tidak diizinkan " });
    }
    const queryResult = userQuerySchema.safeParse(req.query);
    const { page, limit, search } = queryResult.success
        ? queryResult.data
        : { page: 1, limit: 10, search: undefined };
    try {
        const result = await listUser(tenantId, page, limit, search);
        return res.status(200).json({
            message: "Berhasil mengambil dari daftar anggota tim",
            ...result,
        });
    }
    catch (error) {
        console.error("[List Users Error]", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};
// POST /users/invite (undang user baru)
export const inviteUserController = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const actorUserId = req.user?.userId;
    if (!tenantId || !actorUserId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }
    const result = inviteUserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: "Data undangan tidak valid",
            errors: result.error.issues.map((i) => i.message)
        });
    }
    try {
        const data = await inviteUser(tenantId, actorUserId, result.data);
        return res.status(201).json({
            message: "Undangan anggota tim berhasil dikirim",
            ...data,
        });
    }
    catch (error) {
        if (error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Email sudah terdaftar di sistem" });
        }
        if (error.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({ message: "Role yang dipilih tidak ditemukan" });
        }
        console.error("[Invite User Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};
export const changeUserRoleController = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const actorUserId = req.user?.userId;
    const targetUserId = Number(req.params.id);
    if (!tenantId || !actorUserId) {
        return res.status(401).json({ message: "Akses tidak diizikan" });
    }
    if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID pengguna tidak valid" });
    }
    const result = updateUserRoleSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Data role tidak valid",
            errors: result.error.issues.map((i) => i.message)
        });
    }
    try {
        const data = await changeUserRole(tenantId, actorUserId, targetUserId, result.data);
        return res.status(200).json({
            message: "Role anggota tim berhasil diperbarui",
            ...data,
        });
    }
    catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "Pengguna tidak ditemukan"
            });
        }
        if (error.message === "CANNOT_CHANGE_OWN_ROLE") {
            return res.status(400).json({ message: "Tidak dapat mengubah role diri sendiri" });
        }
        if (error.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({ message: "Role tujuan tidak ditemukan" });
        }
        console.error("[Change Role Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};
// DELETE /users/{id} (nonaktifkan user)
export const deactivateUserController = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const actorUserId = req.user?.userId;
    const targetUserId = Number(req.params.id);
    if (!tenantId || !actorUserId) {
        return res.status(401).json({ message: "Akses tidak diizinkan" });
    }
    if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID pengguna tidak valid" });
    }
    try {
        await deactivateUser(tenantId, actorUserId, targetUserId);
        return res.status(200).json({ message: "Anggota tim berhasil dinonaktifkan " });
    }
    catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Anggota tim tidak ditemukan" });
        }
        if (error.message === "CANNOT_DEACTIVATE_SELF") {
            return res.status(400).json({ message: "Tidak dapat menonaktifkan diri sendiri" });
        }
        console.error("[Deactivate User Error]:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};
