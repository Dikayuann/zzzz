import React from "react";
import { MousePointerClick } from "lucide-react";

export const CTA_COLORS = [
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Amber", hex: "#D97706" },
  { name: "Slate", hex: "#0F172A" },
];

export interface CtaBlockEditorProps {
  enableCta?: boolean;
  onEnableCtaChange?: (val: boolean) => void;
  ctaText?: string;
  onCtaTextChange?: (val: string) => void;
  ctaUrl?: string;
  onCtaUrlChange?: (val: string) => void;
  ctaColor?: string;
  onCtaColorChange?: (val: string) => void;
}

export const CtaBlockEditor: React.FC<CtaBlockEditorProps> = ({
  enableCta = false,
  onEnableCtaChange,
  ctaText = "Klaim Voucher Sekarang",
  onCtaTextChange,
  ctaUrl = "https://domainanda.com/promo",
  onCtaUrlChange,
  ctaColor = "#4F46E5",
  onCtaColorChange,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MousePointerClick className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Tombol CTA Otomatis (Call to Action)
            </h4>
            <p className="text-[11px] text-slate-400">
              Sematkan tombol aksi utama tanpa perlu menulis kode HTML
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableCta}
            onChange={(e) => onEnableCtaChange?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {enableCta && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 animate-in fade-in-50 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Teks Tombol
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => onCtaTextChange?.(e.target.value)}
              placeholder="Contoh: Belanja Sekarang"
              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Tautan Tujuan (URL)
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => onCtaUrlChange?.(e.target.value)}
              placeholder="https://domainanda.com/promo"
              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-500">
              Warna Tombol:
            </span>
            <div className="flex items-center gap-1.5">
              {CTA_COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => onCtaColorChange?.(col.hex)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-5 h-5 rounded-full transition cursor-pointer ${
                    ctaColor === col.hex
                      ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
