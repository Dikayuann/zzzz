import React, { useState, useEffect } from "react";
import {
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { TelegramConfig, TelegramSubscriber } from "@/types/channel";

interface TelegramChannelTabProps {
  onStatusChange?: (connected: boolean) => void;
}

export const TelegramChannelTab: React.FC<TelegramChannelTabProps> = ({ onStatusChange }) => {
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [showTgTestModal, setShowTgTestModal] = useState(false);
  const [tgTestMessage, setTgTestMessage] = useState("Halo! Ini pesan tes siaran otomatis dari Campaign Blast.");
  const [tgCustomChatId, setTgCustomChatId] = useState("");
  const [tgSubscribers, setTgSubscribers] = useState<TelegramSubscriber[]>([]);
  const [isSyncingTgSubscribers, setIsSyncingTgSubscribers] = useState(false);

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: "",
    botUsername: "",
    targetChatId: "",
    parseMode: "HTML",
  });

  const fetchTgSubscribers = async () => {
    try {
      const res = await api.get("/channels/telegram/subscribers");
      const list = res.data?.data?.contacts || [];
      setTgSubscribers(list);
      if (list.length > 0) {
        setTgCustomChatId((prev) => prev || list[0].teleChatId);
      }
    } catch (err) {
      console.error("Gagal mengambil subscriber:", err);
    }
  };

  const handleSyncTgSubscribers = async () => {
    setIsSyncingTgSubscribers(true);
    try {
      const res = await api.post("/channels/telegram/sync");
      toast.success(res.data?.message || "Sinkronisasi subscriber berhasil!");
      await fetchTgSubscribers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal sinkronisasi subscriber Telegram");
    } finally {
      setIsSyncingTgSubscribers(false);
    }
  };

  const fetchTelegram = async () => {
    setIsLoadingTelegram(true);
    try {
      const res = await api.get("/channels/telegram");
      const payload = res.data?.data || res.data;
      const botData = payload?.bot || payload;
      if (botData && (payload?.connected || botData?.status === "connected" || payload?.status === "connected")) {
        const rawUsername = botData.botUsername || payload.botUsername || "";
        setTelegramConfig((prev) => ({
          ...prev,
          botToken: botData.maskedToken || botData.botToken || payload.botToken || prev.botToken,
          botUsername: rawUsername ? `@${rawUsername.replace(/^@/, "")}` : "",
          targetChatId: botData.targetChatId || payload.targetChatId || "",
        }));
        setTelegramConnected(true);
        onStatusChange?.(true);
        fetchTgSubscribers();
      } else {
        setTelegramConnected(false);
        onStatusChange?.(false);
      }
    } catch (err: any) {
      console.error("Gagal mengambil konfigurasi Telegram:", err);
    } finally {
      setIsLoadingTelegram(false);
    }
  };

  useEffect(() => {
    fetchTelegram();
  }, []);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramConfig.botToken.trim()) {
      toast.error("Bot Token Telegram wajib diisi");
      return;
    }

    setIsSavingTelegram(true);
    try {
      const res = await api.post("/channels/telegram", {
        botToken: telegramConfig.botToken,
        targetChatId: telegramConfig.targetChatId ? telegramConfig.targetChatId.trim() : undefined,
      });

      const payload = res.data?.data || res.data;
      const botData = payload?.bot || payload;
      const rawUsername = botData?.botUsername || payload?.botUsername || "";
      const botName = botData?.botName || payload?.botName || "";

      if (botData) {
        setTelegramConfig((prev) => ({
          ...prev,
          botToken: botData.maskedToken || botData.botToken || payload.botToken || prev.botToken,
          botUsername: rawUsername ? `@${rawUsername.replace(/^@/, "")}` : prev.botUsername,
          targetChatId: botData.targetChatId || payload.targetChatId || "",
        }));
      }
      setTelegramConnected(true);
      onStatusChange?.(true);
      // Langsung tarik subscriber dan sinkronkan tanpa perlu refresh
      fetchTgSubscribers();
      api.post("/channels/telegram/sync").then(() => fetchTgSubscribers()).catch(() => {});

      toast.success("Bot Telegram berhasil terhubung!", {
        description: rawUsername
          ? `${botName ? `${botName} (` : ""}${rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`}${botName ? ")" : ""} siap digunakan untuk broadcast.`
          : "Konfigurasi bot tersimpan.",
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghubungkan Bot Telegram";
      toast.error(msg, {
        description: err.response?.data?.detail || "Pastikan API Token dari @BotFather sudah benar dan valid.",
      });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  // Polling subscriber baru secara otomatis setiap 4 detik saat bot terhubung
  useEffect(() => {
    if (!telegramConnected) return;
    const interval = setInterval(() => {
      fetchTgSubscribers();
    }, 4000);
    return () => clearInterval(interval);
  }, [telegramConnected]);

  const handleVerifyTelegram = () => {
    if (tgSubscribers.length > 0 && !tgCustomChatId) {
      setTgCustomChatId(tgSubscribers[0].teleChatId);
    }
    setShowTgTestModal(true);
  };

  const handleSendTgTest = async () => {
    const destination = tgCustomChatId.trim() || telegramConfig.targetChatId.trim();
    if (!destination) {
      toast.error("Tujuan Chat ID / User ID wajib diisi!", {
        description: "Masukkan User ID Anda (pribadi setelah klik /start di bot) atau @username_channel.",
      });
      return;
    }

    setIsTestingTelegram(true);
    try {
      const res = await api.post("/channels/telegram/test", {
        chatId: destination,
        message: tgTestMessage.trim() || undefined,
      });

      setShowTgTestModal(false);
      setTelegramConnected(true);
      onStatusChange?.(true);
      toast.success("Pesan Tes Telegram Berhasil Terkirim!", {
        description: res.data?.message || `Pesan tes berhasil dikirim ke ${destination}.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim pesan tes Telegram";
      toast.error(msg, {
        description: err.response?.data?.detail || "Pastikan penerima sudah klik /start pada bot atau bot telah menjadi Admin di grup/channel.",
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConfirmDisconnectTelegram = async () => {
    setIsDisconnecting(true);
    try {
      await api.delete("/channels/telegram");
      setTelegramConnected(false);
      onStatusChange?.(false);
      setTelegramConfig({
        botToken: "",
        botUsername: "",
        targetChatId: "",
        parseMode: "HTML",
      });
      setShowDisconnectConfirm(false);
      toast.success("Koneksi Bot Telegram berhasil diputus");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutus koneksi Bot Telegram");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Telegram Bot</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hubungkan bot Telegram Anda untuk mengirim pesan siaran dan notifikasi.
              </p>
            </div>
          </div>

          {/* Status Pill */}
          <div
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              telegramConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLoadingTelegram
                  ? "bg-amber-400 animate-ping"
                  : telegramConnected
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />
            <span>
              {isLoadingTelegram
                ? "Memeriksa status..."
                : telegramConnected
                ? "Terhubung"
                : "Belum terhubung"}
            </span>
          </div>
        </div>

        {/* Help Banner */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 text-xs text-sky-950 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-900">Tips Penggunaan Telegram Broadcast:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>
              <strong>Blast Langsung ke Kontak Pribadi:</strong> Pengguna/kontak cukup membuka bot Anda{" "}
              <span className="font-bold text-sky-700">
                {telegramConfig.botUsername || "@BotAnda"}
              </span>{" "}
              lalu klik <strong>Start</strong> (<code className="px-1 py-0.5 bg-sky-100 rounded text-[11px] font-mono">/start</code>). Bot bisa langsung mengirim pesan personal 1-on-1 tanpa perlu grup atau channel sama sekali.
            </li>
            <li>
              <strong>Broadcast ke Grup / Channel (Opsional):</strong> Jika ingin siaran ke Channel publik atau grup, tambahkan bot Anda sebagai <strong>Administrator</strong> di channel/grup tersebut.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSaveTelegram} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TELEGRAM BOT TOKEN
              </label>
              <div className="relative">
                <input
                  type={showTgToken ? "text" : "password"}
                  value={telegramConfig.botToken}
                  onChange={(e) =>
                    setTelegramConfig({ ...telegramConfig, botToken: e.target.value })
                  }
                  placeholder="7489234812:AAH93jf938jf-934jf_39fj49f834jf"
                  className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowTgToken(!showTgToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showTgToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                BOT USERNAME (OTOMATIS)
              </label>
              <input
                type="text"
                value={telegramConfig.botUsername}
                readOnly
                placeholder="@BotAnda (terdeteksi otomatis saat terhubung)"
                className={`w-full h-11 px-4 rounded-xl border text-xs font-mono shadow-2xs transition ${
                  telegramConfig.botUsername
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-800 font-bold"
                    : "bg-slate-100/70 border-slate-200/90 text-slate-700 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TARGET DEFAULT CHAT ID / CHANNEL (OPSIONAL)
            </label>
            <input
              type="text"
              value={telegramConfig.targetChatId}
              onChange={(e) =>
                setTelegramConfig({
                  ...telegramConfig,
                  targetChatId: e.target.value,
                })
              }
              placeholder="User ID pribadi (misal 123456789) atau @nama_channel"
              className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">
              Opsional. Dapat dikosongkan jika broadcast ditargetkan per kontak (kontak yang sudah klik <code className="text-slate-600">/start</code> bot). Jika ingin broadcast ke grup/channel publik, gunakan <code className="text-slate-600">@nama_channel</code> atau ID channel privat (<code className="text-slate-600">-100xxxxxxxxxx</code>).
            </p>
          </div>

          {/* Bottom Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSavingTelegram}
                className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isSavingTelegram && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {isSavingTelegram
                    ? "Menghubungkan..."
                    : telegramConnected
                    ? "Simpan Perubahan"
                    : "Hubungkan Bot"}
                </span>
              </button>

              {telegramConnected && (
                <button
                  type="button"
                  onClick={handleVerifyTelegram}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl border border-sky-300 text-sky-600 hover:bg-sky-50/60 text-xs font-semibold transition cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Pesan Tes</span>
                </button>
              )}
            </div>

            {telegramConnected && (
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(true)}
                className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
              >
                Putuskan Bot
              </button>
            )}
          </div>
        </form>

        {/* Section: Daftar Subscriber Otomatis */}
        {telegramConnected && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-sky-600" />
                  <span>Subscriber Terdaftar ({tgSubscribers.length} orang)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengguna yang pernah klik <strong>/start</strong> pada bot Anda otomatis tersimpan di sini dan siap menerima siaran.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncTgSubscribers}
                disabled={isSyncingTgSubscribers}
                className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncingTgSubscribers ? "animate-spin" : ""}`} />
                <span>{isSyncingTgSubscribers ? "Sinkronisasi..." : "Sinkronkan Subscriber"}</span>
              </button>
            </div>

            {tgSubscribers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {tgSubscribers.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setTgCustomChatId(sub.teleChatId);
                      setShowTgTestModal(true);
                    }}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-sky-50/60 hover:border-sky-300 transition cursor-pointer flex items-center justify-between group shadow-2xs"
                    title="Klik untuk tes kirim pesan ke kontak ini"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{sub.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {sub.customFields?.telegramUsername || `ID: ${sub.teleChatId}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-1 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition">
                      Kirim Tes
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center text-xs text-slate-500">
                Belum ada subscriber yang terekam. Buka bot Anda (<strong>{telegramConfig.botUsername || "@BotAnda"}</strong>), klik <strong>/start</strong>, lalu klik tombol <em>Sinkronkan Subscriber</em> di atas.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telegram Test Modal */}
      <Dialog open={showTgTestModal} onOpenChange={setShowTgTestModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              Kirim Pesan Tes Telegram
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Bot terhubung. Masukkan tujuan penerima dan pesan uji coba untuk memastikan broadcast Telegram berfungsi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Tujuan Chat ID / User ID / Channel
              </label>
              <input
                type="text"
                value={tgCustomChatId}
                onChange={(e) => setTgCustomChatId(e.target.value)}
                placeholder="Misal: 123456789 atau @nama_channel"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                ID kontak pengguna perorangan atau @username channel publik (bot harus admin).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Isi Pesan Uji Coba
              </label>
              <textarea
                rows={3}
                value={tgTestMessage}
                onChange={(e) => setTgTestMessage(e.target.value)}
                placeholder="Ketik pesan tes..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 flex-col-reverse sm:flex-row">
              <button
                type="button"
                onClick={() => setShowTgTestModal(false)}
                disabled={isTestingTelegram}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendTgTest}
                disabled={isTestingTelegram}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isTestingTelegram && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isTestingTelegram ? "Mengirim Pesan..." : "Kirim ke Telegram"}</span>
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* In-App Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              <span>Putuskan Koneksi Bot Telegram?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin memutuskan koneksi Bot Telegram ini dari sistem?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setShowDisconnectConfirm(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDisconnecting}
              onClick={handleConfirmDisconnectTelegram}
              className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              {isDisconnecting ? "Memutuskan..." : "Ya, Putuskan Bot"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
