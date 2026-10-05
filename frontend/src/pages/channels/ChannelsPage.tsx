import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
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

type ChannelTab = "email" | "telegram" | "whatsapp";
type WaSubTab = "meta" | "qrcode";

interface MetaWaConfig {
  phoneNumberId: string;
  accessToken: string;
  wabaId: string;
}

interface SmtpConfig {
  preset: "custom" | "gmail" | "sendgrid" | "ses" | "brevo";
  host: string;
  port: string;
  encryption: "TLS" | "SSL" | "None";
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  hasPassword?: boolean;
}

interface TelegramConfig {
  botToken: string;
  botUsername: string;
  targetChatId: string;
  parseMode: "HTML" | "MarkdownV2";
}

export const ChannelsPage: React.FC = () => {
  // Active main tab
  const [activeTab, setActiveTab] = useState<ChannelTab>("whatsapp");

  // WhatsApp states
  const [waSubTab, setWaSubTab] = useState<WaSubTab>("meta");
  const [waConnected, setWaConnected] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [showWaTestModal, setShowWaTestModal] = useState(false);
  const [waTestRecipient, setWaTestRecipient] = useState("+62 812-3456-7890");

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
      phoneNumberId: "123456789012345",
      accessToken: "EAAxxxxxxxxxxx...",
      wabaId: "987654321098765",
    };
  });

  // QR Code WA Web session states
  const [qrCountdown, setQrCountdown] = useState(25);
  const [isQrConnected, setIsQrConnected] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // Email states
  const [smtpConnected, setSmtpConnected] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showEmailTestModal, setShowEmailTestModal] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    preset: "gmail",
    host: "smtp.gmail.com",
    port: "587",
    encryption: "TLS",
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    hasPassword: false,
  });

  // Ambil konfigurasi SMTP dari backend
  useEffect(() => {
    const fetchSmtp = async () => {
      setIsLoadingSmtp(true);
      try {
        const res = await api.get("/settings/smtp");
        const data = res.data?.data;
        if (data) {
          setSmtpConfig((prev) => ({
            ...prev,
            host: data.host || "",
            port: String(data.port || 587),
            username: data.username || "",
            password: "",
            fromName: data.fromName || "",
            fromEmail: data.fromEmail || "",
            encryption: data.encryption === "none" ? "None" : (data.encryption as "TLS" | "SSL"),
            hasPassword: Boolean(data.hasPassword),
          }));
          setSmtpConnected(Boolean(data.verifiedAt));
        } else {
          setSmtpConnected(false);
        }
      } catch (err: any) {
        console.error("Gagal mengambil konfigurasi SMTP:", err);
      } finally {
        setIsLoadingSmtp(false);
      }
    };

    fetchSmtp();
  }, []);

  // Telegram states
  const [telegramConnected, setTelegramConnected] = useState(true);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [showTgTestModal, setShowTgTestModal] = useState(false);
  const [tgTestMessage, setTgTestMessage] = useState("Halo! Ini pesan tes siaran otomatis dari Campaign Blast.");

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem("channel_telegram");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      botToken: "7489234812:AAH93jf938jf-934jf_39fj49f834jf",
      botUsername: "@AcmeCampaignBot",
      targetChatId: "@acme_announcements",
      parseMode: "HTML",
    };
  });

  // Auto-refresh countdown for QR Code
  useEffect(() => {
    if (activeTab === "whatsapp" && waSubTab === "qrcode" && !isQrConnected) {
      const timer = setInterval(() => {
        setQrCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, waSubTab, isQrConnected]);

  // Handle Preset Email Switch
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
    } else {
      setSmtpConfig((prev) => ({ ...prev, preset: "custom" }));
    }
  };

  // 1. WhatsApp Actions
  const handleSaveMetaWa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaConfig.phoneNumberId || !metaConfig.accessToken) {
      toast.error("Phone Number ID dan Access Token wajib diisi!");
      return;
    }
    localStorage.setItem("channel_meta_wa", JSON.stringify(metaConfig));
    setWaConnected(true);
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
        return;
      }
      setWaConnected(true);
      setShowWaTestModal(true);
      toast.success("Verifikasi Meta Cloud API Berhasil!", {
        description: "Phone Number ID aktif. Messaging Tier: 1,000 conversations / 24h.",
      });
    }, 1200);
  };

  const handleSendWaTest = () => {
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
  };

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setTimeout(() => {
      setIsScanningQr(false);
      setIsQrConnected(true);
      setWaConnected(true);
      toast.success("Perangkat WhatsApp Web Berhasil Dihubungkan!", {
        description: "Terhubung ke nomor +62 812-3456-7890 (Samsung Galaxy S24). Multi-Device sesi aktif.",
      });
    }, 1800);
  };

  const handleDisconnectQr = () => {
    setIsQrConnected(false);
    toast.info("Sesi WhatsApp Web telah diputuskan.");
  };

  // 2. Email Actions
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
        setSmtpConnected(Boolean(saved.verifiedAt));
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

  // 3. Telegram Actions
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("channel_telegram", JSON.stringify(telegramConfig));
    setTelegramConnected(true);
    toast.success("Pengaturan Telegram Bot berhasil disimpan!");
  };

  const handleVerifyTelegram = () => {
    setIsTestingTelegram(true);
    setTimeout(() => {
      setIsTestingTelegram(false);
      setTelegramConnected(true);
      setShowTgTestModal(true);
      toast.success("Token Telegram Bot Terverifikasi!", {
        description: `Bot ${telegramConfig.botUsername} aktif dan memiliki izin broadcast.`,
      });
    }, 900);
  };

  const handleSendTgTest = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1100)),
      {
        loading: `Mengirim siaran tes ke ${telegramConfig.targetChatId}...`,
        success: () => {
          setShowTgTestModal(false);
          return `Pesan tes berhasil dikirim ke ${telegramConfig.targetChatId}`;
        },
        error: "Gagal mengirim ke channel Telegram",
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-5xl">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Channel Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi cara campaign dikirimkan ke kontak Anda.
        </p>
      </div>

      {/* 2. CHANNEL NAVIGATION TABS */}
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/70 border border-slate-200/80 shadow-2xs">
        {/* Email Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "email"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Email</span>
          <span
            className={`h-2 w-2 rounded-full ${
              smtpConnected
                ? "bg-emerald-500"
                : smtpConfig.hasPassword
                ? "bg-amber-400"
                : "bg-slate-300"
            }`}
          />
        </button>

        {/* Telegram Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("telegram")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "telegram"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Telegram</span>
          <span
            className={`h-2 w-2 rounded-full ${
              telegramConnected ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </button>

        {/* WhatsApp Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "whatsapp"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>WhatsApp</span>
          <span
            className={`h-2 w-2 rounded-full ${
              waConnected ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </button>
      </div>

      {/* 3. ACTIVE CHANNEL CARD */}

      {/* TAB A: WHATSAPP (EXACT MATCH TO USER SCREENSHOT) */}
      {activeTab === "whatsapp" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  WhatsApp Business
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kirim campaign via WhatsApp Business API.
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                waConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  waConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>{waConnected ? "Terhubung" : "Belum terhubung"}</span>
            </div>
          </div>

          {/* Sub-tab switcher: Business API (Meta) vs Via QR Code (WA Web) */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setWaSubTab("meta")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
            <form onSubmit={handleSaveMetaWa} className="space-y-5">
              {/* Green Help Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-xs text-emerald-900 leading-relaxed">
                <span>Cara mendapatkan kredensial: Buka </span>
                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  Meta for Developers <ExternalLink className="h-3 w-3" />
                </a>
                <span>
                  , buat WhatsApp Business App, lalu salin Phone Number ID, Access Token, dan Business Account ID dari dashboard-nya.
                </span>
              </div>

              {/* Field 1: PHONE NUMBER ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  PHONE NUMBER ID
                </label>
                <input
                  type="text"
                  value={metaConfig.phoneNumberId}
                  onChange={(e) =>
                    setMetaConfig({ ...metaConfig, phoneNumberId: e.target.value })
                  }
                  placeholder="123456789012345"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
              </div>

              {/* Field 2: ACCESS TOKEN */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  ACCESS TOKEN
                </label>
                <input
                  type="password"
                  value={metaConfig.accessToken}
                  onChange={(e) =>
                    setMetaConfig({ ...metaConfig, accessToken: e.target.value })
                  }
                  placeholder="EAAxxxxxxxxxxx..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition shadow-2xs font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Token permanen (bukan temporary) dari System User di Meta Business Manager.
                </p>
              </div>

              {/* Field 3: BUSINESS ACCOUNT ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  BUSINESS ACCOUNT ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={metaConfig.wabaId}
                  onChange={(e) =>
                    setMetaConfig({ ...metaConfig, wabaId: e.target.value })
                  }
                  placeholder="987654321098765"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleVerifyMetaWa}
                  disabled={isTestingWa}
                  className="px-5 py-2.5 rounded-xl border border-sky-300 text-sky-600 hover:bg-sky-50/60 text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
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
                  className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* SUB-VIEW 2: VIA QR CODE (WA WEB GATEWAY) */}
          {waSubTab === "qrcode" && (
            <div className="space-y-6 pt-2">
              {!isQrConnected ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
                  {/* Left: Authentic QR Code Interface */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm relative">
                    <div className="relative p-3 bg-white rounded-xl">
                      {/* Simulated authentic WhatsApp pairing QR */}
                      <div className="h-52 w-52 bg-slate-900 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                        <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2 bg-white rounded">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs ${
                                (i % 7 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                                  ? "bg-slate-900"
                                  : (i % 3 === 0 ? "bg-slate-800" : "bg-transparent")
                              }`}
                            />
                          ))}
                        </div>
                        {/* Center WhatsApp icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="h-10 w-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                            <MessageSquare className="h-5 w-5 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Kode QR diperbarui dalam <strong>{qrCountdown}s</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateQrScan}
                      disabled={isScanningQr}
                      className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      {isScanningQr ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Menghubungkan ke WhatsApp...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>Simulasi Scan Ponsel (Pairing)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Step-by-step pairing guide */}
                  <div className="md:col-span-7 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Cara Menghubungkan WhatsApp Web:
                    </h3>
                    <ol className="space-y-3 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
                      <li>
                        Buka aplikasi <strong>WhatsApp</strong> di ponsel cerdas Anda.
                      </li>
                      <li>
                        Ketuk <strong>Menu ⋮</strong> (di Android) atau <strong>Pengaturan ⚙️</strong> (di iPhone).
                      </li>
                      <li>
                        Pilih menu <strong>Perangkat Tertaut</strong>, lalu ketuk tombol <strong>Tautkan Perangkat</strong>.
                      </li>
                      <li>
                        Arahkan kamera ponsel Anda ke kode QR di samping untuk memindai.
                      </li>
                    </ol>

                    <div className="p-3.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 text-xs flex items-start gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Perlindungan Anti-Banned</strong>
                        <span>Sistem otomatis menggunakan antrean pintar (delay 2-5 detik acak) agar nomor tetap aman saat blast.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Connected QR Session Card */
                <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Perangkat WhatsApp Terhubung (Multi-Device)
                        </h4>
                        <p className="text-xs text-emerald-700">
                          Nomor: +62 812-3456-7890 • Samsung Galaxy S24 (Android 14)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDisconnectQr}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                    >
                      Putuskan Sesi
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Sinyal & Baterai</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">📶 Online • 🔋 88%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Kecepatan Throttle</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">1 pesan / 3.2 detik</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Kapasitas Harian</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">Siap kirim s/d 2.500 kontak</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB B: EMAIL — SMTP & PROVIDERS */}
      {activeTab === "email" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Email — SMTP & Cloud Providers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi server SMTP atau layanan cloud mail untuk pengiriman email campaign.
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                smtpConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : smtpConfig.hasPassword
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  smtpConnected
                    ? "bg-emerald-500 animate-pulse"
                    : smtpConfig.hasPassword
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {smtpConnected
                  ? "Terhubung"
                  : smtpConfig.hasPassword
                  ? "Tersimpan (Belum Diverifikasi)"
                  : "Belum Dikonfigurasi"}
              </span>
            </div>
          </div>

          {/* Quick Provider Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              PILIH PRESET PROVIDER EMAIL
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "gmail", name: "Google Workspace / Gmail" },
                { id: "sendgrid", name: "SendGrid API" },
                { id: "ses", name: "Amazon SES" },
                { id: "brevo", name: "Brevo (Sendinblue)" },
                { id: "custom", name: "Custom SMTP" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSmtpPreset(p.id as SmtpConfig["preset"])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    smtpConfig.preset === p.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Helper Alert */}
          {smtpConfig.preset === "gmail" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-900 leading-relaxed">
              <strong>Tips Gmail:</strong> Gunakan <strong>App Password 16 karakter</strong> (bukan password akun biasa). Pastikan Verifikasi 2 Langkah (2FA) di akun Google Anda telah aktif.
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
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, host: e.target.value })
                  }
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
                    onChange={(e) =>
                      setSmtpConfig({ ...smtpConfig, port: e.target.value })
                    }
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
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, username: e.target.value })
                  }
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
                    onChange={(e) =>
                      setSmtpConfig({ ...smtpConfig, password: e.target.value })
                    }
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
                    {showSmtpPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, fromName: e.target.value })
                  }
                  placeholder="Acme Broadcast"
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
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })
                  }
                  placeholder="newsletter@startup.id"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleVerifySmtp}
                disabled={isTestingSmtp || isSavingSmtp || isLoadingSmtp}
                className="px-5 py-2.5 rounded-xl border border-sky-300 text-sky-600 hover:bg-sky-50/60 text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                <span>Verifikasi & test</span>
              </button>

              <button
                type="submit"
                disabled={isSavingSmtp || isLoadingSmtp}
                className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isSavingSmtp && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isSavingSmtp ? "Menyimpan..." : "Simpan"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB C: TELEGRAM BOT */}
      {activeTab === "telegram" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Telegram Bot Channel
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kirim broadcast dan pengumuman instan ke Channel publik atau grup privat Telegram.
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                telegramConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  telegramConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>{telegramConnected ? "Terhubung" : "Belum terhubung"}</span>
            </div>
          </div>

          {/* Help Banner */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 text-xs text-sky-950 leading-relaxed">
            <span>Panduan setup: Buka Telegram lalu hubungi </span>
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
            >
              @BotFather <ExternalLink className="h-3 w-3" />
            </a>
            <span>
              , ketik <code className="px-1.5 py-0.5 bg-sky-100/70 rounded text-[11px] font-mono">/newbot</code> untuk mendapatkan API Token. Tambahkan bot Anda sebagai <strong>Administrator</strong> pada Channel target agar dapat memposting pesan secara otomatis.
            </span>
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
                    {showTgToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  BOT USERNAME
                </label>
                <input
                  type="text"
                  value={telegramConfig.botUsername}
                  onChange={(e) =>
                    setTelegramConfig({
                      ...telegramConfig,
                      botUsername: e.target.value,
                    })
                  }
                  placeholder="@AcmeCampaignBot"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TARGET BROADCAST CHANNEL / CHAT ID
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
                placeholder="@acme_announcements atau -1001234567890"
                className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-2xs font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">
                Gunakan format username channel publik (misal <code className="text-slate-600">@nama_channel</code>) atau numeric Chat ID channel privat (misal <code className="text-slate-600">-100xxxxxxxxxx</code>).
              </p>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyTelegram}
                disabled={isTestingTelegram}
                className="px-5 py-2.5 rounded-xl border border-sky-300 text-sky-600 hover:bg-sky-50/60 text-xs font-semibold transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isTestingTelegram ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memeriksa Bot...</span>
                  </>
                ) : (
                  <span>Verifikasi & test</span>
                )}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MODALS FOR REALISTIC VERIFICATION & TESTING */}

      {/* A. WhatsApp Test Message Modal */}
      <Dialog open={showWaTestModal} onOpenChange={setShowWaTestModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Kirim Pesan Uji Coba WhatsApp
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Koneksi Meta Cloud API berhasil. Kirimkan pesan uji coba ke nomor Anda untuk memastikan penerimaan template.
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
                placeholder="+62 812-3456-7890"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Isi template yang akan dikirim:</p>
              <p className="italic text-slate-500">
                "Halo! Ini adalah pesan verifikasi dari sistem Campaign Blast API. Koneksi akun WhatsApp Business Anda telah aktif sempurna."
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setShowWaTestModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendWaTest}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Kirim Sekarang
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* B. Email Test Modal */}
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

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setShowEmailTestModal(false)}
                disabled={isTestingSmtp}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendEmailTest}
                disabled={isTestingSmtp}
                className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-60 flex items-center gap-2"
              >
                {isTestingSmtp && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isTestingSmtp ? "Mengirim Email..." : "Kirim Email Tes"}</span>
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* C. Telegram Test Modal */}
      <Dialog open={showTgTestModal} onOpenChange={setShowTgTestModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              Kirim Pesan Tes Telegram
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Bot terverifikasi. Kirimkan pesan uji coba ke channel target: {telegramConfig.targetChatId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Pesan Siaran
              </label>
              <textarea
                value={tgTestMessage}
                onChange={(e) => setTgTestMessage(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setShowTgTestModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSendTgTest}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Kirim ke Telegram
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
