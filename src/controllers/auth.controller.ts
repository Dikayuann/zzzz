import { Request, Response } from "express";
import {
    registerUser,
    verifyEmail,
    resendVerificationEmail,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    changePassword,
} from "../services/auth.service";

export const registerController = async (req: Request, res: Response) => {
    const user = await registerUser(req.body);
    return res.status(201).json({
        message: "Register berhasil. Silakan cek email untuk verifikasi.",
        user,
        verificationToken: user.rawToken, // testing only
    });
};

export const verifyEmailController = async (req: Request, res: Response) => {
    await verifyEmail(req.body);
    return res.status(200).json({ message: "Email berhasil diverifikasi. Akun aktif." });
};

export const resendVerificationController = async (req: Request, res: Response) => {
    const response = await resendVerificationEmail(req.body.email);
    return res.status(200).json(response);
};

export const loginController = async (req: Request, res: Response) => {
    const authData = await loginUser(req.body);
    return res.status(200).json({
        message: "Login berhasil",
        ...authData,
    });
};

export const refreshTokenController = async (req: Request, res: Response) => {
    const data = await refreshAccessToken(req.body);
    return res.status(200).json({
        message: "Token berhasil diperbarui",
        ...data,
    });
};

export const logoutController = async (req: Request, res: Response) => {
    await logoutUser(req.body.refreshToken);
    return res.status(200).json({
        message: "Logout berhasil",
    });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    const data = await forgotPassword(req.body);
    return res.status(200).json({
        message: "Jika email terdaftar, instruksi reset password telah dikirim.",
        resetToken: data.rawToken, // testing only
    });
};

export const resetPasswordController = async (req: Request, res: Response) => {
    await resetPassword(req.body);
    return res.status(200).json({
        message: "Password berhasil diubah. Silakan login kembali.",
    });
};

// change password requires user login
export const changePasswordController = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await changePassword(userId, req.body);
    return res.status(200).json({
        message: "Password berhasil diperbarui",
    });
};
