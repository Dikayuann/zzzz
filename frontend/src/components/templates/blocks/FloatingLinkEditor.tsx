import React from "react";
import { Link2, X, Globe, ExternalLink, Trash2, Check } from "lucide-react";

export interface ActiveLinkData {
  element: HTMLAnchorElement | null;
  range: Range | null;
  text: string;
  url: string;
  isExisting: boolean;
}

interface FloatingLinkEditorProps {
  activeLinkData: ActiveLinkData;
  linkUrlInput: string;
  onLinkUrlInputChange: (val: string) => void;
  onClose: () => void;
  onApply: () => void;
  onRemove: () => void;
}

export const FloatingLinkEditor: React.FC<FloatingLinkEditorProps> = ({
  activeLinkData,
  linkUrlInput,
  onLinkUrlInputChange,
  onClose,
  onApply,
  onRemove,
}) => {
  return (
    <div className="bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 p-3.5 mx-3 my-2 animate-in fade-in duration-150 z-30 space-y-3">
      {/* Top Bar: Title & Target Text & Close Button */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
            <Link2 className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-slate-900 shrink-0">
            {activeLinkData.isExisting ? "Edit Tautan URL" : "Sisipkan Tautan URL"}
          </span>
          <span className="text-[11px] text-slate-600 truncate max-w-[200px] bg-slate-100 px-2 py-0.5 rounded font-mono">
            "{activeLinkData.text}"
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer shrink-0"
          title="Tutup (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* URL Input */}
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          autoFocus
          value={linkUrlInput}
          onChange={(e) => onLinkUrlInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
            if (e.key === "Escape") onClose();
          }}
          placeholder="https://example.com/promo atau {{cta_link}}..."
          className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
        />
      </div>

      {/* Quick Merge Tag Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
        <span className="text-slate-400 font-medium text-[10px] mr-0.5">Tag Cepat:</span>
        {[
          { label: "{{cta_link}}", val: "{{cta_link}}" },
          { label: "{{web_view_link}}", val: "{{web_view_link}}" },
          { label: "{{unsubscribe_link}}", val: "{{unsubscribe_link}}" },
          { label: "Website", val: "https://acmecorp.co" },
          { label: "WhatsApp", val: "https://wa.me/6281234567890" },
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onLinkUrlInputChange(chip.val)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 font-mono text-[10px] transition cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {activeLinkData.isExisting && (
            <button
              type="button"
              onClick={onRemove}
              className="h-7 px-2.5 rounded-md hover:bg-red-50 text-red-600 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="Hapus tautan dari elemen ini"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Tautan</span>
            </button>
          )}

          {linkUrlInput && linkUrlInput.startsWith("http") && (
            <a
              href={linkUrlInput}
              target="_blank"
              rel="noreferrer"
              className="h-7 px-2.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 transition"
              title="Uji buka tautan di tab baru"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Uji Buka</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-7 px-2.5 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-7 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
