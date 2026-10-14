import React, { type RefObject } from "react";
import { Image as ImageIcon, X, Upload, Trash2, Check } from "lucide-react";

export interface ActiveImageData {
  element: HTMLImageElement | null;
  src: string;
  alt: string;
  width: string;
  align: "left" | "center" | "right";
  originalHtml?: string;
}

interface FloatingImageEditorProps {
  activeImageData: ActiveImageData;
  imageSrcInput: string;
  imageAltInput: string;
  imageWidthInput: string;
  imageAlignInput: "left" | "center" | "right";
  enableLogo?: boolean;
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: "left" | "center" | "right";
  imageUploadInputRef: RefObject<HTMLInputElement | null>;
  onApplyLiveUpdate: (updates: {
    src?: string;
    width?: string;
    align?: "left" | "center" | "right";
    alt?: string;
  }) => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onApply: () => void;
  onRemove: () => void;
}

export const FloatingImageEditor: React.FC<FloatingImageEditorProps> = ({
  imageSrcInput,
  imageAltInput,
  imageWidthInput,
  imageAlignInput,
  enableLogo,
  logoUrl,
  logoWidth,
  logoAlign,
  imageUploadInputRef,
  onApplyLiveUpdate,
  onUploadImage,
  onCancel,
  onApply,
  onRemove,
}) => {
  return (
    <div className="bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 p-3.5 mx-3 my-2 animate-in fade-in duration-150 z-30 space-y-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
            <ImageIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-slate-900 shrink-0">
            Pengaturan & Custom Gambar
          </span>
          <span className="text-[11px] text-slate-500 truncate max-w-[200px] bg-slate-100 px-2 py-0.5 rounded font-mono">
            {imageWidthInput || "auto"}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pratinjau Langsung
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer shrink-0"
          title="Tutup & Batalkan (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Section 1: Image URL & Upload from PC */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <label className="font-semibold text-slate-700">Sumber Gambar (URL / File)</label>
          {enableLogo && logoUrl && (
            <button
              type="button"
              onClick={() => {
                onApplyLiveUpdate({
                  src: logoUrl,
                  width: `${logoWidth || 140}px`,
                  align: logoAlign || "center",
                });
              }}
              className="text-sky-600 hover:text-sky-800 font-medium transition cursor-pointer"
            >
              Gunakan Logo Brand
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={imageSrcInput}
            onChange={(e) => onApplyLiveUpdate({ src: e.target.value })}
            placeholder="https://... atau klik Unggah dari Komputer"
            className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition"
          />

          <input
            ref={imageUploadInputRef}
            type="file"
            accept="image/*"
            onChange={onUploadImage}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => imageUploadInputRef.current?.click()}
            className="h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            title="Unggah gambar dari komputer / laptop Anda"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Unggah</span>
          </button>
        </div>
      </div>

      {/* Section 2: Size Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-700">Ukuran Gambar (Lebar):</span>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-mono text-[10px]">Nilai:</span>
            <input
              type="text"
              value={imageWidthInput}
              onChange={(e) => onApplyLiveUpdate({ width: e.target.value })}
              placeholder="Contoh: 232px"
              className="w-16 h-5 px-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-800 text-center focus:bg-white focus:outline-none focus:border-slate-800"
              title="Ketik angka custom (misal: 232px atau 50%)"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: "Logo (120px)", val: "120px" },
            { label: "Kecil (180px)", val: "180px" },
            { label: "Sedang (260px)", val: "260px" },
            { label: "Banner (440px)", val: "440px" },
            { label: "Penuh (100%)", val: "100%" },
          ].map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => onApplyLiveUpdate({ width: size.val })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                imageWidthInput === size.val
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Alignment & Alt Text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 block">Posisi Gambar</label>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onApplyLiveUpdate({ align: "left" })}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                imageAlignInput === "left"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kiri
            </button>
            <button
              type="button"
              onClick={() => onApplyLiveUpdate({ align: "center" })}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                imageAlignInput === "center"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tengah
            </button>
            <button
              type="button"
              onClick={() => onApplyLiveUpdate({ align: "right" })}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                imageAlignInput === "right"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kanan
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 block">Keterangan Alt (Opsional)</label>
          <input
            type="text"
            value={imageAltInput}
            onChange={(e) => onApplyLiveUpdate({ alt: e.target.value })}
            placeholder="Contoh: Logo Perusahaan"
            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition"
          />
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onRemove}
          className="h-7 px-2.5 rounded-md hover:bg-red-50 text-red-600 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          title="Hapus gambar ini dari template"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus Gambar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
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
