import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronDown,
  Mail,
  Send,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Trash2,
  Eye,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Users,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Tipe Data Kampanye
export type CampaignChannel = "Email" | "Telegram" | "WhatsApp";
export type CampaignStatus = "Sent" | "Sending" | "Scheduled" | "Draft" | "Failed";

export interface CampaignItem {
  id: string;
  name: string;
  date: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  audienceCount: number;
  sentCount: number;
  failedCount: number;
  openRate: number | null; // null jika belum terkirim
  clickRate: number | null;
  subject?: string;
  messageContent: string;
  scheduledTime?: string;
  hasAttention?: boolean; // True jika ada masalah (gagal > 0 atau draft terbengkalai)
}

// Data Dummy Realistis Sesuai Mockup
const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: "cmp-01",
    name: "Flash Sale Alert 9.9 Special",
    date: "Sep 22, 2026",
    channel: "WhatsApp",
    status: "Sending",
    audience: "Pelanggan VIP",
    audienceCount: 1240,
    sentCount: 820,
    failedCount: 4,
    openRate: 88.5,
    clickRate: 34.2,
    messageContent:
      "🔥 *FLASH SALE 9.9 DIMULAI!* 🔥\n\nHalo {{nama}}, nikmati diskon spesial s.d 70% hanya untuk member VIP hari ini. Gunakan kode: *VIP99* saat checkout sebelum jam 23:59 WIB!\n\nLink promo: https://acmecorp.co/vip-sale",
  },
  {
    id: "cmp-02",
    name: "Product Launch Announcement v2.0",
    date: "Sep 18, 2026",
    channel: "Email",
    status: "Sent",
    audience: "All Subscribers",
    audienceCount: 3420,
    sentCount: 3408,
    failedCount: 12,
    openRate: 35.4,
    clickRate: 14.1,
    subject: "Memperkenalkan CampaignBlast v2.0: Fitur Multi-Saluran Baru",
    messageContent:
      "Halo {{nama}},\n\nKami sangat bersemangat mengumumkan peluncuran CampaignBlast v2.0 dengan integrasi WhatsApp Gateway dan Telegram Bot!\n\nCoba fitur terbarunya sekarang di dashboard Anda.",
  },
  {
    id: "cmp-03",
    name: "Weekly Newsletter — Sep W2",
    date: "Sep 15, 2026",
    channel: "Email",
    status: "Sent",
    audience: "Newsletter List",
    audienceCount: 5800,
    sentCount: 5780,
    failedCount: 20,
    openRate: 35.2,
    clickRate: 11.8,
    subject: "Tips Meningkatkan Konversi Broadcast hingga 3x Lipat",
    messageContent:
      "Halo {{nama}}, dalam edisi minggu ini kami membahas cara segmentasi tag kontak agar pesan Anda tidak dianggap spam...",
  },
  {
    id: "cmp-04",
    name: "Webinar Reminder H-1",
    date: "Sep 14, 2026",
    channel: "Telegram",
    status: "Sent",
    audience: "Telegram Subscribers",
    audienceCount: 1240,
    sentCount: 1238,
    failedCount: 2,
    openRate: 79.0,
    clickRate: 42.0,
    messageContent:
      "📢 *REMINDER WEBINAR BESOK PAGI!* 📢\n\nHalo {{nama}}, jangan lewatkan sesi live 'Mastering WhatsApp Marketing' besok pukul 10:00 WIB via Zoom.\n\nLink join: https://zoom.us/j/campaignblast",
  },
  {
    id: "cmp-05",
    name: "Customer Onboarding Series #3",
    date: "Sep 23, 2026",
    channel: "Email",
    status: "Scheduled",
    audience: "New Customers",
    audienceCount: 850,
    sentCount: 0,
    failedCount: 0,
    openRate: null,
    clickRate: null,
    scheduledTime: "Besok, 10:00 WIB",
    subject: "Langkah ke-3: Cara Menghubungkan Domain SMTP Pribadi Anda",
    messageContent:
      "Halo {{nama}}, selamat datang di panduan langkah ke-3. Hari ini kita akan mengonfigurasi DNS dan DKIM domain...",
  },
  {
    id: "cmp-06",
    name: "Re-engagement Blast (Failed Delivery)",
    date: "Sep 12, 2026",
    channel: "Email",
    status: "Failed",
    audience: "Inactive 90d",
    audienceCount: 450,
    sentCount: 110,
    failedCount: 340,
    openRate: 12.0,
    clickRate: 2.0,
    subject: "Apakah Anda Masih Ingin Mendapatkan Update dari Kami?",
    messageContent:
      "Halo {{nama}}, kami mendeteksi Anda belum membuka email kami dalam 90 hari terakhir...",
    hasAttention: true,
  },
  {
    id: "cmp-07",
    name: "Promo Akhir Bulan Draft",
    date: "Sep 10, 2026",
    channel: "WhatsApp",
    status: "Draft",
    audience: "Semua Kontak",
    audienceCount: 2100,
    sentCount: 0,
    failedCount: 0,
    openRate: null,
    clickRate: null,
    messageContent:
      "Promo gajian akhir bulan siap diluncurkan! Diskon diskon...",
    hasAttention: true,
  },
];

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [selectedTab, setSelectedTab] = useState<string>("All");

  // State Drawer Preview
  const [previewCampaign, setPreviewCampaign] = useState<CampaignItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State Modal Buat Kampanye Baru
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignChannel, setNewCampaignChannel] = useState<CampaignChannel>("WhatsApp");
  const [newCampaignAudience, setNewCampaignAudience] = useState("Pelanggan VIP");
  const [newCampaignMessage, setNewCampaignMessage] = useState("");

  // Kampanye aktif yang sedang berjalan (untuk Live Operations Strip)
  const activeSending = campaigns.find((c) => c.status === "Sending");

  // Baca draft yang tersimpan di browser
  const [activeDraft, setActiveDraft] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("campaign_blast_draft_v1");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.campaignName || p.emailSubject || p.emailContent || p.waContent) {
          return p;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Gabungkan draf tersimpan ke daftar kampanye
  const allCampaigns = useMemo(() => {
    if (!activeDraft) return campaigns;
    const localDraftItem: CampaignItem = {
      id: "draft-local",
      name: activeDraft.campaignName || "Draf Kampanye (Belum Diberi Nama)",
      date: activeDraft.updatedAt
        ? `Draf (${new Date(activeDraft.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
        : "Draf Lokal",
      channel: (activeDraft.selectedChannels?.[0] as CampaignChannel) || "Email",
      status: "Draft",
      audience: activeDraft.selectedAudience || "All Subscribers",
      audienceCount: 3420,
      sentCount: 0,
      failedCount: 0,
      openRate: null,
      clickRate: null,
      messageContent:
        activeDraft.emailContent ||
        activeDraft.waContent ||
        activeDraft.telegramContent ||
        "Isi draf...",
      hasAttention: false,
    };
    return [localDraftItem, ...campaigns.filter((c) => c.id !== "draft-local")];
  }, [campaigns, activeDraft]);

  // Filter Logika
  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter((item) => {
      // 1. Search Query
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.audience.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Channel Filter
      const matchChannel =
        selectedChannel === "All" || item.channel === selectedChannel;

      // 3. Tab Filter
      let matchTab = true;
      if (selectedTab === "Attention") {
        matchTab = item.status === "Failed" || item.failedCount > 10 || item.hasAttention === true;
      } else if (selectedTab === "Sending") {
        matchTab = item.status === "Sending";
      } else if (selectedTab === "Scheduled") {
        matchTab = item.status === "Scheduled";
      } else if (selectedTab === "Sent") {
        matchTab = item.status === "Sent";
      } else if (selectedTab === "Draft") {
        matchTab = item.status === "Draft";
      }

      return matchSearch && matchChannel && matchTab;
    });
  }, [allCampaigns, searchQuery, selectedChannel, selectedTab]);

  // Aksi Cepat
  const handleOpenPreview = (campaign: CampaignItem) => {
    setPreviewCampaign(campaign);
    setDrawerOpen(true);
  };

  const handleDuplicate = (campaign: CampaignItem) => {
    const duplicated: CampaignItem = {
      ...campaign,
      id: `cmp-${Date.now().toString().slice(-4)}`,
      name: `${campaign.name} (Copy)`,
      status: "Draft",
      sentCount: 0,
      failedCount: 0,
      openRate: null,
      clickRate: null,
      date: "Hari ini",
    };
    setCampaigns([duplicated, ...campaigns]);
    toast.success(`Kampanye "${campaign.name}" berhasil diduplikat sebagai Draft!`);
  };

  const handleDelete = (id: string, name: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
    toast.info(`Kampanye "${name}" telah dihapus.`);
  };

  const handleRetryFailed = (campaign: CampaignItem) => {
    toast.success(`Mengirim ulang ke ${campaign.failedCount} kontak yang gagal pada "${campaign.name}"...`);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) {
      toast.error("Nama kampanye wajib diisi");
      return;
    }

    const newCmp: CampaignItem = {
      id: `cmp-${Date.now().toString().slice(-4)}`,
      name: newCampaignName,
      date: "Hari ini",
      channel: newCampaignChannel,
      status: "Draft",
      audience: newCampaignAudience,
      audienceCount: 1250,
      sentCount: 0,
      failedCount: 0,
      openRate: null,
      clickRate: null,
      messageContent: newCampaignMessage || "Pesan draf baru...",
    };

    setCampaigns([newCmp, ...campaigns]);
    setCreateDialogOpen(false);
    setNewCampaignName("");
    setNewCampaignMessage("");
    toast.success("Kampanye baru berhasil dibuat sebagai Draft!");
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. TOP HEADER: TITLE & NEW CAMPAIGN BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau dan kelola pengiriman pesan massal multichannel (Email, WhatsApp, Telegram).
          </p>
        </div>

        <button
          onClick={() => navigate("/campaigns/new")}
          className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs px-4 py-2.5 shadow-xs shadow-sky-600/20 transition-all cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Buat Kampanye Baru</span>
        </button>
      </div>

      {/* 2. LIVE OPERATIONS STRIP (Bukan kartu statis generik) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Active sending or next schedule */}
        {activeSending ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Play className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  ⚡ Sedang Mengirim: {activeSending.name}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-800">
                  {Math.round((activeSending.sentCount / activeSending.audienceCount) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-48 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${(activeSending.sentCount / activeSending.audienceCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeSending.sentCount.toLocaleString()} / {activeSending.audienceCount.toLocaleString()} kontak
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Semua antrean normal • Tidak ada blast berjalan saat ini
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Jadwal berikutnya: <strong className="text-slate-700">Customer Onboarding Series #3</strong> (Besok, 10:00 WIB)
              </p>
            </div>
          </div>
        )}

        {/* Right: Live Channel Readiness Indicators */}
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600" title="WhatsApp Gateway">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium">WA: Siap</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600" title="SMTP Server">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span className="font-medium">SMTP: Siap</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600" title="Telegram Bot">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium">TG: Siap</span>
          </div>
        </div>
      </div>

      {/* BANNER DRAF TERSIMPAN AKTIF */}
      {activeDraft && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shrink-0 shadow-xs shadow-sky-600/20">
              <Bookmark className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Draf Kampanye Tersimpan: "{activeDraft.campaignName || "Tanpa Judul"}"
                </span>
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                  Step {activeDraft.currentStep || 1} of 5
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Saluran: <strong className="text-slate-800">{activeDraft.selectedChannels?.join(", ") || "Email"}</strong> • Terakhir disimpan:{" "}
                {activeDraft.updatedAt ? new Date(activeDraft.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Baru saja"}. Data Anda tersimpan aman.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                localStorage.removeItem("campaign_blast_draft_v1");
                setActiveDraft(null);
                toast.info("Draf kampanye lokal telah dibuang.");
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Hapus Draf
            </button>
            <button
              onClick={() => navigate("/campaigns/new")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Lanjutkan Edit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CONTROLS BAR: SEARCH, CHANNEL FILTER & SMART STATUS TABS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search input & Channel Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kampanye atau audiens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          {/* Filter Channel */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer outline-none shrink-0">
                <span>{selectedChannel === "All" ? "Semua Saluran" : selectedChannel}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => setSelectedChannel("All")} className="text-xs cursor-pointer font-medium">
                Semua Saluran
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedChannel("Email")} className="text-xs cursor-pointer font-medium">
                ✉️ Email Saja
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedChannel("WhatsApp")} className="text-xs cursor-pointer font-medium">
                💬 WhatsApp Saja
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedChannel("Telegram")} className="text-xs cursor-pointer font-medium">
                ✈️ Telegram Saja
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Smart Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 w-fit">
          <button
            onClick={() => setSelectedTab("All")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "All"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({campaigns.length})
          </button>
          <button
            onClick={() => setSelectedTab("Attention")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "Attention"
                ? "bg-rose-50 text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-rose-600"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>Perlu Perhatian</span>
          </button>
          <button
            onClick={() => setSelectedTab("Sending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "Sending"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Mengirim
          </button>
          <button
            onClick={() => setSelectedTab("Scheduled")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "Scheduled"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terjadwal
          </button>
          <button
            onClick={() => setSelectedTab("Sent")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "Sent"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setSelectedTab("Draft")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedTab === "Draft"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Draft
          </button>
        </div>
      </div>

      {/* 4. MAIN DATA TABLE: CAMPAIGNS LIST WITH DELIVERY HEALTH */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">KAMPANYE</th>
                <th className="py-3 px-3">SALURAN</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">TARGET AUDIENS</th>
                <th className="py-3 px-3">DELIVERY HEALTH</th>
                <th className="py-3 px-3">OPEN RATE</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada kampanye yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((item) => {
                  const percentSuccess =
                    item.audienceCount > 0
                      ? Math.round((item.sentCount / item.audienceCount) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenPreview(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Campaign Name & Date */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {item.date} {item.scheduledTime && `• ${item.scheduledTime}`}
                          </span>
                        </div>
                      </td>

                      {/* 2. Channel Badge with Icon */}
                      <td className="py-3.5 px-3">
                        {item.channel === "Email" && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                            <Mail className="h-3 w-3" />
                            <span>Email</span>
                          </span>
                        )}
                        {item.channel === "WhatsApp" && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </span>
                        )}
                        {item.channel === "Telegram" && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/60 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                            <Send className="h-3 w-3" />
                            <span>Telegram</span>
                          </span>
                        )}
                      </td>

                      {/* 3. Status Badge with Dot Indicator */}
                      <td className="py-3.5 px-3">
                        {item.status === "Sent" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Selesai</span>
                          </span>
                        )}
                        {item.status === "Sending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Mengirim</span>
                          </span>
                        )}
                        {item.status === "Scheduled" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            <span>Terjadwal</span>
                          </span>
                        )}
                        {item.status === "Draft" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>Draft</span>
                          </span>
                        )}
                        {item.status === "Failed" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>Gagal</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Audience Segment Tag */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.audience}</span>
                        </div>
                      </td>

                      {/* 5. DELIVERY HEALTH BAR (Fitur Unggulan) */}
                      <td className="py-3.5 px-3">
                        {item.status === "Draft" || item.status === "Scheduled" ? (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="space-y-1 w-36">
                                <div className="flex items-center justify-between text-[11px] font-mono leading-none">
                                  <span className="font-semibold text-slate-800">
                                    {item.sentCount.toLocaleString()}
                                  </span>
                                  {item.failedCount > 0 ? (
                                    <span className="text-rose-600 font-bold">
                                      {item.failedCount} gagal
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 font-bold">
                                      {percentSuccess}%
                                    </span>
                                  )}
                                </div>
                                {/* Multi-segmented delivery bar */}
                                <div className="h-1.5 w-full rounded-full bg-slate-100 flex overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${percentSuccess}%` }}
                                  />
                                  {item.failedCount > 0 && (
                                    <div
                                      className="h-full bg-rose-500"
                                      style={{
                                        width: `${(item.failedCount / item.audienceCount) * 100}%`,
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-slate-900 text-white p-2">
                              <p className="font-bold">{item.sentCount} terkirim berhasil</p>
                              {item.failedCount > 0 && (
                                <p className="text-rose-400 mt-0.5">⚠️ {item.failedCount} kontak gagal/bounce</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </td>

                      {/* 6. Open Rate with Visual Bar */}
                      <td className="py-3.5 px-3">
                        {item.openRate !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-xs">
                              {item.openRate}%
                            </span>
                            <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(item.openRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Tombol Preview */}
                          <button
                            type="button"
                            title="Pratinjau Pesan"
                            onClick={() => handleOpenPreview(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Tombol Duplikat Cepat */}
                          <button
                            type="button"
                            title="Duplikat Kampanye"
                            onClick={() => handleDuplicate(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu Lengkap */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem
                                onClick={() => handleOpenPreview(item)}
                                className="text-xs cursor-pointer font-medium"
                              >
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                <span>Buka Pratinjau Detail</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(item)}
                                className="text-xs cursor-pointer font-medium"
                              >
                                <Copy className="mr-2 h-4 w-4 text-slate-500" />
                                <span>Duplikat Kampanye</span>
                              </DropdownMenuItem>
                              {item.failedCount > 0 && (
                                <DropdownMenuItem
                                  onClick={() => handleRetryFailed(item)}
                                  className="text-xs cursor-pointer font-medium text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  <span>Retry {item.failedCount} Kontak Gagal</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(item.id, item.name)}
                                className="text-xs cursor-pointer font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus Kampanye</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredCampaigns.length}</strong> dari{" "}
            <strong className="text-slate-800">{campaigns.length}</strong> kampanye
          </span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
              Sebelumnya
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* 5. SLIDE-OVER DRAWER: QUICK PREVIEW PESAN & DETAIL KAMPANYE */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl">
          {previewCampaign && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {previewCampaign.channel === "Email" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                  )}
                  {previewCampaign.channel === "WhatsApp" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <MessageSquare className="h-3 w-3" /> WhatsApp
                    </span>
                  )}
                  {previewCampaign.channel === "Telegram" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                      <Send className="h-3 w-3" /> Telegram
                    </span>
                  )}
                  <span className="text-xs text-slate-400">• {previewCampaign.date}</span>
                </div>
                <SheetTitle className="text-lg mt-1">{previewCampaign.name}</SheetTitle>
                <SheetDescription>
                  Target Audiens: <strong className="text-slate-700">{previewCampaign.audience}</strong> ({previewCampaign.audienceCount.toLocaleString()} kontak)
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Body */}
              <div className="space-y-5 py-4">
                {/* Delivery Health Card */}
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Performa Pengiriman</span>
                    <span className="font-mono text-slate-500">
                      {previewCampaign.sentCount} / {previewCampaign.audienceCount}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(previewCampaign.sentCount / previewCampaign.audienceCount) * 100}%`,
                      }}
                    />
                    {previewCampaign.failedCount > 0 && (
                      <div
                        className="h-full bg-rose-500"
                        style={{
                          width: `${(previewCampaign.failedCount / previewCampaign.audienceCount) * 100}%`,
                        }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Tersampaikan</p>
                      <p className="text-sm font-bold text-emerald-600">{previewCampaign.sentCount}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Gagal / Bounce</p>
                      <p className="text-sm font-bold text-rose-600">{previewCampaign.failedCount}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Open Rate</p>
                      <p className="text-sm font-bold text-slate-900">
                        {previewCampaign.openRate ? `${previewCampaign.openRate}%` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Message Simulator Preview */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    Pratinjau Pesan yang Dikirim
                  </h4>

                  {previewCampaign.channel === "WhatsApp" && (
                    <div className="rounded-2xl bg-[#efeae2] p-4 border border-slate-300 shadow-inner font-sans">
                      <div className="max-w-sm rounded-2xl rounded-tl-xs bg-[#d9fdd3] p-3 shadow-xs text-slate-900 text-xs leading-relaxed whitespace-pre-line relative">
                        {previewCampaign.messageContent}
                        <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                          <span>10:30 WIB</span>
                          <CheckCircle2 className="h-3 w-3 text-sky-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {previewCampaign.channel === "Telegram" && (
                    <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 shadow-inner">
                      <div className="max-w-sm rounded-2xl rounded-bl-xs bg-slate-800 p-3 shadow-xs text-slate-100 text-xs leading-relaxed whitespace-pre-line">
                        {previewCampaign.messageContent}
                        <span className="text-[10px] text-slate-400 block text-right mt-1">10:30</span>
                      </div>
                    </div>
                  )}

                  {previewCampaign.channel === "Email" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
                      <div className="border-b border-slate-100 pb-2 text-xs">
                        <span className="text-slate-400">Subjek: </span>
                        <span className="font-semibold text-slate-800">{previewCampaign.subject}</span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                        {previewCampaign.messageContent}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <SheetFooter className="gap-2">
                {previewCampaign.failedCount > 0 && (
                  <button
                    onClick={() => handleRetryFailed(previewCampaign)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-3.5 py-2 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Kirim Ulang ke {previewCampaign.failedCount} Gagal</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDuplicate(previewCampaign);
                    setDrawerOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 shadow-2xs transition cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplikat Kampanye</span>
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 6. MODAL WIZARD: BUAT KAMPANYE BARU */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Buat Kampanye Baru</DialogTitle>
            <DialogDescription>
              Tentukan saluran pengiriman, nama kampanye, dan pesan yang ingin Anda kirimkan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-4 pt-2">
            {/* Nama Kampanye */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Nama Kampanye</label>
              <input
                type="text"
                placeholder="Contoh: Promo Gajian Akhir Bulan"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                required
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Pilihan Saluran */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Pilih Saluran</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewCampaignChannel("WhatsApp")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    newCampaignChannel === "WhatsApp"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewCampaignChannel("Email")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    newCampaignChannel === "Email"
                      ? "border-blue-500 bg-blue-50/60 text-blue-800 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email SMTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewCampaignChannel("Telegram")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    newCampaignChannel === "Telegram"
                      ? "border-sky-500 bg-sky-50/60 text-sky-800 ring-1 ring-sky-500"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Send className="h-4 w-4 text-sky-600" />
                  <span>Telegram Bot</span>
                </button>
              </div>
            </div>

            {/* Target Audiens */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Target Audiens</label>
              <select
                value={newCampaignAudience}
                onChange={(e) => setNewCampaignAudience(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none focus:border-sky-500"
              >
                <option value="Pelanggan VIP">Pelanggan VIP (1,240 kontak)</option>
                <option value="All Subscribers">All Subscribers (3,420 kontak)</option>
                <option value="Newsletter List">Newsletter List (5,800 kontak)</option>
                <option value="Inactive 90d">Inactive 90d (450 kontak)</option>
              </select>
            </div>

            {/* Konten Pesan */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Isi Pesan / Template</label>
                <span className="text-[10px] text-slate-400 font-mono">Variabel: {`{{nama}}`}</span>
              </div>
              <textarea
                rows={4}
                placeholder="Tulis pesan kampanye di sini... Contoh: Halo {{nama}}, nikmati diskon spesial hari ini!"
                value={newCampaignMessage}
                onChange={(e) => setNewCampaignMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs shadow-sky-600/20 transition cursor-pointer"
              >
                Simpan sebagai Draft
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
