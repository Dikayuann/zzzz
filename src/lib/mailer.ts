import nodemailer from "nodemailer";
import prisma from "./prisma";
import { AppError } from "../shared/errors/AppError";
import { decrypt } from "./encryption";

export interface SendEmailOptions {
    tenantId: number;
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    const { tenantId, to, subject, html, text } = options;

    // ambil konfigurasi SMTP tenant dari database
    const config = await prisma.smtpConfig.findUnique({ where: { tenantId } });

    if (!config) {
        throw new AppError("Server SMTP belum dikonfigurasi. Harap simpan pengaturan SMTP terlebih dahulu.", 400);
    }

    // buat transporter nodemailer
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.encryption === "SSL" || config.port === 465,
        auth: {
            user: config.username,
            pass: decrypt(config.passwordEncrypted),
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // menentukan nama & alamat pengirim
    const fromAddress = config.fromName ? `"${config.fromName}" <${config.fromEmail || config.username}>` : config.fromEmail || config.username;

    // kirim email
    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html,
            text,
        });

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (err: any) {
        console.error("[Mailer Error]:", err.message || err);
        throw new AppError (`Gagal mengirim email: ${err.message || "Kesalahan server SMTP"}`, 500
        );
    }

};