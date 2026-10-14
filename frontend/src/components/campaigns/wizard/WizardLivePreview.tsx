import React from "react";
import {
  MessageSquare,
  Send,
  Video,
  Phone,
  MoreVertical,
  CheckCircle2,
  CheckCheck,
  Smile,
  Paperclip,
} from "lucide-react";
import type { DeliveryChannel } from "@/types/campaignWizard";
import { evaluateMergeTags } from "@/data/mergeTags";
import { getEmailTheme } from "@/data/emailThemes";

interface WizardLivePreviewProps {
  activeChannel: DeliveryChannel;
  emailContent: string;
  emailSubject: string;
  waContent: string;
  telegramContent: string;
  emailBrandName: string;
  emailHeaderStyle: "clean" | "banner" | "minimal";
  emailCtaEnabled: boolean;
  emailCtaText: string;
  emailCtaUrl: string;
  emailCtaColor: string;
  emailThemeId: string;
}

export const renderFormattedPreview = (rawText: string, channel: DeliveryChannel = "Email") => {
  if (!rawText || !rawText.trim()) return null;

  const processed = evaluateMergeTags(rawText);
  const isHtml = /<[a-z][\s\S]*>/i.test(processed);

  if (isHtml) {
    if (channel === "WhatsApp") {
      return (
        <div
          className="text-xs text-[#111b21] leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-600 [&_blockquote]:pl-2 [&_blockquote]:italic [&_a]:text-[#027eb5] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (channel === "Telegram") {
      return (
        <div
          className="text-xs text-slate-900 leading-relaxed [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-sky-500 [&_blockquote]:pl-2 [&_blockquote]:italic [&_a]:text-[#1d90e6] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    return (
      <div
        className="text-xs text-slate-800 leading-relaxed [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-1 [&_strong]:font-bold [&_strong]:text-slate-900 [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:bg-slate-50/70 [&_blockquote]:py-1 [&_blockquote]:rounded-r [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_a]:text-sky-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5"
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  }

  const lines = processed.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        if (line.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-0.5">
              {line.replace("# ", "")}
            </h2>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-xs font-bold text-slate-800 mt-1.5 mb-0.5">
              {line.replace("## ", "")}
            </h3>
          );
        }

        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
        const bulletText = isBullet ? line.replace(/^[•\-]\s*/, "") : line;

        const parseInline = (text: string) => {
          const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_|<u>.*?<\/u>|`.*?`|https?:\/\/[^\s]+)/g;
          const parts = text.split(regex);

          return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
              return (
                <strong key={i} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return (
                <strong key={i} className="font-bold text-slate-900">
                  {part.slice(1, -1)}
                </strong>
              );
            }
            if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
              return (
                <em key={i} className="italic">
                  {part.slice(1, -1)}
                </em>
              );
            }
            if (part.startsWith("<u>") && part.endsWith("</u>") && part.length > 7) {
              return (
                <span key={i} className="underline">
                  {part.slice(3, -4)}
                </span>
              );
            }
            if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
              return (
                <code key={i} className="bg-black/5 px-1 py-0.2 rounded font-mono text-[11px]">
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.startsWith("http://") || part.startsWith("https://")) {
              return (
                <span key={i} className="text-[#0284c7] underline font-medium break-all">
                  {part}
                </span>
              );
            }
            return part;
          });
        };

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <div className="flex-1">{parseInline(bulletText)}</div>
            </div>
          );
        }

        if (line.trim() === "---") {
          return <hr key={idx} className="my-2 border-slate-200" />;
        }

        return <div key={idx}>{parseInline(line)}</div>;
      })}
    </div>
  );
};

export const WizardLivePreview: React.FC<WizardLivePreviewProps> = ({
  activeChannel,
  emailContent,
  emailSubject,
  waContent,
  telegramContent,
  emailBrandName,
  emailHeaderStyle,
  emailCtaEnabled,
  emailCtaText,
  emailCtaUrl,
  emailCtaColor,
  emailThemeId,
}) => {
  const ctaBgClass =
    emailCtaColor === "emerald"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : emailCtaColor === "rose"
      ? "bg-rose-600 hover:bg-rose-700"
      : emailCtaColor === "amber"
      ? "bg-amber-600 hover:bg-amber-700"
      : emailCtaColor === "slate"
      ? "bg-slate-900 hover:bg-black"
      : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <div>
      {/* 1. GMAIL / EMAIL SIMULATOR */}
      {activeChannel === "Email" && (
        <div className="rounded-2xl border border-slate-200/90 bg-[#f6f8fc] shadow-sm overflow-hidden flex flex-col h-[520px]">
          {/* Gmail Header */}
          <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 font-bold">
                Google Gmail Web Client
              </span>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 font-mono">
              Inbox
            </span>
          </div>

          {/* Email Subject Line & Sender Info */}
          <div className="bg-white px-5 py-3 border-b border-slate-100 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
              {emailSubject || "Your monthly update is here ✉️"}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">Acme Official</span>
                    <span className="text-[11px] text-slate-400">&lt;promo@acmecorp.co&gt;</span>
                  </div>
                  <span className="text-[10px] text-slate-400">to John Doe (you)</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">10:30 WIB</span>
            </div>
          </div>

          {/* Email Content Body */}
          {(() => {
            const theme = getEmailTheme(emailThemeId);
            const cfg = theme.config;
            return (
              <div
                className="p-4 flex-1 overflow-y-auto"
                style={{ background: cfg.outerBg }}
              >
                <div
                  className="max-w-[460px] mx-auto overflow-hidden text-xs"
                  style={{
                    background: cfg.cardBg,
                    borderRadius: cfg.cardRadius,
                    boxShadow: cfg.cardShadow,
                  }}
                >
                  {/* Header Style Banner / Clean */}
                  {emailHeaderStyle !== "minimal" && (
                    <div
                      style={{
                        background: cfg.headerBg,
                        padding: cfg.headerPadding,
                        borderBottom: cfg.headerBorderBottom,
                      }}
                    >
                      <span
                        style={{
                          color: cfg.logoText,
                          fontSize: cfg.logoFontSize,
                          fontWeight: cfg.logoFontWeight,
                          letterSpacing: cfg.logoLetterSpacing,
                          display: "block",
                        }}
                      >
                        {emailBrandName || "ACME CORP"}
                      </span>
                      {cfg.dividerColor && cfg.dividerColor !== "transparent" && (
                        <div style={{ height: "1px", background: cfg.dividerColor, marginTop: "10px" }} />
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div
                    style={{
                      background: cfg.bodyBg,
                      color: cfg.bodyFg,
                      padding: cfg.bodyPadding,
                      fontSize: cfg.bodyFontSize,
                      lineHeight: cfg.bodyLineHeight,
                    }}
                  >
                    <div className="space-y-3">
                      {renderFormattedPreview(emailContent, "Email") || (
                        <span style={{ color: cfg.bodyFg, opacity: 0.4, fontStyle: "italic" }}>
                          Tulis isi email di sebelah kiri untuk melihat pratinjau di sini...
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    {emailCtaEnabled && emailCtaText && (
                      <div style={{ paddingTop: "16px", textAlign: "center" }}>
                        <a
                          href={emailCtaUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-block font-bold text-xs text-white shadow-sm transition hover:opacity-90 active:scale-95 ${ctaBgClass}`}
                          style={{
                            background: cfg.ctaBg !== "#4f46e5" ? cfg.ctaBg : undefined,
                            color: cfg.ctaFg,
                            borderRadius: cfg.ctaRadius,
                            padding: cfg.ctaPadding,
                            display: "inline-block",
                            textDecoration: "none",
                          }}
                        >
                          {evaluateMergeTags(emailCtaText)}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      background: cfg.footerBg,
                      color: cfg.footerFg,
                      padding: cfg.footerPadding,
                      borderTop: cfg.footerBorderTop,
                      fontSize: cfg.footerFontSize,
                      lineHeight: "1.6",
                    }}
                  >
                    <p style={{ margin: "0 0 4px" }}>
                      Anda menerima email ini karena terdaftar sebagai pelanggan kami di {emailBrandName || "Acme Corp"}.
                    </p>
                    <p style={{ margin: 0 }}>
                      <a
                        href="https://acmecorp.co/unsubscribe"
                        style={{ color: cfg.footerFg, opacity: 0.8, textDecoration: "underline" }}
                      >
                        Berhenti berlangganan (Unsubscribe)
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. WHATSAPP WEB / MOBILE SIMULATOR */}
      {activeChannel === "WhatsApp" && (
        <div className="rounded-2xl border border-slate-300 bg-[#efeae2] shadow-sm overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-700 border border-emerald-400/40 text-white font-bold text-xs flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs">Acme Official Blast</span>
                  <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-400 text-[#075e54]" />
                </div>
                <span className="text-[10px] text-emerald-200 block">online</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white">
              <Video className="h-4 w-4 cursor-pointer" />
              <Phone className="h-4 w-4 cursor-pointer" />
              <MoreVertical className="h-4 w-4 cursor-pointer" />
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-between"
            style={{
              backgroundColor: "#efeae2",
              backgroundImage: "radial-gradient(#d3c9b8 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <div className="flex justify-center">
              <span className="rounded-lg bg-white/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
                HARI INI
              </span>
            </div>

            {/* Bubble */}
            <div className="max-w-[88%] self-end rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-3.5 shadow-xs text-slate-900 text-xs leading-relaxed">
              <div>
                {renderFormattedPreview(waContent, "WhatsApp") || (
                  <span className="text-slate-400 italic">
                    Pesan WhatsApp masih kosong...
                  </span>
                )}
              </div>

              <div className="text-[10px] text-slate-500 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                <span>11:42</span>
                <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb] stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Bottom input */}
          <div className="bg-[#f0f2f5] p-2 border-t border-slate-200 flex items-center gap-2">
            <Smile className="h-5 w-5 text-slate-500 cursor-pointer" />
            <Paperclip className="h-5 w-5 text-slate-500 cursor-pointer" />
            <div className="flex-1 bg-white h-8 rounded-lg border border-slate-200 px-3 flex items-center text-xs text-slate-400">
              Ketik pesan...
            </div>
          </div>
        </div>
      )}

      {/* 3. TELEGRAM SIMULATOR */}
      {activeChannel === "Telegram" && (
        <div className="rounded-2xl border border-slate-800 bg-[#17212b] shadow-sm overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-[#242f3d] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-xs block">Acme Official Bot</span>
                <span className="text-[10px] text-sky-400 block">bot</span>
              </div>
            </div>
            <MoreVertical className="h-4 w-4 text-slate-400 cursor-pointer" />
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-end bg-[#0e1621]">
            <div className="max-w-[88%] self-start rounded-2xl rounded-bl-xs bg-[#182533] p-3.5 shadow-xs text-slate-100 text-xs leading-relaxed border border-slate-800">
              <div className="text-sky-400 font-bold text-[11px] mb-1">
                Acme Broadcast
              </div>
              <div>
                {renderFormattedPreview(telegramContent, "Telegram") || (
                  <span className="text-slate-500 italic">
                    Pesan Telegram masih kosong...
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
                11:42
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
