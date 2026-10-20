import React, { useState } from "react";
import {
  Code2,
  Check,
  Edit2,
  LayoutTemplate,
  Plus,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import type { TemplateChannel } from "@/types/template";

interface TemplateHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  channel: TemplateChannel;
  onChannelChange: (channel: TemplateChannel) => void;
  onOpenMergeTags: () => void;
  onOpenTemplatePicker: () => void;
  onNewTemplate: () => void;
  onSaveTemplate: () => void;
  onOpenTestSend?: () => void;
  isSaving?: boolean;
  hasSavedTemplate?: boolean;
  hasUnsavedChanges?: boolean;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  title,
  onTitleChange,
  channel,
  onChannelChange,
  onOpenMergeTags,
  onOpenTemplatePicker,
  onNewTemplate,
  onSaveTemplate,
  onOpenTestSend,
  isSaving = false,
  hasSavedTemplate = false,
  hasUnsavedChanges = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const effectiveChannel: TemplateChannel =
    channel === "whatsapp" || channel === "telegram" ? channel : "email";

  const handleCommitTitle = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="pb-4 border-b border-slate-200/80 space-y-3">
      {/* ROW 1: Title (Left) + Actions (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title / Inline Name Edit */}
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommitTitle();
                if (e.key === "Escape") {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              onBlur={handleCommitTitle}
              className="text-lg font-bold text-slate-900 bg-white border border-slate-400 rounded-lg px-2.5 py-1 focus:outline-none shadow-2xs"
            />
            <button
              type="button"
              onClick={handleCommitTitle}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition"
              title="Simpan Nama"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
            className="group flex items-center gap-2 cursor-pointer py-1 min-w-0"
            title="Klik untuk ubah nama template"
          >
            <h1 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition truncate">
              {title}
            </h1>
            <Edit2 className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
            {hasUnsavedChanges ? (
              <span
                className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1.5 shadow-2xs"
                title="Ada perubahan yang belum disimpan ke database"
              >
                
                <span>Belum Disimpan</span>
              </span>
            ) : hasSavedTemplate ? (
              <span
                className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                title="Template sudah tersimpan di database"
              >
                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Tersimpan</span>
              </span>
            ) : null}
          </div>
        )}

        {/* RIGHT: Action Buttons (Always neatly grouped in one horizontal row) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Template Picker Button */}
          <button
            type="button"
            onClick={onOpenTemplatePicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-400 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95 whitespace-nowrap"
            title="Buka Pustaka Template Preset & Kustom"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-slate-700" />
            <span>Pilih Template</span>
          </button>

          {/* + Buat Baru Button */}
          <button
            type="button"
            onClick={onNewTemplate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95 whitespace-nowrap"
            title="Mulai Template Bersih Baru"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Baru</span>
          </button>

          {/* <> Merge Tags Button */}
          <button
            type="button"
            onClick={onOpenMergeTags}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Code2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Merge tags</span>
          </button>

          {/* Send Test Button (Active on all channels: Email, WhatsApp, Telegram) */}
          {onOpenTestSend && (
            <button
              type="button"
              onClick={onOpenTestSend}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95 whitespace-nowrap ${
                effectiveChannel === "whatsapp"
                  ? "border-emerald-200 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-700"
                  : effectiveChannel === "telegram"
                  ? "border-sky-200 bg-sky-50/90 hover:bg-sky-100 text-sky-700"
                  : "border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700"
              }`}
              title={`Kirim ${effectiveChannel === "whatsapp" ? "WhatsApp" : effectiveChannel === "telegram" ? "Telegram" : "email"} uji coba`}
            >
              <Send className={`h-3.5 w-3.5 ${
                effectiveChannel === "whatsapp"
                  ? "text-emerald-600"
                  : effectiveChannel === "telegram"
                  ? "text-sky-600"
                  : "text-indigo-600"
              }`} />
              <span>Kirim Uji Coba</span>
            </button>
          )}

          {/* Save Template Button */}
          <button
            type="button"
            onClick={onSaveTemplate}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap ${
              hasUnsavedChanges
                ? "bg-slate-900 hover:bg-slate-800 text-white ring-2 ring-amber-400/40"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ROW 2: Channel Selector Pills */}
      <div className="flex items-center">
        <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-100/80 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onChannelChange("email")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              effectiveChannel === "email"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => onChannelChange("whatsapp")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              effectiveChannel === "whatsapp"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => onChannelChange("telegram")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              effectiveChannel === "telegram"
                ? "bg-sky-500 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            Telegram
          </button>
        </div>
      </div>
    </div>
  );
};
