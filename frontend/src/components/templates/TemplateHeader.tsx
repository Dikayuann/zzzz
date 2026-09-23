import React, { useState } from "react";
import { Code2, Check, Edit2 } from "lucide-react";
import type { TemplateChannel } from "@/types/template";

interface TemplateHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  channel: TemplateChannel;
  onChannelChange: (channel: TemplateChannel) => void;
  onOpenMergeTags: () => void;
  onSaveTemplate: () => void;
  isSaving?: boolean;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  title,
  onTitleChange,
  channel,
  onChannelChange,
  onOpenMergeTags,
  onSaveTemplate,
  isSaving = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleCommitTitle = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
      {/* LEFT: Title, Channel Selector, Merge Tags, Save */}
      <div className="flex flex-wrap items-center gap-3">
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
              className="text-lg font-bold text-slate-900 bg-white border border-indigo-400 rounded-lg px-2.5 py-1 focus:outline-none shadow-2xs"
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
            className="group flex items-center gap-2 cursor-pointer py-1"
            title="Klik untuk ubah nama template"
          >
            <h1 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
              {title}
            </h1>
            <Edit2 className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
          </div>
        )}

        {/* Channel Selector Pills: [ Email | WhatsApp | Telegram ] */}
        <div className="inline-flex rounded-lg border border-slate-200/90 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onChannelChange("email")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              channel === "email"
                ? "bg-[#4F46E5] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => onChannelChange("whatsapp")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              channel === "whatsapp"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => onChannelChange("telegram")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              channel === "telegram"
                ? "bg-sky-500 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Telegram
          </button>
        </div>

        {/* <> Merge tags Button */}
        <button
          type="button"
          onClick={onOpenMergeTags}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95"
        >
          <Code2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Merge tags</span>
        </button>

        {/* Save Template Button */}
        <button
          type="button"
          onClick={onSaveTemplate}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-2xs transition cursor-pointer active:scale-95 disabled:opacity-60"
        >
          {isSaving ? "Menyimpan..." : "Save template"}
        </button>
      </div>
    </div>
  );
};
