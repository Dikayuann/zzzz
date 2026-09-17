import cyrpto from "node:crypto";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
const BCYRPT_ROUNDS = 12;
// list user dalam tenant
export const listUser = async (tenantId, page = 1, limit = 10, search) => {
    const skip = (page - 1) * limit;
    const whereCondition = { tenantId };
    if (search) {
        whereCondition.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    const [total, users] = await Promise.all([
        prisma.user.count({ where: whereCondition }), // total
        prisma.user.findMany({
            where: whereCondition, // users array
            skip,
            take: limit,
            select: {
                id: true,
                tenantId: true,
                name: true,
                email: true,
                status: true,
                lastLoginAt: true,
                userRoles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                isCustom: true,
                            },
                        },
                    },
                },
            },
            orderBy: { id: "desc" },
        }),
    ]);
    return {
        data: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            lastLoginAt: u.lastLoginAt,
            roles: u.userRoles.map((ur) => ur.role.name),
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// invite user baru oleh admin
export const inviteUser = async (tenantId, actorUserId, data) => {
    // mengecek email apakah sudah terdaftar
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }
    // mengecek apakah role yang dipilih valid
    const role = await prisma.role.findFirst({
        where: {
            id: data.roleId,
            OR: [{ tenantId: null }, { tenantId: tenantId }]
        }
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    // membuat password sementara untuk user yang diundang
    const randomPassword = cyrpto.randomBytes(8).toString("hex") + "Aa1!";
    const passwordHash = await bcrypt.hash(randomPassword, BCYRPT_ROUNDS);
    // membuat token undangan/verifikasi
    const rawInviteToken = cyrpto.randomBytes(32).toString("hex");
    const tokenHash = cyrpto.createHash("sha256").update(rawInviteToken).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); //48 jam
    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                tenantId,
                name: data.name,
                email: data.email,
                passwordHash,
                status: "INVITED",
                userRoles: {
                    create: { roleId: role.id },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
            },
        });
        await tx.emailVerification.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        return user;
    });
    // catata audit log
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "INVITE_USER",
        entityType: "User",
        entityId: newUser.id,
        details: { email: newUser.email, role: role.name }
    });
    return {
        user: newUser,
        role: role.name,
        inviteToken: rawInviteToken // dikirimkan via STMP Email
    };
};
export const changeUserRole = async (tenantId, actorUserId, targetUserId, data) => {
    // memastikan target user ada di dalam tenant yang sama
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId }
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    // tidak boleh mengubah role diri sendiri untuk mencegah kehilangan akses admin
    if (user.id === actorUserId) {
        throw new Error("CANNOT_CHANGE_OWN_ROLE");
    }
    // memastikan role tujuan valid
    const role = await prisma.role.findFirst({
        where: {
            id: data.roleId,
            OR: [{ tenantId: null }, { tenantId: tenantId }]
        },
    });
    if (!role) {
        throw new Error("ROLE_NOT_FOUND");
    }
    await prisma.$transaction(async (tx) => {
        // hapus role lama
        await tx.userRole.deleteMany({
            where: { userId: targetUserId },
        });
        // pasang role baru
        await tx.userRole.create({
            data: {
                userId: targetUserId,
                roleId: role.id,
            },
        });
    });
    // catat audit log
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "CHANGE_USER_ROLE",
        entityType: "User",
        entityId: targetUserId,
        details: { role: role.name, roleId: role.id },
    });
    return { success: true, newRole: role.name };
};
// nonaktifkan user (deactivate)
export const deactivateUser = async (tenantId, actorUserId, targetUserId) => {
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId }
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    if (user.id === actorUserId) {
        throw new Error("CANNOT_DEACTIVATE_SELF");
    }
    await prisma.$transaction(async (tx) => {
        // update user menjadi inactive
        await tx.user.update({
            where: { id: targetUserId },
            data: { status: "INACTIVE" }
        });
        // revoke refresh token aktif agar session langsung mati
        await tx.refreshToken.updateMany({
            where: { userId: targetUserId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    });
    // catat audit log
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "DEACTIVATE_USER",
        entityType: "User",
        entityId: targetUserId,
    });
    return { success: true };
};
