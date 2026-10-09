import nodemailer from "nodemailer";

// Helper membuat transporter Nodemailer berdasarkan .env
const getSystemTransporter = () => {
    const host = process.env.SYSTEM_SMTP_HOST;
    const user = process.env.SYSTEM_SMTP_USER;
    const pass = process.env.SYSTEM_SMTP_PASS;

    if (!host || !user || !pass) {
        return null; // SMTP belum dikonfigurasi (fallback ke console log)
    }

    const port = Number(process.env.SYSTEM_SMTP_PORT) || 587;
    const secure = process.env.SYSTEM_SMTP_SECURE === "true" || port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
};

/**
 * Wrapper Layout Email Minimalis & Responsif (Standar Stripe / Linear)
 */
const renderEmailWrapper = (title: string, bodyHtml: string): string => {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <!-- Brand Header -->
                    <tr>
                        <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid #f1f5f9;">
                            <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0f172a;">Campaign Blast</span>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 32px 36px 36px 36px;">
                            ${bodyHtml}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                                Ini adalah pesan otomatis dari sistem Campaign Blast. Mohon tidak membalas email ini secara langsung.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${new Date().getFullYear()} Campaign Blast Platform. Hak cipta dilindungi undang-undang.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};

/**
 * 1. Kirim Email OTP Verifikasi Registrasi
 */
export const sendOtpEmail = async (toEmail: string, recipientName: string, otpCode: string): Promise<void> => {
    const transporter = getSystemTransporter();
    const fromAddress = process.env.SYSTEM_SMTP_FROM || "Campaign Blast <noreply@campaignblast.id>";

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`[SYSTEM EMAIL] VERIFIKASI EMAIL (OTP)`);
        console.log(`Kepada   : ${recipientName} <${toEmail}>`);
        console.log(`Kode OTP : ${otpCode}`);
        console.log(`Berlaku  : 30 Menit`);
        console.log(`======================================================\n`);
        return;
    }

    const content = `
        <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #0f172a; letter-spacing: -0.02em;">Verifikasi Alamat Email</h1>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Halo ${recipientName},
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Terima kasih telah mendaftar di Campaign Blast. Gunakan kode verifikasi di bawah ini untuk mengonfirmasi pendaftaran akun Anda:
        </p>
        
        <!-- Minimalist OTP Code Box -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: center; margin: 28px 0;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: #0f172a; display: inline-block;">
                ${otpCode}
            </span>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #64748b;">
            Kode ini berlaku selama <strong>30 menit</strong>. Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan pesan ini.
        </p>
    `;

    await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${otpCode} adalah kode verifikasi Anda`,
        html: renderEmailWrapper("Verifikasi Email", content),
    });
};

/**
 * 2. Kirim Email Link Reset Password
 */
export const sendPasswordResetEmail = async (toEmail: string, recipientName: string, resetToken: string): Promise<void> => {
    const transporter = getSystemTransporter();
    const fromAddress = process.env.SYSTEM_SMTP_FROM || "Campaign Blast <noreply@campaignblast.id>";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`[SYSTEM EMAIL] RESET PASSWORD`);
        console.log(`Kepada    : ${recipientName} <${toEmail}>`);
        console.log(`Reset URL : ${resetUrl}`);
        console.log(`Berlaku   : 30 Menit`);
        console.log(`======================================================\n`);
        return;
    }

    const content = `
        <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #0f172a; letter-spacing: -0.02em;">Atur Ulang Kata Sandi</h1>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Halo ${recipientName},
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Kami menerima permintaan untuk mengatur ulang kata sandi akun Campaign Blast Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
        </p>
        
        <!-- Elegant Slate Button -->
        <div style="text-align: left; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-block;">
                Atur Ulang Kata Sandi
            </a>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #64748b;">
            Tautan ini hanya berlaku selama <strong>30 menit</strong>. Jika Anda tidak meminta pengaturan ulang kata sandi, akun Anda tetap aman dan Anda tidak perlu melakukan tindakan apa pun.
        </p>
        <p style="margin: 16px 0 0 0; font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all;">
            Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:<br>
            <a href="${resetUrl}" style="color: #64748b; text-decoration: underline;">${resetUrl}</a>
        </p>
    `;

    await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: "Instruksi pengaturan ulang kata sandi",
        html: renderEmailWrapper("Reset Password", content),
    });
};

/**
 * 3. Kirim Email Undangan Bergabung ke Organisasi
 */
export const sendInvitationEmail = async (
    toEmail: string,
    recipientName: string,
    organizationName: string,
    inviteToken: string
): Promise<void> => {
    const transporter = getSystemTransporter();
    const fromAddress = process.env.SYSTEM_SMTP_FROM || "Campaign Blast <noreply@campaignblast.id>";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteUrl = `${frontendUrl}/verify-email?token=${inviteToken}&email=${encodeURIComponent(toEmail)}`;

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`[SYSTEM EMAIL] UNDANGAN ANGGOTA TIM`);
        console.log(`Kepada     : ${recipientName} <${toEmail}>`);
        console.log(`Organisasi : ${organizationName}`);
        console.log(`Invite URL : ${inviteUrl}`);
        console.log(`Berlaku    : 48 Jam`);
        console.log(`======================================================\n`);
        return;
    }

    const content = `
        <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #0f172a; letter-spacing: -0.02em;">Undangan Bergabung ke Tim</h1>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Halo ${recipientName},
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
            Anda telah diundang untuk bergabung ke workspace organisasi <strong>${organizationName}</strong> pada platform Campaign Blast.
        </p>
        
        <!-- Elegant Slate Button -->
        <div style="text-align: left; margin: 28px 0;">
            <a href="${inviteUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-block;">
                Terima Undangan
            </a>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 20px; color: #64748b;">
            Tautan undangan ini berlaku selama <strong>48 jam</strong>.
        </p>
        <p style="margin: 16px 0 0 0; font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all;">
            Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:<br>
            <a href="${inviteUrl}" style="color: #64748b; text-decoration: underline;">${inviteUrl}</a>
        </p>
    `;

    await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Undangan bergabung ke ${organizationName}`,
        html: renderEmailWrapper("Undangan Tim", content),
    });
};
