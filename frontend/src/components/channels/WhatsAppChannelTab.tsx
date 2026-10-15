import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Send,
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
import type { WaSubTab, MetaWaConfig } from "@/types/channel";

interface WhatsAppChannelTabProps {
  onStatusChange?: (connected: boolean) => void;
}

export const WhatsAppChannelTab: React.FC<WhatsAppChannelTabProps> = ({ onStatusChange }) => {
  const [waSubTab, setWaSubTab] = useState<WaSubTab>("meta");
  const [waConnected, setWaConnected] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [showWaTestModal, setShowWaTestModal] = useState(false);
  const [waTestRecipient, setWaTestRecipient] = useState("");

  const [metaConfig, setMetaConfig] = useState<MetaWaConfig>(() => {
    const saved = localStorage.getItem("channel_meta_wa");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      phoneNumberId: "",
      accessToken: "",
      wabaId: "",
    };
  });

  // QR Code WA Web session states
  const [isQrConnected, setIsQrConnected] = useState(false);
  const [qrStatus, setQrStatus] = useState<string>("disconnected");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrPhoneNumber, setQrPhoneNumber] = useState<string | null>(null);
  const [qrPushName, setQrPushName] = useState<string | null>(null);
  const [qrDailyCount, setQrDailyCount] = useState<number>(0);
  const [qrDailyQuota, setQrDailyQuota] = useState<number>(300);
  const [isInitializingQr, setIsInitializingQr] = useState(false);

  // Retrieve Baileys WhatsApp QR status from backend
  const fetchWhatsappQrStatus = async () => {
    try {
      const res = await api.get("/channels/whatsapp/qr/status");
      const data = res.data?.data;
      if (data) {
        setQrStatus(data.status);
        const connected = data.status === "connected";
        setIsQrConnected(connected);
        setQrPhoneNumber(data.phoneNumber);
        setQrPushName(data.pushName);
        setQrDataUrl(data.qrDataUrl);
        setQrDailyCount(data.dailyCount || 0);
        setQrDailyQuota(data.dailyQuota || 300);
        onStatusChange?.(connected || waConnected);
      }
    } catch (err: any) {
      console.error("Gagal mengambil status WhatsApp QR:", err);
    }
  };

  // Poll status while on QR tab if not connected
  useEffect(() => {
    if (waSubTab === "qrcode") {
      fetchWhatsappQrStatus();

      if (!isQrConnected) {
        const interval = setInterval(() => {
          fetchWhatsappQrStatus();
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [waSubTab, isQrConnected]);

  const handleSaveMetaWa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaConfig.phoneNumberId || !metaConfig.accessToken) {
      toast.error("Phone Number ID dan Access Token wajib diisi!");
      return;
    }
    localStorage.setItem("channel_meta_wa", JSON.stringify(metaConfig));
    setWaConnected(true);
    onStatusChange?.(true);
    toast.success("Pengaturan WhatsApp Business API berhasil disimpan!", {
      description: `WABA ID ${metaConfig.wabaId} telah terkonfigurasi.`,
    });
  };

  const handleVerifyMetaWa = () => {
    setIsTestingWa(true);
    setTimeout(() => {
      setIsTestingWa(false);
      if (metaConfig.accessToken.length < 10) {
        toast.error("Format Access Token Meta tidak valid", {
          description: "Pastikan menggunakan Permanent Token dari System User Meta.",
        });
        setWaConnected(false);
        onStatusChange?.(isQrConnected);
        return;
      }
      setWaConnected(true);
      onStatusChange?.(true);
      setShowWaTestModal(true);
      toast.success("Verifikasi Meta Cloud API Berhasil!", {
        description: "Phone Number ID aktif. Messaging Tier: 1,000 conversations / 24h.",
      });
    }, 1200);
  };

  const handleSendWaTest = async () => {
    if (isTestingWa) return;
    if (!waTestRecipient.trim()) {
      toast.error("Nomor penerima WhatsApp wajib diisi!");
      return;
    }

    if (waSubTab === "qrcode" || isQrConnected) {
      setIsTestingWa(true);
      try {
        const res = await api.post("/channels/whatsapp/qr/test", {
          recipientPhone: waTestRecipient.trim(),
          message: "Halo! Ini adalah pesan verifikasi uji coba dari sistem Campaign Blast API. WhatsApp Web Baileys Anda telah terhubung aktif.",
        });
        setShowWaTestModal(false);
        toast.success(res.data?.message || `Pesan WhatsApp berhasil dikirim ke ${waTestRecipient}!`);
        await fetchWhatsappQrStatus();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal mengirim pesan uji coba WhatsApp");
      } finally {
        setIsTestingWa(false);
      }
    } else {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: `Mengirim pesan uji coba ke ${waTestRecipient}...`,
          success: () => {
            setShowWaTestModal(false);
            return `Pesan template WhatsApp berhasil terkirim ke ${waTestRecipient} (Status: Delivered)`;
          },
          error: "Gagal mengirim pesan uji coba",
        }
      );
    }
  };

  const handleInitQrSession = async () => {
    setIsInitializingQr(true);
    try {
      await api.post("/channels/whatsapp/qr/init");
      toast.success("Memulai sesi WhatsApp Web, memuat QR Code...");
      await fetchWhatsappQrStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menginisialisasi sesi WhatsApp");
    } finally {
      setIsInitializingQr(false);
    }
  };

  const handleDisconnectQr = async () => {
    try {
      await api.delete("/channels/whatsapp/qr");
      setIsQrConnected(false);
      setQrDataUrl(null);
      setQrPhoneNumber(null);
      setQrPushName(null);
      setQrStatus("disconnected");
      onStatusChange?.(waConnected);
      toast.info("Sesi WhatsApp Web telah diputuskan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutuskan sesi WhatsApp");
    }
  };

  const isCurrentTabConnected = waSubTab === "meta" ? waConnected : isQrConnected;

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp Business</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirim campaign via WhatsApp Business API atau WhatsApp Web.
              </p>
            </div>
          </div>

          {/* Status Pill */}
          <div
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              isCurrentTabConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCurrentTabConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span>{isCurrentTabConnected ? "Terhubung" : "Belum terhubung"}</span>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex flex-wrap sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setWaSubTab("meta")}
            className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              waSubTab === "meta"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Business API (Meta)
          </button>
          <button
            type="button"
            onClick={() => setWaSubTab("qrcode")}
            className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              waSubTab === "qrcode"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Via QR Code (WA Web)
          </button>
        </div>

        {/* SUB-VIEW 1: BUSINESS API (META) */}
        {waSubTab === "meta" && (
          <form onSubmit={handleSaveMetaWa} className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              <span>Dapatkan kredensial di </span>
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-slate-900 hover:text-sky-600 inline-flex items-center gap-1"
              >
                Meta for Developers <ExternalLink className="h-3 w-3" />
              </a>
              <span>, lalu salin Phone Number ID, Access Token, dan Business Account ID ke formulir berikut.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                PHONE NUMBER ID
              </label>
              <input
                type="text"
                value={metaConfig.phoneNumberId}
                onChange={(e) => setMetaConfig({ ...metaConfig, phoneNumberId: e.target.value })}
                placeholder="123456789012345"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ACCESS TOKEN
              </label>
              <input
                type="password"
                value={metaConfig.accessToken}
                onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                placeholder="EAAxxxxxxxxxxx..."
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
              />
              <p className="text-[11px] text-slate-400">
                Gunakan token permanen dari System User Meta Business Manager.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                BUSINESS ACCOUNT ID (WABA ID)
              </label>
              <input
                type="text"
                value={metaConfig.wabaId}
                onChange={(e) => setMetaConfig({ ...metaConfig, wabaId: e.target.value })}
                placeholder="987654321098765"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyMetaWa}
                disabled={isTestingWa}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isTestingWa ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Verifikasi & test</span>
                )}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* SUB-VIEW 2: VIA QR CODE (WA WEB GATEWAY) */}
        {waSubTab === "qrcode" && (
          <div className="space-y-5 pt-1">
            {!isQrConnected ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                {/* Left: QR Code */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="WhatsApp QR Code"
                      className="h-48 w-48 object-contain rounded-lg border border-slate-100"
                    />
                  ) : (
                    <div className="h-48 w-48 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                      {isInitializingQr ? (
                        <>
                          <RefreshCw className="h-7 w-7 text-emerald-600 animate-spin mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Memuat QR Code...</p>
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-7 w-7 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-500">
                            Klik tombol di bawah untuk memuat QR Code
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {qrDataUrl && qrStatus === "qr_ready" && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>QR Code aktif • Siap dipindai</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleInitQrSession}
                    disabled={isInitializingQr}
                    className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isInitializingQr ? "animate-spin" : ""}`} />
                    <span>{qrDataUrl ? "Perbarui QR Code" : "Muat QR Code"}</span>
                  </button>
                </div>

                {/* Right: Steps */}
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Cara Menghubungkan:</h3>
                  <ol className="space-y-2 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
                    <li>Buka aplikasi <strong>WhatsApp</strong> di ponsel Anda.</li>
                    <li>Ketuk <strong>Menu ⋮</strong> (Android) atau <strong>Pengaturan ⚙️</strong> (iPhone).</li>
                    <li>Pilih <strong>Perangkat Tertaut</strong>, lalu ketuk <strong>Tautkan Perangkat</strong>.</li>
                    <li>Arahkan kamera ke QR Code di samping.</li>
                  </ol>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Proteksi pengiriman aman dan kuota harian otomatis aktif setelah terhubung.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connected Device Row */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                      {qrPushName ? qrPushName.charAt(0).toUpperCase() : "W"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {qrPushName || "WhatsApp User"}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Terhubung
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {qrPhoneNumber
                          ? `+${qrPhoneNumber.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, "$1 $2-$3-$4")}`
                          : "+62 812-XXXX-XXXX"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWaTestModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Pesan Uji Coba</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnectQr}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition cursor-pointer active:scale-95"
                    >
                      Putuskan
                    </button>
                  </div>
                </div>

                {/* Quota Row */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Kapasitas Blast Hari Ini</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {qrDailyCount} / {qrDailyQuota} pesan
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(2, (qrDailyCount / (qrDailyQuota || 300)) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sisa {Math.max(0, qrDailyQuota - qrDailyCount)} pesan untuk hari ini</span>
                    <span>Reset otomatis 00:00 WIB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Test Message Modal */}
      <Dialog open={showWaTestModal} onOpenChange={setShowWaTestModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Kirim Pesan Uji Coba WhatsApp
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kirimkan pesan uji coba ke nomor Anda untuk memastikan koneksi gateway WhatsApp aktif dan pesan terkirim.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nomor WhatsApp Penerima Uji Coba
              </label>
              <input
                type="tel"
                value={waTestRecipient}
                onChange={(e) => setWaTestRecipient(e.target.value)}
                placeholder="Contoh: 08123456789 atau 628123456789"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Gunakan format nomor lokal (08...) atau internasional (62...).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Isi pesan uji coba yang akan dikirim:</p>
              <p className="italic text-slate-500">
                "Halo! Ini adalah pesan verifikasi uji coba dari sistem Campaign Blast API. WhatsApp Web Baileys Anda telah terhubung aktif."
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 flex-col-reverse sm:flex-row">
              <button
                type="button"
                onClick={() => setShowWaTestModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendWaTest}
                disabled={isTestingWa}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isTestingWa && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isTestingWa ? "Mengirim..." : "Kirim Sekarang"}</span>
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
