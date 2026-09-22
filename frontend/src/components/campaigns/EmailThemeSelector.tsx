import React from "react";
import { Check, Sparkles, X } from "lucide-react";
import { EMAIL_THEMES, type EmailTheme } from "@/data/emailThemes";

interface EmailThemeSelectorProps {
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
  onClose: () => void;
}

export const EmailThemeSelector: React.FC<EmailThemeSelectorProps> = ({
  selectedThemeId,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pilih Tema Visual Email</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pilih template desain yang akan diterapkan ke preview email Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EMAIL_THEMES.map((theme) => {
              const isSelected = theme.id === selectedThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelect(theme.id);
                    onClose();
                  }}
                  className={`relative flex flex-col items-start text-left p-3 rounded-2xl border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Mini Email Preview */}
                  <MiniEmailPreview theme={theme} />

                  {/* Theme Info */}
                  <div className="mt-2.5 w-full">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-900 leading-tight">
                        {theme.emoji} {theme.name}
                      </span>
                      {isSelected && (
                        <span className="flex-shrink-0 h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {theme.badge}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Tema hanya mengubah tampilan preview. Konten pesan tidak berubah.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/** Mini thumbnail preview of the email theme */
const MiniEmailPreview: React.FC<{ theme: EmailTheme }> = ({ theme }) => {
  const cfg = theme.config;
  // Show a header strip whenever headerPadding is set (handles white+border headers like Brevo)
  const showHeader = cfg.headerPadding !== "0" && cfg.headerPadding !== "";
  
  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-slate-200/60"
      style={{ background: cfg.outerBg, height: "90px" }}
    >
      <div
        className="w-full"
        style={{ background: cfg.cardBg, borderRadius: `${cfg.cardRadius} ${cfg.cardRadius} 0 0` }}
      >
        {/* Header strip — works for gradient, solid, and white+border-bottom themes */}
        {showHeader && (
          <div
            style={{
              background: cfg.headerBg,
              padding: "8px 10px 7px",
              borderBottom: cfg.headerBorderBottom !== "none" ? cfg.headerBorderBottom : undefined,
            }}
          >
            {/* Logo placeholder */}
            <div
              style={{
                background: cfg.logoBg !== "transparent" && cfg.logoBg !== "" ? cfg.logoBg : undefined,
                borderRadius: cfg.logoRadius || "4px",
                padding: "2px 8px",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  color: cfg.logoText,
                  fontSize: "8px",
                  fontWeight: "800",
                  letterSpacing: "0.05em",
                  display: "block",
                }}
              >
                BRAND
              </span>
            </div>
            {cfg.taglineText && (
              <span
                style={{
                  color: cfg.taglineFg,
                  fontSize: "7px",
                  display: "block",
                  marginTop: "2px",
                  opacity: 0.8,
                }}
              >
                {cfg.taglineText}
              </span>
            )}
          </div>
        )}

        {/* Body lines */}
        <div
          style={{
            background: cfg.bodyBg,
            padding: "8px 10px",
            flex: 1,
          }}
        >
          {!showHeader && (
            <div
              style={{
                color: cfg.bodyFg,
                fontSize: "9px",
                fontWeight: "800",
                marginBottom: "4px",
                letterSpacing: "0.05em",
              }}
            >
              BRAND
            </div>
          )}
          {/* Content lines */}
          {[1, 0.7, 0.5].map((opacity, i) => (
            <div
              key={i}
              style={{
                height: "5px",
                borderRadius: "3px",
                background: cfg.bodyFg,
                opacity: opacity * 0.18,
                marginBottom: "4px",
                width: i === 0 ? "100%" : i === 1 ? "80%" : "60%",
              }}
            />
          ))}
          {/* CTA button preview */}
          <div
            style={{
              marginTop: "6px",
              height: "10px",
              width: "50%",
              borderRadius: cfg.ctaRadius || "4px",
              background: cfg.ctaBg.includes("linear-gradient") ? cfg.ctaBg : cfg.ctaBg,
              opacity: 0.85,
            }}
          />
        </div>
      </div>
    </div>
  );
};
