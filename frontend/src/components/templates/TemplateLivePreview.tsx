import React, { useState } from "react";
import type {
  TemplateChannel,
  RecipientPreview,
} from "@/types/template";
import {
  interpolateMergeTags,
  SAMPLE_RECIPIENTS,
  parseInlineFormatting,
  parseWhatsAppFormatting,
  compileTemplateToEmailHtml,
} from "@/utils/templateParser";
import {
  ChevronDown,
  Send,
  CheckCheck,
  Eye,
  Code2,
  Copy,
  Check,
  MailCheck,
  ExternalLink,
  Globe,
  Camera,
  MessageCircle,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  enableCta = false,
  ctaText = "Klaim Voucher Sekarang 🚀",
  ctaUrl = "https://tokoonline.com/promo",
  ctaColor = "#4F46E5",
  enableSocial = true,
  websiteUrl = "https://acmecorp.co",
  instagramUrl = "https://instagram.com/acmecorp",
  whatsappUrl = "https://wa.me/6281234567890",
  footerAddress = "PT Acme Digital Nusantara, Jakarta, Indonesia",
}) => {
  const [previewMode, setPreviewMode] = useState<"visual" | "html">("visual");
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Interpolated values
  const compiledSubject = interpolateMergeTags(subject, recipient, orgName);
  const compiledPreheader = preheader ? interpolateMergeTags(preheader, recipient, orgName) : "";
  const compiledContent = interpolateMergeTags(content, recipient, orgName);

  // Compiled production HTML for email sending
  const compiledEmailHtml = compileTemplateToEmailHtml({
    subject,
    preheader,
    content,
    orgName,
    senderEmail,
    recipient,
    brandColor,
    enableCta,
    ctaText,
    ctaUrl,
    ctaColor,
    enableSocial,
    websiteUrl,
    instagramUrl,
    whatsappUrl,
    footerAddress,
  });

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledEmailHtml);
    setCopiedHtml(true);
    toast.success("Kode HTML Email disalin ke clipboard!");
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Structured Block Renderer for Email & Telegram
  const renderFormattedBlocks = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-slate-400 italic text-xs">
          (Konten pesan masih kosong. Tuliskan pesan di panel editor...)
        </p>
      );
    }

    const lines = text.split("\n");
    const blocks: React.ReactNode[] = [];
    let currentListItems: string[] = [];

    const flushList = (keyPrefix: number) => {
      if (currentListItems.length > 0) {
        blocks.push(
          <ul key={`ul-${keyPrefix}`} className="my-2.5 ml-4 list-disc space-y-1 text-slate-700 text-xs leading-relaxed">
            {currentListItems.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentListItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "---") {
        flushList(i);
        blocks.push(<hr key={i} className="my-4 border-slate-100" />);
        continue;
      }

      if (trimmed.startsWith("# ")) {
        flushList(i);
        blocks.push(
          <h1 key={i} className="text-base font-bold text-slate-900 mt-3.5 mb-1.5 leading-snug">
            {parseInlineFormatting(trimmed.replace("# ", ""))}
          </h1>
        );
        continue;
      }

      if (trimmed.startsWith("## ")) {
        flushList(i);
        blocks.push(
          <h2 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1 leading-snug">
            {parseInlineFormatting(trimmed.replace("## ", ""))}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        const itemText = trimmed.replace(/^[•-]\s*/, "");
        currentListItems.push(itemText);
        continue;
      }

      flushList(i);

      if (!trimmed) {
        blocks.push(<div key={i} className="h-2.5" />);
      } else {
        blocks.push(
          <p key={i} className="text-slate-700 text-xs leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    flushList(lines.length);
    return blocks;
  };

  // WhatsApp Message Line Renderer
  const renderWhatsAppLines = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-slate-400 italic text-xs">
          (Pesan WhatsApp masih kosong...)
        </p>
      );
    }

    const lines = text.split("\n");
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

  return (
    <div className="space-y-4">
      {/* TOP BAR OF PREVIEW: SECTION TITLE, RECIPIENT SWITCHER & VIEW MODE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            LIVE PREVIEW
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-500">As seen by:</span>

            {/* Recipient Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-indigo-600 transition cursor-pointer"
                >
                  <span>{recipient.name}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Pilih Simulasi Penerima
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SAMPLE_RECIPIENTS.map((rec) => (
                  <DropdownMenuItem
                    key={rec.id}
                    onClick={() => onRecipientChange(rec)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl cursor-pointer ${
                      recipient.id === rec.id
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{rec.name}</span>
                      <span className="text-[10px] text-slate-400 block">{rec.email}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View Mode Switcher for Email */}
        {channel === "email" && (
          <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setPreviewMode("visual")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                previewMode === "visual"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Tampilan Email</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("html")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                previewMode === "html"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code2 className="h-3 w-3" />
              <span>HTML Output</span>
            </button>
          </div>
        )}
      </div>

      {/* CHANNEL 1: EMAIL PREVIEW */}
      {channel === "email" && (
        previewMode === "visual" ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            {/* Email Envelope Metadata */}
            <div className="space-y-1 text-xs pb-4 border-b border-slate-100">
              <p className="text-slate-500">
                <span className="text-slate-400 font-medium">From:</span>{" "}
                <span className="font-semibold text-slate-800">{orgName}</span>{" "}
                <span className="text-slate-400">&lt;{senderEmail}&gt;</span>
              </p>
              <p className="text-slate-800 font-medium pt-0.5">
                <span className="text-slate-400 font-medium">Subject:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {compiledSubject || "(Tanpa Subjek)"}
                </span>
              </p>
              {compiledPreheader && (
                <p className="text-[11px] text-slate-400 truncate">
                  <span className="font-medium text-slate-400">Preheader:</span>{" "}
                  {compiledPreheader}
                </p>
              )}
            </div>

            {/* Email Body */}
            <div className="space-y-4">
              {/* Brand Logo Bar */}
              <div>
                <span
                  style={{ backgroundColor: brandColor }}
                  className="inline-block text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase shadow-2xs"
                >
                  {orgName.toUpperCase()}
                </span>
              </div>

              {/* Formatted Content */}
              <div className="space-y-1 font-sans text-xs text-slate-700">
                {renderFormattedBlocks(compiledContent)}
              </div>

              {/* Mailchimp Call-to-Action (CTA) Button */}
              {enableCta && (
                <div className="pt-4 pb-2 text-center">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ backgroundColor: ctaColor }}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
                  >
                    <span>{ctaText}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Mailchimp Social Links & Compliance Footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2 text-xs">
                {enableSocial && (
                  <div className="flex items-center justify-center gap-4 text-slate-500 py-1">
                    {websiteUrl && (
                      <a href={websiteUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition flex items-center gap-1 text-[11px] font-medium">
                        <Globe className="h-3.5 w-3.5" /> Web
                      </a>
                    )}
                    {instagramUrl && (
                      <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-rose-600 transition flex items-center gap-1 text-[11px] font-medium">
                        <Camera className="h-3.5 w-3.5" /> Instagram
                      </a>
                    )}
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition flex items-center gap-1 text-[11px] font-medium">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  {footerAddress}
                </p>
                <p className="text-[10px] text-slate-400">
                  Email dikirim oleh <strong>{orgName}</strong>. <a href="#unsubscribe" className="underline text-slate-500 hover:text-slate-800">Unsubscribe</a>.
                </p>
              </div>
            </div>

            {/* Delivery Guarantee Notice */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <MailCheck className="h-3.5 w-3.5" /> Mailchimp-grade HTML Ready
              </span>
              <span>100% responsif</span>
            </div>
          </div>
        ) : (
          /* HTML Code Output */
          <div className="rounded-2xl border border-slate-200/90 bg-slate-900 text-slate-100 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  mailchimp-email.html
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition cursor-pointer active:scale-95"
              >
                {copiedHtml ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>Salin HTML</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[380px] p-2 leading-relaxed bg-slate-950/60 rounded-xl border border-slate-800/80">
              <code>{compiledEmailHtml}</code>
            </pre>
          </div>
        )
      )}

      {/* CHANNEL 2: WHATSAPP PREVIEW */}
      {channel === "whatsapp" && (
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
          {/* WhatsApp Emerald App Bar */}
          <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-400 text-[#075E54] font-bold text-xs flex items-center justify-center shadow-xs">
                {orgName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">{orgName} Official</span>
                <span className="text-[10px] text-emerald-200">Online • Akun Bisnis Terverifikasi</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Video className="h-4 w-4 cursor-pointer" />
              <Phone className="h-4 w-4 cursor-pointer" />
              <MoreVertical className="h-4 w-4 cursor-pointer" />
            </div>
          </div>

          {/* WhatsApp Chat Wallpaper Background */}
          <div
            className="p-4 min-h-[380px] bg-[#EFEAE2] flex flex-col justify-end space-y-2"
            style={{
              backgroundImage: "radial-gradient(#d4cbbe 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {/* Date pill */}
            <div className="text-center my-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/80 text-[10px] text-slate-500 font-medium shadow-2xs">
                HARI INI
              </span>
            </div>

            {/* WhatsApp Outgoing / Incoming Chat Bubble */}
            <div className="max-w-[88%] self-start bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-xs border border-slate-200/50 space-y-2">
              <div className="space-y-1">
                {renderWhatsAppLines(compiledContent)}
              </div>

              {/* Timestamp & double blue check */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1 select-none">
                <span>10:30 WIB</span>
                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANNEL 3: TELEGRAM PREVIEW */}
      {channel === "telegram" && (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-100/70 p-5 shadow-2xs">
          {/* Telegram Channel / Bot Header */}
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-200/60">
            <div className="h-8 w-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-2xs">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {orgName} Official Bot
              </span>
              <span className="text-[10px] text-sky-600 font-medium">
                Telegram Broadcast Channel
              </span>
            </div>
          </div>

          {/* Telegram Chat Bubble */}
          <div className="max-w-md bg-white rounded-2xl rounded-tl-sm p-4 shadow-xs border border-slate-200/60 space-y-2">
            <div className="space-y-1 font-sans text-xs text-slate-800">
              {renderFormattedBlocks(compiledContent)}
            </div>

            {/* Timestamp & Read Receipt */}
            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
              <span>10:30</span>
              <CheckCheck className="h-3 w-3 text-sky-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
