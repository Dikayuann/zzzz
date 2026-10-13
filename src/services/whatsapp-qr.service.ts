import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import prisma from "../lib/prisma";
import { AppError } from "../shared/errors/AppError";

// cache in-memory untuk menyimpan koneksi socket aktif per tenant

const activeSockets: Map<number, WASocket> = new Map();
const activeQrCodes: Map<number, { qrRaw: string; qrDataUrl:string } > = new Map();

// helper untuk direktori sesi auth
const getSessionDir = (tenantId: number) => {
    const dir = path.join(process.cwd(), "sessions", `tenant_${tenantId}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

export const initWhatsappQrSession = async (tenantId: number) => {
    // cek apakah socket sudah ada dan aktif
    const existingSocket = activeSockets.get(tenantId);
    const sessionDb = await prisma.whatsappQrSession.findUnique({ where: { tenantId } });

    if (existingSocket && sessionDb?.status === "connected") {
        return {
            status: "connected",
            phoneNumber: sessionDb.phoneNumber,
            pushName: sessionDb.pushName,
            message: "WhatsApp sudah terhubung"
        }
    }

    const sessionDir = getSessionDir(tenantId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Campaign Blast", "Chrome", "1.0.0"],
    });

    activeSockets.set(tenantId, sock);

    // Simpan kredensial saat ada update
    sock.ev.on("creds.update", saveCreds);

    // simpan kredensial saat ada update
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        //  Saat Baileys mengeluarkan QR Code baru
        if (qr) {
            try {
                const qrDataUrl = await QRCode.toDataURL(qr);
                activeQrCodes.set(tenantId, { qrRaw: qr, qrDataUrl });
        await prisma.whatsappQrSession.upsert({
            where: { tenantId },
            update: { status: "qr_ready", qrRaw: qr },
            create: { tenantId, status: "qr_ready", qrRaw: qr },
        });
    } catch (err) {
                console.error("Gagal generate QR Data URL:", err);
            }
        }

        // Saat HP berhasil Scan dan Terhubung (OPEN)
        if (connection === "open") {
            const rawId = sock.user?.id || "";
            const phoneNumber = rawId.split(":")
            [0]?.split("@")[0] || null;
            const pushName = sock.user?.name || sock.user?.notify || "WhatsApp User";

            activeQrCodes.delete(tenantId);

            await prisma.whatsappQrSession.upsert({
                where: { tenantId },
                update: {
                    status: "connected",
                    phoneNumber,
                    pushName,
                    qrRaw: null,
                    connectedAt: new Date(),
                    lastActiveAt: new Date(),
                },
                create: {
                    tenantId,
                    status: "connected",
                    phoneNumber,
                    pushName,
                    qrRaw: null,
                    connectedAt: new Date(),
                    lastActiveAt: new Date(),
                },
            });

            console.log(`[WA-QR] Tenant ${tenantId} WhatsApp Connected: +${phoneNumber} (${pushName})`);
        }

        // saat koneksi terputus
        if (connection === "close") {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            activeQrCodes.delete(tenantId);
            activeSockets.delete(tenantId);

            if (statusCode === DisconnectReason.loggedOut) {
                // logout dari hp bersihkan sesi
                try {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                } catch (_) {}
                await prisma.whatsappQrSession.updateMany({
                    where: { tenantId },
                    data: {
                        status: "disconnected",
                        qrRaw: null,
                    },
                });
            } else if (shouldReconnect) {
                // Terputus sementara (misal koneksi goyang), sambungkan kembali

                initWhatsappQrSession(tenantId).catch(console.error);
            }
        }
    });
    return getWhatsappQrStatus(tenantId);
}

// mengambil status koneksi qr code saat ini
export const getWhatsappQrStatus = async (tenantId: number) => {
    const sessionDb = await prisma.whatsappQrSession.findUnique({ where: { tenantId } });

    const cachedQr = activeQrCodes.get(tenantId);

    return {
        status: sessionDb?.status || "disconnected",
        phoneNumber: sessionDb?.phoneNumber || null,
        pushName: sessionDb?.pushName || null,
        qrDataUrl: cachedQr?.qrDataUrl || null,
        connectedAt: sessionDb?.connectedAt || null,
        dailyCount: sessionDb?.dailyCount || 0,
        dailyQuota: sessionDb?.dailyQuota || 300,
    };
};

// putuskan Sesi WhatsApp Web (Logout)
export const disconnectWhatsappQrSession = async (tenantId: number) => {
    const sock = activeSockets.get(tenantId);

    if (sock) {
        try {
            await sock.logout();
        } catch (_) {}
        activeSockets.delete(tenantId);
    }

    activeSockets.delete(tenantId);

    const sessionDir = getSessionDir(tenantId);

    try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
    } catch (_) {}

    await prisma.whatsappQrSession.updateMany({
        where: { tenantId },
        data: {
            status: "disconnected",
            qrRaw: null,
            phoneNumber: null,
            pushName: null,
        },
    });

    return { success: true, message: "Sesi WhatsApp berhasil diputuskan" };
};

// kirim pesan via whatsapp web
export const sendWhatsappQrMessage = async (
    tenantId: number,
    recipientPhone: string,
    message: string
)=> {
    const sock = activeSockets.get(tenantId);
    const sessionDb = await prisma.whatsappQrSession.findUnique({
        where: { tenantId }
    });

    if (!sock || sessionDb?.status !== "connected") {
        throw new AppError("Koneksi WhatsApp belum terhubung. Silahkan scan QR Code terlebih dahulu", 400);
    }

    // cek kuota pengiriman harian
    if (sessionDb.dailyCount >= sessionDb.dailyQuota) {
        throw new AppError(
            `Batas kuota pengiriman harian (${sessionDb.dailyQuota} pesan) telah tercapai untuk nomor ini`, 429);
    }

    // format nomor Whatsapp
    let cleanNumber = recipientPhone.replace(/\D/g, "");
    if (cleanNumber.startsWith("0")) {
        cleanNumber = "62" + cleanNumber.slice(1);
    }
    const jid = `${cleanNumber}@s.whatsapp.net`;

    try {
        // Simulasi kehadiran "sedang mengetik..."
        await sock.sendPresenceUpdate("composing", jid);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // jeda 1.5 detik
        await sock.sendPresenceUpdate("paused", jid);
        // Kirim pesan teks
        const sent = await sock.sendMessage(jid, { text: message });
        // Update counter pengiriman di database
        await prisma.whatsappQrSession.update({
            where: { tenantId },
            data: {
                dailyCount: { increment: 1 },
                lastMessageSentAt: new Date(),
                lastActiveAt: new Date(),
            },
        });
        return {
            success: true,
            message: `Pesan berhasil dikirim ke +${cleanNumber}`,
            messageId: sent?.key?.id,
        };
    } catch (err: any) {
        throw new AppError(`Gagal mengirim pesan WhatsApp: ${err.message || "Error tidak diketahui"}`, 500);
    }

};
