import React from "react";
import { Search, ChevronDown, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampaignFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedChannel: string;
  onSelectChannel: (channel: string) => void;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  totalCampaignsCount: number;
}

export const CampaignFilterBar: React.FC<CampaignFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedChannel,
  onSelectChannel,
  selectedTab,
  onSelectTab,
  totalCampaignsCount,
}) => {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
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
            <DropdownMenuItem onClick={() => onSelectChannel("All")} className="text-xs cursor-pointer font-medium">
              Semua Saluran
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectChannel("Email")} className="text-xs cursor-pointer font-medium">
              ✉️ Email Saja
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectChannel("WhatsApp")} className="text-xs cursor-pointer font-medium">
              💬 WhatsApp Saja
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectChannel("Telegram")} className="text-xs cursor-pointer font-medium">
              ✈️ Telegram Saja
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Smart Segmented Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 w-fit">
        <button
          onClick={() => onSelectTab("All")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            selectedTab === "All"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Semua ({totalCampaignsCount})
        </button>
        <button
          onClick={() => onSelectTab("Attention")}
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
          onClick={() => onSelectTab("Sending")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            selectedTab === "Sending"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Mengirim
        </button>
        <button
          onClick={() => onSelectTab("Scheduled")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            selectedTab === "Scheduled"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Terjadwal
        </button>
        <button
          onClick={() => onSelectTab("Sent")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            selectedTab === "Sent"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Selesai
        </button>
        <button
          onClick={() => onSelectTab("Draft")}
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
  );
};
