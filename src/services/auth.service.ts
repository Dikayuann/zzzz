import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma";
import { RegisterInput,
    VerifyEmailInput,
    LoginInput,
    RefreshTokenInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    ChangePasswordInput } from "../schemas/auth.schema";
import { logAudit } from "../lib/audit";


const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret"

export const registerUser = async (data: RegisterInput) => {
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

    await logAudit({
        tenantId: result.user.tenantId,
        actorId: result.user.id,
        action: "USER_REGISTER",
        entityType: "User",
        entityId: result.user.id,
        details: { email: data.email, organizationName: data.organizationName },
    });

    return result;
};

// verify email
export const verifyEmail = async (data: VerifyEmailInput) => {
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
export const resendVerificationEmail = async (email: string) => {
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

export const loginUser = async (data: LoginInput ) => {
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
        throw new Error("INVALID_CREDENTIALS")
    }

    // cek apakah akun sedang terkunci
    if (user.lockedUntil) {
        const now = new Date();
        if (user.lockedUntil > now) {
            // masih terkunci
            throw new Error("ACCOUNT_LOCKED")
        }
        // Jika waktu 15 menit sudah lewat, buka kuncian di database
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0, lockedUntil: null },
        });
        // Reset juga variabel di memori JavaScript agar tidak membawa nilai 5 lama
        user.failedLoginCount = 0;
        user.lockedUntil = null;
    }

    //cek password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
        const newCount = user.failedLoginCount + 1;
        const updateData: any = { failedLoginCount: newCount };

        // Jika sudah 5x salah, set waktu lockout 15 menit dari sekarang
        if (newCount >= 5 ) {
            updateData.lockedUntil = new Date(Date.now() + 1000 * 60 * 15); // 15 menit
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        // Lempar ACCOUNT_LOCKED jika ini percobaan ke-5 (baru saja terkunci)
        if (newCount >= 5) {
            await logAudit({ tenantId: user.tenantId,
            actorId: user.id ,
            action: "ACCOUNT_LOCKED",
            entityType: "User",
            entityId: user.id,
            details: { email: user.email, reason: "5_FAILED_LOGIN_ATTEMPTS" },
            });
            throw new Error("ACCOUNT_LOCKED");
        }

        // catat percobaan gagal
        await logAudit({
            tenantId: user.tenantId,
            actorId: user.id,
            action: "LOGIN_FAILED",
            entityType: "User",
            entityId: user.id,
            details: { email: user.email, failedCount: newCount },
        });

        throw new Error("INVALID_CREDENTIALS");
    }


    // wajib sudah verifikasi email
    if (user.status === "PENDING_VERIFICATION") {
        throw new Error("EMAIL_NOT_VERIFIED")
    }

    if (user.status !== "ACTIVE") {
        throw new Error("ACCOUNT_INACTIVE")
    }

    // update lastLoginAt
    await prisma.user.update({
        where: {id: user.id },
        data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date() },
    });

    const roles = user.userRoles.map((ur) => ur.role.name)

    // generate access token (15 menit)
    const accessToken = jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            roles,
        },
        JWT_SECRET,
        { expiresIn: "15m"}
    );

    // Generate Refresh Token acak & simpan hash ke DB (7 hari)
    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    await logAudit({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        details: { email: user.email },
    })

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
export const refreshAccessToken = async (data: RefreshTokenInput) => {
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
                    include: {role: true},
                },
            },
        },
    },
    });

    if (!tokenRecord) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    const user = tokenRecord.user
    const roles = user.userRoles.map((ur) => ur.role.name)

    const newAccessToken = jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            roles,
        },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    return { accessToken: newAccessToken };
};

// logout user mencabut refresh token
export const logoutUser = async (rawRefreshToken: string) => {
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");


    // mencari token record beserta relasi user
    const tokenRecord = await prisma.refreshToken.findFirst({
        where: {tokenHash, revokedAt: null},
        include: {user: true},
    });

    if (tokenRecord) {
        await prisma.refreshToken.update({
            where: {id: tokenRecord.id},
            data: {revokedAt: new Date()},
        });

    // catat audit log logout
    await logAudit({
        tenantId: tokenRecord.user.tenantId,
        actorId: tokenRecord.user.id,
        action: "USER_LOGOUT",
        entityType: "User",
        entityId: tokenRecord.user.id,
        details: {email: tokenRecord.user.email},
    });
}

    return { success: true };
}

//  forgot password generate reset token
export const forgotPassword = async (data: ForgotPasswordInput) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    })

    // email tidak terdaftar tetap return sukses
    if (!user) {
        return { success: true, rawToken: null };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 menit

    await prisma.passwordReset.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    await logAudit({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "FORGOT_PASSWORD_REQUEST",
        entityType: "User",
        entityId: user.id,
        details: {email: user.email},
    })

    return { success: true, rawToken };
}

export const resetPassword = async (data: ResetPasswordInput) => {
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

    await logAudit({
        actorId: record.userId,
        action: "RESET_PASSWORD_SUCCESS",
        entityType: "User",
        entityId: record.userId,
    });

    return { success: true };
};

// change password (user sedang login)
export const changePassword = async (userId: number, data: ChangePasswordInput ) => {
    const user = await prisma.user.findUnique({
        where: {id: userId},
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
        throw new Error("CURRENT_PASSWORD_NOT_MATCH");
    }

    const newPasswordHash  = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash  },
    });

    await logAudit({
        tenantId: user.tenantId,
        actorId: userId,
        action: "CHANGE_PASSWORD_SUCCESS",
        entityType: "User",
        entityId: userId,
    })

    return { success: true };
}

