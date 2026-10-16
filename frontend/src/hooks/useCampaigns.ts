import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { CampaignItem, CampaignChannel, CampaignStatus } from "@/types/campaign";
import { toast } from "sonner";

/**
 * Helper untuk mengubah data mentah dari Backend/Database MariaDB
 * menjadi format CampaignItem yang ramah untuk tampilan UI frontend.
 */
function mapBackendToCampaignItem(raw: any): CampaignItem {
  // 1. Normalisasi nama channel (whatsapp_qr -> WhatsApp, telegram -> Telegram, email -> Email)
  let channel: CampaignChannel = "Email";
  if (raw.channel === "whatsapp_qr" || raw.channel === "whatsapp_business" || raw.channel === "whatsapp") {
    channel = "WhatsApp";
  } else if (raw.channel === "telegram") {
    channel = "Telegram";
  }

  // 2. Normalisasi status (draft, scheduled, sending, sent, failed)
  let status: CampaignStatus = "Draft";
  const rawStatus = (raw.status || "").toLowerCase();
  if (rawStatus === "sent") status = "Sent";
  else if (rawStatus === "sending") status = "Sending";
  else if (rawStatus === "scheduled") status = "Scheduled";
  else if (rawStatus === "failed") status = "Failed";

  // 3. Format tanggal pembuatan (contoh: 16 Okt 2026)
  const dateFormatted = raw.createdAt
    ? new Date(raw.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Baru saja";

  // 4. Hitung persentase open rate jika ada
  const openRate =
    raw.sentCount > 0 && raw.openedCount !== undefined
      ? Math.round((raw.openedCount / raw.sentCount) * 100)
      : null;

  return {
    id: String(raw.id),
    name: raw.name || "Tanpa Judul",
    date: dateFormatted,
    channel,
    status,
    audience: raw.audienceType === "all" ? "Semua Kontak" : raw.audienceRef || "Target Kontak",
    audienceCount: raw.totalRecipients || 0,
    sentCount: raw.sentCount || 0,
    failedCount: raw.failedCount || 0,
    openRate,
    clickRate: null,
    subject: raw.template?.subject || undefined,
    messageContent: raw.template?.name ? `Template: ${raw.template.name}` : "Pesan kustom",
    scheduledTime: raw.scheduledAt
      ? new Date(raw.scheduledAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
      : undefined,
  };
}

export function useCampaigns() {
  // 1. STATE (Tempat menyimpan data & kondisi)
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. FUNGSI FETCH (Mengambil data dari backend API)
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Panggil endpoint GET /api/v1/campaigns
      const res = await api.get("/campaigns?limit=50");
      const rawList = res.data?.data || [];
      
      // Ubah setiap data dari database menjadi format UI
      const mapped = rawList.map(mapBackendToCampaignItem);
      setCampaigns(mapped);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal memuat daftar kampanye dari server";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. EFFECT (Otomatis jalan 1x saat halaman pertama kali dibuka)
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // 4. FUNGSI HAPUS KAMPANYE (DELETE /api/v1/campaigns/:id)
  const deleteCampaign = async (id: string, name: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      // Hapus dari state layar secara instan agar UI responsif
      setCampaigns((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Kampanye "${name}" berhasil dihapus.`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus kampanye";
      toast.error(msg);
    }
  };

  // 5. FUNGSI BATALKAN JADWAL (POST /api/v1/campaigns/:id/cancel)
  const cancelCampaign = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/cancel`);
      toast.success("Jadwal kampanye berhasil dibatalkan.");
      await fetchCampaigns(); // Tarik ulang data terbaru
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membatalkan jadwal");
    }
  };

  // Return data dan fungsi agar bisa dipakai di halaman mana pun
  return {
    campaigns,
    setCampaigns,
    isLoading,
    errorMessage,
    fetchCampaigns,
    deleteCampaign,
    cancelCampaign,
  };
}
