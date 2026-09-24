import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Send,
  MessageSquare,
  X,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Eye,
  Zap,
  Tag,
  Check,
  ChevronDown,
  AlertTriangle,
  FilePlus,
  Flame,
  Rocket,
  HandHeart,
  BellRing,
  RotateCcw,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Star,
  Reply,
  Bookmark,
  CheckCheck,
  Trash2,
  Code2,
  Edit3,
  ShieldCheck,
  Palette,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RichCampaignEditor } from "@/components/campaigns/RichCampaignEditor";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import { evaluateMergeTags } from "@/data/mergeTags";
import { getEmailTheme } from "@/data/emailThemes";

export type DeliveryChannel = "Email" | "Telegram" | "WhatsApp";

const DRAFT_STORAGE_KEY = "campaign_blast_draft_v1";

// Definisi Template Siap Pakai
interface PresetTemplate {
  id: string;
  name: string;
  badge: string;
  desc: string;
  icon: typeof FilePlus;
  iconColor: string;
  emailSubject: string;
  emailContent: string;
  waContent: string;
  telegramContent: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "blank",
    name: "Blank Template",
    badge: "Mulai dari Nol",
    desc: "Kanvas kosong untuk menulis pesan kustom bebas.",
    icon: FilePlus,
    iconColor: "text-slate-600 bg-slate-100",
    emailSubject: "",
    emailContent: "",
    waContent: "",
    telegramContent: "",
  },
  {
    id: "newsletter",
    name: "Monthly Newsletter",
    badge: "Terpopuler",
    desc: "Update bulanan seputar fitur baru dan kabar penting.",
    icon: Rocket,
    iconColor: "text-indigo-600 bg-indigo-50",
    emailSubject: "Your monthly update is here ✉️",
    emailContent:
      "Hi {{nama}},\n\nWe have some exciting news to share with you this month. Our team has been working hard to bring you new features and improvements that we think you'll love.\n\nHere's what's new:\n• Feature one — improved performance and reliability\n• Feature two — new dashboard with better insights\n• Feature three — easier contact management\n\nWe hope these updates make your experience even better. As always, feel free to reach out if you have any questions.\n\nBest regards,\nThe {{org_name}} Team\n\n---\nYou received this email because you're subscribed to our newsletter.\n{{unsubscribe_link}}",
    waContent:
      "🚀 *KABAR BULANAN TERBARU TELAH TIBA!* 🚀\n\nHalo {{nama}},\n\nBulan ini kami merilis fitur baru untuk meningkatkan performa blast Anda:\n• Pengiriman multi-channel lebih cepat\n• Dashboard analitik real-time\n• Proteksi anti-banned otomatis\n\nCek update selengkapnya di:\n👉 https://acmecorp.co/updates",
    telegramContent:
      "🚀 *MONTHLY UPDATE ALERT* 🚀\n\nHalo {{nama}}, selamat datang di rilis terbaru kami. Kami telah meningkatkan reliabilitas pengiriman dan pemantauan analitik.\n\nSelengkapnya: https://acmecorp.co/updates",
  },
  {
    id: "flash-sale",
    name: "Flash Sale & Promo Diskon",
    badge: "Promo",
    desc: "Format promo eksklusif dengan voucher dan urgensi batas waktu.",
    icon: Flame,
    iconColor: "text-rose-600 bg-rose-50",
    emailSubject: "🔥 Flash Sale 24 Jam: Diskon Spesial s.d 70% Khusus Anda!",
    emailContent:
      "Halo {{nama}},\n\nJangan lewatkan Flash Sale terbatas kami hari ini! Dapatkan diskon istimewa hingga 70% untuk produk pilihan.\n\n🎟️ Kode Voucher: {{voucher}}\n⏰ Batas Waktu: Pukul 23:59 WIB malam ini\n\nKlik link di bawah untuk mulai berbelanja sekarang:\nhttps://acmecorp.co/flash-sale\n\nSalam hangat,\nTim Marketing Acme",
    waContent:
      "🔥 *FLASH SALE SPESIAL 24 JAM!* 🔥\n\nHalo {{nama}}, nikmati diskon khusus member hingga 70% hari ini saja!\n\n🎟️ Kode Voucher: *{{voucher}}*\n⏰ Berakhir: 23:59 WIB\n\nKlaim diskon Anda sekarang:\n👉 https://acmecorp.co/flash-sale",
    telegramContent:
      "🔥 *FLASH SALE 24 JAM DIMULAI!* 🔥\n\nHalo {{nama}}, promo terbesar bulan ini telah dibuka!\n\nGunakan voucher: `{{voucher}}`\nLink: https://acmecorp.co/flash-sale",
  },
  {
    id: "onboarding",
    name: "Welcome & Onboarding Pengguna",
    badge: "Esensial",
    desc: "Menyambut anggota baru dengan panduan langkah awal.",
    icon: HandHeart,
    iconColor: "text-emerald-600 bg-emerald-50",
    emailSubject: "Selamat Datang di Acme Corp, {{nama}}! Panduan Memulai Anda",
    emailContent:
      "Halo {{nama}},\n\nTerima kasih telah bergabung bersama kami. Akun Anda telah siap digunakan.\n\nBerikut 3 langkah mudah untuk memulai:\n1. Lengkapi profil tim Anda\n2. Hubungkan gateway pengiriman pesan\n3. Kirim pesan broadcast pertama Anda\n\nJika ada pertanyaan, tim kami siap membantu kapan saja.\n\nSalam hangat,\nTim Customer Success",
    waContent:
      "👋 *SELAMAT DATANG DI ACME CORP!* 👋\n\nHalo {{nama}}, senang Anda bergabung bersama kami. Akun Anda sudah aktif dan siap digunakan!\n\nButuh bantuan untuk memulai? Balas pesan ini atau buka panduan kami di:\n👉 https://acmecorp.co/docs",
    telegramContent:
      "👋 *SELAMAT DATANG!* 👋\n\nHalo {{nama}}, akun Anda berhasil diaktifkan. Ketik /help untuk melihat menu panduan.",
  },
  {
    id: "event-reminder",
    name: "Pengingat Event / Webinar H-1",
    badge: "Pengingat",
    desc: "Pengingat jadwal acara atau pertemuan live virtual.",
    icon: BellRing,
    iconColor: "text-amber-600 bg-amber-50",
    emailSubject: "⏰ Pengingat: Sesi Live Workshop Anda Dimulai Besok Pukul 10:00 WIB",
    emailContent:
      "Halo {{nama}},\n\nIni adalah pengingat bahwa sesi workshop interaktif kita akan dimulai besok pagi.\n\n📅 Tanggal: Besok\n⏰ Waktu: 10:00 - 12:00 WIB\n📍 Akses: Zoom Meeting\n\nLink Bergabung:\nhttps://zoom.us/j/acmecorp-live\n\nSampai jumpa di sesi live!",
    waContent:
      "⏰ *PENGINGAT SESI LIVE BESOK PAGI!* ⏰\n\nHalo {{nama}}, jangan lewatkan workshop kita besok pukul 10:00 WIB via Zoom.\n\nLink akses:\n👉 https://zoom.us/j/acmecorp-live\n\nSampai bertemu besok!",
    telegramContent:
      "⏰ *REMINDER WEBINAR BESOK* ⏰\n\nHalo {{nama}}, sesi dimulai besok pukul 10:00 WIB. Link Zoom: https://zoom.us/j/acmecorp-live",
  },
];

interface DraftPayload {
  campaignName: string;
  selectedChannels: DeliveryChannel[];
  emailSender: string;
  replyToEmail: string;
  selectedAudience: string;
  selectedTemplateId: string;
  activeTemplateTab: DeliveryChannel;
  emailSubject: string;
  emailContent: string;
  waContent: string;
  telegramContent: string;
  scheduleType: "instant" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  throttleRate: string;
  currentStep: number;
  maxStepReached: number;
  updatedAt: string;
  emailBrandName?: string;
  emailHeaderStyle?: "clean" | "banner" | "minimal";
  emailCtaEnabled?: boolean;
  emailCtaText?: string;
  emailCtaUrl?: string;
  emailCtaColor?: string;
  emailEditorMode?: "visual" | "html";
  emailThemeId?: string;
}

const getInitialDraft = (): Partial<DraftPayload> | null => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Kalau emang kosong (belum ada nama kampanye dan masih di step 1), jangan dianggap draf
      if (!parsed.campaignName?.trim() && (!parsed.currentStep || parsed.currentStep <= 1)) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return null;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Gagal membaca draft dari localStorage:", e);
  }
  return null;
};

export const NewCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const initialDraft = useMemo(() => getInitialDraft(), []);

  // Stepper State (1 to 5) & Tracking Step Tertinggi yang Pernah Dicapai
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialDraft?.currentStep && initialDraft.currentStep >= 1 && initialDraft.currentStep <= 5) {
      return initialDraft.currentStep;
    }
    return 1;
  });

  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    return Math.max(initialDraft?.maxStepReached || 1, initialDraft?.currentStep || 1, 1);
  });

  // Form State
  const [campaignName, setCampaignName] = useState<string>(() => initialDraft?.campaignName ?? "");
  const [selectedChannels, setSelectedChannels] = useState<DeliveryChannel[]>(() => {
    if (initialDraft?.selectedChannels && initialDraft.selectedChannels.length > 0) {
      return initialDraft.selectedChannels;
    }
    return ["Email"];
  });

  // Pengaturan Pengirim Email
  const [emailSender, setEmailSender] = useState<string>(() => initialDraft?.emailSender ?? "promo@acmecorp.co");
  const [replyToEmail, setReplyToEmail] = useState<string>(() => initialDraft?.replyToEmail ?? "support@acmecorp.co");

  // Pengaturan Pengirim WhatsApp & Telegram
  const [waSender] = useState("+62 812-8899-7766");
  const [telegramBot] = useState("@AcmeOfficialBlastBot");

  // State Audience
  const [selectedAudience, setSelectedAudience] = useState<string>(() => initialDraft?.selectedAudience ?? "all-subscribers");

  // State Template Terpilih
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => initialDraft?.selectedTemplateId ?? "newsletter");
  const [activeTemplateTab, setActiveTemplateTab] = useState<DeliveryChannel>(() => initialDraft?.activeTemplateTab ?? "Email");
  const [emailSubject, setEmailSubject] = useState<string>(() => {
    if (initialDraft?.emailSubject !== undefined) return initialDraft.emailSubject;
    return PRESET_TEMPLATES[1].emailSubject;
  });
  const [emailContent, setEmailContent] = useState<string>(() => {
    if (initialDraft?.emailContent !== undefined) return initialDraft.emailContent;
    return PRESET_TEMPLATES[1].emailContent;
  });
  const [waContent, setWaContent] = useState<string>(() => {
    if (initialDraft?.waContent !== undefined) return initialDraft.waContent;
    return PRESET_TEMPLATES[1].waContent;
  });
  const [telegramContent, setTelegramContent] = useState<string>(() => {
    if (initialDraft?.telegramContent !== undefined) return initialDraft.telegramContent;
    return PRESET_TEMPLATES[1].telegramContent;
  });

  // State Jadwal & Throttle
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">(() => initialDraft?.scheduleType ?? "instant");
  const [scheduledDate, setScheduledDate] = useState<string>(() => initialDraft?.scheduledDate ?? "2026-09-23");
  const [scheduledTime, setScheduledTime] = useState<string>(() => initialDraft?.scheduledTime ?? "10:00");
  const [throttleRate, setThrottleRate] = useState<string>(() => initialDraft?.throttleRate ?? "safe");

  // State Modals & Saved Indicator
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Kustomisasi Tampilan & Desain Email (Defaults)
  const emailBrandName = initialDraft?.emailBrandName ?? "ACME CORP";
  const emailHeaderStyle = initialDraft?.emailHeaderStyle ?? "clean";
  const emailCtaEnabled = initialDraft?.emailCtaEnabled ?? false;
  const emailCtaText = initialDraft?.emailCtaText ?? "Klaim Penawaran Spesial ➔";
  const emailCtaUrl = initialDraft?.emailCtaUrl ?? "https://acmecorp.co/promo";
  const emailCtaColor = initialDraft?.emailCtaColor ?? "indigo";
  const [emailEditorMode, setEmailEditorMode] = useState<"visual" | "html">(() => initialDraft?.emailEditorMode ?? "visual");
  const emailThemeId = initialDraft?.emailThemeId ?? "plain";
  const [reviewChannelTab, setReviewChannelTab] = useState<DeliveryChannel>(() => initialDraft?.selectedChannels?.[0] || "Email");

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    return Boolean(
      initialDraft &&
        (initialDraft.campaignName ||
          initialDraft.emailSubject ||
          initialDraft.emailContent ||
          (initialDraft.currentStep && initialDraft.currentStep > 1))
    );
  });
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    if (initialDraft?.updatedAt) {
      return new Date(initialDraft.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "";
  });

  // Dedicated Persistent Save Function
  const saveDraftToStorage = (overrides?: Partial<DraftPayload>) => {
    const effectiveName = overrides?.campaignName !== undefined ? overrides.campaignName : campaignName;
    const effectiveStep = overrides?.currentStep !== undefined ? overrides.currentStep : currentStep;

    // Kalau emang kosong (belum ada nama kampanye dan masih di step 1), jangan masuk ke draft!
    if (!effectiveName.trim() && effectiveStep === 1) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      return;
    }

    const data: DraftPayload = {
      campaignName,
      selectedChannels,
      emailSender,
      replyToEmail,
      selectedAudience,
      selectedTemplateId,
      activeTemplateTab,
      emailSubject,
      emailContent,
      waContent,
      telegramContent,
      scheduleType,
      scheduledDate,
      scheduledTime,
      throttleRate,
      currentStep,
      maxStepReached: Math.max(maxStepReached, currentStep),
      updatedAt: new Date().toISOString(),
      emailBrandName,
      emailHeaderStyle,
      emailCtaEnabled,
      emailCtaText,
      emailCtaUrl,
      emailCtaColor,
      emailEditorMode,
      emailThemeId,
      ...overrides,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Gagal menyimpan draf:", e);
    }
  };

  // Auto-save on any change (Hanya simpan jika bukan kosong)
  useEffect(() => {
    if (!campaignName.trim() && currentStep === 1) {
      return;
    }
    saveDraftToStorage();
  }, [
    campaignName,
    selectedChannels,
    emailSender,
    replyToEmail,
    selectedAudience,
    selectedTemplateId,
    activeTemplateTab,
    emailSubject,
    emailContent,
    waContent,
    telegramContent,
    scheduleType,
    scheduledDate,
    scheduledTime,
    throttleRate,
    currentStep,
    maxStepReached,
    emailBrandName,
    emailHeaderStyle,
    emailCtaEnabled,
    emailCtaText,
    emailCtaUrl,
    emailCtaColor,
    emailEditorMode,
    emailThemeId,
  ]);

  // Handle BeforeUnload (Tab close / refresh safety)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (campaignName.trim() || currentStep > 1) {
        saveDraftToStorage();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  // Sender Profiles
  const senderEmailProfiles = [
    {
      id: "promo@acmecorp.co",
      name: "Acme Promo & Marketing",
      email: "promo@acmecorp.co",
      quota: "Batas harian: 15,000 email",
      badge: "Marketing",
    },
    {
      id: "newsletter@acmecorp.co",
      name: "Acme Weekly Newsletter",
      email: "newsletter@acmecorp.co",
      quota: "Batas harian: 20,000 email",
      badge: "Buletin",
    },
    {
      id: "support@acmecorp.co",
      name: "Acme Customer Care",
      email: "support@acmecorp.co",
      quota: "Transaksional / Notifikasi Akun",
      badge: "Support",
    },
  ];

  const currentSenderProfile =
    senderEmailProfiles.find((p) => p.id === emailSender) || senderEmailProfiles[0];

  // Target Audiens Mock Data
  const audienceOptions = [
    {
      id: "all-subscribers",
      name: "All Subscribers",
      desc: "Semua kontak aktif yang terdaftar di database",
      count: 3420,
      badge: "Umum",
    },
    {
      id: "vip-customers",
      name: "Pelanggan VIP",
      desc: "Pelanggan dengan riwayat transaksi minimal 3 kali",
      count: 1240,
      badge: "Prioritas",
    },
    {
      id: "newsletter-list",
      name: "Newsletter List",
      desc: "Pelanggan yang berlangganan kabar mingguan",
      count: 5800,
      badge: "Marketing",
    },
    {
      id: "inactive-90d",
      name: "Inactive 90d",
      desc: "Pengguna yang tidak membuka pesan dalam 90 hari terakhir",
      count: 450,
      badge: "Re-engagement",
    },
  ];

  const currentAudienceObj =
    audienceOptions.find((a) => a.id === selectedAudience) || audienceOptions[0];

  // Cek apakah form sudah ada isinya yang bermakna
  const isFormDirty = () => {
    return campaignName.trim().length > 0 || currentStep > 1;
  };

  // Handler Percobaan Batal (Cancel / X)
  const handleAttemptCancel = () => {
    // Kalau emang kosong, langsung buang dan keluar tanpa modal konfirmasi draft
    if (!isFormDirty()) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      navigate("/campaigns");
      return;
    }
    setShowCancelModal(true);
  };

  // Handler Simpan Draf & Keluar
  const handleSaveDraftAndExit = () => {
    if (!isFormDirty()) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setShowCancelModal(false);
      navigate("/campaigns");
      return;
    }
    saveDraftToStorage();
    toast.success(`Draf kampanye "${campaignName || "Tanpa Judul"}" tersimpan dengan aman.`);
    setShowCancelModal(false);
    navigate("/campaigns");
  };

  // Handler Manual Save Button
  const handleManualSave = () => {
    if (!isFormDirty()) {
      toast.info("Isi nama kampanye terlebih dahulu sebelum menyimpan draf.");
      return;
    }
    saveDraftToStorage();
    setHasRestoredDraft(true);
    toast.success(`Draf kampanye "${campaignName}" berhasil disimpan!`);
  };

  // Handler Buang Data & Keluar
  const handleDiscardAndExit = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setShowCancelModal(false);
    toast.info("Draf kampanye dibuang.");
    navigate("/campaigns");
  };

  // Handler Reset Draf Manual
  const handleResetDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setCampaignName("");
    setSelectedChannels(["Email"]);
    setEmailSender("promo@acmecorp.co");
    setReplyToEmail("support@acmecorp.co");
    setSelectedAudience("all-subscribers");
    setSelectedTemplateId("blank");
    setEmailSubject("");
    setEmailContent("");
    setWaContent("");
    setTelegramContent("");
    setCurrentStep(1);
    setMaxStepReached(1);
    setHasRestoredDraft(false);
    setShowResetModal(false);
    setShowCancelModal(false);
    toast.info("Draf telah di-reset ke pengaturan awal.");
  };

  // Handler Pilih Template Preset
  const handleSelectTemplate = (template: PresetTemplate) => {
    setSelectedTemplateId(template.id);
    setEmailSubject(template.emailSubject);
    setEmailContent(template.emailContent);
    setWaContent(template.waContent);
    setTelegramContent(template.telegramContent);

    if (template.id === "blank") {
      toast.info("Memilih Blank Template. Anda dapat menulis pesan dari awal.");
    } else {
      toast.success(`Template "${template.name}" berhasil diterapkan.`);
    }
  };

  // Toggle Saluran (Multi-select)
  const handleToggleChannel = (target: DeliveryChannel) => {
    if (selectedChannels.includes(target)) {
      if (selectedChannels.length === 1) {
        toast.error("Minimal harus memilih 1 saluran pengiriman!");
        return;
      }
      const updated = selectedChannels.filter((c) => c !== target);
      setSelectedChannels(updated);
      if (activeTemplateTab === target) {
        setActiveTemplateTab(updated[0]);
      }
    } else {
      const updated = [...selectedChannels, target];
      setSelectedChannels(updated);
    }
  };

  // Helper Sisipkan Merge Tag ke Saluran Aktif
  const handleInsertTag = (tag: string) => {
    const placeholder = `{{${tag}}}`;
    if (activeTemplateTab === "Email") {
      setEmailContent((prev) => (prev ? `${prev} ${placeholder}` : `<p>${placeholder}</p>`));
    } else if (activeTemplateTab === "WhatsApp") {
      setWaContent((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
    } else {
      setTelegramContent((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
    }
    toast.success(`Variabel ${placeholder} disisipkan!`);
  };

  // Parser Real-Time untuk Pratinjau Google Gmail, WhatsApp, dan Telegram
  const renderFormattedPreview = (rawText: string, channel: DeliveryChannel = "Email") => {
    if (!rawText || !rawText.trim()) return null;

    // Evaluasi seluruh merge tags menggunakan pustaka komprehensif
    const processed = evaluateMergeTags(rawText);

    // Cek apakah konten merupakan HTML (output dari Rich Text Editor Tiptap / Custom HTML)
    const isHtml = /<[a-z][\s\S]*>/i.test(processed);

    if (isHtml) {
      if (channel === "WhatsApp") {
        return (
          <div
            className="text-xs text-[#111b21] leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-600 [&_blockquote]:pl-2 [&_blockquote]:italic [&_a]:text-[#027eb5] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        );
      }
      if (channel === "Telegram") {
        return (
          <div
            className="text-xs text-slate-900 leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-sky-500 [&_blockquote]:pl-2 [&_blockquote]:italic [&_a]:text-[#1d90e6] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        );
      }
      // Gmail / Email
      return (
        <div
          className="text-xs text-slate-800 leading-relaxed [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-1 [&_strong]:font-bold [&_strong]:text-slate-900 [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:bg-slate-50/70 [&_blockquote]:py-1 [&_blockquote]:rounded-r [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_a]:text-sky-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }

    const lines = processed.split("\n");

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          if (line.startsWith("# ")) {
            return (
              <h2 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-0.5">
                {line.replace("# ", "")}
              </h2>
            );
          }

          if (line.startsWith("## ")) {
            return (
              <h3 key={idx} className="text-xs font-bold text-slate-800 mt-1.5 mb-0.5">
                {line.replace("## ", "")}
              </h3>
            );
          }

          const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
          const bulletText = isBullet ? line.replace(/^[•\-]\s*/, "") : line;

          const parseInline = (text: string) => {
            const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_|<u>.*?<\/u>|`.*?`|https?:\/\/[^\s]+)/g;
            const parts = text.split(regex);

            return parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                return (
                  <strong key={i} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                return (
                  <strong key={i} className="font-bold text-slate-900">
                    {part.slice(1, -1)}
                  </strong>
                );
              }
              if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
                return (
                  <em key={i} className="italic">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              if (part.startsWith("<u>") && part.endsWith("</u>") && part.length > 7) {
                return (
                  <span key={i} className="underline">
                    {part.slice(3, -4)}
                  </span>
                );
              }
              if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
                return (
                  <code key={i} className="bg-black/5 px-1 py-0.2 rounded font-mono text-[11px]">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              if (part.startsWith("http://") || part.startsWith("https://")) {
                return (
                  <span key={i} className="text-[#0284c7] underline font-medium break-all">
                    {part}
                  </span>
                );
              }
              return part;
            });
          };

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <div className="flex-1">{parseInline(bulletText)}</div>
              </div>
            );
          }

          if (line.trim() === "---") {
            return <hr key={idx} className="my-2 border-slate-200" />;
          }

          return <div key={idx}>{parseInline(line)}</div>;
        })}
      </div>
    );
  };


  // Validasi Step
  const canContinue = () => {
    if (currentStep === 1) {
      return campaignName.trim().length > 0 && selectedChannels.length > 0;
    }
    if (currentStep === 3) {
      if (selectedChannels.includes("Email") && !emailContent.trim()) {
        return false;
      }
      if (selectedChannels.includes("WhatsApp") && !waContent.trim()) {
        return false;
      }
      if (selectedChannels.includes("Telegram") && !telegramContent.trim()) {
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
    } else {
      // Selesai -> Bersihkan localStorage draft
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }

      toast.success(
        `Kampanye "${campaignName}" multichannel (${selectedChannels.join(", ")}) berhasil ${
          scheduleType === "instant" ? "diluncurkan!" : "dijadwalkan!"
        }`
      );
      navigate("/campaigns");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Text Content Active Tab Helper
  const currentContent =
    activeTemplateTab === "Email"
      ? emailContent
      : activeTemplateTab === "WhatsApp"
      ? waContent
      : telegramContent;

  return (
    <div
      className={`min-h-[85vh] flex flex-col justify-between mx-auto px-2 sm:px-4 py-4 space-y-6 transition-all duration-300 ${
        currentStep === 3 ? "max-w-6xl" : "max-w-5xl"
      }`}
    >
      {/* 1. TOP HEADER & SLEEK CLOSE / SAVE CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              New Campaign
            </h1>
            <span className="rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 text-[11px] font-bold">
              Multi-Channel
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Follow the steps below to create and send your campaign.</span>
            <span className="text-slate-300">•</span>
            {(!campaignName.trim() && currentStep === 1) ? (
              <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                <span>Form baru</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Draf tersimpan otomatis {lastSavedTime ? `(pk. ${lastSavedTime})` : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleManualSave}
            title="Simpan perubahan draf sekarang"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200/80 bg-sky-50/60 hover:bg-sky-100 text-sky-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Bookmark className="h-3.5 w-3.5 fill-sky-600 text-sky-600" />
            <span>Simpan Draf</span>
          </button>

          <button
            type="button"
            onClick={handleAttemptCancel}
            title="Tutup & Simpan Draft"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50/80 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* BANNER NOTIFIKASI DRAFT TERPULIHKAN (Jika ada data tersimpan) */}
      {hasRestoredDraft && (
        <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-2.5 text-xs text-sky-900 shadow-2xs max-w-3xl w-full mx-auto animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>
              <strong>Draf Otomatis Aktif:</strong> Melanjutkan data kampanye yang tersimpan{" "}
              {lastSavedTime ? `(tersimpan pk. ${lastSavedTime})` : ""}. Data Anda 100% aman.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-[11px] font-semibold text-sky-700 hover:text-rose-600 underline cursor-pointer"
          >
            Mulai Baru (Reset Draf)
          </button>
        </div>
      )}

      {/* 2. STEPPER NAVIGATION (1 to 5) — MULTI-DIRECTIONAL UNLOCKED */}
      <div className="w-full max-w-3xl mx-auto py-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-8 right-8 top-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

          {[
            { num: 1, label: "Channel" },
            { num: 2, label: "Audience" },
            { num: 3, label: "Template" },
            { num: 4, label: "Schedule" },
            { num: 5, label: "Review" },
          ].map((s) => {
            const isCompleted =
              s.num < currentStep || (maxStepReached >= s.num && currentStep !== s.num);
            const isCurrent = currentStep === s.num;
            const isClickable = s.num <= maxStepReached;

            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isClickable) setCurrentStep(s.num);
                }}
                className={`flex flex-col items-center gap-1.5 relative z-10 select-none ${
                  isClickable ? "cursor-pointer" : "cursor-default opacity-60"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#0284c7] text-white ring-4 ring-sky-100 shadow-sm"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-white border-2 border-slate-300 text-slate-500"
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? "text-[#0284c7]"
                      : isCompleted
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CARD CONTAINER */}
      <div
        className={`rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs w-full mx-auto flex-1 flex flex-col justify-center transition-all duration-300 ${
          currentStep === 3 ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        {/* ================= STEP 1: CHANNEL & SENDER CONFIGURATION ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pilih Saluran & Identitas Pengirim
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bisa memilih lebih dari satu saluran pengiriman sekaligus (Multi-Channel).
              </p>
            </div>

            {/* Input: Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Nama Kampanye <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Contoh: September Super Promo & Onboarding"
                className="w-full h-11 rounded-2xl border border-slate-200/90 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            {/* Delivery Channel Multi-Selection Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Saluran Pengiriman (Bisa pilih lebih dari satu) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedChannels.length} saluran terpilih
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Email Card */}
                <div
                  onClick={() => handleToggleChannel("Email")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                    selectedChannels.includes("Email")
                      ? "border-sky-500 bg-sky-50/20 shadow-xs"
                      : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selectedChannels.includes("Email")
                          ? "bg-sky-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                        selectedChannels.includes("Email")
                          ? "bg-sky-500 border-sky-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedChannels.includes("Email") && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Email SMTP</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      HTML email dengan tracking open & click
                    </p>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div
                  onClick={() => handleToggleChannel("WhatsApp")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                    selectedChannels.includes("WhatsApp")
                      ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                      : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selectedChannels.includes("WhatsApp")
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                        selectedChannels.includes("WhatsApp")
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedChannels.includes("WhatsApp") && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">WhatsApp Gateway</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pesan instan langsung ke nomor WhatsApp
                    </p>
                  </div>
                </div>

                {/* Telegram Card */}
                <div
                  onClick={() => handleToggleChannel("Telegram")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                    selectedChannels.includes("Telegram")
                      ? "border-blue-500 bg-blue-50/20 shadow-xs"
                      : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selectedChannels.includes("Telegram")
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Send className="h-4.5 w-4.5" />
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                        selectedChannels.includes("Telegram")
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedChannels.includes("Telegram") && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Telegram Bot</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kirim via bot token pribadi pengguna
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PENGATURAN SENDER EMAIL (Muncul jika Email dicentang) */}
            {selectedChannels.includes("Email") && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3.5 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-sky-600" />
                    Konfigurasi Alamat Email Pengirim (From)
                  </span>
                  <span className="text-[11px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-semibold">
                    SMTP Organisasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Pilih Email Pengirim (From Address)
                    </label>

                    {/* Custom DropdownMenu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500 flex items-center justify-between shadow-2xs transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600 shrink-0">
                              <Mail className="h-3 w-3" />
                            </div>
                            <div className="text-left truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {currentSenderProfile.name}
                                </span>
                                <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-bold text-sky-700">
                                  {currentSenderProfile.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {currentSenderProfile.email}
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-2" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start" className="w-[320px] rounded-2xl p-1.5 shadow-lg">
                        {senderEmailProfiles.map((prof) => (
                          <DropdownMenuItem
                            key={prof.id}
                            onClick={() => setEmailSender(prof.id)}
                            className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs ${
                              emailSender === prof.id
                                ? "bg-sky-50 text-sky-900 font-semibold"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">{prof.name}</span>
                                <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600">
                                  {prof.badge}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 block">{prof.email}</span>
                              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                                {prof.quota}
                              </span>
                            </div>
                            {emailSender === prof.id && (
                              <Check className="h-4 w-4 text-sky-600 stroke-[2.5]" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentSenderProfile.quota}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Alamat Balasan (Reply-To)
                    </label>
                    <input
                      type="email"
                      value={replyToEmail}
                      onChange={(e) => setReplyToEmail(e.target.value)}
                      placeholder="support@acmecorp.co"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Email tempat balasan dari penerima akan diarahkan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PENGATURAN SENDER WHATSAPP */}
            {selectedChannels.includes("WhatsApp") && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Nomor Gateway WhatsApp Aktif
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {waSender} (Sesi Server Online & Terhubung)
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  ● Siap Blast
                </span>
              </div>
            )}

            {/* PENGATURAN SENDER TELEGRAM */}
            {selectedChannels.includes("Telegram") && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Bot Telegram Pribadi (FR-CHN-02)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {telegramBot} (Token Tersambung)
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                  ● Bot Aktif
                </span>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: AUDIENCE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pilih Target Audiens
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan akan dikirimkan ke kontak pada segmen yang memiliki data sesuai saluran terpilih ({selectedChannels.join(", ")}).
              </p>
            </div>

            <div className="space-y-3">
              {audienceOptions.map((aud) => {
                const isSelected = selectedAudience === aud.id;

                return (
                  <div
                    key={aud.id}
                    onClick={() => setSelectedAudience(aud.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
                        : "border-slate-200/80 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isSelected
                            ? "bg-[#0284c7] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">
                            {aud.name}
                          </h4>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {aud.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{aud.desc}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 block font-mono">
                        {aud.count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">kontak valid</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: TEMPLATE PICKER & HYPER-REALISTIC LIVE SIMULATOR ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* A. Top bar in Step 3 matching user's reference */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{campaignName || "Monthly Newsletter"}</span>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({selectedChannels.join(" & ")})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tulis pesan di sebelah kiri, preview real-time (Google Gmail, WhatsApp, Telegram) muncul di sebelah kanan.
                </p>
              </div>

              {/* Right Controls: Channel Pills, Merge Tags Dropdown & Save Template */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Channel Selector Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                  {selectedChannels.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setActiveTemplateTab(ch)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTemplateTab === ch
                          ? ch === "Email"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : ch === "WhatsApp"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-sky-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {ch === "Email" && <Mail className="h-3 w-3" />}
                      {ch === "WhatsApp" && <MessageSquare className="h-3 w-3" />}
                      {ch === "Telegram" && <Send className="h-3 w-3" />}
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>

                {/* Pustaka Merge Tags Lengkap */}
                <button
                  type="button"
                  onClick={() => setShowMergeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 shadow-2xs transition cursor-pointer"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span>&lt;&gt; Pustaka Tag (28+)</span>
                </button>

                {/* Save Template Button */}
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save template</span>
                </button>
              </div>
            </div>

            {/* B. Template Preset Picker Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Pilihan Template Cepat
                </span>
                <span className="text-[11px] text-slate-400">
                  Pilih salah satu untuk memuat teks rekomendasi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {PRESET_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedTemplateId === tmpl.id;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                        isSelected
                          ? "border-[#0284c7] bg-sky-50/30 shadow-xs ring-1 ring-sky-400"
                          : "border-slate-200/80 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg p-1.5 ${tmpl.iconColor}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              tmpl.id === "blank"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {tmpl.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-[11px] text-slate-900 leading-snug line-clamp-1">
                          {tmpl.name}
                        </h4>
                      </div>

                      {isSelected && (
                        <div className="mt-2 pt-1 border-t border-sky-100 flex items-center justify-end">
                          <span className="text-[9px] font-bold text-sky-600 flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Dipakai
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C. Split View: EDITOR (Kiri) + HYPER-REALISTIC SIMULATOR (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              {/* LEFT COLUMN: EDITOR (Span 6) */}
              <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                      EDITOR ({activeTemplateTab})
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {activeTemplateTab === "Email" ? "Tampilan & Format Email" : "Format pesan saluran aktif"}
                    </span>
                  </div>

                  {/* Subject Line (Hanya muncul jika tab Email aktif) */}
                  {activeTemplateTab === "Email" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Subject line
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Your monthly update is here ✉️"
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode Editor Switcher (Hanya untuk Email: Visual WYSIWYG vs Raw HTML) */}
                  {activeTemplateTab === "Email" && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Isi Pesan Email
                      </label>
                      <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setEmailEditorMode("visual")}
                          className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            emailEditorMode === "visual"
                              ? "bg-white text-indigo-700 shadow-2xs font-bold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Palette className="h-3 w-3" />
                          <span>Mode Visual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailEditorMode("html")}
                          className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            emailEditorMode === "html"
                              ? "bg-white text-indigo-700 shadow-2xs font-bold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Code2 className="h-3 w-3" />
                          <span>&lt;&gt; Custom HTML</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Editor View: Visual WYSIWYG atau Raw Custom HTML */}
                  {activeTemplateTab === "Email" && emailEditorMode === "html" ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={12}
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Paste template email HTML kustom Anda di sini... (contoh: <div><h1>Promo</h1><p>Halo {{nama}}, ...</p></div>)"
                        className="w-full rounded-2xl border border-slate-700 p-4 text-xs font-mono text-emerald-400 bg-slate-950 leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs resize-y"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>💡 Paste kode template HTML dari Canva, Figma, Stripo, atau framework email lainnya.</span>
                        <button
                          type="button"
                          onClick={() => setShowMergeModal(true)}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                        >
                          + Sisipkan Tag
                        </button>
                      </div>
                    </div>
                  ) : (
                    <RichCampaignEditor
                      key={activeTemplateTab}
                      value={currentContent}
                      channel={activeTemplateTab}
                      onChange={(val) => {
                        if (activeTemplateTab === "Email") setEmailContent(val);
                        else if (activeTemplateTab === "WhatsApp") setWaContent(val);
                        else setTelegramContent(val);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: HYPER-REALISTIC LIVE SIMULATOR (Span 6) */}
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    LIVE PREVIEW ({activeTemplateTab})
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    1:1 Real Client Mockup
                  </span>
                </div>

                {/* 1. GOOGLE GMAIL WEBMAIL SIMULATOR (Tab Email) */}
                {activeTemplateTab === "Email" && (
                  <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex flex-col h-[520px]">
                    {/* Google Mail Header Bar */}
                    <div className="bg-[#f6f8fc] px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-white font-black text-[11px] shadow-2xs">
                          M
                        </div>
                        <span className="font-semibold text-slate-700">Google Mail Preview</span>
                        <span className="rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                          Inbox
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Star className="h-3.5 w-3.5 hover:text-amber-500 cursor-pointer" />
                        <Reply className="h-3.5 w-3.5 hover:text-slate-700 cursor-pointer" />
                      </div>
                    </div>

                    {/* Email Subject Heading in Gmail */}
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {emailSubject || "(Subject Line Empty)"}
                      </h3>
                      {/* Sender Info Row */}
                      <div className="flex items-start justify-between mt-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                            A
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">
                                {currentSenderProfile.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                &lt;{currentSenderProfile.email}&gt;
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              to me ▾
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          11:42 AM (moments ago)
                        </span>
                      </div>
                    </div>

                    {/* Email Content Body (Themed) */}
                    {(() => {
                      const theme = getEmailTheme(emailThemeId);
                      const cfg = theme.config;
                      // A header exists whenever headerPadding is non-empty (even white bg headers like Brevo)
                      const showHeader = cfg.headerPadding !== "0" && cfg.headerPadding !== "";
                      const ctaBgClass =
                        emailCtaColor === "emerald" ? "bg-emerald-600 shadow-emerald-600/20" :
                        emailCtaColor === "rose" ? "bg-rose-600 shadow-rose-600/20" :
                        emailCtaColor === "amber" ? "bg-amber-600 shadow-amber-600/20" :
                        emailCtaColor === "dark" ? "bg-slate-900 shadow-slate-900/20" :
                        "bg-indigo-600 shadow-indigo-600/20";

                      return (
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ background: cfg.outerBg }}
                        >
                          <div
                            style={{
                              background: cfg.cardBg,
                              borderRadius: cfg.cardRadius,
                              boxShadow: cfg.cardShadow,
                              margin: "0 auto",
                              overflow: "hidden",
                              maxWidth: "100%",
                            }}
                          >
                            {/* Unified Header — handles gradient, solid color, and white+border themes */}
                            {showHeader && (
                              <div
                                style={{
                                  background: cfg.headerBg,
                                  padding: cfg.headerPadding,
                                  borderBottom: cfg.headerBorderBottom !== "none" ? cfg.headerBorderBottom : undefined,
                                }}
                              >
                                <div
                                  style={{
                                    background: cfg.logoBg !== "transparent" && cfg.logoBg !== "" ? cfg.logoBg : undefined,
                                    borderRadius: cfg.logoRadius || undefined,
                                    padding: cfg.logoPadding || undefined,
                                    display: "inline-block",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: cfg.logoText,
                                      fontSize: cfg.logoFontSize,
                                      fontWeight: cfg.logoFontWeight,
                                      letterSpacing: cfg.logoLetterSpacing,
                                      display: "block",
                                    }}
                                  >
                                    {emailBrandName || "ACME CORP"}
                                  </span>
                                </div>
                                {cfg.taglineText && (
                                  <p
                                    style={{
                                      color: cfg.taglineFg,
                                      fontSize: "10px",
                                      margin: "4px 0 0",
                                      opacity: 0.9,
                                    }}
                                  >
                                    {cfg.taglineText}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* No-header fallback: just show brand as text above body */}
                            {!showHeader && (
                              <div style={{ padding: "16px 24px 0" }}>
                                <span
                                  style={{
                                    color: cfg.logoText,
                                    fontSize: cfg.logoFontSize,
                                    fontWeight: cfg.logoFontWeight,
                                    letterSpacing: cfg.logoLetterSpacing,
                                    display: "block",
                                  }}
                                >
                                  {emailBrandName || "ACME CORP"}
                                </span>
                                {cfg.dividerColor && cfg.dividerColor !== "transparent" && (
                                  <div style={{ height: "1px", background: cfg.dividerColor, marginTop: "10px" }} />
                                )}
                              </div>
                            )}

                            {/* Body */}
                            <div
                              style={{
                                background: cfg.bodyBg,
                                color: cfg.bodyFg,
                                padding: cfg.bodyPadding,
                                fontSize: cfg.bodyFontSize,
                                lineHeight: cfg.bodyLineHeight,
                              }}
                            >
                              <div className="space-y-3">
                                {renderFormattedPreview(emailContent, "Email") || (
                                  <span style={{ color: cfg.bodyFg, opacity: 0.4, fontStyle: "italic" }}>
                                    Tulis isi email di sebelah kiri untuk melihat pratinjau di sini...
                                  </span>
                                )}
                              </div>

                              {/* CTA Button */}
                              {emailCtaEnabled && emailCtaText && (
                                <div style={{ paddingTop: "16px", textAlign: "center" }}>
                                  <a
                                    href={emailCtaUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-block font-bold text-xs text-white shadow-sm transition hover:opacity-90 active:scale-95 ${ctaBgClass}`}
                                    style={{
                                      background: cfg.ctaBg !== "#4f46e5" ? cfg.ctaBg : undefined,
                                      color: cfg.ctaFg,
                                      borderRadius: cfg.ctaRadius,
                                      padding: cfg.ctaPadding,
                                      display: "inline-block",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {evaluateMergeTags(emailCtaText)}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div
                              style={{
                                background: cfg.footerBg,
                                color: cfg.footerFg,
                                padding: cfg.footerPadding,
                                borderTop: cfg.footerBorderTop,
                                fontSize: cfg.footerFontSize,
                                lineHeight: "1.6",
                              }}
                            >
                              <p style={{ margin: "0 0 4px" }}>
                                Anda menerima email ini karena terdaftar sebagai pelanggan kami di {emailBrandName || "Acme Corp"}.
                              </p>
                              <p style={{ margin: 0 }}>
                                <a
                                  href="https://acmecorp.co/unsubscribe"
                                  style={{ color: cfg.footerFg, opacity: 0.8, textDecoration: "underline" }}
                                >
                                  Berhenti berlangganan (Unsubscribe)
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. WHATSAPP WEB / MOBILE SIMULATOR (Tab WhatsApp) */}
                {activeTemplateTab === "WhatsApp" && (
                  <div className="rounded-2xl border border-slate-300 bg-[#efeae2] shadow-sm overflow-hidden flex flex-col h-[480px]">
                    {/* WhatsApp Dark Green Header */}
                    <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-700 border border-emerald-400/40 text-white font-bold text-xs flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs">Acme Official Blast</span>
                            <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-400 text-[#075e54]" />
                          </div>
                          <span className="text-[10px] text-emerald-200 block">online</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-white">
                        <Video className="h-4 w-4 cursor-pointer" />
                        <Phone className="h-4 w-4 cursor-pointer" />
                        <MoreVertical className="h-4 w-4 cursor-pointer" />
                      </div>
                    </div>

                    {/* Chat Messages Body with WhatsApp Wallpaper */}
                    <div
                      className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-between"
                      style={{
                        backgroundColor: "#efeae2",
                        backgroundImage: "radial-gradient(#d3c9b8 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    >
                      {/* Date Bubble */}
                      <div className="flex justify-center">
                        <span className="rounded-lg bg-white/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
                          HARI INI
                        </span>
                      </div>

                      {/* WhatsApp Green Outgoing Bubble */}
                      <div className="max-w-[88%] self-end rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-3.5 shadow-xs text-slate-900 text-xs leading-relaxed">
                        <div>
                          {renderFormattedPreview(waContent, "WhatsApp") || (
                            <span className="text-slate-400 italic">
                              Pesan WhatsApp masih kosong...
                            </span>
                          )}
                        </div>

                        {/* Bubble Timestamp & Double Blue Checkmark */}
                        <div className="text-[10px] text-slate-500 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                          <span>11:42</span>
                          <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb] stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Bottom Input Simulator */}
                    <div className="bg-[#f0f2f5] p-2 border-t border-slate-200 flex items-center gap-2">
                      <Smile className="h-5 w-5 text-slate-500 cursor-pointer" />
                      <Paperclip className="h-5 w-5 text-slate-500 cursor-pointer" />
                      <div className="flex-1 bg-white h-8 rounded-lg border border-slate-200 px-3 flex items-center text-xs text-slate-400">
                        Ketik pesan...
                      </div>
                      <div className="h-8 w-8 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                        <Send className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TELEGRAM MOBILE / DESKTOP SIMULATOR (Tab Telegram) */}
                {activeTemplateTab === "Telegram" && (
                  <div className="rounded-2xl border border-slate-300 bg-[#7c9cb6]/20 shadow-sm overflow-hidden flex flex-col h-[480px]">
                    {/* Telegram Blue Header */}
                    <div className="bg-[#2481cc] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white text-[#2481cc] font-bold text-xs flex items-center justify-center">
                          <Send className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">Acme Blast Bot</span>
                            <span className="rounded bg-sky-300/30 px-1 py-0.2 text-[9px] font-bold">
                              bot
                            </span>
                          </div>
                          <span className="text-[10px] text-sky-100 block">
                            terhubung ke server
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-white">
                        <MoreVertical className="h-4 w-4 cursor-pointer" />
                      </div>
                    </div>

                    {/* Telegram Chat Body */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-between bg-slate-100">
                      {/* Date Bubble */}
                      <div className="flex justify-center">
                        <span className="rounded-full bg-slate-300/60 px-3 py-0.5 text-[10px] font-semibold text-slate-700">
                          22 September 2026
                        </span>
                      </div>

                      {/* Telegram Outgoing Message Bubble */}
                      <div className="max-w-[88%] self-end rounded-2xl rounded-br-xs bg-[#effedd] border border-emerald-200/60 p-3.5 shadow-xs text-slate-900 text-xs leading-relaxed">
                        <div>
                          {renderFormattedPreview(telegramContent, "Telegram") || (
                            <span className="text-slate-400 italic">
                              Pesan Telegram masih kosong...
                            </span>
                          )}
                        </div>

                        {/* Telegram Timestamp & Double Check */}
                        <div className="text-[10px] text-emerald-700 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                          <span>11:42</span>
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    {/* Telegram Input Simulator */}
                    <div className="bg-white p-2.5 border-t border-slate-200 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-8 rounded-full px-3.5 flex items-center text-xs text-slate-400">
                        Broadcast message channel...
                      </div>
                      <Send className="h-4 w-4 text-[#2481cc] cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SCHEDULE & SPEED ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Jadwal & Pengaturan Pengiriman
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan waktu kirim dan kontrol kecepatan blast agar aman dari spam filter.
              </p>
            </div>

            {/* Schedule Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => setScheduleType("instant")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  scheduleType === "instant"
                    ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    scheduleType === "instant"
                      ? "bg-[#0284c7] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Kirim Sekarang</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kampanye langsung masuk ke antrean pengiriman segera setelah konfirmasi.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setScheduleType("scheduled")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  scheduleType === "scheduled"
                    ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    scheduleType === "scheduled"
                      ? "bg-[#0284c7] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Jadwalkan Nanti</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tentukan tanggal dan jam otomatis blast akan dieksekusi oleh server.
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time Picker (Jika Dijadwalkan) */}
            {scheduleType === "scheduled" && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3 animate-in fade-in-50">
                <span className="text-xs font-bold text-slate-900 block">
                  Pilih Waktu Peluncuran
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Tanggal</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Jam (WIB)</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Throttle & Speed Limiter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                Proteksi Kecepatan Antrean (Anti-Banned Throttle)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "safe",
                    title: "Aman (Direkomendasikan)",
                    desc: "Jeda acak 5-15 detik antar kontak. Sangat aman dari risiko blokir WhatsApp.",
                  },
                  {
                    id: "normal",
                    title: "Standar",
                    desc: "Jeda 2-5 detik antar kontak. Cocok untuk pengiriman Email & Telegram.",
                  },
                  {
                    id: "fast",
                    title: "Cepat (Turbo)",
                    desc: "Maksimal throughput server. Gunakan hanya jika domain SMTP telah terverifikasi tinggi.",
                  },
                ].map((th) => (
                  <div
                    key={th.id}
                    onClick={() => setThrottleRate(th.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      throttleRate === th.id
                        ? "border-[#0284c7] bg-sky-50/20"
                        : "border-slate-200/80 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{th.title}</span>
                    <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">
                      {th.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & CONFIRMATION ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900">
                    Tinjau & Konfirmasi Peluncuran
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Siap Diluncurkan (4/4 Lolos Verifikasi)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa kembali seluruh konfigurasi saluran, audiens, dan pesan sebelum dikirimkan.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-bold text-slate-800">{currentAudienceObj.count.toLocaleString()}</span>
                  <span className="text-slate-400 text-[11px]">Penerima</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-bold text-slate-800">
                    ~{Math.max(1, Math.ceil(currentAudienceObj.count / (throttleRate === "turbo" ? 120 : throttleRate === "safe" ? 30 : 60)))}m
                  </span>
                  <span className="text-slate-400 text-[11px]">Est. Durasi</span>
                </div>
              </div>
            </div>

            {/* 4 Summary Grid Cards with Direct Edit Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Saluran & Pengirim */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="h-3 w-3 text-sky-500" /> Saluran & Akun Pengirim
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Ubah
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedChannels.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-bold flex items-center gap-1.5"
                        >
                          {c === "Email" && <Mail className="h-3 w-3 text-sky-600" />}
                          {c === "WhatsApp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                          {c === "Telegram" && <Send className="h-3 w-3 text-sky-500" />}
                          <span>{c}</span>
                        </span>
                      ))}
                    </div>
                    {selectedChannels.includes("Email") && (
                      <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Pengirim:</span>
                          <span className="font-semibold text-slate-800">{currentSenderProfile.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Email:</span>
                          <span className="font-medium text-slate-700">{currentSenderProfile.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Target Audiens */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-indigo-500" /> Target Penerima
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Ubah
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {currentAudienceObj.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                        {currentAudienceObj.count.toLocaleString()} kontak
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {currentAudienceObj.desc}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Kontak Valid & Aktif
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Waktu Peluncuran & Proteksi */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-amber-500" /> Waktu & Proteksi Kirim
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Ubah
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {scheduleType === "instant" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                          <Zap className="h-3 w-3 text-emerald-600" /> Kirim Sekarang (Instan)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/70">
                          <Calendar className="h-3 w-3 text-sky-600" /> Terjadwal: {scheduledDate} {scheduledTime} WIB
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Proteksi Throttle:</span>
                      <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {throttleRate === "safe" ? "Aman (Anti-Banned)" : throttleRate === "normal" ? "Standar" : "Cepat (Turbo)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Identitas & Desain */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="h-3 w-3 text-purple-500" /> Identitas & Desain
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Ubah
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nama Kampanye:</span>
                      <span className="font-bold text-xs text-slate-900 block truncate">
                        {campaignName || "(Tanpa Nama)"}
                      </span>
                    </div>
                    {selectedChannels.includes("Email") && (
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">Tema Desain:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            {getEmailTheme(emailThemeId).swatches.map((s, idx) => (
                              <span
                                key={idx}
                                className="h-2.5 w-2.5 rounded-full border border-white shadow-xs"
                                style={{ background: s }}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {getEmailTheme(emailThemeId).name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Multi-Channel Live Preview (Clean, Not Cut Off, No Code-Vibe) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              {/* Tab Header Bar */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Pratinjau Pesan yang Akan Diterima Pelanggan
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pilih tab saluran di bawah untuk memeriksa tampilan visual akhir sebelum dikirim.
                  </p>
                </div>

                {/* Switcher Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                  {selectedChannels.map((channel) => {
                    const activeTab = selectedChannels.includes(reviewChannelTab) ? reviewChannelTab : selectedChannels[0];
                    const isCurrent = activeTab === channel;
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setReviewChannelTab(channel)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {channel === "Email" && <Mail className="h-3 w-3" />}
                        {channel === "WhatsApp" && <MessageSquare className="h-3 w-3" />}
                        {channel === "Telegram" && <Send className="h-3 w-3" />}
                        <span>{channel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel Preview Content */}
              <div className="p-5 bg-slate-50/40">
                {/* 1. EMAIL PREVIEW */}
                {(selectedChannels.includes(reviewChannelTab) ? reviewChannelTab : selectedChannels[0]) === "Email" && (
                  <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                    {/* Meta Bar */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {emailSubject || "(Subjek Email Belum Diisi)"}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold flex-shrink-0">
                          {getEmailTheme(emailThemeId).name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-800">{currentSenderProfile.name}</span>
                        <span className="text-[11px] text-slate-400">&lt;{currentSenderProfile.email}&gt;</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500">Kepada: {currentAudienceObj.name}</span>
                      </div>
                    </div>

                    {/* Themed Card Preview */}
                    {(() => {
                      const theme = getEmailTheme(emailThemeId);
                      const cfg = theme.config;
                      const showHeader = cfg.headerPadding !== "0" && cfg.headerPadding !== "";
                      const ctaBgClass =
                        emailCtaColor === "emerald" ? "bg-emerald-600" :
                        emailCtaColor === "rose" ? "bg-rose-600" :
                        emailCtaColor === "amber" ? "bg-amber-600" :
                        emailCtaColor === "dark" ? "bg-slate-900" :
                        "bg-indigo-600";

                      return (
                        <div style={{ background: cfg.outerBg, padding: "20px 16px" }}>
                          <div
                            style={{
                              background: cfg.cardBg,
                              borderRadius: cfg.cardRadius,
                              boxShadow: cfg.cardShadow,
                              margin: "0 auto",
                              maxWidth: "560px",
                              overflow: "hidden",
                            }}
                          >
                            {/* Branded Header */}
                            {showHeader && (
                              <div
                                style={{
                                  background: cfg.headerBg,
                                  padding: cfg.headerPadding,
                                  borderBottom: cfg.headerBorderBottom !== "none" ? cfg.headerBorderBottom : undefined,
                                }}
                              >
                                <div
                                  style={{
                                    background: cfg.logoBg !== "transparent" && cfg.logoBg !== "" ? cfg.logoBg : undefined,
                                    borderRadius: cfg.logoRadius || "6px",
                                    padding: cfg.logoPadding || "4px 10px",
                                    display: "inline-block",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: cfg.logoText,
                                      fontSize: cfg.logoFontSize,
                                      fontWeight: cfg.logoFontWeight,
                                      letterSpacing: cfg.logoLetterSpacing,
                                      display: "block",
                                    }}
                                  >
                                    {emailBrandName || "ACME CORP"}
                                  </span>
                                </div>
                                {cfg.taglineText && (
                                  <p style={{ color: cfg.taglineFg, fontSize: "10px", margin: "4px 0 0", opacity: 0.85 }}>
                                    {cfg.taglineText}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Body Content — Clean, Elegant, No Monospace */}
                            <div
                              style={{
                                background: cfg.bodyBg,
                                color: cfg.bodyFg,
                                padding: cfg.bodyPadding,
                                fontSize: cfg.bodyFontSize,
                                lineHeight: cfg.bodyLineHeight,
                              }}
                            >
                              <div className="space-y-2.5">
                                {renderFormattedPreview(emailContent, "Email") || (
                                  <span style={{ color: cfg.bodyFg, opacity: 0.45, fontStyle: "italic" }}>
                                    (Konten email belum diisi)
                                  </span>
                                )}
                              </div>

                              {/* CTA Button */}
                              {emailCtaEnabled && emailCtaText && (
                                <div style={{ paddingTop: "20px", textAlign: "center" }}>
                                  <span
                                    className={`inline-block font-bold text-xs text-white shadow-sm ${ctaBgClass}`}
                                    style={{
                                      background: cfg.ctaBg !== "#4f46e5" && cfg.ctaBg !== "#0f172a" ? cfg.ctaBg : undefined,
                                      color: cfg.ctaFg,
                                      borderRadius: cfg.ctaRadius,
                                      padding: cfg.ctaPadding,
                                      textDecoration: "none",
                                      display: "inline-block",
                                    }}
                                  >
                                    {evaluateMergeTags(emailCtaText)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div
                              style={{
                                background: cfg.footerBg,
                                color: cfg.footerFg,
                                padding: cfg.footerPadding,
                                borderTop: cfg.footerBorderTop,
                                fontSize: cfg.footerFontSize,
                                lineHeight: "1.6",
                              }}
                            >
                              <p style={{ margin: "0 0 4px" }}>
                                Anda menerima email ini karena terdaftar sebagai pelanggan kami di {emailBrandName || "Acme Corp"}.
                              </p>
                              <p style={{ margin: 0 }}>
                                <span style={{ color: cfg.footerFg, opacity: 0.8, textDecoration: "underline" }}>
                                  Berhenti berlangganan (Unsubscribe)
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. WHATSAPP PREVIEW */}
                {(selectedChannels.includes(reviewChannelTab) ? reviewChannelTab : selectedChannels[0]) === "WhatsApp" && (
                  <div className="max-w-md mx-auto rounded-2xl border border-slate-300 bg-[#efeae2] shadow-sm overflow-hidden">
                    <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block">{emailBrandName || "Acme Official"}</span>
                          <span className="text-[10px] text-emerald-100/80 block">Official Business Account</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-semibold">WhatsApp</span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-2xs max-w-[92%] space-y-2">
                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                          {renderFormattedPreview(waContent, "WhatsApp") || (
                            <span className="text-slate-400 italic">(Konten WhatsApp belum diisi)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                          <span>10:00</span>
                          <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TELEGRAM PREVIEW */}
                {(selectedChannels.includes(reviewChannelTab) ? reviewChannelTab : selectedChannels[0]) === "Telegram" && (
                  <div className="max-w-md mx-auto rounded-2xl border border-slate-700 bg-[#0f172a] shadow-sm overflow-hidden p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Send className="h-3.5 w-3.5 text-sky-400" /> Telegram Channel Preview
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Bot Broadcast</span>
                    </div>
                    <div className="bg-[#1e293b] rounded-2xl p-4 shadow-xs space-y-2 border border-slate-700/60">
                      <span className="text-xs font-bold text-sky-400 block">{emailBrandName || "Acme Bot"}</span>
                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                        {renderFormattedPreview(telegramContent, "Telegram") || (
                          <span className="text-slate-500 italic">(Konten Telegram belum diisi)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">10:00</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Guarantee Notice */}
            <div className="p-3.5 rounded-2xl border border-sky-100 bg-sky-50/50 flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-900 leading-relaxed">
                <strong>Jaminan Antrean Aman:</strong> Begitu tombol "Luncurkan Kampanye" ditekan, sistem akan mendistribusikan pesan secara bertahap sesuai proteksi antrean throttle untuk melindungi akun dan reputasi domain SMTP Anda dari pembatasan spam.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ACTION BAR (SLEEK CANCEL & NAVIGATION CONTROLS) */}
      <div
        className={`flex items-center justify-between w-full mx-auto pt-2 transition-all duration-300 ${
          currentStep === 3 ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Sleek Cancel & Save Button */}
          <button
            type="button"
            onClick={handleAttemptCancel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>{(!campaignName.trim() && currentStep === 1) ? "Batal" : "Batal & Simpan Draf"}</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium select-none">
          Step {currentStep} of 5
        </span>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </button>
          )}

          <button
            type="button"
            disabled={!canContinue()}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 ${
              canContinue()
                ? currentStep === 5
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>{currentStep === 5 ? "Luncurkan Kampanye" : "Continue"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 5. DIALOG KONFIRMASI BATAL (REASSURING & INTUITIVE) */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-1">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Tinggalkan Pembuatan Kampanye?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Data yang telah Anda isi otomatis tersimpan dengan aman sebagai Draf. Anda dapat melanjutkannya kapan saja tanpa takut kehilangan isian.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-3">
            <button
              type="button"
              onClick={handleSaveDraftAndExit}
              className="w-full h-10 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan sebagai Draf & Keluar</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Lanjutkan Mengedit
            </button>
            <button
              type="button"
              onClick={handleDiscardAndExit}
              className="w-full h-9 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 mt-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Buang Draf & Hapus Isian</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. DIALOG KONFIRMASI RESET / HAPUS DRAF */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-1">
              <Trash2 className="h-5 w-5 text-rose-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Reset Draf & Mulai Baru?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Tindakan ini akan mengosongkan seluruh isian nama kampanye, saluran, dan template yang tersimpan di browser ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-3">
            <button
              type="button"
              onClick={handleResetDraft}
              className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              Ya, Reset & Bersihkan Draf
            </button>
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. MODAL PUSTAKA MERGE TAGS (28+ VARIABEL) */}
      <MergeTagsModal
        open={showMergeModal}
        onOpenChange={setShowMergeModal}
        onSelectTag={handleInsertTag}
      />

    </div>
  );
};
