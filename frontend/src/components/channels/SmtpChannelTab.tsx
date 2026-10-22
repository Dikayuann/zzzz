import React, { useState, useEffect } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
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
import type { SmtpConfig } from "@/types/channel";

interface SmtpChannelTabProps {
  onStatusChange?: (connected: boolean) => void;
}

export const SmtpChannelTab: React.FC<SmtpChannelTabProps> = ({ onStatusChange }) => {
  const [smtpConnected, setSmtpConnected] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showEmailTestModal, setShowEmailTestModal] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    preset: "custom",
    host: "",
    port: "587",
    encryption: "TLS",
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    hasPassword: false,
  });

  const fetchSmtp = async () => {
    setIsLoadingSmtp(true);
    try {
      const res = await api.get("/settings/smtp");
      const data = res.data?.data;
      if (data) {
        let detectedPreset: SmtpConfig["preset"] = "custom";
        if (data.host?.includes("gmail.com")) detectedPreset = "gmail";
        else if (data.host?.includes("sendgrid")) detectedPreset = "sendgrid";
        else if (data.host?.includes("amazonaws")) detectedPreset = "ses";
        else if (data.host?.includes("brevo")) detectedPreset = "brevo";
        else if (data.host?.includes("zoho")) detectedPreset = "zoho";

        const isConnected = Boolean(data.verifiedAt || (data.host && data.hasPassword));
        setSmtpConfig((prev) => ({
          ...prev,
          preset: detectedPreset,
          host: data.host || "",
          port: String(data.port || 587),
          username: data.username || "",
          password: "",
          fromName: data.fromName || "",
          fromEmail: data.fromEmail || "",
          encryption: data.encryption === "none" ? "None" : (data.encryption as "TLS" | "SSL"),
          hasPassword: Boolean(data.hasPassword),
        }));
        setSmtpConnected(isConnected);
        onStatusChange?.(isConnected);
      } else {
        setSmtpConnected(false);
        onStatusChange?.(false);
      }
    } catch (err: any) {
      console.error("Gagal mengambil konfigurasi SMTP:", err);
    } finally {
      setIsLoadingSmtp(false);
    }
  };

  useEffect(() => {
    fetchSmtp();
  }, []);

  const handleSelectSmtpPreset = (preset: SmtpConfig["preset"]) => {
    if (preset === "gmail") {
      setSmtpConfig((prev) => ({
        ...prev,
        preset,
        host: "smtp.gmail.com",
        port: "587",
        encryption: "TLS",
      }));
    } else if (preset === "sendgrid") {
      setSmtpConfig((prev) => ({
        ...prev,
        preset,
        host: "smtp.sendgrid.net",
        port: "587",
        encryption: "TLS",
        username: "apikey",
      }));
    } else if (preset === "ses") {
      setSmtpConfig((prev) => ({
        ...prev,
        preset,
        host: "email-smtp.ap-southeast-1.amazonaws.com",
        port: "587",
        encryption: "TLS",
      }));
    } else if (preset === "brevo") {
      setSmtpConfig((prev) => ({
        ...prev,
        preset,
        host: "smtp-relay.brevo.com",
        port: "587",
        encryption: "TLS",
      }));
    } else if (preset === "zoho") {
      setSmtpConfig((prev) => ({
        ...prev,
        preset,
        host: "smtp.zoho.com",
        port: "465",
        encryption: "SSL",
      }));
    } else {
      setSmtpConfig((prev) => ({ ...prev, preset: "custom" }));
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username) {
      toast.error("Host, Port, dan Username wajib diisi!");
      return;
    }
    if (!smtpConfig.hasPassword && !smtpConfig.password) {
      toast.error("Password / App Password wajib diisi untuk konfigurasi awal!");
      return;
    }

    setIsSavingSmtp(true);
    try {
      const payload = {
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port, 10) || 587,
        username: smtpConfig.username,
        password: smtpConfig.password && smtpConfig.password.trim().length > 0 ? smtpConfig.password : undefined,
        fromName: smtpConfig.fromName,
        fromEmail: smtpConfig.fromEmail,
        encryption: smtpConfig.encryption,
      };

      const res = await api.post("/settings/smtp", payload);
      const saved = res.data?.data;
      if (saved) {
        setSmtpConfig((prev) => ({
          ...prev,
          hasPassword: Boolean(saved.hasPassword),
          password: "",
        }));
        setSmtpConnected(true);
        onStatusChange?.(true);
      }

      toast.success("Pengaturan SMTP Email berhasil disimpan!", {
        description: `Server ${smtpConfig.host}:${smtpConfig.port} siap mengirim broadcast.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan konfigurasi SMTP";
      toast.error(msg);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleVerifySmtp = () => {
    if (!smtpConfig.hasPassword && !smtpConfig.password) {
      toast.error("Simpan konfigurasi SMTP terlebih dahulu sebelum pengujian.");
      return;
    }
    if (!testEmailRecipient && smtpConfig.username.includes("@")) {
      setTestEmailRecipient(smtpConfig.username);
    }
    setShowEmailTestModal(true);
  };

  const handleSendEmailTest = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      toast.error("Alamat email penerima uji coba tidak valid!");
      return;
    }

    setIsTestingSmtp(true);
    try {
      const res = await api.post("/settings/smtp/test", {
        testEmail: testEmailRecipient,
      });

      setShowEmailTestModal(false);
      setSmtpConnected(true);
      onStatusChange?.(true);
      toast.success("Email Uji Coba Berhasil Dikirim!", {
        description: res.data?.message || `Email uji coba berhasil mendarat di ${testEmailRecipient}`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Pengiriman email uji coba gagal";
      const detail = err.response?.data?.detail;
      toast.error(msg, {
        description: detail || "Periksa kembali konfigurasi host, port, atau kredensial akun.",
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConfirmDisconnectSmtp = async () => {
    setIsDisconnecting(true);
    try {
      await api.delete("/settings/smtp");
      setSmtpConnected(false);
      onStatusChange?.(false);
      setSmtpConfig({
        preset: "custom",
        host: "",
        port: "587",
        encryption: "TLS",
        username: "",
        password: "",
        fromName: "",
        fromEmail: "",
        replyTo: "",
        hasPassword: false,
      });
      setShowDisconnectConfirm(false);
      toast.success("Konfigurasi SMTP Email berhasil diputuskan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutuskan konfigurasi SMTP");
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
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Email — SMTP Server</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi server SMTP untuk pengiriman email broadcast.
              </p>
            </div>
          </div>

          {/* Status Pill */}
          <div
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              smtpConnected || smtpConfig.hasPassword
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                smtpConnected || smtpConfig.hasPassword ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span>
              {smtpConnected || smtpConfig.hasPassword ? "Terhubung" : "Belum terhubung"}
            </span>
          </div>
        </div>

        {/* Quick Provider Presets Dropdown */}
        <div className="space-y-1.5 max-w-md">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Provider / Layanan Email
          </label>
          <div className="relative">
            <select
              value={smtpConfig.preset}
              onChange={(e) => handleSelectSmtpPreset(e.target.value as SmtpConfig["preset"])}
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition shadow-2xs cursor-pointer appearance-none"
            >
              <option value="custom">Custom SMTP Server (Rekomendasi / Fleksibel)</option>
              <option value="gmail">Google Workspace / Gmail</option>
              <option value="sendgrid">SendGrid (SMTP Relay)</option>
              <option value="ses">Amazon SES (Simple Email Service)</option>
              <option value="brevo">Brevo (Sendinblue)</option>
              <option value="zoho">Zoho Mail</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Pilih provider yang Anda gunakan untuk mengisi konfigurasi server standar secara otomatis.
          </p>
        </div>

        {/* Preset Helper Alert */}
        {smtpConfig.preset === "gmail" && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-900 leading-relaxed">
            <strong>Tips Gmail:</strong> Gunakan <strong>App Password 16 karakter</strong> (bukan password akun biasa). Pastikan Verifikasi 2 Langkah (2FA) di akun Google Anda telah aktif.
          </div>
        )}
        {smtpConfig.preset === "zoho" && (
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/90 text-xs text-blue-900 leading-relaxed">
            <strong>Tips Zoho:</strong> Gunakan port <strong>465 (SSL)</strong> dan <strong>Application-Specific Password</strong> dari panel Zoho Security Anda.
          </div>
        )}

        {/* SMTP Form */}
        <form onSubmit={handleSaveSmtp} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                SMTP HOST
              </label>
              <input
                type="text"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition shadow-2xs"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                PORT & ENKRIPSI
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  placeholder="587"
                  className="w-full h-11 px-3 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
                <select
                  value={smtpConfig.encryption}
                  onChange={(e) =>
                    setSmtpConfig({
                      ...smtpConfig,
                      encryption: e.target.value as "TLS" | "SSL" | "None",
                    })
                  }
                  className="w-full h-11 px-2.5 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs cursor-pointer"
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                USERNAME / EMAIL LOGIN
              </label>
              <input
                type="text"
                value={smtpConfig.username}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                placeholder="marketing@startup.id"
                className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                PASSWORD / APP KEY
              </label>
              <div className="relative">
                <input
                  type={showSmtpPassword ? "text" : "password"}
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  placeholder={
                    smtpConfig.hasPassword
                      ? "•••••••• (Tersimpan - ketik jika ingin mengubah)"
                      : "••••••••••••••••"
                  }
                  className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                FROM NAME (NAMA PENGIRIM)
              </label>
              <input
                type="text"
                value={smtpConfig.fromName}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                placeholder="Brand Anda"
                className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                FROM EMAIL (ALAMAT PENGIRIM)
              </label>
              <input
                type="email"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                placeholder="newsletter@startup.id"
                className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleVerifySmtp}
                disabled={isTestingSmtp || isSavingSmtp || isLoadingSmtp}
                className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                <span>Verifikasi & test</span>
              </button>

              <button
                type="submit"
                disabled={isSavingSmtp || isLoadingSmtp}
                className="w-full sm:w-auto justify-center px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isSavingSmtp && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isSavingSmtp ? "Menyimpan..." : "Simpan"}</span>
              </button>
            </div>

            {(smtpConnected || smtpConfig.hasPassword) && (
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(true)}
                className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                Putuskan SMTP
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Email Test Modal */}
      <Dialog open={showEmailTestModal} onOpenChange={setShowEmailTestModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Kirim Email Uji Coba
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Server SMTP terhubung. Masukkan email Anda untuk menerima email uji coba dengan header dan format blast.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email Penerima Uji Coba
              </label>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="budi.santoso@startup.id"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 flex-col-reverse sm:flex-row">
              <button
                type="button"
                onClick={() => setShowEmailTestModal(false)}
                disabled={isTestingSmtp}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendEmailTest}
                disabled={isTestingSmtp}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isTestingSmtp && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isTestingSmtp ? "Mengirim Email..." : "Kirim Email Tes"}</span>
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
                <Mail className="h-4 w-4" />
              </div>
              <span>Putuskan Konfigurasi SMTP?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin memutuskan dan menghapus konfigurasi server SMTP Email ini dari sistem?
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
              onClick={handleConfirmDisconnectSmtp}
              className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              {isDisconnecting ? "Memutuskan..." : "Ya, Putuskan SMTP"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
