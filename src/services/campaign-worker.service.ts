import prisma from "../lib/prisma";
import { AppError } from "../shared/errors/AppError";
import { applyMergeTags } from "../lib/merge-tags";
import { sendWhatsappQrMessage } from "./whatsapp-qr.service";
import { sendEmail } from "../lib/mailer";
import { sendTestTelegramMessage } from "./telegram.service";
import { expandAudience } from "./campaign.service";

// Helper jeda waktu statis & acak (anti-ban simulation)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (minMs: number, maxMs: number) => {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const executeCampaignBlast = async (tenantId: number, campaignId: number) => {
    // 1. Ambil detail campaign beserta template & versinya
    const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
        include: {
            template: true,
            templateVersion: true,
        },
    });
    if (!campaign) {
        throw new AppError("Campaign tidak ditemukan", 404);
    }
    // State Guard: Jangan kirim ulang jika sedang berjalan atau sudah selesai
    if (campaign.status === "sending") {
        throw new AppError("Campaign sedang dalam proses pengiriman", 409);
    }
    if (campaign.status === "sent") {
        throw new AppError("Campaign ini sudah selesai dikirim", 409);
    }
    // 2. Pastikan daftar penerima sudah terisi di campaign_recipients
    let totalQueued = await prisma.campaignRecipient.count({
        where: { campaignId, status: "queued" },
    });

    // Jika antrean masih kosong (misal campaign dari draft langsung dikirim)
    if (totalQueued === 0) {
        // Ambil daftar kontak yang sesuai dengan target audiens & saluran
        const audienceContacts = await expandAudience(
            tenantId,
            campaign.audienceType || "all",
            campaign.audienceRef,
            campaign.channel
        );

        if (audienceContacts.length === 0) {
            throw new AppError("Tidak ada kontak yang memenuhi syarat untuk saluran ini", 400)
        }

        // masukkan semua kontak target ketabel antrean campaign_recipients
        const records = audienceContacts.map((c) => ({
            campaignId: campaign.id,
            contactId: c.id,
            channel: campaign.channel,
            status: "queued",
        }));

        await prisma.campaignRecipient.createMany({
            data: records,
            skipDuplicates: true,
        });

        // update total penerima di campaign
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { totalRecipients: audienceContacts.length },
        });
        totalQueued = audienceContacts.length;

    }
    // 3. Kunci status campaign menjadi 'sending'
    await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            status: "sending",
            sentAt: campaign.sentAt || new Date(),
        },
    });
    // 4. Jalankan pengiriman loop di background (tanpa memblokir respon HTTP)
    (async () => {
        try {
            console.log(`🚀 [Worker] Memulai blast untuk Campaign #${campaign.id}: "${campaign.name}"`);
            // Ambil semua penerima yang masih berstatus 'queued'
            const recipients = await prisma.campaignRecipient.findMany({
                where: { campaignId, status: "queued" },
                include: {
                    contact: {
                        include: {
                            consents: true,
                        },
                    },
                },
                orderBy: { id: "asc" },
            });
            // Template konten fallback
            const version = campaign.templateVersion;
            const channel = campaign.channel;
            let isQuotaExceeded = false;

            for (const recipient of recipients) {
                const contact = recipient.contact;

                // Cek apakah kontak tidak aktif atau pernah opt-out
                const isOptedOut = contact.consents?.some((c) => c.status === "opted_out")
                || contact.status !== "active";

                if (isOptedOut) {
                    await prisma.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: {
                            status: "failed",
                            errorMessage: "Kontak telah berhenti berlangganan (opt-out) atau tidak aktif",
                        },
                    });

                    await prisma.campaign.update({
                        where: { id: campaignId },
                        data: { failedCount: { increment: 1 } },
                    });

                    continue;
                }



                const contactContext = {
                    ...contact,
                    customFields: (contact.customFields as Record<string, any>) || null,
                };
                // 4a. Personalisasi pesan dengan Merge Tags ({{nama}}, {{email}}, dll)
                const personalizedEmailSubject = applyMergeTags(version?.subject || campaign.name, contactContext);
                const personalizedHtml = applyMergeTags(version?.contentHtml || "", contactContext);
                const personalizedWaText = applyMergeTags(version?.contentWhatsapp || "", contactContext);
                const personalizedTeleText = applyMergeTags(version?.contentTelegram || "", contactContext);
                let isSuccess = false;
                let providerMessageId: string | null = null;
                let errorMessage: string | null = null;
                // 4b. Routing pengiriman ke saluran terkait
                try {
                    if (channel === "whatsapp_qr") {
                        const targetPhone = contact.whatsappNumber || contact.phone;
                        if (!targetPhone) {
                            throw new Error("Kontak tidak memiliki nomor WhatsApp");
                        }
                        const res = await sendWhatsappQrMessage(tenantId, targetPhone, personalizedWaText);
                        isSuccess = true;
                        providerMessageId = res.messageId || null;
                    } else if (channel === "email") {
                        if (!contact.email) {
                            throw new Error("Kontak tidak memiliki alamat email");
                        }
                        const res = await sendEmail({
                            tenantId,
                            to: contact.email,
                            subject: personalizedEmailSubject,
                            html: personalizedHtml,
                            text: personalizedWaText || undefined,
                        });
                        isSuccess = true;
                        providerMessageId = res.messageId || null;
                    } else if (channel === "telegram") {
                        if (!contact.teleChatId) {
                            throw new Error("Kontak belum terhubung / klik /start di Telegram Bot");
                        }
                        const res = await sendTestTelegramMessage(tenantId, {
                            chatId: contact.teleChatId,
                            message: personalizedTeleText,
                            parseMode: "HTML",
                        });
                        isSuccess = true;
                        providerMessageId = String(res.messageId || "");
                    } else {
                        throw new Error(`Saluran pengiriman "${channel}" belum didukung`);
                    }
                } catch (err: any) {
                    isSuccess = false;
                    errorMessage = err.message || "Gagal mengirim pesan";
                    console.error(`❌ [Worker] Gagal kirim ke ${contact.name}:`, errorMessage);

                    // Cek apakah error terkait kuota harian WhatsApp (status 429 atau pesan mengandung kuota)
                    if (err.statusCode === 429 || (errorMessage && errorMessage.toLowerCase().includes("kuota"))) {
                        isQuotaExceeded = true;
                    }
                }

                // cek apakah error (status 429 atau pesan mengandung kuota)

                // 4c. Update status penerima di database
                const recipientStatus = isSuccess ? "sent" : "failed";
                await prisma.campaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                        status: recipientStatus,
                        providerMessageId,
                        errorMessage,
                        sentAt: isSuccess ? new Date() : null,
                    },
                });
                // 4d. Catat Delivery Log untuk Riwayat/Audit
                await prisma.deliveryLog.create({
                    data: {
                        campaignRecipientId: recipient.id,
                        eventType: recipientStatus,
                        rawPayloadJson: {
                            channel,
                            isSuccess,
                            providerMessageId,
                            error: errorMessage,
                            timestamp: new Date().toISOString(),
                        },
                    },
                });
                // 4e. Update Counter Metrik Campaign secara bertahap (Real-time Progress)
                if (isSuccess) {
                    await prisma.campaign.update({
                        where: { id: campaignId },
                        data: { sentCount: { increment: 1 } },
                    });
                } else {
                    await prisma.campaign.update({
                        where: { id: campaignId },
                        data: { failedCount: { increment: 1 } },
                    });
                }

                // Jika kuota habis, jangan lanjut ke kontak berikutnya!
                if (isQuotaExceeded) {
                    console.warn(`⚠️ [Worker] Kuota harian habis. Menghentikan loop pengiriman.`);
                    break; // Keluar dari loop for
                }
                
                // 4f. Throttling anti-ban (jeda acak alami antar kontak)
                if (channel === "whatsapp_qr") {
                    await randomDelay(5000, 10000); // 5 s/d 10 detik untuk WhatsApp
                } else {
                    await randomDelay(1000, 3000);  // 1 s/d 3 detik untuk Email/Telegram
                }
            }
            // 5. Finalisasi Campaign (Cek apakah di-pause karena kuota atau selesai tuntas)
            if (isQuotaExceeded) {
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { status: "paused" },
                });
                console.log(`⏸️ [Worker] Campaign #${campaign.id} di-pause otomatis karena kuota harian WhatsApp tercapai.`);
            } else {
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: {
                        status: "sent",
                        completedAt: new Date(),
                    },
                });
                console.log(`✅ [Worker] Selesai blast untuk Campaign #${campaign.id}`);
            }
        } catch (fatalError: any) {
            console.error(`💥 [Worker] Error fatal pada worker campaign #${campaignId}:`, fatalError);
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: "failed" },
            });
        }
    })();
    return {
        success: true,
        message: "Campaign mulai dikirim di latar belakang",
        campaignId,
        totalRecipients: totalQueued,
    };
};