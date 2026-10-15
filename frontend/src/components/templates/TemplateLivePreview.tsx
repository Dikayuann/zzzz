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
  Code2,
  Copy,
  Check,
  CheckCheck,
  Mail,
  SlidersHorizontal,
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
  channel,
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
  footerAddress = "PT Acme Digital Nusantara, Jakarta, Indonesia",
  mediaUrl = "",
}) => {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState<"visual" | "html">("visual");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Auto-resize iframe height based on rendered content
  useEffect(() => {
    if (previewMode !== "visual" || channel !== "email" || isContentEmpty) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 380);
          iframe.style.height = `${height + 20}px`;
        }
      } catch {
        // Fallback default
        iframe.style.height = "520px";
      }
    };

    iframe.addEventListener("load", handleLoad);
    // Also trigger immediately in case already loaded
    handleLoad();

    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [compiledEmailHtml, deviceView, previewMode, channel, isContentEmpty]);

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

            {/* Visual vs Raw HTML Output Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setPreviewMode("visual")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  previewMode === "visual"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("html")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  previewMode === "html"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Lihat Kode HTML Lengkap"
              >
                <Code2 className="h-3 w-3" />
                <span>HTML</span>
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
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 ml-1">
                Pratinjau Klien Email
              </span>
            </div>

            {/* Quick Action: Copy HTML */}
            <button
              type="button"
              onClick={handleCopyHtml}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
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

          {previewMode === "visual" ? (
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
                className={`p-4 sm:p-6 bg-[#f8fafc]/80 flex justify-center overflow-x-auto min-h-[380px] transition-all`}
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
                ) : (
                  /* RENDERED EMAIL VIEWPORT */
                  <div
                    style={{
                      width: deviceView === "mobile" ? "375px" : "100%",
                      maxWidth: deviceView === "mobile" ? "375px" : "620px",
                    }}
                    className={`transition-all duration-200 ${
                      deviceView === "mobile"
                        ? "rounded-2xl border-2 border-slate-300 shadow-md bg-white overflow-hidden"
                        : "w-full"
                    }`}
                  >
                    {deviceView === "mobile" && (
                      <div className="bg-slate-100 py-1.5 px-4 text-center border-b border-slate-200 text-[10px] font-semibold text-slate-500">
                        Pratinjau Mobile (375px)
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      title="Email HTML Preview"
                      srcDoc={compiledEmailHtml}
                      sandbox="allow-same-origin"
                      className="w-full border-0 bg-transparent min-h-[420px]"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* RAW HTML CODE OUTPUT VIEW */
            <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
              <pre className="selection:bg-indigo-600">
                <code>{compiledEmailHtml || "(Konten email masih kosong)"}</code>
              </pre>
            </div>
          )}
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
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {interpolateMergeTags(content || "(Pesan Telegram masih kosong...)", recipient, orgName)}
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
    </div>
  );
};
