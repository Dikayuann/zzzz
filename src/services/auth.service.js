import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
export const registerUser = async (data) => {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    // Buat kode OTP 6 digit acak & hash SHA-256 untuk disimpan ke DB
    const rawToken = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 menit
    const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: data.organizationName,
                status: "ACTIVE",
            },
        });
        let adminRole = await tx.role.findFirst({
            where: { name: "Org Admin", tenantId: null },
        });
        if (!adminRole) {
            adminRole = await tx.role.create({
                data: {
                    tenantId: tenant.id,
                    name: "Org Admin",
                    isCustom: false,
                },
            });
        }
        const user = await tx.user.create({
            data: {
                tenantId: tenant.id,
                name: data.name,
                email: data.email,
                passwordHash,
                status: "PENDING_VERIFICATION",
                userRoles: { create: { roleId: adminRole.id } },
            },
            select: {
                id: true,
                tenantId: true,
                name: true,
                email: true,
                status: true,
                userRoles: { select: { role: { select: { name: true } } } },
            },
        });
        await tx.emailVerification.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        return { user, rawToken };
    });
    return result;
};
// verify email
export const verifyEmail = async (data) => {
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    return prisma.$transaction(async (tx) => {
        const record = await tx.emailVerification.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (!record) {
            throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }
        await tx.emailVerification.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });
        await tx.user.update({
            where: { id: record.userId },
            data: { status: "ACTIVE" },
        });
        return { success: true };
    });
};
// resend verification email
export const resendVerificationEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return { success: true, message: "Jika email terdaftar, instruksi verifikasi telah dikirim." };
    }
    if (user.status === "ACTIVE") {
        return { success: true, message: "Akun sudah aktif. Silakan langsung login." };
    }
    const rawToken = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 menit
    await prisma.emailVerification.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    return {
        success: true,
        message: "Kode OTP baru telah dikirim ke email Anda.",
        verificationToken: rawToken,
    };
};
export const loginUser = async (data) => {
    // menacari user berdasarkan email
    const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
            userRoles: {
                include: { role: true }
            },
        },
    });
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // wajib sudah verifikasi email
    if (user.status === "PENDING_VERIFICATION") {
        throw new Error("EMAIL_NOT_VERIFIED");
    }
    if (user.status !== "ACTIVE") {
        throw new Error("ACCOUNT_INACTIVE");
    }
    // update lastLoginAt
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });
    const roles = user.userRoles.map((ur) => ur.role.name);
    // generate access token (15 menit)
    const accessToken = jwt.sign({
        userId: user.id,
        tenantId: user.tenantId,
        roles,
    }, JWT_SECRET, { expiresIn: "15m" });
    // Generate Refresh Token acak & simpan hash ke DB (7 hari)
    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    return {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
            id: user.id,
            tenantId: user.tenantId,
            name: user.name,
            email: user.email,
            roles,
        },
    };
};
// refresh access token
export const refreshAccessToken = async (data) => {
    const tokenHash = crypto.createHash("sha256").update(data.refreshToken).digest("hex");
    const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
            tokenHash,
            revokedAt: null,
            expiresAt: { gt: new Date() },
        },
        include: {
            user: {
                include: {
                    userRoles: {
                        include: { role: true },
                    },
                },
            },
        },
    });
    if (!tokenRecord) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    const user = tokenRecord.user;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const newAccessToken = jwt.sign({
        userId: user.id,
        tenantId: user.tenantId,
        roles,
    }, JWT_SECRET, { expiresIn: "15m" });
    return { accessToken: newAccessToken };
};
// logout user mencabut refresh token
export const logoutUser = async (rawRefreshToken) => {
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
    return { success: true };
};
//  forgot password generate reset token
export const forgotPassword = async (data) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    });
    // email tidak terdaftar tetap return sukses
    if (!user) {
        return { success: true, rawToken: null };
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 menit
    await prisma.passwordReset.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    return { success: true, rawToken };
};
export const resetPassword = async (data) => {
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    const record = await prisma.passwordReset.findFirst({
        where: {
            tokenHash,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
    });
    if (!record) {
        throw new Error("TOKEN_INVALID_OR_EXPIRED");
    }
    const newPasswordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    await prisma.$transaction(async (tx) => {
        // update password user
        await tx.user.update({
            where: { id: record.userId },
            data: { passwordHash: newPasswordHash },
        });
        // tandai token reset sudah digunakan
        await tx.passwordReset.update({
            where: { id: record.id },
            data: { usedAt: new Date() },
        });
        // Revoke semua refresh token aktif agar session lama ter-logout
        await tx.refreshToken.updateMany({
            where: { userId: record.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    });
    return { success: true };
};
// change password (user sedang login)
export const changePassword = async (userId, data) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
        throw new Error("CURRENT_PASSWORD_NOT_MATCH");
    }
    const newPasswordHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
    });
    return { success: true };
};
