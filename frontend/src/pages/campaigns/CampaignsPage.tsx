import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { CampaignItem, CampaignChannel } from "@/types/campaign";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  CampaignTable,
  CampaignDetailSheet,
  CreateCampaignQuickModal,
  CampaignOperationsStrip,
  CampaignFilterBar,
} from "@/components/campaigns";

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();

   const {
    campaigns,
    setCampaigns,
    isLoading,
    errorMessage,
    fetchCampaigns,
    deleteCampaign,
    sendCampaignNow,
  } = useCampaigns();
   const [selectedTab, setSelectedTab] = useState<string>("All");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<CampaignItem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [activeDraft, setActiveDraft] = useState<any | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("campaign_blast_draft_v1");
      if (saved) {
        setActiveDraft(JSON.parse(saved));
      }
    } catch {
      // Ignore JSON parse error
    }
  }, []);

  const handleOpenPreview = (item: CampaignItem) => {
    setPreviewCampaign(item);
    setDrawerOpen(true);
  };

  const handleDuplicate = (item: CampaignItem) => {
    const duplicated: CampaignItem = {
      ...item,
      id: `cmp-${Date.now()}`,
      name: `${item.name} (Salinan)`,
      status: "Draft",
      date: "Hari ini",
      sentCount: 0,
      failedCount: 0,
      openRate: null,
      clickRate: null,
    };
    setCampaigns((prev) => [duplicated, ...prev]);
    toast.success(`Kampanye "${item.name}" berhasil diduplikasi sebagai draf.`);
  };

  const handleRetryFailed = (item: CampaignItem) => {
    toast.loading(`Mempersiapkan pengiriman ulang ke ${item.failedCount} kontak...`, {
      duration: 1800,
    });
    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                sentCount: c.sentCount + c.failedCount,
                failedCount: 0,
                status: "Sent",
              }
            : c
        )
      );
      toast.success(`Berhasil mengirim ulang ke semua kontak gagal.`);
      setDrawerOpen(false);
    }, 1800);
  };

  const handleDelete = (id: string, name: string) => {
    deleteCampaign(id, name);
  };

  const handleCreateDraft = (
    name: string,
    channel: CampaignChannel,
    audience: string,
    message: string
  ) => {
    const newDraft: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name,
      channel,
      status: "Draft",
      audience,
      audienceCount: 1240,
      sentCount: 0,
      failedCount: 0,
      openRate: null,
      clickRate: null,
      date: "Hari ini",
      messageContent: message,
    };
    setCampaigns((prev) => [newDraft, ...prev]);
    toast.success(`Draf kampanye "${name}" berhasil dibuat.`);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (selectedChannel !== "All" && c.channel !== selectedChannel) return false;
      if (selectedTab === "Attention") {
        if (c.status !== "Failed" && (!c.failedCount || c.failedCount === 0)) return false;
      } else if (selectedTab !== "All" && c.status !== selectedTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.audience.toLowerCase().includes(q) ||
          c.channel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [campaigns, selectedChannel, selectedTab, searchQuery]);

  const activeSending = campaigns.find((c) => c.status === "Sending");

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Kampanye Broadcast</h1>
          <p className="text-xs text-slate-500 mt-1">
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

      {/* 2. Live Operations Strip & Draft Banner */}
      <CampaignOperationsStrip
        activeSending={activeSending}
        activeDraft={activeDraft}
        onClearDraft={() => {
          localStorage.removeItem("campaign_blast_draft_v1");
          setActiveDraft(null);
          toast.info("Draf kampanye lokal telah dibuang.");
        }}
        onContinueDraft={() => navigate("/campaigns/new")}
      />

      {/* 3. Controls & Filter Bar */}
      <CampaignFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        totalCampaignsCount={campaigns.length}
      />

       {/* 4. Main Campaign Table (Handling 3 State: Loading, Error, Success) */}
      {isLoading ? (
        // A. KONDISI LOADING
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs space-y-3">
          <RefreshCw className="h-6 w-6 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat daftar kampanye dari database...</p>
        </div>
      ) : errorMessage ? (
        // B. KONDISI ERROR
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-2xs space-y-3">
          <AlertCircle className="h-6 w-6 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-700 font-semibold">{errorMessage}</p>
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        // C. KONDISI SUKSES / EMPTY (Ditangani langsung di dalam CampaignTable)
        <CampaignTable
          campaigns={filteredCampaigns}
          onOpenPreview={handleOpenPreview}
          onDuplicate={handleDuplicate}
          onRetryFailed={handleRetryFailed}
          onDelete={handleDelete}
          onSendNow={sendCampaignNow}
        />
      )}


      {/* 5. Slide-Over Detail Sheet */}
      <CampaignDetailSheet
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        campaign={previewCampaign}
        onRetryFailed={handleRetryFailed}
        onDuplicate={handleDuplicate}
      />

      {/* 6. Create Draft Quick Modal */}
      <CreateCampaignQuickModal
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateDraft}
      />
    </div>
  );
};

export default CampaignsPage;
