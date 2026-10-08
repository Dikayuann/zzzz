import crypto from "node:crypto";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import { InviteUserInput, UpdateUserRoleInput } from "../schemas/user.schema";

const BCRYPT_ROUNDS = 12;

// list user dalam tenant
export const listUser = async (
    tenantId: number,
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const whereCondition: any = { tenantId };

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
export const inviteUser = async (
    tenantId: number,
    actorUserId: number,
    data: InviteUserInput
) => {
    // mengecek email apakah sudah terdaftar
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new AppError("Email sudah terdaftar di sistem", 409);
    }

    // mengecek apakah role yang dipilih valid
    const role = await prisma.role.findFirst({
        where: {
            id: data.roleId,
            OR: [{ tenantId: null }, { tenantId: tenantId }],
        },
    });

    if (!role) {
        throw new AppError("Role yang dipilih tidak ditemukan", 404);
    }

    // membuat password sementara untuk user yang diundang
    const randomPassword = crypto.randomBytes(8).toString("hex") + "Aa1!";
    const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

    // membuat token undangan/verifikasi
    const rawInviteToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawInviteToken).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 jam

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

    // catat audit log
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "INVITE_USER",
        entityType: "User",
        entityId: newUser.id,
        details: { email: newUser.email, role: role.name },
    });

    return {
        user: newUser,
        role: role.name,
        inviteToken: rawInviteToken, // dikirimkan via SMTP Email
    };
};

export const changeUserRole = async (
    tenantId: number,
    actorUserId: number,
    targetUserId: number,
    data: UpdateUserRoleInput
) => {
    // memastikan target user ada di dalam tenant yang sama
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId },
    });

    if (!user) {
        throw new AppError("Pengguna tidak ditemukan", 404);
    }

    // tidak boleh mengubah role diri sendiri untuk mencegah kehilangan akses admin
    if (user.id === actorUserId) {
        throw new AppError("Tidak dapat mengubah role diri sendiri", 400);
    }

    // memastikan role tujuan valid
    const role = await prisma.role.findFirst({
        where: {
            id: data.roleId,
            OR: [{ tenantId: null }, { tenantId: tenantId }],
        },
    });

    if (!role) {
        throw new AppError("Role tujuan tidak ditemukan", 404);
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
export const deactivateUser = async (
    tenantId: number,
    actorUserId: number,
    targetUserId: number
) => {
    const user = await prisma.user.findFirst({
        where: { id: targetUserId, tenantId },
    });

    if (!user) {
        throw new AppError("Anggota tim tidak ditemukan", 404);
    }

    if (user.id === actorUserId) {
        throw new AppError("Tidak dapat menonaktifkan diri sendiri", 400);
    }

    await prisma.$transaction(async (tx) => {
        // update user menjadi inactive
        await tx.user.update({
            where: { id: targetUserId },
            data: { status: "INACTIVE" },
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
