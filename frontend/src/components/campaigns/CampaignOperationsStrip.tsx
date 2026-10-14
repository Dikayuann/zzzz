import React from "react";
import { Play, Clock, Bookmark, ArrowRight } from "lucide-react";
import type { CampaignItem } from "@/types/campaign";

interface CampaignOperationsStripProps {
  activeSending?: CampaignItem;
  activeDraft: any | null;
  onClearDraft: () => void;
  onContinueDraft: () => void;
}

export const CampaignOperationsStrip: React.FC<CampaignOperationsStripProps> = ({
  activeSending,
  activeDraft,
  onClearDraft,
  onContinueDraft,
}) => {
  return (
    <div className="space-y-4">
      {/* Live Operations Strip */}
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

      {/* Draft banner */}
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
              onClick={onClearDraft}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Hapus Draf
            </button>
            <button
              onClick={onContinueDraft}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Lanjutkan Edit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
