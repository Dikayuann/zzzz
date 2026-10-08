import React from "react";
import type { RecipientPreview, ToolbarAction, TemplateChannel } from "@/types/template";

export const SAMPLE_RECIPIENTS: RecipientPreview[] = [
  {
    id: "ct-1",
    name: "Budi Santoso",
    firstName: "Budi",
    lastName: "Santoso",
    email: "budi.santoso@startup.id",
    phone: "+62 812-3456-7890",
    company: "Startup ID",
  },
  {
    id: "ct-2",
    name: "Rina Wijaya",
    firstName: "Rina",
    lastName: "Wijaya",
    email: "rina.w@tokoonline.com",
    phone: "+62 813-9876-5432",
    company: "Toko Online",
  },
  {
    id: "ct-3",
    name: "Ahmad Fauzi",
    firstName: "Ahmad",
    lastName: "Fauzi",
    email: "ahmad@kreatifindonesia.co",
    phone: "+62 811-2345-6789",
    company: "Kreatif Media",
  },
];

export const DEFAULT_TEMPLATE_CONTENT = "";
export const DEFAULT_SUBJECT = "";
export const DEFAULT_PREHEADER = "";

export const DEFAULT_WA_CONTENT = `Halo kak *{{first_name}}*, salam hangat dari *{{org_name}}*.

Kami ingin menginformasikan bahwa ada pembaruan fitur untuk akun Anda:
• *Peningkatan Kecepatan*: Pengiriman pesan kini lebih cepat
• *Laporan Analitik Real-time*: Pantau performa dan konversi langsung
• *Dukungan Multi-Channel*: Integrasi Email, WhatsApp, dan Telegram

Jika ada pertanyaan atau butuh panduan, silakan balas chat ini.

Terima kasih,
_Tim {{org_name}}_`;

export const DEFAULT_TELEGRAM_CONTENT = `Halo kak *{{first_name}}*, salam hangat dari *{{org_name}}*! 🚀

Kami ingin menginformasikan bahwa ada pembaruan fitur untuk akun Anda:
• *Peningkatan Kecepatan*: Pengiriman pesan kini lebih cepat
• *Laporan Analitik Real-time*: Pantau performa dan konversi langsung
• *Dukungan Multi-Channel*: Integrasi Email, WhatsApp, dan Telegram

Jika ada pertanyaan atau butuh panduan, silakan balas pesan ini.

Terima kasih,
_Tim {{org_name}}_`;

/**
 * Detect if text content is already raw HTML email
 */
export function isRawHtml(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    /<(?:table|div|p|h[1-6]|span|a|b|strong|i|em|section|header|footer)\b[^>]*>/i.test(trimmed)
  );
}

/**
 * Comprehensive Merge Tag Interpolation
 * Supports all tags from contacts, businesses, commerce, dates, and links.
 */
export function interpolateMergeTags(
  text: string,
  recipient: RecipientPreview,
  orgName: string = "Acme Corp"
): string {
  if (!text) return "";

  const now = new Date();
  const replacements: Record<string, string> = {
    // Contact details
    nama: recipient.name,
    name: recipient.name,
    full_name: recipient.name,
    first_name: recipient.firstName,
    last_name: recipient.lastName,
    email: recipient.email,
    phone: recipient.phone,
    telepon: recipient.phone,
    company: recipient.company,
    perusahaan: recipient.company,
    sapaan: "Bpk.",
    kota: "Jakarta Selatan",
    gender: "Laki-laki",

    // Organization / Sender details
    org_name: orgName,
    company_name: orgName,
    sender_name: `Tim ${orgName}`,
    support_email: "support@acmecorp.co",
    support_phone: "+62 811-2233-4455",
    website_url: "https://acmecorp.co",
    alamat_kantor: "PT Acme Digital Nusantara, Jakarta, Indonesia",

    // Commerce / Promo details
    kode_promo: "PROMO2026",
    voucher: "PROMO2026",
    diskon: "30%",
    order_id: "INV-2026-0988",
    nama_produk: "Paket Premium Annual Pro",
    total_belanja: "Rp 750.000",
    batas_waktu: "Pukul 23:59 WIB malam ini",
    tanggal_kadaluarsa: "31 Oktober 2026",

    // Datetime
    tanggal_hari_ini: now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    hari: now.toLocaleDateString("id-ID", { weekday: "long" }),
    bulan: now.toLocaleDateString("id-ID", { month: "long" }),
    bulan_ini: now.toLocaleDateString("id-ID", { month: "long" }),
    tahun: now.getFullYear().toString(),
    tahun_ini: now.getFullYear().toString(),
    jam: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),

    // Links & Utilities
    unsubscribe_link: "#unsubscribe",
    cta_link: "https://acmecorp.co/promo",
    web_view_link: "#view-online",
    otp: "849201",
  };

  // Merge any dynamic custom attributes from recipient simulation
  if (recipient.customAttributes) {
    Object.entries(recipient.customAttributes).forEach(([k, v]) => {
      replacements[k.toLowerCase()] = v;
    });
  }

  return text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, tagKey) => {
    const key = tagKey.toLowerCase();
    if (replacements[key] !== undefined) {
      return replacements[key];
    }
    // Clean fallback for custom tags
    const readable = key.replace(/_/g, " ");
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  });
}

/**
 * Intelligent toolbar action applicator with toggle and channel-aware syntax (Email vs WhatsApp)
 */
export function applyToolbarAction(
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
  currentValue: string,
  channel: TemplateChannel = "email"
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = currentValue.substring(start, end);

  let newText = currentValue;
  let newCursorStart = start;
  let newCursorEnd = end;

  const isWA = channel === "whatsapp";

  switch (action) {
    case "bold": {
      const wrapChar = isWA ? "*" : "**";
      const wrapLen = wrapChar.length;

      if (selectedText) {
        if (selectedText.startsWith(wrapChar) && selectedText.endsWith(wrapChar) && selectedText.length >= wrapLen * 2) {
          const unwrapped = selectedText.slice(wrapLen, -wrapLen);
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `${wrapChar}${selectedText}${wrapChar}`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + wrapLen;
          newCursorEnd = end + wrapLen;
        }
      } else {
        const placeholder = `${wrapChar}teks tebal${wrapChar}`;
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start + wrapLen;
        newCursorEnd = start + wrapLen + 10;
      }
      break;
    }

    case "italic": {
      const wrapChar = isWA ? "_" : "*";

      if (selectedText) {
        if (selectedText.startsWith(wrapChar) && selectedText.endsWith(wrapChar) && selectedText.length >= 2) {
          const unwrapped = selectedText.slice(1, -1);
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `${wrapChar}${selectedText}${wrapChar}`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + 1;
          newCursorEnd = end + 1;
        }
      } else {
        const placeholder = `${wrapChar}teks miring${wrapChar}`;
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = start + 12;
      }
      break;
    }

    case "underline": {
      if (selectedText) {
        if (selectedText.startsWith("<u>") && selectedText.endsWith("</u>") && selectedText.length >= 7) {
          const unwrapped = selectedText.slice(3, -4);
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `<u>${selectedText}</u>`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + 3;
          newCursorEnd = end + 3;
        }
      } else {
        const placeholder = "<u>teks bergaris bawah</u>";
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start + 3;
        newCursorEnd = start + 22;
      }
      break;
    }

    case "strikethrough": {
      if (selectedText) {
        if (selectedText.startsWith("~") && selectedText.endsWith("~") && selectedText.length >= 2) {
          const unwrapped = selectedText.slice(1, -1);
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `~${selectedText}~`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + 1;
          newCursorEnd = end + 1;
        }
      } else {
        const placeholder = "~teks dicoret~";
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = start + 13;
      }
      break;
    }

    case "code": {
      const wrapChar = "```";
      if (selectedText) {
        if (selectedText.startsWith(wrapChar) && selectedText.endsWith(wrapChar) && selectedText.length >= 6) {
          const unwrapped = selectedText.slice(3, -3);
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `${wrapChar}${selectedText}${wrapChar}`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + 3;
          newCursorEnd = end + 3;
        }
      } else {
        const placeholder = "```kode monospace```";
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start + 3;
        newCursorEnd = start + 17;
      }
      break;
    }

    case "h1": {
      const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = currentValue.indexOf("\n", start);
      const effectiveLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
      const currentLine = currentValue.substring(lineStart, effectiveLineEnd);

      let updatedLine = currentLine;
      if (currentLine.startsWith("# ")) {
        updatedLine = currentLine.replace(/^#\s*/, "");
      } else if (currentLine.startsWith("## ")) {
        updatedLine = currentLine.replace(/^##\s*/, "# ");
      } else {
        updatedLine = `# ${currentLine}`;
      }

      newText = currentValue.substring(0, lineStart) + updatedLine + currentValue.substring(effectiveLineEnd);
      newCursorStart = lineStart + updatedLine.length;
      newCursorEnd = newCursorStart;
      break;
    }

    case "h2": {
      const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = currentValue.indexOf("\n", start);
      const effectiveLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
      const currentLine = currentValue.substring(lineStart, effectiveLineEnd);

      let updatedLine = currentLine;
      if (currentLine.startsWith("## ")) {
        updatedLine = currentLine.replace(/^##\s*/, "");
      } else if (currentLine.startsWith("# ")) {
        updatedLine = currentLine.replace(/^#\s*/, "## ");
      } else {
        updatedLine = `## ${currentLine}`;
      }

      newText = currentValue.substring(0, lineStart) + updatedLine + currentValue.substring(effectiveLineEnd);
      newCursorStart = lineStart + updatedLine.length;
      newCursorEnd = newCursorStart;
      break;
    }

    case "bullet": {
      const lineStart = currentValue.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = currentValue.indexOf("\n", start);
      const effectiveLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
      const currentLine = currentValue.substring(lineStart, effectiveLineEnd);

      let updatedLine = currentLine;
      if (currentLine.startsWith("• ")) {
        updatedLine = currentLine.replace(/^•\s*/, "");
      } else {
        updatedLine = `• ${currentLine}`;
      }

      newText = currentValue.substring(0, lineStart) + updatedLine + currentValue.substring(effectiveLineEnd);
      newCursorStart = lineStart + updatedLine.length;
      newCursorEnd = newCursorStart;
      break;
    }

    case "link": {
      const defaultUrl = "https://";
      const enteredUrl = window.prompt("Masukkan URL tautan (contoh: https://tokoonline.com):", defaultUrl);
      if (!enteredUrl) return currentValue;

      if (selectedText) {
        const linkSnippet = `[${selectedText}](${enteredUrl})`;
        newText = currentValue.substring(0, start) + linkSnippet + currentValue.substring(end);
        newCursorStart = start;
        newCursorEnd = start + linkSnippet.length;
      } else {
        const linkSnippet = `[tautan web](${enteredUrl})`;
        newText = currentValue.substring(0, start) + linkSnippet + currentValue.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = start + 11;
      }
      break;
    }
  }

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorStart, newCursorEnd);
  }, 0);

  return newText;
}

/**
 * Inserts a tag (e.g. {{first_name}}) at cursor position
 */
export function insertTagAtCursor(
  targetElement: HTMLTextAreaElement | HTMLInputElement | null,
  currentValue: string,
  tag: string
): string {
  const formattedTag = tag.startsWith("{{") ? tag : `{{${tag}}}`;

  if (!targetElement) {
    return currentValue ? `${currentValue} ${formattedTag}` : formattedTag;
  }

  const start = targetElement.selectionStart ?? currentValue.length;
  const end = targetElement.selectionEnd ?? currentValue.length;

  const newValue =
    currentValue.substring(0, start) +
    formattedTag +
    currentValue.substring(end);

  setTimeout(() => {
    targetElement.focus();
    const newCursor = start + formattedTag.length;
    targetElement.setSelectionRange(newCursor, newCursor);
  }, 0);

  return newValue;
}

/**
 * Inserts custom HTML snippet at cursor position in text editor
 */
export function insertHtmlSnippetAtCursor(
  textarea: HTMLTextAreaElement | null,
  currentValue: string,
  snippet: string
): string {
  if (!textarea) {
    return currentValue ? `${currentValue}\n\n${snippet}` : snippet;
  }

  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;

  const newValue =
    currentValue.substring(0, start) +
    snippet +
    currentValue.substring(end);

  setTimeout(() => {
    textarea.focus();
    const newCursor = start + snippet.length;
    textarea.setSelectionRange(newCursor, newCursor);
  }, 0);

  return newValue;
}

/**
 * High-fidelity Inline Parser for Email & Markdown: bold, italic, underline, links
 */
export function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const pattern = /(\[.*?\]\(.*?\)|\<u\>.*?\<\/u\>|\*\*.*?\*\*|\*[^*\n]+?\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return React.createElement(
        "a",
        {
          key: index,
          href: linkMatch[2],
          target: "_blank",
          rel: "noreferrer",
          className: "text-indigo-600 hover:text-indigo-800 underline font-semibold transition",
        },
        parseInlineFormatting(linkMatch[1])
      );
    }

    const underlineMatch = part.match(/^\<u\>(.*?)\<\/u\>$/);
    if (underlineMatch) {
      return React.createElement(
        "u",
        {
          key: index,
          className: "underline decoration-slate-800 underline-offset-2",
        },
        parseInlineFormatting(underlineMatch[1])
      );
    }

    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return React.createElement(
        "strong",
        {
          key: index,
          className: "font-bold text-slate-900",
        },
        parseInlineFormatting(boldMatch[1])
      );
    }

    const italicMatch = part.match(/^\*(.*?)\*$/);
    if (italicMatch && !part.startsWith("**")) {
      return React.createElement(
        "em",
        {
          key: index,
          className: "italic text-slate-800",
        },
        parseInlineFormatting(italicMatch[1])
      );
    }

    return React.createElement("span", { key: index }, part);
  });
}

/**
 * WhatsApp Markdown Parser (*bold*, _italic_, ~strike~, ```code```)
 */
export function parseWhatsAppFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const pattern = /(```[\s\S]*?```|\*[^*\n]+?\*|_[^_\n]+?_|~[^~\n]+?~)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("```") && part.endsWith("```") && part.length >= 6) {
      const codeContent = part.slice(3, -3);
      return React.createElement(
        "code",
        {
          key: index,
          className: "font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]",
        },
        codeContent
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const boldContent = part.slice(1, -1);
      return React.createElement(
        "strong",
        {
          key: index,
          className: "font-bold text-slate-900",
        },
        parseWhatsAppFormatting(boldContent)
      );
    }

    if (part.startsWith("_") && part.endsWith("_") && part.length >= 2) {
      const italicContent = part.slice(1, -1);
      return React.createElement(
        "em",
        {
          key: index,
          className: "italic text-slate-800",
        },
        parseWhatsAppFormatting(italicContent)
      );
    }

    if (part.startsWith("~") && part.endsWith("~") && part.length >= 2) {
      const strikeContent = part.slice(1, -1);
      return React.createElement(
        "del",
        {
          key: index,
          className: "line-through text-slate-500",
        },
        parseWhatsAppFormatting(strikeContent)
      );
    }

    return React.createElement("span", { key: index }, part);
  });
}

/**
 * Mailchimp-Grade HTML Email Compiler
 * Realistic, clean, email client-ready without artificial cards or tacky mockups.
 */
export function compileTemplateToEmailHtml({
  subject,
  preheader,
  content,
  orgName = "Acme Corp",
  senderEmail = "hello@acmecorp.co",
  recipient = SAMPLE_RECIPIENTS[0],
  brandColor = "#4F46E5",
  // Custom Logo Props
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
}: {
  subject: string;
  preheader?: string;
  content: string;
  orgName?: string;
  senderEmail?: string;
  recipient?: RecipientPreview;
  brandColor?: string;
  enableLogo?: boolean;
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: "left" | "center" | "right";
  enableCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
  enableSocial?: boolean;
  websiteUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  footerAddress?: string;
}): string {
  const compiledSubj = interpolateMergeTags(subject || "", recipient, orgName);
  const compiledPreheader = preheader ? interpolateMergeTags(preheader, recipient, orgName) : "";

  const logoHtml =
    enableLogo && logoUrl
      ? `<div style="text-align: ${logoAlign}; margin-bottom: 24px;"><img src="${logoUrl}" alt="${orgName}" style="max-width: ${logoWidth}px; height: auto; display: inline-block;" /></div>`
      : "";

  // If content is empty
  if (!content || !content.trim()) {
    return "";
  }

  // 1. If content is already complete HTML document
  if (content.trim().toLowerCase().startsWith("<!doctype") || content.trim().toLowerCase().startsWith("<html")) {
    return interpolateMergeTags(content, recipient, orgName);
  }

  // 2. If content is raw HTML fragment
  if (isRawHtml(content)) {
    const interpolatedBody = interpolateMergeTags(content, recipient, orgName);
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${compiledSubj}</title>
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  ${compiledPreheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f8fafc;">${compiledPreheader}</div>` : ""}
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    ${logoHtml}
    ${interpolatedBody}
  </div>
</body>
</html>`;
  }

  // 3. If content is plain text / markdown: convert cleanly
  const compiledContent = interpolateMergeTags(content, recipient, orgName);

  const inlineToHtml = (str: string): string => {
    return str
      .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" style="color: ${brandColor}; text-decoration: underline; font-weight: 600;">$1</a>`)
      .replace(/\<u\>(.*?)\<\/u\>/g, `<u>$1</u>`)
      .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; color: #0f172a;">$1</strong>`)
      .replace(/\*(.*?)\*/g, `<em style="font-style: italic;">$1</em>`);
  };

  const lines = compiledContent.split("\n");
  const bodyHtmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed === "---") {
      if (inList) {
        bodyHtmlParts.push(`</ul>`);
        inList = false;
      }
      bodyHtmlParts.push(`<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      if (inList) {
        bodyHtmlParts.push(`</ul>`);
        inList = false;
      }
      bodyHtmlParts.push(
        `<h1 style="margin: 20px 0 10px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">${inlineToHtml(trimmed.slice(2))}</h1>`
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (inList) {
        bodyHtmlParts.push(`</ul>`);
        inList = false;
      }
      bodyHtmlParts.push(
        `<h2 style="margin: 16px 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b; line-height: 1.4;">${inlineToHtml(trimmed.slice(3))}</h2>`
      );
      continue;
    }

    if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      if (!inList) {
        bodyHtmlParts.push(`<ul style="margin: 8px 0 16px 20px; padding: 0; color: #334155; line-height: 1.6; font-size: 14px;">`);
        inList = true;
      }
      const itemText = trimmed.replace(/^[•-]\s*/, "");
      bodyHtmlParts.push(`<li style="margin-bottom: 6px;">${inlineToHtml(itemText)}</li>`);
      continue;
    }

    if (inList) {
      bodyHtmlParts.push(`</ul>`);
      inList = false;
    }

    if (!trimmed) {
      bodyHtmlParts.push(`<div style="height: 12px;"></div>`);
    } else {
      bodyHtmlParts.push(
        `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${inlineToHtml(trimmed)}</p>`
      );
    }
  }

  if (inList) {
    bodyHtmlParts.push(`</ul>`);
  }

  const emailBodyHtml = bodyHtmlParts.join("\n");

  const ctaButtonHtml = enableCta
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: ${ctaColor};">
                <a href="${ctaUrl}" target="_blank" style="font-size: 14px; font-family: inherit; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    : "";

  const socialLinksHtml = enableSocial
    ? `
    <div style="margin: 20px 0 10px; text-align: center;">
      ${websiteUrl ? `<a href="${websiteUrl}" target="_blank" style="color: #64748b; margin: 0 8px; font-size: 12px; font-weight: 600; text-decoration: none;">Website</a>` : ""}
      ${instagramUrl ? `<a href="${instagramUrl}" target="_blank" style="color: #64748b; margin: 0 8px; font-size: 12px; font-weight: 600; text-decoration: none;">Instagram</a>` : ""}
      ${whatsappUrl ? `<a href="${whatsappUrl}" target="_blank" style="color: #64748b; margin: 0 8px; font-size: 12px; font-weight: 600; text-decoration: none;">WhatsApp</a>` : ""}
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${compiledSubj}</title>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  ${compiledPreheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f8fafc;">${compiledPreheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 32px 32px 20px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${logoHtml}
              ${emailBodyHtml}
              ${ctaButtonHtml}
            </td>
          </tr>
          ${
            enableSocial || footerAddress
              ? `<tr>
            <td style="padding: 20px 32px 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
              ${socialLinksHtml}
              ${footerAddress ? `<p style="margin: 6px 0 4px 0;">${footerAddress}</p>` : ""}
              <p style="margin: 0;">Dikirim oleh <strong>${orgName}</strong> &lt;${senderEmail}&gt; • <a href="#unsubscribe" style="color: #64748b; text-decoration: underline;">Berhenti berlangganan</a></p>
            </td>
          </tr>`
              : ""
          }
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface ExtractedTextBlock {
  id: string;
  tag: string;
  label: string;
  text: string;
}

/**
 * Extracts visible text strings (headings, paragraphs, button labels, list items) from HTML email
 * so users can edit text directly in visual/form mode without dealing with raw HTML tags.
 */
export function extractTextBlocksFromHtml(html: string): ExtractedTextBlock[] {
  if (!html || typeof window === "undefined") return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const ignoreTags = new Set([
      "SCRIPT",
      "STYLE",
      "NOSCRIPT",
      "TEMPLATE",
      "XML",
      "META",
      "HEAD",
      "TITLE",
    ]);

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ignoreTags.has(parent.tagName.toUpperCase())) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const results: ExtractedTextBlock[] = [];
    const seenTexts = new Set<string>();
    let node: Node | null;
    let index = 0;

    while ((node = walker.nextNode())) {
      const rawText = (node.nodeValue || "").trim();
      if (!rawText || rawText.length < 2) continue;
      // Filter out conditional comments or XML fragments
      if (rawText.startsWith("<!--") || rawText.endsWith("-->")) continue;
      if (rawText.startsWith("<![endif]") || rawText.startsWith("<!--[if") || rawText.includes("mso-")) continue;
      if (rawText.startsWith("<") && rawText.endsWith(">")) continue;
      if (seenTexts.has(rawText)) continue;

      seenTexts.add(rawText);

      const parentTag = (node.parentElement?.tagName || "div").toLowerCase();
      let label = "Teks";
      if (parentTag === "h1") label = "Judul Utama (H1)";
      else if (parentTag === "h2") label = "Subjudul (H2)";
      else if (parentTag === "h3" || parentTag === "h4") label = "Judul Bagian";
      else if (parentTag === "a" || parentTag === "button") label = "Tombol / Tautan";
      else if (parentTag === "p") label = "Paragraf";
      else if (parentTag === "li") label = "Poin Daftar";
      else if (parentTag === "strong" || parentTag === "b") label = "Teks Tebal";
      else if (parentTag === "center") label = "Teks Tombol / Judul";

      results.push({
        id: `txt-${index++}-${parentTag}`,
        tag: parentTag,
        label,
        text: rawText,
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Replaces a specific text occurrence in the HTML document
 */
export function replaceTextInHtml(
  html: string,
  targetText: string,
  newText: string
): string {
  if (!html || !targetText || targetText === newText) return html;
  return html.split(targetText).join(newText);
}

