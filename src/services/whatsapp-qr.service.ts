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
const activeSendingTenants: Set<number> = new Set();

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

    // Menangani pesan masuk (Inbound messages & Auto-Opt-Out "Berhenti" / "STOP")
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify" || !messages || messages.length === 0) return;

        for (const msg of messages) {
            // Abaikan jika pesan berasal dari diri sendiri atau broadcast status
            if (msg.key.fromMe || msg.key.remoteJid === "status@broadcast") continue;

            const remoteJid = msg.key.remoteJid;
            if (!remoteJid || !remoteJid.endsWith("@s.whatsapp.net")) continue;

            const rawText =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                "";
            const text = rawText.trim().toLowerCase();
            if (!text) continue;

            const rawPhone = remoteJid.split("@")[0] || "";
            const cleanPhone = rawPhone.replace(/\D/g, "");

            // Cek apakah pesan merupakan permohonan berhenti berlangganan
            const isUnsubscribe = [
                "berhenti",
                "stop",
                "unsubscribe",
                "unsub",
                "batal",
                "keluar",
            ].includes(text);

            try {
                // Cocokkan 9 digit terakhir untuk nomor 08xxx vs 628xxx
                const last9Digits = cleanPhone.slice(-9);
                const contact = await prisma.contact.findFirst({
                    where: {
                        tenantId,
                        OR: [
                            { whatsappNumber: { contains: last9Digits } },
                            { phone: { contains: last9Digits } },
                        ],
                    },
                });

                if (isUnsubscribe) {
                    if (contact) {
                        // 1. Catat status Consent menjadi opted_out
                        await prisma.consent.upsert({
                            where: {
                                contactId_channel: {
                                    contactId: contact.id,
                                    channel: "whatsapp",
                                },
                            },
                            update: {
                                status: "opted_out",
                                updatedAt: new Date(),
                            },
                            create: {
                                contactId: contact.id,
                                channel: "whatsapp",
                                status: "opted_out",
                            },
                        });

                        // 2. Perbarui waktu interaksi terakhir
                        await prisma.contact.update({
                            where: { id: contact.id },
                            data: { lastInboundAt: new Date() },
                        });

                        // 3. Kirim konfirmasi opt-out ramah & resmi
                        await sock.sendMessage(remoteJid, {
                            text: `Permintaan Anda berhasil diproses. Nomor Anda telah dinonaktifkan dari daftar pesan promosi kami. Anda tidak akan menerima pesan blast lagi.\n\nKetik *GABUNG* jika ingin berlangganan kembali di kemudian hari.\nTerima kasih.`,
                        });

                        console.log(`[WA-QR] Auto Opt-Out berhasil untuk ${contact.name} (+${cleanPhone})`);
                    } else {
                        await sock.sendMessage(remoteJid, {
                            text: `Nomor Anda telah dicatat untuk tidak menerima pesan promosi dari kami. Terima kasih.`,
                        });
                    }
                } else if (text === "gabung" || text === "join") {
                    // Jika pelanggan ingin berlangganan kembali
                    if (contact) {
                        await prisma.consent.upsert({
                            where: {
                                contactId_channel: {
                                    contactId: contact.id,
                                    channel: "whatsapp",
                                },
                            },
                            update: {
                                status: "opted_in",
                                updatedAt: new Date(),
                            },
                            create: {
                                contactId: contact.id,
                                channel: "whatsapp",
                                status: "opted_in",
                            },
                        });

                        await sock.sendMessage(remoteJid, {
                            text: `Terima kasih! Nomor Anda telah aktif kembali untuk menerima informasi dan penawaran dari kami.`,
                        });
                        console.log(`[WA-QR] Re-Opt-In untuk ${contact.name} (+${cleanPhone})`);
                    }
                } else if (contact) {
                    // Update lastInboundAt jika customer membalas pesan biasa
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: { lastInboundAt: new Date() },
                    });
                }
            } catch (err) {
                console.error("[WA-QR] Error saat menangani pesan masuk:", err);
            }
        }
    });

    return getWhatsappQrStatus(tenantId);
}

/**
 * Memeriksa apakah tanggal lastMessageSentAt berbeda dengan hari ini (WIB).
 * Jika sudah berganti hari (lewat 00:00 WIB), reset dailyCount = 0 di database.
 */
const checkAndResetDailyQuota = async (session: { id: number; lastMessageSentAt: Date | null; dailyCount: number }) => {
    if (!session.lastMessageSentAt || session.dailyCount === 0) {
        return session.dailyCount;
    }

    const now = new Date();
    // Bandingkan tanggal berbasis zona waktu WIB (Asia/Jakarta)
    const lastDate = session.lastMessageSentAt.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
    const currentDate = now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });

    if (lastDate !== currentDate) {
        await prisma.whatsappQrSession.update({
            where: { id: session.id },
            data: { dailyCount: 0 },
        });
        return 0;
    }

    return session.dailyCount;
};

// mengambil status koneksi qr code saat ini
export const getWhatsappQrStatus = async (tenantId: number) => {
    const sessionDb = await prisma.whatsappQrSession.findUnique({ where: { tenantId } });

    // Auto-reconnect jika status di database 'connected' tapi socket belum aktif di memori
    if (sessionDb?.status === "connected" && !activeSockets.has(tenantId)) {
        const sessionDir = getSessionDir(tenantId);
        if (fs.existsSync(path.join(sessionDir, "creds.json"))) {
            initWhatsappQrSession(tenantId).catch((err) => {
                console.error(`[WhatsApp Web] Gagal auto-reconnect tenant #${tenantId}:`, err);
            });
        }
    }

    const cachedQr = activeQrCodes.get(tenantId);

    let currentDailyCount = sessionDb?.dailyCount || 0;
    if (sessionDb) {
        currentDailyCount = await checkAndResetDailyQuota(sessionDb);
    }

    return {
        status: sessionDb?.status || "disconnected",
        phoneNumber: sessionDb?.phoneNumber || null,
        pushName: sessionDb?.pushName || null,
        qrDataUrl: cachedQr?.qrDataUrl || null,
        connectedAt: sessionDb?.connectedAt || null,
        dailyCount: currentDailyCount,
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
    message: string,
    mediaUrl?: string
)=> {

    // Cegat jika ada pengiriman yang sedang berjalan
    if (activeSendingTenants.has(tenantId)) {
        throw new AppError("Pesan WhatsApp sedang dalam proses pengiriman. Mohon tunggu hingga proses selesai.", 429)
    }


    let sock = activeSockets.get(tenantId);
    const sessionDb = await prisma.whatsappQrSession.findUnique({
        where: { tenantId }
    });



    // Jika socket di memori belum ada tapi kredensial sesi tersimpan di disk, hubungkan otomatis
    if (!sock && sessionDb?.status === "connected") {
        const sessionDir = getSessionDir(tenantId);
        if (fs.existsSync(path.join(sessionDir, "creds.json"))) {
            await initWhatsappQrSession(tenantId);
            // tunggu sejenak hingga socket siap terhubung
            for (let i = 0; i < 5; i++) {
                sock = activeSockets.get(tenantId);
                if (sock) break;
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }

    if (!sock || sessionDb?.status !== "connected") {
        throw new AppError("Koneksi WhatsApp belum terhubung. Silahkan scan QR Code terlebih dahulu", 400);
    }

    // Periksa reset kuota harian jika sudah lewat 00:00 WIB
    const activeDailyCount = await checkAndResetDailyQuota(sessionDb);

    // cek kuota pengiriman harian
    if (activeDailyCount >= sessionDb.dailyQuota) {
        throw new AppError(
            `Batas kuota pengiriman harian (${sessionDb.dailyQuota} pesan) telah tercapai untuk nomor ini. Kuota akan direset otomatis pukul 00:00 WIB.`, 429);
    }

    // format nomor Whatsapp
    let cleanNumber = recipientPhone.replace(/\D/g, "");
    if (cleanNumber.startsWith("0")) {
        cleanNumber = "62" + cleanNumber.slice(1);
    }
    const jid = `${cleanNumber}@s.whatsapp.net`;

    try {
        activeSendingTenants.add(tenantId);
        // Simulasi kehadiran "sedang mengetik..."
        await sock.sendPresenceUpdate("composing", jid);
        await new Promise((resolve) => setTimeout(resolve, 2500)); // jeda 2.5 detik
        await sock.sendPresenceUpdate("paused", jid);
        // Kirim pesan teks
        let sent:any;
       if (mediaUrl && mediaUrl.trim()) {
            sent = await sock.sendMessage(jid, {
                image: { url: mediaUrl.trim() },
                caption: message,
            });
        } else {
            sent = await sock.sendMessage(jid, { text: message });
        }
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
    } finally {
        activeSendingTenants.delete(tenantId);
    }
};

/**
 * Memulihkan semua sesi WhatsApp Web yang tersimpan saat server baru dijalankan
 */
export const restoreActiveWhatsappSessions = async () => {
    try {
        const connectedSessions = await prisma.whatsappQrSession.findMany({
            where: { status: "connected" },
        });

        for (const session of connectedSessions) {
            const sessionDir = getSessionDir(session.tenantId);
            if (fs.existsSync(path.join(sessionDir, "creds.json"))) {
                console.log(`[WhatsApp Web] Memulihkan sesi otomatis untuk tenant #${session.tenantId}...`);
                initWhatsappQrSession(session.tenantId).catch((err) => {
                    console.error(`[WhatsApp Web] Gagal restore sesi tenant #${session.tenantId}:`, err);
                });
            }
        }
    } catch (err) {
        console.error("[WhatsApp Web] Gagal memulihkan sesi saat startup:", err);
    }
};
