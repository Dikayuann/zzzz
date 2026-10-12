import {  z } from "zod";


// Helper validasi password sesuai policy 
export const passwordValidation = z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada minimal 1 huruf besar")
    .regex(/[a-z]/, "Harus ada minimal 1 huruf kecil")
    .regex(/[0-9]/, "Harus ada minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Harus ada minimal 1 simbol");

//  register schema
export const registerSchema = z.object({
    organizationName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    password: passwordValidation,
});

// verify email schema
export const verifiyEmailSchema = z.object({
    token: z.string().min(1, "Token verifikasi wajib diisi"),
    email: z.string().email("Format email tidak valid").optional(),
});

// login schema
export const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi")
});

// refresh token schema
export const refreshTokenSchema =
z.object({
    refreshToken: z.string().min(1, "Refresh token wajib diisi"),
})

// forgot password schema
export const forgotPasswordSchema = z.object({
    email: z.string().email("Format email tidak valid"),
});

// reset password schema
export const resetPasswordSchema = 
z.object({
    token: z.string().min(1, "Token reset wajib diisi"),
    password: passwordValidation,
})

// change password schema
export const changePasswordSchema = 
z.object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: passwordValidation,
});



// resend verification schema
export const resendVerificationSchema = z.object({
    email: z.string().email("Format email tidak valid"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifiyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;