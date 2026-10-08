import React, { useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

export interface LogoBlockEditorProps {
  enableLogo?: boolean;
  onEnableLogoChange?: (val: boolean) => void;
  logoUrl?: string;
  onLogoUrlChange?: (val: string) => void;
  logoWidth?: number;
  onLogoWidthChange?: (val: number) => void;
  logoAlign?: "left" | "center" | "right";
  onLogoAlignChange?: (val: "left" | "center" | "right") => void;
}

export const LogoBlockEditor: React.FC<LogoBlockEditorProps> = ({
  enableLogo = false,
  onEnableLogoChange,
  logoUrl = "",
  onLogoUrlChange,
  logoWidth = 140,
  onLogoWidthChange,
  logoAlign = "center",
  onLogoAlignChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (PNG, JPG, SVG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        onLogoUrlChange?.(dataUrl);
        onEnableLogoChange?.(true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ImageIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Logo Organisasi & Brand (Custom Logo)
            </h4>
            <p className="text-[11px] text-slate-400">
              Tampilkan logo resmi brand Anda di bagian atas template email
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableLogo}
            onChange={(e) => onEnableLogoChange?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
        </label>
      </div>

      {enableLogo && (
        <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-slate-600">
                URL Gambar Logo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => onLogoUrlChange?.(e.target.value)}
                  placeholder="https://acmecorp.co/logo.png"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                {/* Upload from PC Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0"
                  title="Unggah logo dari komputer Anda"
                >
                  <Upload className="h-3 w-3" />
                  <span>Unggah</span>
                </button>
              </div>
            </div>

            {/* Logo Preview Thumbnail */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">
                Pratinjau Logo
              </span>
              <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-1 overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="max-h-8 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">
                    Belum ada logo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logo Width & Alignment Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-600">
                Lebar Logo:
              </span>
              <div className="flex items-center gap-1">
                {[100, 140, 180].map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => onLogoWidthChange?.(width)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                      logoWidth === width
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {width}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-600">
                Posisi:
              </span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => onLogoAlignChange?.("left")}
                  className={`p-1 rounded transition cursor-pointer ${
                    logoAlign === "left"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Rata Kiri"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onLogoAlignChange?.("center")}
                  className={`p-1 rounded transition cursor-pointer ${
                    logoAlign === "center"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Rata Tengah"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onLogoAlignChange?.("right")}
                  className={`p-1 rounded transition cursor-pointer ${
                    logoAlign === "right"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Rata Kanan"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
