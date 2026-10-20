import React, { useState, useRef, useEffect, useMemo } from "react";
import type {
  TemplateChannel,
  RecipientPreview,
} from "@/types/template";
import {
  interpolateMergeTags,
  SAMPLE_RECIPIENTS,
  parseWhatsAppFormatting,
  compileTemplateToEmailHtml,
} from "@/utils/templateParser";
import {
  ChevronDown,
  Monitor,
  Smartphone,
  Copy,
  Check,
  CheckCheck,
  Mail,
  SlidersHorizontal,
  ZoomIn,
  Maximize2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface TemplateLivePreviewProps {
  channel: TemplateChannel;
  subject: string;
  preheader?: string;
  content: string;
  orgName?: string;
  senderEmail?: string;
  brandColor?: string;
  recipient: RecipientPreview;
  onRecipientChange: (recipient: RecipientPreview) => void;
  // Custom Logo Props
  enableLogo?: boolean;
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: "left" | "center" | "right";
  // Mailchimp CTA Button Props
  enableCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
  // Mailchimp Social Links Props
  enableSocial?: boolean;
  websiteUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  footerAddress?: string;
  mediaUrl?: string;
}

export const TemplateLivePreview: React.FC<TemplateLivePreviewProps> = ({
  channel: rawChannel,
  subject,
  preheader,
  content,
  orgName = "Acme Corp",
  senderEmail = "hello@acmecorp.co",
  brandColor = "#4F46E5",
  recipient,
  onRecipientChange,
  enableLogo = false,
  logoUrl = "",
  logoWidth = 140,
  logoAlign = "center",
  enableCta = false,
  ctaText = "Klaim Voucher Sekarang",
  ctaUrl = "https://tokoonline.com/promo",
  ctaColor = "#4F46E5",
  enableSocial = false,
  websiteUrl = "https://acmecorp.co",
  instagramUrl = "https://instagram.com/acmecorp",
  whatsappUrl = "https://wa.me/6281234567890",
  footerAddress = "",
  mediaUrl = "",
}) => {
  const channel: TemplateChannel =
    rawChannel === "whatsapp" || rawChannel === "telegram" ? rawChannel : "email";

  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [zoomMode, setZoomMode] = useState<"fit" | "100" | "85" | "75" | "50">("fit");
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullScreenIframeRef = useRef<HTMLIFrameElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(600);
  const [iframeHeight, setIframeHeight] = useState<number>(480);

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
  }, [channel, deviceView]);

  // Base canvas width: 600px standard email desktop, 375px mobile phone
  const baseWidth = deviceView === "mobile" ? 375 : 600;

  // Compute fluid scale factor so desktop email never clips or overflows on any screen
  const scale = useMemo(() => {
    if (deviceView === "mobile") {
      const available = Math.max(260, viewportWidth - 24);
      if (available < 375) {
        return Math.max(0.5, Number((available / 375).toFixed(3)));
      }
      return 1;
    }

    if (zoomMode === "100") return 1;
    if (zoomMode === "85") return 0.85;
    if (zoomMode === "75") return 0.75;
    if (zoomMode === "50") return 0.5;

    // "fit" mode (Default): auto-scale down smoothly if viewport is narrower than 600px email
    const available = Math.max(280, viewportWidth - 32);
    if (available >= baseWidth) {
      return 1;
    }
    return Math.max(0.4, Number((available / baseWidth).toFixed(3)));
  }, [zoomMode, viewportWidth, baseWidth, deviceView]);

  // Custom Recipient Test Simulation Modal State
  const [isCustomRecipientModalOpen, setIsCustomRecipientModalOpen] = useState(false);
  const [customName, setCustomName] = useState(recipient.name);
  const [customEmail, setCustomEmail] = useState(recipient.email);
  const [customCompany, setCustomCompany] = useState(recipient.company || "");
  const [customPhone, setCustomPhone] = useState(recipient.phone || "");
  const [customVoucher, setCustomVoucher] = useState(recipient.customAttributes?.kode_promo || "PROMO2026");

  // Memoized Interpolated Subject & Preheader for preview (prevents unnecessary re-processing)
  const compiledSubject = useMemo(
    () => interpolateMergeTags(subject || "", recipient, orgName),
    [subject, recipient, orgName]
  );

  const compiledPreheader = useMemo(
    () => (preheader ? interpolateMergeTags(preheader, recipient, orgName) : ""),
    [preheader, recipient, orgName]
  );

  // Memoized Compiled clean email HTML
  const compiledEmailHtml = useMemo(
    () =>
      compileTemplateToEmailHtml({
        subject,
        preheader,
        content,
        orgName,
        senderEmail,
        recipient,
        brandColor,
        enableLogo,
        logoUrl,
        logoWidth,
        logoAlign,
        enableCta,
        ctaText,
        ctaUrl,
        ctaColor,
        enableSocial,
        websiteUrl,
        instagramUrl,
        whatsappUrl,
        footerAddress,
      }),
    [
      subject,
      preheader,
      content,
      orgName,
      senderEmail,
      recipient,
      brandColor,
      enableLogo,
      logoUrl,
      logoWidth,
      logoAlign,
      enableCta,
      ctaText,
      ctaUrl,
      ctaColor,
      enableSocial,
      websiteUrl,
      instagramUrl,
      whatsappUrl,
      footerAddress,
    ]
  );

  const handleApplyCustomRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = customName.trim().split(" ");
    const firstName = parts[0] || "Pelanggan";
    const lastName = parts.slice(1).join(" ") || "";
    const updated: RecipientPreview = {
      id: "custom-preview",
      name: customName.trim() || "Nama Pelanggan",
      firstName,
      lastName,
      email: customEmail.trim() || "pelanggan@domain.com",
      phone: customPhone.trim() || "+6281234567890",
      company: customCompany.trim() || "Perusahaan Pelanggan",
      customAttributes: {
        ...recipient.customAttributes,
        kode_promo: customVoucher.trim() || "PROMO2026",
      },
    };
    onRecipientChange(updated);
    setIsCustomRecipientModalOpen(false);
    toast.success("Data simulasi uji coba tag berhasil diterapkan!");
  };

  const isContentEmpty = !content || !content.trim();

  // Measure actual rendered email content height without artificial runaway growth or excess blanks
  const measureActualEmailHeight = (doc: Document): number => {
    if (!doc || !doc.body) return 380;

    let maxBottom = 0;
    // Check all rendered elements inside body
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

    if (maxBottom > 40) {
      return Math.ceil(maxBottom + 16);
    }

    const bodyH = doc.body.scrollHeight || 0;
    return Math.max(bodyH, 240);
  };

  // Attach safe link interceptor inside preview iframes to prevent accidental page navigation
  const attachPreviewLinkInterceptor = (doc: Document) => {
    if (!doc || !doc.body) return;
    doc.body.addEventListener("click", (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button[data-href]");
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const href = target.getAttribute("href") || target.getAttribute("data-href") || "";
        if (href && href !== "#" && href !== "#unsubscribe") {
          toast.info(`Tautan pratinjau: ${href}`, {
            description: "Navigasi dinonaktifkan dalam mode pratinjau template.",
            duration: 2500,
          });
        }
      }
    });
  };

  // Instant real-time synchronous update into preview iframe
  useEffect(() => {
    if (channel !== "email") return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(
          compiledEmailHtml ||
            "<!DOCTYPE html><html><body style='margin:0;padding:24px;font-family:sans-serif;color:#94a3b8;text-align:center;'>(Konten email masih kosong)</body></html>"
        );
        doc.close();

        attachPreviewLinkInterceptor(doc);

        const updateHeight = () => {
          try {
            const measured = measureActualEmailHeight(doc);
            setIframeHeight(measured);
          } catch {}
        };
        updateHeight();
        setTimeout(updateHeight, 150);
      }
    } catch (err) {
      console.warn("Iframe write error:", err);
    }
  }, [compiledEmailHtml, channel, deviceView]);

  // Instant real-time update into fullscreen modal iframe
  useEffect(() => {
    if (!isFullScreenModalOpen || channel !== "email") return;
    const iframe = fullScreenIframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(
          compiledEmailHtml ||
            "<!DOCTYPE html><html><body style='margin:0;padding:24px;font-family:sans-serif;color:#94a3b8;text-align:center;'>(Konten email masih kosong)</body></html>"
        );
        doc.close();

        attachPreviewLinkInterceptor(doc);

        const updateHeight = () => {
          try {
            const measured = measureActualEmailHeight(doc);
            setIframeHeight(measured);
          } catch {}
        };
        updateHeight();
        setTimeout(updateHeight, 150);
      }
    } catch (err) {
      console.warn("Fullscreen iframe write error:", err);
    }
  }, [compiledEmailHtml, isFullScreenModalOpen, deviceView, channel]);

  const handleCopyHtml = () => {
    if (!compiledEmailHtml) {
      toast.info("Konten email masih kosong");
      return;
    }
    navigator.clipboard.writeText(compiledEmailHtml);
    setCopiedHtml(true);
    toast.success("Kode HTML Email disalin ke clipboard!");
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // WhatsApp Message Line Renderer
  const renderWhatsAppLines = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-slate-400 italic text-xs">
          (Pesan WhatsApp masih kosong. Tulis pesan di panel editor...)
        </p>
      );
    }

    const lines = interpolateMergeTags(text, recipient, orgName).split("\n");
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-800 leading-relaxed font-sans">
          {parseWhatsAppFormatting(line)}
        </p>
      );
    });
  };

  // Telegram Message Line Renderer
  const renderTelegramLines = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-slate-400 italic text-xs">
          (Pesan Telegram masih kosong. Tulis pesan di panel editor...)
        </p>
      );
    }

    const lines = interpolateMergeTags(text, recipient, orgName).split("\n");
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-800 leading-relaxed font-sans">
          {parseWhatsAppFormatting(line)}
        </p>
      );
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3.5">
      {/* TOP CONTROLS BAR: Live Simulation & Device Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        {/* Recipient Simulator Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Pratinjau untuk:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs transition cursor-pointer"
              >
                <span>{recipient.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({recipient.email})</span>
                <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Simulasi Data Kontak
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SAMPLE_RECIPIENTS.map((rec) => (
                <DropdownMenuItem
                  key={rec.id}
                  onClick={() => onRecipientChange(rec)}
                  className={`text-xs px-2.5 py-2 rounded-lg cursor-pointer ${
                    recipient.id === rec.id
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{rec.name}</span>
                      <span className="text-[10px] text-slate-400">{rec.company}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{rec.email}</span>
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCustomName(recipient.name);
                  setCustomEmail(recipient.email);
                  setCustomCompany(recipient.company || "");
                  setCustomPhone(recipient.phone || "");
                  setCustomVoucher(recipient.customAttributes?.kode_promo || "PROMO2026");
                  setIsCustomRecipientModalOpen(true);
                }}
                className="text-xs px-2.5 py-2 rounded-lg cursor-pointer text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                <span>Kustomisasi Nilai Uji Coba...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Mode & Device Controls (Only for Email) */}
        {channel === "email" && (
          <div className="flex items-center gap-1.5">
            {/* Desktop / Mobile Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  deviceView === "desktop"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Tampilan Desktop (600px)"
              >
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  deviceView === "mobile"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Tampilan Ponsel (375px)"
              >
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHANNEL: EMAIL PREVIEW */}
      {channel === "email" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col">
          {/* 1. PROFESSIONAL EMAIL CLIENT CHROME / WINDOW HEADER */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 ml-1">
                Pratinjau Klien Email
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Dropdown for Desktop View */}
              {channel === "email" && deviceView === "desktop" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/90 shadow-2xs transition cursor-pointer"
                      title="Skala Tampilan Email Desktop"
                    >
                      <ZoomIn className="h-3 w-3 text-slate-500" />
                      <span>{zoomMode === "fit" ? `Paskan (${Math.round(scale * 100)}%)` : `${zoomMode}%`}</span>
                      <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 text-xs">
                    <DropdownMenuItem
                      onClick={() => setZoomMode("fit")}
                      className={`cursor-pointer ${zoomMode === "fit" ? "font-bold bg-slate-100 text-slate-900" : ""}`}
                    >
                      Paskan Layar (Auto)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setZoomMode("100")}
                      className={`cursor-pointer ${zoomMode === "100" ? "font-bold bg-slate-100 text-slate-900" : ""}`}
                    >
                      100% (Ukuran Asli)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setZoomMode("85")}
                      className={`cursor-pointer ${zoomMode === "85" ? "font-bold bg-slate-100 text-slate-900" : ""}`}
                    >
                      85%
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setZoomMode("75")}
                      className={`cursor-pointer ${zoomMode === "75" ? "font-bold bg-slate-100 text-slate-900" : ""}`}
                    >
                      75%
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setZoomMode("50")}
                      className={`cursor-pointer ${zoomMode === "50" ? "font-bold bg-slate-100 text-slate-900" : ""}`}
                    >
                      50%
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Fullscreen Preview Button */}
              {channel === "email" && (
                <button
                  type="button"
                  onClick={() => setIsFullScreenModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/90 shadow-2xs transition cursor-pointer"
                  title="Lihat Pratinjau Layar Penuh"
                >
                  <Maximize2 className="h-3 w-3 text-slate-500" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </button>
              )}

              {/* Quick Action: Copy HTML */}
              <button
                type="button"
                onClick={handleCopyHtml}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer ml-0.5"
                title="Salin kode HTML email"
              >
                {copiedHtml ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            {/* 2. REALISTIC EMAIL METADATA HEADER */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
                {/* Subject Line */}
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                  {compiledSubject ? (
                    compiledSubject
                  ) : (
                    <span className="text-slate-400 font-normal italic">
                      (Subjek email belum diisi)
                    </span>
                  )}
                </h1>

                {/* Preheader snippet (if exists) */}
                {compiledPreheader && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                    {compiledPreheader}
                  </p>
                )}

                {/* Sender & Recipient Details */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    {/* Brand / Sender Avatar or Logo */}
                    {enableLogo && logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={orgName}
                        className="h-8 w-8 rounded-full object-contain bg-white border border-slate-200 shadow-2xs shrink-0 p-0.5"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: brandColor || "#4F46E5" }}
                        className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                      >
                        {orgName ? orgName.charAt(0).toUpperCase() : "A"}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-1.5">
                        <span className="font-bold text-slate-900">{orgName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          &lt;{senderEmail}&gt;
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Kepada: <strong className="text-slate-700">{recipient.name}</strong>{" "}
                        <span className="text-slate-400 font-mono">({recipient.email})</span>
                      </p>
                    </div>
                  </div>

                  {/* Realistic Timestamp */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {currentDateFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. EMAIL BODY VIEWPORT (DESKTOP OR MOBILE SIMULATOR) */}
              <div
                ref={previewViewportRef}
                className="p-3 sm:p-5 bg-[#f8fafc]/90 overflow-x-auto min-h-[380px] transition-all flex flex-col items-center"
              >
                {isContentEmpty ? (
                  /* CLEAN EMPTY STATE */
                  <div className="w-full max-w-md py-16 text-center my-auto">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200/80 text-slate-400 mx-auto flex items-center justify-center mb-3 shadow-2xs">
                      <Mail className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Kanvas Email Masih Kosong
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      Mulai tulis konten di editor sebelah kiri atau klik <strong>"Pilih Template"</strong> di atas untuk memuat desain siap pakai.
                    </p>
                  </div>
                ) : deviceView === "mobile" ? (
                  /* CLEAN REAL MOBILE VIEWPORT (NO BEZEL, PROPORTIONATELY SCALED) */
                  <div className="w-[375px] max-w-full mx-auto bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col my-1">
                    <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium select-none">
                      <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                        <Smartphone className="h-3 w-3 text-slate-500" />
                        <span>Layar Ponsel (375px)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Skala Pas (100%)</span>
                    </div>

                    <div className="bg-white overflow-y-auto max-h-[640px] flex justify-center">
                      <div
                        style={{
                          width: "375px",
                          height: `${Math.round(iframeHeight * (375 / 600))}px`,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          ref={iframeRef}
                          title="Email Mobile Preview"
                          srcDoc={compiledEmailHtml}
                          sandbox="allow-same-origin"
                          style={{
                            width: "600px",
                            height: `${iframeHeight}px`,
                            transform: `scale(${375 / 600})`,
                            transformOrigin: "top left",
                            position: "absolute",
                            top: 0,
                            left: 0,
                          }}
                          className="border-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* DESKTOP VIEWPORT WITH FLUID AUTO-SCALING & INTERNAL SCROLLING */
                  <div
                    className="w-full max-w-full overflow-y-auto max-h-[600px] rounded-xl border border-slate-200/90 shadow-2xs bg-white flex justify-center"
                    style={{
                      width: `${Math.round(baseWidth * scale)}px`,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(baseWidth * scale)}px`,
                        height: `${Math.round(iframeHeight * scale)}px`,
                        position: "relative",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        title="Email Desktop Preview"
                        srcDoc={compiledEmailHtml}
                        sandbox="allow-same-origin"
                        style={{
                          width: `${baseWidth}px`,
                          height: `${iframeHeight}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                        className="border-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      )}

      {/* CHANNEL: WHATSAPP PREVIEW */}
      {channel === "whatsapp" && (
        <div className="rounded-2xl border border-slate-200/90 bg-[#e5ddd5] shadow-2xs overflow-hidden flex flex-col">
          {/* WhatsApp Header */}
          <div className="px-4 py-3 bg-[#075e54] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {orgName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                  <span>{orgName}</span>
                  <span className="text-[9px] bg-emerald-400 text-slate-900 px-1 rounded-sm font-semibold">
                    Official
                  </span>
                </h4>
                <p className="text-[10px] text-white/80">Online</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Chat Body */}
          <div className="p-4 sm:p-6 min-h-[360px] flex flex-col justify-end space-y-2">
            <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-3 shadow-2xs self-start border border-slate-200/40 space-y-2">
            {/* Banner Gambar WhatsApp */}
            {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-100 max-h-56 bg-slate-100">
                  <img
                      src={mediaUrl}
                      alt="WhatsApp Banner"
                      className="w-full h-auto object-cover max-h-56"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x200?text=Gambar+Tidak+Valid";
                      }}
                  />
                </div>
            )}
            <div className="text-xs text-slate-800 leading-relaxed font-sans">
              {renderWhatsAppLines(content)}
            </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                <span>10:30</span>
                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL: TELEGRAM PREVIEW */}
      {channel === "telegram" && (
        <div className="rounded-2xl border border-slate-200/90 bg-[#54759e]/15 shadow-2xs overflow-hidden flex flex-col">
          {/* Telegram Header */}
          <div className="px-4 py-3 bg-[#2481cc] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {orgName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{orgName} Channel</h4>
                <p className="text-[10px] text-white/80">broadcast channel</p>
              </div>
            </div>
          </div>

          {/* Telegram Body */}
          <div className="p-4 sm:p-6 min-h-[360px] flex flex-col justify-end space-y-2">
            <div className="max-w-[85%] bg-white rounded-2xl p-3 shadow-2xs self-start border border-slate-200/40 space-y-2">
              {/* Banner Gambar Telegram */}
              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-100 max-h-56 bg-slate-100">
                  <img
                    src={mediaUrl}
                    alt="Telegram Banner"
                    className="w-full h-auto object-cover max-h-56"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x200?text=Gambar+Tidak+Valid";
                    }}
                  />
                </div>
              )}
              <div className="text-xs text-slate-800 leading-relaxed font-sans space-y-0.5">
                {renderTelegramLines(content)}
              </div>
              <div className="flex items-center justify-end text-[10px] text-slate-400 pt-1">
                <span>10:30</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Kustomisasi Nilai Uji Coba Simulasi Tags */}
      <Dialog open={isCustomRecipientModalOpen} onOpenChange={setIsCustomRecipientModalOpen}>
        <DialogContent className="max-w-md p-5 rounded-2xl border-slate-200">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span>Kustomisasi Nilai Uji Coba Tag</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Isi data uji coba di bawah ini untuk melihat bagaimana merge tag (seperti nama, perusahaan, dan voucher) terisi secara nyata di pratinjau.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyCustomRecipient} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Nama Lengkap Penerima (Tag: {"{{first_name}}"}, {"{{nama}}"})
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full h-8.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Email Penerima (Tag: {"{{email}}"})
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="budi@example.com"
                className="w-full h-8.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Perusahaan (Tag: {"{{company}}"})
                </label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="PT Maju Bersama"
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  No. Telepon / WA (Tag: {"{{phone}}"})
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+628123456789"
                  className="w-full h-8.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Kode Promo / Voucher (Tag: {"{{kode_promo}}"}, {"{{voucher}}"})
              </label>
              <input
                type="text"
                value={customVoucher}
                onChange={(e) => setCustomVoucher(e.target.value)}
                placeholder="PROMO2026"
                className="w-full h-8.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomRecipientModalOpen(false)}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Terapkan ke Pratinjau
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FULLSCREEN EMAIL PREVIEW MODAL */}
      <Dialog open={isFullScreenModalOpen} onOpenChange={setIsFullScreenModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 rounded-2xl border-slate-700/50 flex flex-col overflow-hidden [&>button:last-child]:hidden shadow-2xl">
          {/* Gradient Header Navbar with prominent controls and visible X button */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-500/20 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Mail className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-white">Pratinjau Layar Penuh</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-medium border border-indigo-400/20">
                    Live Preview
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                  Kepada: <span className="text-slate-300 font-medium">{recipient.name}</span> ({recipient.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Device Switcher */}
              <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceView("desktop")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    deviceView === "desktop"
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("mobile")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    deviceView === "mobile"
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Copy HTML Button */}
              <button
                type="button"
                onClick={handleCopyHtml}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs active:scale-95 border border-indigo-400/30"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Salin HTML</span>
              </button>

              {/* High-Contrast, Clearly Visible Close Button (X) */}
              <button
                type="button"
                onClick={() => setIsFullScreenModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 hover:border-rose-400 ml-1 group"
                title="Tutup (Esc)"
                aria-label="Tutup"
              >
                <X className="h-4 w-4 text-white group-hover:rotate-90 transition-transform duration-150" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-center">
            {deviceView === "mobile" ? (
              /* CLEAN REAL MOBILE VIEWPORT IN FULLSCREEN MODAL (PROPORTIONATELY SCALED) */
              <div className="w-[390px] max-w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col my-auto">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium select-none">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                    <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                    <span>Tampilan Mobile (390px)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Skala Pas (100%)</span>
                </div>
                <div className="bg-white overflow-y-auto max-h-[75vh] flex justify-center">
                  <div
                    style={{
                      width: "390px",
                      height: `${Math.round(iframeHeight * (390 / 600))}px`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      ref={fullScreenIframeRef}
                      title="Fullscreen Mobile Preview"
                      srcDoc={compiledEmailHtml}
                      sandbox="allow-same-origin"
                      style={{
                        width: "600px",
                        height: `${iframeHeight}px`,
                        transform: `scale(${390 / 600})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* DESKTOP CLIENT IN FULLSCREEN MODAL */
              <div
                style={{
                  width: "640px",
                  maxWidth: "100%",
                }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col my-auto transition-all duration-150 max-h-[82vh]"
              >
                {/* Fullscreen Metadata Header */}
                <div className="p-4 border-b border-slate-100 bg-white shrink-0">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {compiledSubject || "(Subjek email belum diisi)"}
                  </h2>
                  {compiledPreheader && (
                    <p className="text-xs text-slate-500 mt-1">{compiledPreheader}</p>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      Dari: <strong className="text-slate-800">{orgName}</strong> &lt;{senderEmail}&gt;
                    </span>
                    <span>
                      Kepada: <strong className="text-slate-800">{recipient.name}</strong>
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  <iframe
                    ref={fullScreenIframeRef}
                    title="Fullscreen Desktop Preview"
                    srcDoc={compiledEmailHtml}
                    sandbox="allow-same-origin"
                    className="w-full border-0 bg-transparent"
                    style={{ height: `${iframeHeight}px` }}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
