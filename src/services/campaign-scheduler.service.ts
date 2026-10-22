import prisma from "../lib/prisma";
import {
    executeCampaignBlast,
    isWithinSendingWindow,
    isCampaignExpired,
} from "./campaign-worker.service";

let schedulerInterval: NodeJS.Timeout | null = null;
let isJobRunning = false;

/**
 * Pengecekan otomatis kampanye terjadwal & auto-resume kampanye dijeda
 * Berjalan di background setiap 30 detik
 */
export const checkAndRunScheduledCampaigns = async () => {
    if (isJobRunning) return;
    isJobRunning = true;

    try {
        const now = new Date();

        // 1. Ambil kampanye yang dijadwalkan dan waktunya sudah tiba
        const scheduledCampaigns = await prisma.campaign.findMany({
            where: {
                status: "scheduled",
                scheduledAt: { lte: now },
            },
        });

        for (const campaign of scheduledCampaigns) {
            try {
                // Jika sudah melewati batas akhir tanggal (Cutoff Date)
                if (isCampaignExpired(campaign.recurrenceRule)) {
                    console.log(`⏹️ [Scheduler] Kampanye #${campaign.id} kedaluwarsa sebelum diluncurkan.`);
                    await prisma.campaignRecipient.updateMany({
                        where: { campaignId: campaign.id, status: "queued" },
                        data: {
                            status: "failed",
                            errorMessage: "Dibatalkan: Melewati batas akhir tanggal kampanye",
                        },
                    });
                    await prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { status: "sent", completedAt: new Date() },
                    });
                    continue;
                }

                // Cek jam operasional kerja
                if (!isWithinSendingWindow(campaign.recurrenceRule)) {
                    // Masih di luar jam kerja, biarkan tetap scheduled / paused
                    continue;
                }

                console.log(`⏰ [Scheduler] Memulai eksekusi terjadwal untuk Campaign #${campaign.id}: "${campaign.name}"`);
                await executeCampaignBlast(campaign.tenantId, campaign.id);
            } catch (err: any) {
                console.error(`💥 [Scheduler] Gagal meluncurkan campaign #${campaign.id}:`, err?.message);
            }
        }

        // 2. Ambil kampanye yang di-pause (misal karena batas jam kerja kemarin habis)
        const pausedCampaigns = await prisma.campaign.findMany({
            where: {
                status: "paused",
            },
        });

        for (const campaign of pausedCampaigns) {
            try {
                // Jika sudah melewati batas tanggal berakhir
                if (isCampaignExpired(campaign.recurrenceRule)) {
                    console.log(`⏹️ [Scheduler] Kampanye #${campaign.id} dihentikan karena melewati batas akhir tanggal.`);
                    await prisma.campaignRecipient.updateMany({
                        where: { campaignId: campaign.id, status: "queued" },
                        data: {
                            status: "failed",
                            errorMessage: "Dibatalkan: Melewati batas akhir tanggal kampanye (Cutoff Date)",
                        },
                    });
                    await prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { status: "sent", completedAt: new Date() },
                    });
                    continue;
                }

                // Cek apakah jam kerja hari ini sudah buka kembali
                if (isWithinSendingWindow(campaign.recurrenceRule)) {
                    // Masih ada antrean queued?
                    const queuedCount = await prisma.campaignRecipient.count({
                        where: { campaignId: campaign.id, status: "queued" },
                    });

                    if (queuedCount > 0) {
                        console.log(`▶️ [Scheduler] Auto-resume jam kerja untuk Campaign #${campaign.id}: "${campaign.name}" (${queuedCount} sisa antrean)`);
                        await executeCampaignBlast(campaign.tenantId, campaign.id);
                    } else {
                        // Jika sudah tidak ada antrean lagi
                        await prisma.campaign.update({
                            where: { id: campaign.id },
                            data: { status: "sent", completedAt: new Date() },
                        });
                    }
                }
            } catch (err: any) {
                console.error(`💥 [Scheduler] Gagal melanjutkan campaign #${campaign.id}:`, err?.message);
            }
        }
    } catch (e: any) {
        console.error("💥 [Scheduler] Error pada siklus pengecekan kampanye:", e?.message);
    } finally {
        isJobRunning = false;
    }
};

/**
 * Jalankan background scheduler saat server Node.js menyala
 */
export const startCampaignScheduler = () => {
    if (schedulerInterval) return;
    console.log("⏱️ [Scheduler] Background Campaign Scheduler aktif (interval 30 detik)");
    // Jalankan segera sekali saat booting
    checkAndRunScheduledCampaigns().catch(() => {});
    // Lalu jalankan berulang tiap 30 detik
    schedulerInterval = setInterval(checkAndRunScheduledCampaigns, 30000);
};

export const stopCampaignScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
};
