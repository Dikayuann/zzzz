import { Request, Response } from "express";
import {
    registerSchema,
    verifiyEmailSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    resendVerificationSchema, } from "../schemas/auth.schema";
import {
    registerUser,
    verifyEmail,
    resendVerificationEmail,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    changePassword, } from "../services/auth.service";


export const registerController = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Data register tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        const user = await registerUser(result.data);

        return res.status(201).json({
            message: "Register berhasil. Silakan cek email untuk verifikasi.",
            user,
            verificationToken: user.rawToken, //testing only
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
};

export const verifyEmailController = async (req: Request, res: Response) => {
    const result = verifiyEmailSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Token tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        await verifyEmail(result.data);
        return res.status(200).json({ message: "Email berhasil diverifikasi. Akun aktif." });
    } catch (error: any) {
        if (error.message === "TOKEN_INVALID_OR_EXPIRED") {
            return res.status(400).json({ message: "Token verifikasi tidak valid atau sudah kadaluarsa" });
        }
        return res.status(500).json({ message: "Terjadi kesalahan internal"});
    }
 };

export const resendVerificationController = async (req: Request, res: Response) => {
    const result = resendVerificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Email tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        const response = await resendVerificationEmail(result.data.email);
        return res.status(200).json(response);
    } catch (error: any) {
        return res.status(500).json({ message: "Gagal mengirim ulang email verifikasi" });
    }
};

export const loginController = async (req: Request, res: Response ) => {
    const result = loginSchema.safeParse(req.body);

    if(!result.success) {
        return res.status(400).json({
            message: "Data login tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        const authData = await loginUser(result.data);
        return res.status(200).json({
            message: "Login berhasil",
            ...authData,
        });
    } catch (error: any) {
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({message: "Email atau password salah"});
        }
        if (error.message === "ACCOUNT_LOCKED") {
            return res.status(403).json({message: "Akun Anda terkunci sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam 15 menit."});
        }
        if (error.message === "EMAIL_NOT_VERIFIED") {
            return res.status(403).json({message: "Silahkan verifikasi email Anda terlebih dahulu"});
        }
        if (error.message === "ACCOUNT_INACTIVE") {
            return res.status(403).json({message: "Akun Anda tidak aktif. Silahkan hubungi admin."});
        }
        return res.status(500).json({ message: "Terjadi kesalahan internal"})
    }
};

// refresh token
export const refreshTokenController = async (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Refresh token tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        const data = await refreshAccessToken(result.data);
        return res.status(200).json({
            message: "Token berhasil diperbarui",
            ...data,
        });
    } catch (error: any) {
        if (error.message === "INVALID_REFRESH_TOKEN") {
            return res.status(400).json({message: "Refresh token tidak valid atau sudah kadaluarsa"});
        }
        return res.status(500).json({message: "Terjadi kesalahan internal"});
    }
};

// logout
export const logoutController = async (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Refresh token wajib dikirim untuk logout",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        await logoutUser(result.data.refreshToken);
        return res.status(200).json({
            message: "Logout berhasil",
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan internal"
        });
    }
};

// forgot password
export const forgotPasswordController = async (req: Request, res: Response) => {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Format email tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        const data = await forgotPassword(result.data);
        return res.status(200).json({
            message: "Jika email terdaftar, instruksi reset password telah dikirim.",
            resetToken: data.rawToken, // testing only
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan internal"
        });
    }
};

// reset password
export const resetPasswordController = async (req: Request, res: Response) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Data reset password tidak valid",
            errors: result.error.issues.map((issue) => issue.message),
        });
    }

    try {
        await resetPassword(result.data);
        return res.status(200).json({
            message: "Password berhasil diubah. Silakan login kembali."
        });
    } catch (error: any) {
        if (error.message === "TOKEN_INVALID_OR_EXPIRED") {
            return res.status(400).json({
                message: "Token reset password tidak valid atau sudah kadaluarsa"
            });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal"});
    }
};

// change password required user login
export const changePasswordController = async (req:Request, res:Response) => {
    const userId = req.user?.userId
    if (!userId) {
        return res.status(401).json({
            message: "Akses tidak diizinkan"});
    }

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "data change password tidak valid",
            errors: result.error.issues.map((issue) => issue.message ),
        });
    }

    try {
        await changePassword(userId, result.data);
        return res.status(200).json({
            message: "Password berhasil diperbarui"});
    } catch (error: any) {
        if (error.message === "INVALID_CURRENT_PASSWORD" || error.message === "CURRENT_PASSWORD_NOT_MATCH" ) {
            return res.status(400).json({
                message: "Password salah"});
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal"});
    }
};






