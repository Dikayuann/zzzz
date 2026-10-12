import nodemailer from "nodemailer";
import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import { AppError } from "../shared/errors/AppError";
import { SaveSmtpInput } from "../schemas/smtp.schema";

// Helper untuk membuat transporter Nodemailer berdasarkan konfigurasi
const createTransporter = (config: {
    host: string;
    port: number;
    username: string;
    passwordEncrypted: string;
    encryption: string;
}) => {
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.encryption === "SSL" || config.port === 465, // true untuk port 465, false untuk lainnya
        auth: {
            user: config.username,
            pass: config.passwordEncrypted,
        },
        tls: {
            rejectUnauthorized: false, // fleksibel untuk berbagai mail server
        },
    });
};

// 1. Ambil konfigurasi SMTP tenant
export const getSmtpConfig = async (tenantId: number) => {
    const config = await prisma.smtpConfig.findUnique({
        where: { tenantId },
    });

    if (!config) return null;

    return {
        id: config.id,
        tenantId: config.tenantId,
        host: config.host,
        port: config.port,
        username: config.username,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        encryption: config.encryption,
        verifiedAt: config.verifiedAt,
        createdAt: config.createdAt,
        // Password disamarkan untuk keamanan tampilan frontend
        hasPassword: Boolean(config.passwordEncrypted),
    };
};

// 2. Simpan atau perbarui konfigurasi SMTP
export const saveSmtpConfig = async (
    tenantId: number,
    actorId: number,
    data: SaveSmtpInput
) => {
    const fromEmail = data.fromEmail && data.fromEmail.length > 0 ? data.fromEmail : data.username;
    const fromName = data.fromName || "Campaign Blast";

    const existing = await prisma.smtpConfig.findUnique({ where: { tenantId } });
    const passwordEncrypted = data.password && data.password.trim().length > 0
        ? data.password
        : existing?.passwordEncrypted;

    if (!passwordEncrypted) {
        throw new AppError("Password / App Password wajib diisi untuk konfigurasi awal", 400);
    }

    const config = await prisma.smtpConfig.upsert({
        where: { tenantId },
        update: {
            host: data.host,
            port: data.port,
            username: data.username,
            passwordEncrypted,
            fromName,
            fromEmail,
            encryption: data.encryption,
            verifiedAt: existing?.verifiedAt || new Date(),
        },
        create: {
            tenantId,
            host: data.host,
            port: data.port,
            username: data.username,
            passwordEncrypted,
            fromName,
            fromEmail,
            encryption: data.encryption,
            verifiedAt: new Date(),
        },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "SMTP_CONFIG_SAVE",
        entityType: "SmtpConfig",
        entityId: config.id,
        details: { host: config.host, port: config.port, username: config.username },
    });

    return getSmtpConfig(tenantId);
};

// 3. Uji coba koneksi (handshake) dan kirim email percobaan
export const testSmtpConnection = async (
    tenantId: number,
    actorId: number,
    testEmail: string
) => {
    const config = await prisma.smtpConfig.findUnique({
        where: { tenantId },
    });

    if (!config) {
        throw new AppError("Server SMTP belum dikonfigurasi. Harap simpan pengaturan terlebih dahulu.", 400);
    }

    const transporter = createTransporter(config);

    // Langkah A: Verifikasi koneksi handshake ke server SMTP
    try {
        await transporter.verify();
    } catch (err: any) {
        console.error("[SMTP Handshake Error]:", err);
        throw new AppError("Gagal terhubung ke server SMTP. Periksa Host, Port, atau Username/Password Anda.", 400);
    }

    // Langkah B: Kirim email test sungguhan ke inbox tujuan
    const fromAddress = config.fromName
        ? `"${config.fromName}" <${config.fromEmail || config.username}>`
        : config.fromEmail || config.username;

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: testEmail,
            subject: "🎉 Uji Coba Koneksi SMTP Berhasil - Campaign Blast",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0b996e;">Koneksi SMTP Berhasil! 🚀</h2>
                    <p>Halo,</p>
                    <p>Email ini adalah bukti bahwa konfigurasi server SMTP organisasi Anda di <strong>Campaign Blast Platform</strong> sudah terhubung dengan sempurna dan siap digunakan untuk mengirim broadcast.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">
                        Host: ${config.host} | Port: ${config.port} | Enkripsi: ${config.encryption}<br/>
                        Waktu Pengujian: ${new Date().toLocaleString("id-ID")}
                    </p>
                </div>
            `,
        });

        // Tandai verifiedAt di database
        await prisma.smtpConfig.update({
            where: { tenantId },
            data: { verifiedAt: new Date() },
        });

        await logAudit({
            tenantId,
            actorId,
            action: "SMTP_TEST_SUCCESS",
            entityType: "SmtpConfig",
            entityId: config.id,
            details: { target: testEmail, messageId: info.messageId },
        });

        return {
            success: true,
            message: `Email pengujian berhasil dikirim ke ${testEmail}`,
            messageId: info.messageId,
        };
    } catch (err: any) {
        console.error("[SMTP Send Mail Error]:", err);
        throw new AppError("Pengiriman email uji coba gagal", 500);
    }
};

// 4. Hapus konfigurasi SMTP
export const deleteSmtpConfig = async (tenantId: number, actorId: number) => {
    const config = await prisma.smtpConfig.findUnique({
        where: { tenantId },
    });

    if (!config) {
        throw new AppError("Konfigurasi SMTP memang belum ada", 400);
    }

    await prisma.smtpConfig.delete({
        where: { tenantId },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "SMTP_CONFIG_DELETE",
        entityType: "SmtpConfig",
        entityId: config.id,
        details: { host: config.host },
    });

    return { success: true };
};
