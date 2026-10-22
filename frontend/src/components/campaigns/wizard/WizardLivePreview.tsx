import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Monitor,
  Smartphone,
  Wifi,
  Battery,
  ArrowLeft,
  Star,
  Trash2,
  Mic,
  Mail,
} from "lucide-react";
import type { DeliveryChannel } from "@/types/campaignWizard";
import { evaluateMergeTags } from "@/data/mergeTags";
import { compileTemplateToEmailHtml } from "@/utils/templateParser";

export interface WizardLivePreviewProps {
  activeChannel: DeliveryChannel;
  emailContent: string;
  emailSubject: string;
  waContent: string;
  telegramContent: string;
  emailBrandName?: string;
  emailHeaderStyle?: "clean" | "banner" | "minimal";
  emailCtaEnabled?: boolean;
  emailCtaText?: string;
  emailCtaUrl?: string;
  emailCtaColor?: string;
  emailThemeId?: string;
  waSenderName?: string;
  telegramBotName?: string;
  emailSenderName?: string;
  emailSenderAddress?: string;
  deviceView?: "desktop" | "mobile";
  onDeviceViewChange?: (view: "desktop" | "mobile") => void;
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
  emailHeaderStyle: _emailHeaderStyle = "clean",
  emailCtaEnabled = false,
  emailCtaText = "Klaim Penawaran ➔",
  emailCtaUrl = "",
  emailCtaColor = "indigo",
  emailThemeId: _emailThemeId = "plain",
  waSenderName,
  telegramBotName,
  emailSenderName,
  emailSenderAddress,
  deviceView: controlledDeviceView,
  onDeviceViewChange,
}) => {
  const [internalDeviceView, setInternalDeviceView] = useState<"desktop" | "mobile">("desktop");
  const deviceView = controlledDeviceView || internalDeviceView;

  const handleDeviceToggle = (view: "desktop" | "mobile") => {
    setInternalDeviceView(view);
    onDeviceViewChange?.(view);
  };

  // Dynamic names & addresses without hardcoded placeholders
  const displaySenderName =
    emailSenderName?.trim() ||
    (emailBrandName && emailBrandName !== "ACME CORP" && emailBrandName !== "Brand Resmi" ? emailBrandName : "") ||
    "Campaign Blast";

  const displaySenderEmail =
    emailSenderAddress?.trim() || "dev@zerollz.biz.id";

  const avatarInitial = (displaySenderName.trim().charAt(0) || "P").toUpperCase();

  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(500);
  const [desktopIframeHeight, setDesktopIframeHeight] = useState<number>(450);
  const [mobileIframeHeight, setMobileIframeHeight] = useState<number>(450);

  // Measure available container width responsively to auto-scale preview
  useEffect(() => {
    const el = previewViewportRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el && el.clientWidth > 0) {
        setViewportWidth(el.clientWidth);
      }
    };
    updateWidth();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setViewportWidth(entry.contentRect.width);
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [activeChannel, deviceView]);

  const desktopBaseWidth = 600;
  const desktopScale = useMemo(() => {
    const available = Math.max(260, viewportWidth - 24);
    if (available >= desktopBaseWidth) {
      return 1;
    }
    return Math.max(0.4, Number((available / desktopBaseWidth).toFixed(3)));
  }, [viewportWidth, desktopBaseWidth]);

  // Mobile scale for phone mockup (~298px available width inside 330px phone)
  const mobileScale = useMemo(() => {
    return Math.max(0.35, Number((298 / 600).toFixed(3)));
  }, []);

  const compiledEmailHtml = useMemo(() => {
    return compileTemplateToEmailHtml({
      subject: emailSubject || "",
      content: emailContent || "",
      orgName: displaySenderName,
      senderEmail: displaySenderEmail,
      enableCta: emailCtaEnabled,
      ctaText: emailCtaText,
      ctaUrl: emailCtaUrl,
      ctaColor: emailCtaColor,
    });
  }, [
    emailSubject,
    emailContent,
    displaySenderName,
    displaySenderEmail,
    emailCtaEnabled,
    emailCtaText,
    emailCtaUrl,
    emailCtaColor,
  ]);

  const measureActualEmailHeight = (doc: Document): number => {
    if (!doc || !doc.body) return 380;

    let maxBottom = 0;
    const elements = doc.body.querySelectorAll(
      "table, div, p, section, article, h1, h2, h3, h4, h5, h6, img, ul, ol, form"
    );
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (
        htmlEl.style.display === "none" ||
        htmlEl.style.visibility === "hidden" ||
        htmlEl.style.maxHeight === "0px" ||
        htmlEl.style.maxHeight === "0" ||
        htmlEl.getAttribute("aria-hidden") === "true"
      ) {
        return;
      }
      const rect = htmlEl.getBoundingClientRect();
      if (rect.height > 0) {
        const bottom = (htmlEl.offsetTop || 0) + (rect.height || htmlEl.offsetHeight || 0);
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
      }
    });

    const bodyH = doc.body.scrollHeight || doc.body.offsetHeight || 0;
    const docH = doc.documentElement?.scrollHeight || doc.documentElement?.offsetHeight || 0;
    const measured = Math.max(bodyH, docH, maxBottom + 32, 280);
    return Math.ceil(measured + 8);
  };

  const attachPreviewLinkInterceptor = (doc: Document) => {
    if (!doc || !doc.body) return;
    doc.body.addEventListener("click", (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button[data-href]");
      if (target) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  };

  useEffect(() => {
    if (activeChannel !== "Email") return;
    const targetIframe = deviceView === "desktop" ? desktopIframeRef.current : mobileIframeRef.current;
    if (!targetIframe) return;

    try {
      const doc = targetIframe.contentDocument || targetIframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(
          compiledEmailHtml ||
            "<!DOCTYPE html><html><body style='margin:0;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#94a3b8;text-align:center;font-size:13px;'>(Konten email masih kosong. Tulis isi email di sebelah kiri)</body></html>"
        );
        doc.close();

        // Prevent internal scrollbar inside iframe (avoids double scrollbar bug)
        const noScrollStyle = doc.createElement("style");
        noScrollStyle.textContent = `
          html, body {
            overflow: hidden !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        if (doc.head) {
          doc.head.appendChild(noScrollStyle);
        }

        attachPreviewLinkInterceptor(doc);

        const updateHeight = () => {
          try {
            const measured = measureActualEmailHeight(doc);
            if (deviceView === "desktop") {
              setDesktopIframeHeight(measured);
            } else {
              setMobileIframeHeight(measured);
            }
          } catch {}
        };

        updateHeight();
        setTimeout(updateHeight, 150);
        setTimeout(updateHeight, 500);

        Array.from(doc.images).forEach((img) => {
          if (!img.complete) {
            img.addEventListener("load", updateHeight, { once: true });
            img.addEventListener("error", updateHeight, { once: true });
          }
        });
      }
    } catch (err) {
      console.warn("Iframe write error:", err);
    }
  }, [compiledEmailHtml, activeChannel, deviceView]);

  return (
    <div className="space-y-3">
      {/* 1. TOP SIMULATOR CONTROL BAR: Channel Badge & Device Switcher */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            {activeChannel === "Email" && <Mail className="h-3.5 w-3.5 text-indigo-600" />}
            {activeChannel === "WhatsApp" && <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />}
            {activeChannel === "Telegram" && <Send className="h-3.5 w-3.5 text-sky-600" />}
            <span>Pratinjau Realistis</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 hidden sm:inline-block">
            {deviceView === "desktop" ? "Mode Desktop" : "Mode Smartphone (HP)"}
          </span>
        </div>

        {/* Device Switcher Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => handleDeviceToggle("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              deviceView === "desktop"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Desktop / Browser Komputer"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeviceToggle("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              deviceView === "mobile"
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Mobile / Smartphone"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* 2. DEVICE: DESKTOP VIEW */}
      {deviceView === "desktop" && (
        <div className="animate-in fade-in-50 duration-150">
          {/* A. EMAIL DESKTOP */}
          {activeChannel === "Email" && (
            <div className="rounded-2xl border border-slate-200/90 bg-[#f6f8fc] shadow-sm overflow-hidden flex flex-col h-[500px]">
              {/* Subject & Sender info */}
              <div className="bg-white px-5 py-3 border-b border-slate-100 space-y-2">
                <div className="min-h-[22px]">
                  {emailSubject?.trim() ? (
                    <h3 className="font-bold text-sm text-slate-900 leading-snug break-words">
                      {emailSubject}
                    </h3>
                  ) : (
                    <span className="text-slate-400 italic text-xs font-normal">
                      (Subjek belum diisi)
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {avatarInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{displaySenderName}</span>
                        <span className="text-[11px] text-slate-400">&lt;{displaySenderEmail}&gt;</span>
                      </div>
                      <span className="text-[10px] text-slate-400">to Anda (Pelanggan)</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">10:30 WIB</span>
                </div>
              </div>

              {/* Scrollable Email Body with Fluid Auto-Scaling Preview */}
              <div
                ref={previewViewportRef}
                className="p-3 bg-[#f6f8fc] flex-1 overflow-y-auto overflow-x-hidden flex justify-center items-start"
              >
                  <div
                    style={{
                      width: `${Math.round(desktopBaseWidth * desktopScale)}px`,
                      height: `${Math.round(desktopIframeHeight * desktopScale)}px`,
                      position: "relative",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                    className="rounded-xl overflow-hidden"
                  >
                    <iframe
                      ref={desktopIframeRef}
                      title="Email Desktop Preview"
                      srcDoc={compiledEmailHtml}
                      sandbox="allow-same-origin"
                      scrolling="no"
                      style={{
                        width: `${desktopBaseWidth}px`,
                        height: `${desktopIframeHeight}px`,
                        transform: `scale(${desktopScale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        overflow: "hidden",
                      }}
                      className="border-0 bg-transparent overflow-hidden"
                    />
                  </div>
              </div>
            </div>
          )}

          {/* B. WHATSAPP DESKTOP */}
          {activeChannel === "WhatsApp" && (
            <div className="rounded-2xl border border-slate-300 bg-[#efeae2] shadow-sm overflow-hidden flex flex-col h-[490px]">
              {/* Header */}
              <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-700 border border-emerald-400/40 text-white font-bold text-xs flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs">{waSenderName || "WhatsApp Official"}</span>
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
              <div className="bg-[#f0f2f5] p-2.5 border-t border-slate-200 flex items-center gap-2">
                <Smile className="h-5 w-5 text-slate-500 cursor-pointer" />
                <Paperclip className="h-5 w-5 text-slate-500 cursor-pointer" />
                <div className="flex-1 bg-white h-8 rounded-lg border border-slate-200 px-3 flex items-center text-xs text-slate-400">
                  Ketik pesan...
                </div>
                <div className="h-8 w-8 rounded-full bg-[#00a884] text-white flex items-center justify-center cursor-pointer">
                  <Mic className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* C. TELEGRAM DESKTOP */}
          {activeChannel === "Telegram" && (
            <div className="rounded-2xl border border-slate-800 bg-[#17212b] shadow-sm overflow-hidden flex flex-col h-[490px]">
              {/* Header */}
              <div className="bg-[#242f3d] text-white px-4 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{telegramBotName || "Official Telegram Bot"}</span>
                    <span className="text-[10px] text-sky-400 block">bot</span>
                  </div>
                </div>
                <MoreVertical className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>

              {/* Body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-end bg-[#0e1621]">
                <div className="max-w-[88%] self-start rounded-2xl rounded-bl-xs bg-[#182533] p-3.5 shadow-xs text-slate-100 text-xs leading-relaxed border border-slate-800">
                  <div className="text-sky-400 font-bold text-[11px] mb-1">
                    {telegramBotName || "Notifikasi Resmi"}
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
      )}

      {/* 3. DEVICE: MOBILE SMARTPHONE MOCKUP */}
      {deviceView === "mobile" && (
        <div className="flex justify-center items-center py-1 animate-in zoom-in-95 duration-200">
          <div className="w-[330px] rounded-[42px] border-[8px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col relative select-none">
            {/* Dynamic Island / Speaker Pill */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-end pr-2.5">
              <div className="h-2 w-2 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* A. MOBILE EMAIL VIEW */}
            {activeChannel === "Email" && (
              <div className="flex flex-col bg-white h-[510px]">
                {/* Phone Status Bar */}
                <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 font-mono z-20">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Mobile Gmail App Bar */}
                <div className="bg-white border-b border-slate-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                    <span className="font-bold text-xs text-slate-800">Kotak Masuk</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Star className="h-3.5 w-3.5" />
                    <Trash2 className="h-3.5 w-3.5" />
                    <MoreVertical className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Mobile Email Subject & Sender */}
                <div className="bg-white px-4 py-2 border-b border-slate-100 space-y-1.5">
                  <div className="min-h-[18px]">
                    {emailSubject?.trim() ? (
                      <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {emailSubject}
                      </h3>
                    ) : (
                      <span className="text-slate-400 italic text-[11px] font-normal">
                        (Subjek belum diisi)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {avatarInitial}
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-[11px] truncate max-w-[130px]">
                            {displaySenderName}
                          </span>
                          <span className="text-[10px] text-slate-400">10:30</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <span>kepada saya</span>
                          <span className="text-[9px] text-slate-400">▾</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Scrollable Email Body with Fluid Auto-Scaling Preview */}
                <div className="p-2 flex-1 overflow-y-auto overflow-x-hidden bg-[#f6f8fc] flex justify-center items-start">
                  <div
                    style={{
                      width: `${Math.round(600 * mobileScale)}px`,
                      height: `${Math.round(mobileIframeHeight * mobileScale)}px`,
                      position: "relative",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                    className="rounded-lg overflow-hidden"
                  >
                    <iframe
                      ref={mobileIframeRef}
                      title="Email Mobile Preview"
                      srcDoc={compiledEmailHtml}
                      sandbox="allow-same-origin"
                      scrolling="no"
                      style={{
                        width: "600px",
                        height: `${mobileIframeHeight}px`,
                        transform: `scale(${mobileScale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        overflow: "hidden",
                      }}
                      className="border-0 bg-transparent overflow-hidden"
                    />
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="bg-white py-1.5 flex justify-center">
                  <div className="w-24 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            )}

            {/* B. MOBILE WHATSAPP VIEW */}
            {activeChannel === "WhatsApp" && (
              <div className="flex flex-col bg-[#efeae2] h-[510px]">
                {/* Status bar */}
                <div className="bg-[#054c44] px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-emerald-100 font-mono z-20">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-emerald-200">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* WhatsApp Mobile Top Bar */}
                <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 cursor-pointer" />
                    <div className="h-7 w-7 rounded-full bg-emerald-700 border border-emerald-400/40 text-white font-bold text-xs flex items-center justify-center">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs truncate max-w-[130px]">{waSenderName || "WhatsApp Official"}</span>
                        <CheckCircle2 className="h-3 w-3 fill-emerald-400 text-[#075e54]" />
                      </div>
                      <span className="text-[9px] text-emerald-200 block">online</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-white">
                    <Video className="h-3.5 w-3.5" />
                    <Phone className="h-3.5 w-3.5" />
                    <MoreVertical className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Chat area */}
                <div
                  className="p-3 flex-1 overflow-y-auto space-y-2.5 flex flex-col justify-between"
                  style={{
                    backgroundColor: "#efeae2",
                    backgroundImage: "radial-gradient(#d3c9b8 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <div className="flex justify-center">
                    <span className="rounded-md bg-white/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-semibold text-slate-600 shadow-2xs">
                      HARI INI
                    </span>
                  </div>

                  {/* Bubble */}
                  <div className="max-w-[90%] self-end rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-3 shadow-xs text-slate-900 text-xs leading-relaxed">
                    <div>
                      {renderFormattedPreview(waContent, "WhatsApp") || (
                        <span className="text-slate-400 italic text-[11px]">
                          Pesan WhatsApp masih kosong...
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 text-right mt-1 flex items-center justify-end gap-1 font-mono">
                      <span>09:41</span>
                      <CheckCheck className="h-3 w-3 text-[#53bdeb] stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom input */}
                <div className="bg-[#f0f2f5] p-2 border-t border-slate-200 flex items-center gap-1.5">
                  <Smile className="h-4 w-4 text-slate-500" />
                  <div className="flex-1 bg-white h-7 rounded-full border border-slate-200 px-3 flex items-center text-[11px] text-slate-400">
                    Ketik pesan...
                  </div>
                  <Paperclip className="h-4 w-4 text-slate-500" />
                  <div className="h-7 w-7 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Home bar */}
                <div className="bg-[#f0f2f5] py-1.5 flex justify-center">
                  <div className="w-24 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            )}

            {/* C. MOBILE TELEGRAM VIEW */}
            {activeChannel === "Telegram" && (
              <div className="flex flex-col bg-[#0e1621] h-[510px]">
                {/* Status bar */}
                <div className="bg-[#17212b] px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-300 font-mono z-20">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Telegram Mobile Header */}
                <div className="bg-[#242f3d] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <div className="h-7 w-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                      <Send className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block truncate max-w-[140px]">
                        {telegramBotName || "Official Telegram Bot"}
                      </span>
                      <span className="text-[9px] text-sky-400 block">bot</span>
                    </div>
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </div>

                {/* Chat area */}
                <div className="p-3 flex-1 overflow-y-auto space-y-2.5 flex flex-col justify-end bg-[#0e1621]">
                  <div className="max-w-[90%] self-start rounded-2xl rounded-bl-xs bg-[#182533] p-3 shadow-xs text-slate-100 text-xs leading-relaxed border border-slate-800">
                    <div className="text-sky-400 font-bold text-[10px] mb-1">
                      {telegramBotName || "Notifikasi Resmi"}
                    </div>
                    <div>
                      {renderFormattedPreview(telegramContent, "Telegram") || (
                        <span className="text-slate-500 italic text-[11px]">
                          Pesan Telegram masih kosong...
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 block text-right mt-1 font-mono">
                      09:41
                    </span>
                  </div>
                </div>

                {/* Bottom input */}
                <div className="bg-[#17212b] p-2 border-t border-slate-800 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4 text-slate-400" />
                  <div className="flex-1 bg-[#242f3d] h-7 rounded-full px-3 flex items-center text-[11px] text-slate-400">
                    Pesan...
                  </div>
                  <div className="h-7 w-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                    <Send className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Home bar */}
                <div className="bg-[#17212b] py-1.5 flex justify-center">
                  <div className="w-24 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
