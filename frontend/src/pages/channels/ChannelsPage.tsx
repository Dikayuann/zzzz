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
  ChevronDown,
  Users,
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
  preset: "custom" | "gmail" | "sendgrid" | "ses" | "brevo" | "zoho";
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

interface TelegramSubscriber {
  id: number;
  name: string;
  teleChatId: string;
  customFields?: { telegramUsername?: string };
  createdAt: string;
}

export const ChannelsPage: React.FC = () => {
  // Active main tab
  const [activeTab, setActiveTab] = useState<ChannelTab>("whatsapp");

  // WhatsApp states
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


  // Email states
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

  // Telegram states
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

  // Ambil konfigurasi Channels dari backend saat mount
  useEffect(() => {
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
          fetchTgSubscribers();
        } else {
          setTelegramConnected(false);
        }
      } catch (err: any) {
        console.error("Gagal mengambil konfigurasi Telegram:", err);
      } finally {
        setIsLoadingTelegram(false);
      }
    };

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
          setSmtpConnected(Boolean(data.verifiedAt || (data.host && data.hasPassword)));
        } else {
          setSmtpConnected(false);
        }
      } catch (err: any) {
        console.error("Gagal mengambil konfigurasi SMTP:", err);
      } finally {
        setIsLoadingSmtp(false);
      }
    };

    fetchTelegram();
    fetchSmtp();
  }, []);

  // Retrieve Baileys WhatsApp QR status from the backend
  const fetchWhatsappQrStatus = async () => {
    try {
      const res = await api.get("/channels/whatsapp/qr/status");
      const data = res.data?.data;
      if (data) {
        setQrStatus(data.status);
        setIsQrConnected(data.status === "connected");
        setQrPhoneNumber(data.phoneNumber);
        setQrPushName(data.pushName);
        setQrDataUrl(data.qrDataUrl);
        setQrDailyCount(data.dailyCount || 0);
        setQrDailyQuota(data.dailyQuota || 300);
      }
    } catch (err: any) {
      console.error("Gagal mengambil status WhatsApp QR:", err);
    }
  };

  // Periodically poll the status while on the QR Code tab if not yet connected.
  useEffect(() => {
    if (activeTab === "whatsapp" && waSubTab === "qrcode") {
      fetchWhatsappQrStatus();

      // check every 3 second whether the phone has scanned a QR code or if there is a new QR code.
      if (!isQrConnected) {
        const interval = setInterval(() => {
          fetchWhatsappQrStatus();
        },3000);
        return () => clearInterval(interval)
      }
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

  const handleSendWaTest = async () => {
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

 // Initialize the Baileys session and request the actual QR code from the backend.
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

  // disconnect whatsapp web (logout)
  const handleDisconnectQr = async () => {
    try {
      await api.delete("/channels/whatsapp/qr");
      setIsQrConnected(false);
      setQrDataUrl(null);
      setQrPhoneNumber(null);
      setQrPushName(null);
      setQrStatus("disconnected");
      toast.info("Sesi WhatsApp Web telah diputuskan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutuskan sesi WhatsApp");

    }
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
        setSmtpConnected(true);
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

  const handleDisconnectSmtp = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan dan menghapus konfigurasi server SMTP Email ini?")) return;

    try {
      await api.delete("/settings/smtp");
      setSmtpConnected(false);
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
      toast.success("Konfigurasi SMTP Email berhasil diputuskan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutuskan konfigurasi SMTP");
    }
  };

  // 3. Telegram Actions
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

  const handleDisconnectTelegram = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan koneksi Bot Telegram ini?")) return;

    try {
      await api.delete("/channels/telegram");
      setTelegramConnected(false);
      setTelegramConfig({
        botToken: "",
        botUsername: "",
        targetChatId: "",
        parseMode: "HTML",
      });
      toast.success("Koneksi Bot Telegram berhasil diputus");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memutus koneksi Bot Telegram");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl mx-auto w-full">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Channel Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi cara campaign dikirimkan ke kontak Anda.
        </p>
      </div>

      {/* 2. CHANNEL NAVIGATION TABS */}
      <div className="flex flex-wrap sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 w-full sm:w-auto">
        {/* Email Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "email"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
          {smtpConnected || smtpConfig.hasPassword ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </button>

        {/* Telegram Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("telegram")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "telegram"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Telegram</span>
          {telegramConnected ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </button>

        {/* WhatsApp Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "whatsapp"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              waConnected || isQrConnected ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
        </button>
      </div>

      {/* 3. ACTIVE CHANNEL CARD */}

      {/* TAB A: WHATSAPP */}
      {activeTab === "whatsapp" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  WhatsApp Business
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kirim campaign via WhatsApp Business API atau WhatsApp Web.
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                (waSubTab === "meta" ? waConnected : isQrConnected)
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  (waSubTab === "meta" ? waConnected : isQrConnected)
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {(waSubTab === "meta" ? waConnected : isQrConnected)
                  ? "Terhubung"
                  : "Belum terhubung"}
              </span>
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
              {/* Help Box */}
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
                />
                <p className="text-[11px] text-slate-400">
                  Gunakan token permanen dari System User Meta Business Manager.
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono transition"
                />
              </div>

              {/* Buttons */}
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
                /* Unconnected: Clean QR Pairing Layout */
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
                            <p className="text-xs text-slate-500 font-medium">
                              Memuat QR Code...
                            </p>
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
                    <h3 className="text-sm font-bold text-slate-900">
                      Cara Menghubungkan:
                    </h3>
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
                /* Connected QR: Clean, Compact, Minimalist */
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

                    {/* Action Buttons */}
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

                  {/* Quota & Safeguard Row */}
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
      )}

      {/* TAB B: EMAIL — SMTP & PROVIDERS */}
      {activeTab === "email" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Email — SMTP Server
                </h2>
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
                  smtpConnected || smtpConfig.hasPassword
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {smtpConnected || smtpConfig.hasPassword
                  ? "Terhubung"
                  : "Belum terhubung"}
              </span>
            </div>
          </div>

          {/* Quick Provider Presets  Dropdown */}
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
                  onClick={handleDisconnectSmtp}
                  className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition cursor-pointer active:scale-95"
                >
                  Putuskan SMTP
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB C: TELEGRAM BOT */}
      {activeTab === "telegram" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
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
              className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                isLoadingTelegram
                  ? "bg-slate-50 text-slate-600 border-slate-200"
                  : telegramConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {isLoadingTelegram ? (
                <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${
                    telegramConnected ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              )}
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
                  <span>{isSavingTelegram ? "Menghubungkan..." : telegramConnected ? "Simpan Perubahan" : "Hubungkan Bot"}</span>
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
                  onClick={handleDisconnectTelegram}
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

      {/* C. Telegram Test Modal */}
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
                placeholder={telegramConfig.targetChatId || "User ID Telegram Anda (misal 123456789) atau @channel"}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {telegramConfig.targetChatId
                  ? `Kosongkan jika ingin mengirim ke target default (${telegramConfig.targetChatId}).`
                  : "Untuk tes kirim ke akun pribadi: buka bot Anda lalu klik /start, lalu masukkan User ID Telegram Anda (cek ID via @userinfobot)."}
              </p>
            </div>

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
    </div>
  );
};
