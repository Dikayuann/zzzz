import { Router } from "express";
import {
    registerController,
    verifyEmailController,
    resendVerificationController,
    loginController,
    refreshTokenController,
    logoutController,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController
} from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register organisasi & user baru (Org Admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationName, name, email, password]
 *             properties:
 *               organizationName: { type: string, example: "PT Maju Terus" }
 *               name: { type: string, example: "Budi Santoso" }
 *               email: { type: string, example: "budi@example.com" }
 *               password: { type: string, example: "Password123!" }
 *     responses:
 *       201:
 *         description: Register berhasil
 */
router.post('/register', registerController);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verifikasi email menggunakan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, example: "token_verifikasi_disini" }
 *     responses:
 *       200:
 *         description: Email berhasil diverifikasi
 */
router.post('/verify-email', verifyEmailController);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     summary: Kirim ulang link verifikasi email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *     responses:
 *       200:
 *         description: Email verifikasi baru dikirim
 */
router.post('/resend-verification', resendVerificationController);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user (mengembalikan access & refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *               password: { type: string, example: "Password123!" }
 *     responses:
 *       200:
 *         description: Login berhasil
 */
router.post('/login', loginController);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Perbarui access token menggunakan refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string, example: "refresh_token_disini" }
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 */
router.post('/refresh', refreshTokenController);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout dan cabut (revoke) refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string, example: "refresh_token_disini" }
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post('/logout', logoutController);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Permintaan token/link reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "budi@example.com" }
 *     responses:
 *       200:
 *         description: Instruksi reset password dikirim
 */
router.post('/forgot-password', forgotPasswordController);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password menggunakan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string, example: "token_reset_disini" }
 *               password: { type: string, example: "PasswordBaru123!" }
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 */
router.post('/reset-password', resetPasswordController);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Ubah password (user login)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: "PasswordLama123!" }
 *               newPassword: { type: string, example: "PasswordBaru123!" }
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 */
router.post('/change-password', authenticateJWT, changePasswordController);

export default router;
