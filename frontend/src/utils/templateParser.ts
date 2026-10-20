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

  const interpolateKey = (rawKey: string): string => {
    const key = rawKey.trim().toLowerCase();
    if (replacements[key] !== undefined) {
      return replacements[key];
    }
    // Clean fallback for custom tags
    const readable = key.replace(/_/g, " ");
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  };

  // 1. Double curly brackets: {{ tag_name }}
  let result = text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, tagKey) => interpolateKey(tagKey));

  // 2. Square brackets: [ tag_name ] (e.g. [nama], [first_name], [kode_promo])
  result = result.replace(/\[\s*([a-zA-Z0-9_-]+)\s*\]/g, (match, tagKey) => {
    const key = tagKey.trim().toLowerCase();
    if (replacements[key] !== undefined) {
      return replacements[key];
    }
    return match; // don't touch markdown links or non-matching brackets
  });

  // 3. Single curly brackets: { tag_name } (e.g. {nama}, {first_name})
  result = result.replace(/\{\s*([a-zA-Z0-9_-]+)\s*\}/g, (match, tagKey) => {
    const key = tagKey.trim().toLowerCase();
    if (replacements[key] !== undefined) {
      return replacements[key];
    }
    return match;
  });

  return result;
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

  const isMessaging = channel === "whatsapp" || channel === "telegram";

  switch (action) {
    case "bold": {
      const wrapChar = isMessaging ? "*" : "**";
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
      const wrapChar = isMessaging ? "_" : "*";

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

    case "bracket": {
      if (selectedText) {
        if (
          (selectedText.startsWith("{{") && selectedText.endsWith("}}") && selectedText.length >= 4) ||
          (selectedText.startsWith("[") && selectedText.endsWith("]") && selectedText.length >= 2)
        ) {
          const unwrapped = selectedText.startsWith("{{")
            ? selectedText.slice(2, -2).trim()
            : selectedText.slice(1, -1).trim();
          newText = currentValue.substring(0, start) + unwrapped + currentValue.substring(end);
          newCursorStart = start;
          newCursorEnd = start + unwrapped.length;
        } else {
          const wrapped = `{{${selectedText}}}`;
          newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
          newCursorStart = start + 2;
          newCursorEnd = end + 2;
        }
      } else {
        const placeholder = "{{nama}}";
        newText = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
        newCursorStart = start;
        newCursorEnd = start + placeholder.length;
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

  const pattern = /(```[\s\S]*?```|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_|~[^~\n]+?~)/g;
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

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return React.createElement(
        "strong",
        {
          key: index,
          className: "font-bold text-slate-900",
        },
        parseWhatsAppFormatting(boldContent)
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
  footerAddress = "",
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
  if (isFullHtmlDoc(content)) {
    const interpolated = interpolateMergeTags(content, recipient, orgName);
    if (interpolated.includes("</head>")) {
      const guardStyle = `<style id="__preview_guard__">
        img { max-width: 100% !important; height: auto !important; }
        table { border-collapse: collapse; }
      </style></head>`;
      return interpolated.replace("</head>", guardStyle);
    }
    return interpolated;
  }

  // 2. If content is raw HTML fragment (e.g. from Canva, Stripo, or custom HTML blocks)
  if (isRawHtml(content)) {
    const interpolatedBody = interpolateMergeTags(content, recipient, orgName);
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${compiledSubj}</title>
  <style>
    html, body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; max-width: 100% !important; }
    table { border-collapse: collapse; }
    div { box-sizing: border-box; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  ${compiledPreheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f8fafc;">${compiledPreheader}</div>` : ""}
  <div style="max-width: 600px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 0;">
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
            enableSocial
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
  index: number;
  tag: string;
  contextTag?: string;
  label: string;
  text: string;
  hasMergeTags?: boolean;
}

interface CohesiveTextNode {
  node: Node;
  originalText: string;
}

export interface CohesiveBlock extends ExtractedTextBlock {
  nodes: CohesiveTextNode[];
}

function getNextNodeInTree(node: Node, stopRoot: Node | null): Node | null {
  if (node.firstChild) {
    return node.firstChild;
  }
  let curr: Node | null = node;
  while (curr) {
    if (curr === stopRoot) return null;
    if (curr.nextSibling) {
      return curr.nextSibling;
    }
    curr = curr.parentNode;
  }
  return null;
}

/**
 * Returns true if there is a block or line boundary between nodeA and nodeB
 * (different block container, or <br>, <hr>, <div>, etc. between them)
 */
function hasBoundaryBetween(nodeA: Node, nodeB: Node): boolean {
  // 1. If closest block containers differ, they are in different paragraphs/cells
  const containerA = nodeA.parentElement?.closest("td, th, p, h1, h2, h3, h4, h5, h6, li, blockquote, div");
  const containerB = nodeB.parentElement?.closest("td, th, p, h1, h2, h3, h4, h5, h6, li, blockquote, div");
  if (containerA !== containerB) {
    return true;
  }

  // 2. If in the same container, check if any boundary tag (<br>, <hr>, <div>, <p>, <table>, <img>) appears between them
  let curr: Node | null = nodeA;
  const commonRoot = containerA || nodeA.ownerDocument?.body || null;

  while (curr && curr !== nodeB) {
    if (curr !== nodeA && curr.nodeType === Node.ELEMENT_NODE) {
      const tag = (curr as Element).tagName.toUpperCase();
      if (["BR", "HR", "DIV", "P", "TABLE", "TR", "TD", "TH", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "IMG"].includes(tag)) {
        return true;
      }
    }
    curr = getNextNodeInTree(curr, commonRoot);
  }

  return false;
}

/**
 * Walks all valid text nodes in document order, then groups adjacent inline text nodes
 * that belong to the same sentence/paragraph (no <br>, <p>, <div>, <td> boundaries between them).
 */
export function extractCohesiveBlocksFromDoc(doc: Document): CohesiveBlock[] {
  const ignoreTags = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEMPLATE",
    "XML",
    "META",
    "HEAD",
    "TITLE",
    "SVG",
    "PATH",
  ]);

  const walker = doc.createTreeWalker(doc.body || doc.documentElement, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ignoreTags.has(parent.tagName.toUpperCase())) return NodeFilter.FILTER_REJECT;
      const val = (node.nodeValue || "").trim();
      if (!val) return NodeFilter.FILTER_REJECT;
      if (val.startsWith("<!--") || val.endsWith("-->")) return NodeFilter.FILTER_REJECT;
      if (val.startsWith("<![endif]") || val.startsWith("<!--[if") || val.includes("mso-")) return NodeFilter.FILTER_REJECT;
      if (val.startsWith("<") && val.endsWith(">")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const rawNodes: Node[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    rawNodes.push(n);
  }

  if (rawNodes.length === 0) return [];

  // Group adjacent inline text nodes that belong to the same cohesive block
  const groups: Node[][] = [];
  let currentGroup: Node[] = [rawNodes[0]];

  for (let i = 1; i < rawNodes.length; i++) {
    const prevNode = rawNodes[i - 1];
    const currNode = rawNodes[i];

    if (hasBoundaryBetween(prevNode, currNode)) {
      groups.push(currentGroup);
      currentGroup = [currNode];
    } else {
      currentGroup.push(currNode);
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups.map((group, index) => {
    let combinedText = "";
    group.forEach((node, idx) => {
      const val = (node.nodeValue || "").trim();
      if (!val) return;
      if (idx === 0) {
        combinedText = val;
      } else {
        const needsSpace =
          !combinedText.endsWith(" ") &&
          !val.startsWith(" ") &&
          !/^[.,!?;:)\]]/.test(val) &&
          !/[(\[]$/.test(combinedText);
        combinedText += (needsSpace ? " " : "") + val;
      }
    });

    const firstNode = group[0];
    const parentEl = firstNode.parentElement;
    const immediateTag = (parentEl?.tagName || "span").toLowerCase();
    const containerEl = parentEl?.closest("h1, h2, h3, h4, h5, h6, a, button, p, li, th, td, blockquote");
    const containerTag = containerEl?.tagName.toLowerCase() || immediateTag;

    let label = "Teks";
    if (containerTag === "h1") label = "Judul Utama (H1)";
    else if (containerTag === "h2") label = "Subjudul (H2)";
    else if (containerTag === "h3" || containerTag === "h4") label = "Judul Bagian";
    else if (containerTag === "a" || containerTag === "button") label = "Tombol / Tautan";
    else if (containerTag === "p") label = "Paragraf";
    else if (containerTag === "li") label = "Poin Daftar";
    else if (containerTag === "th" || containerTag === "td") {
      if (combinedText.length <= 40 && !combinedText.includes(".")) {
        label = "Judul / Teks Singkat";
      } else {
        label = "Kolom / Tabel";
      }
    }

    const hasMergeTags = /\{\{[^}]+\}\}/.test(combinedText);

    return {
      id: `txt-${index}-${immediateTag}`,
      index,
      tag: immediateTag,
      contextTag: containerTag !== immediateTag ? containerTag : undefined,
      label,
      text: combinedText,
      hasMergeTags,
      nodes: group.map((node) => ({
        node,
        originalText: (node.nodeValue || "").trim(),
      })),
    };
  });
}

/**
 * Updates a cohesive block in a DOM document by index
 */
export function updateCohesiveBlockInDoc(doc: Document, targetIndex: number, newText: string): boolean {
  const blocks = extractCohesiveBlocksFromDoc(doc);
  const block = blocks[targetIndex];
  if (!block || block.nodes.length === 0) return false;

  if (block.nodes.length === 1) {
    block.nodes[0].node.nodeValue = newText;
    return true;
  }

  // Multiple nodes in paragraph (e.g. text + bold + text)
  const boldNode = block.nodes.find((n) => {
    const pTag = n.node.parentElement?.tagName.toUpperCase();
    return pTag === "STRONG" || pTag === "B";
  });

  if (boldNode && boldNode.originalText && newText.includes(boldNode.originalText)) {
    const parts = newText.split(boldNode.originalText);
    const prefix = parts[0] || "";
    const suffix = parts.slice(1).join(boldNode.originalText) || "";

    block.nodes[0].node.nodeValue = prefix;
    boldNode.node.nodeValue = boldNode.originalText;
    block.nodes[block.nodes.length - 1].node.nodeValue = suffix;

    for (let i = 1; i < block.nodes.length - 1; i++) {
      if (block.nodes[i] !== boldNode) {
        block.nodes[i].node.nodeValue = "";
      }
    }
  } else {
    block.nodes[0].node.nodeValue = newText;
    for (let i = 1; i < block.nodes.length; i++) {
      block.nodes[i].node.nodeValue = "";
    }
  }

  return true;
}

/**
 * Extracts visible cohesive text blocks from HTML email
 */
export function extractTextBlocksFromHtml(html: string): ExtractedTextBlock[] {
  if (!html || typeof window === "undefined") return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks = extractCohesiveBlocksFromDoc(doc);
    return blocks.map(({ nodes, ...rest }) => rest);
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

/**
 * Deterministically updates the entire text of a cohesive text block by its exact ordinal index
 */
export function updateTextBlockByIndex(
  html: string,
  targetIndex: number,
  newText: string
): string {
  if (!html || targetIndex < 0) return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const updated = updateCohesiveBlockInDoc(doc, targetIndex, newText);
    if (!updated) return html;

    if (isFullHtmlDoc(html)) {
      const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : "<!DOCTYPE html>\n";
      return doctype + doc.documentElement.outerHTML;
    }
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Replaces a specific text block by index or text safely using DOMParser
 */
export function replaceTextBlockInHtml(
  html: string,
  blockIndex: number,
  oldText: string,
  newText: string
): string {
  if (!html) return html;
  if (blockIndex >= 0) {
    const result = updateTextBlockByIndex(html, blockIndex, newText);
    if (result !== html) return result;
  }
  if (!oldText || oldText === newText) return html;
  return html.split(oldText).join(newText);
}

/**
 * Detect if text content is a complete HTML document with html/head/body
 */
export function isFullHtmlDoc(html: string): boolean {
  if (!html) return false;
  const trimmed = html.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    (trimmed.includes("<body") && trimmed.includes("</body")) ||
    (trimmed.includes("<head") && trimmed.includes("</head"))
  );
}

export const EDITOR_HELPER_STYLE_ID = "__campaign_editor_style__";

export function getEditorHelperCss(): string {
  return `
    html, body {
      scroll-behavior: auto !important;
    }
    body {
      min-height: 420px;
      outline: none;
    }
    [contenteditable="true"] *:hover {
      outline: 1.5px dashed #94a3b8 !important;
      outline-offset: 2px;
      cursor: text;
    }
    [contenteditable="true"] *:focus {
      outline: 1.5px solid #0f172a !important;
      outline-offset: 2px;
    }
    a, [role="button"] {
      cursor: pointer !important;
    }
    a:hover {
      outline: 1.5px solid #2563eb !important;
      outline-offset: 2px !important;
    }
    img {
      cursor: pointer !important;
      transition: outline 0.15s ease-in-out;
    }
    img:hover {
      outline: 2px dashed #0284c7 !important;
      outline-offset: 2px !important;
    }
  `;
}

/**
 * Prepares HTML content for the in-place editable visual iframe.
 * Preserves the exact DOCTYPE, HEAD, STYLES, and BODY if it's already a full HTML document.
 */
export function prepareHtmlForVisualEditor(content: string): { fullHtml: string; isFullDoc: boolean } {
  if (!content || !content.trim()) {
    return {
      fullHtml: `<!DOCTYPE html><html><head><meta charset="utf-8"><style id="${EDITOR_HELPER_STYLE_ID}">${getEditorHelperCss()}</style></head><body contenteditable="true" data-cb-editor="true" style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 380px;"></body></html>`,
      isFullDoc: false,
    };
  }

  const isFullDoc = isFullHtmlDoc(content);

  if (isFullDoc) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      let head = doc.head;
      if (!head) {
        head = doc.createElement("head");
        doc.documentElement.insertBefore(head, doc.body);
      }

      let existingStyle = head.querySelector(`style#${EDITOR_HELPER_STYLE_ID}`);
      if (!existingStyle) {
        const styleEl = doc.createElement("style");
        styleEl.id = EDITOR_HELPER_STYLE_ID;
        styleEl.textContent = getEditorHelperCss();
        head.appendChild(styleEl);
      }

      if (doc.body) {
        doc.body.setAttribute("contenteditable", "true");
        doc.body.setAttribute("data-cb-editor", "true");
      }

      const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : "<!DOCTYPE html>\n";
      return {
        fullHtml: doctype + doc.documentElement.outerHTML,
        isFullDoc: true,
      };
    } catch {
      // Fallback
    }
  }

  return {
    fullHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style id="${EDITOR_HELPER_STYLE_ID}">
    ${getEditorHelperCss()}
  </style>
</head>
<body contenteditable="true" data-cb-editor="true" style="margin: 0; padding: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; outline: none; min-height: 380px;">
  ${content}
</body>
</html>`,
    isFullDoc: false,
  };
}

/**
 * Extracts clean, valid HTML from the visual editor iframe document.
 * Strips all temporary editor helper styles and attributes so the raw HTML code
 * is clean, unpolluted, and keeps its original structure intact.
 */
export function extractCleanHtmlFromVisualDoc(doc: Document, isFullDoc: boolean): string {
  if (!doc) return "";

  if (isFullDoc) {
    try {
      const clone = doc.documentElement.cloneNode(true) as HTMLElement;

      const helperStyle = clone.querySelector(`style#${EDITOR_HELPER_STYLE_ID}`);
      if (helperStyle && helperStyle.parentNode) {
        helperStyle.parentNode.removeChild(helperStyle);
      }

      const body = clone.querySelector("body");
      if (body) {
        body.removeAttribute("contenteditable");
        body.removeAttribute("data-cb-editor");
      }

      const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : "<!DOCTYPE html>\n";
      return doctype + clone.outerHTML;
    } catch {
      // Fallback
    }
  }

  if (doc.body) {
    const cloneBody = doc.body.cloneNode(true) as HTMLElement;
    cloneBody.removeAttribute("contenteditable");
    cloneBody.removeAttribute("data-cb-editor");
    return cloneBody.innerHTML;
  }

  return "";
}

/**
 * Automatically formats and indents HTML code with clean line breaks
 * Makes minified or single-line HTML (e.g. from Canva or Stripo) human-readable, beautifully structured, and easy to edit line-by-line!
 */
export function formatHtmlCode(html: string): string {
  if (!html || !html.trim()) return "";

  // 1. Separate conditional comments and doctypes onto their own lines
  let processed = html
    .replace(/(<!DOCTYPE[^>]*>)/gi, "$1\n")
    .replace(/(<!--\[if\b[\s\S]*?\](?:><!--)?>)/gi, "\n$1\n")
    .replace(/(<!\[endif\]-->)/gi, "\n$1\n")
    .replace(/(<br[^>]*>)/gi, "$1\n");

  // 2. Format embedded CSS blocks inside <style> tags
  processed = processed.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_match, attrs, cssContent) => {
    const cleanCss = cssContent
      .replace(/\s+/g, " ")
      .replace(/\{/g, " {\n  ")
      .replace(/;/g, ";\n  ")
      .replace(/\}/g, "\n}\n")
      .split("\n")
      .map((line: string) => line.trim())
      .filter(Boolean)
      .map((line: string) => {
        if (line.endsWith("{") || line === "}") return line;
        return "  " + line;
      })
      .join("\n");
    return `<style${attrs}>\n${cleanCss}\n</style>`;
  });

  // 3. Break lines between HTML tags
  processed = processed.replace(/>\s*</g, ">\n<");

  // 4. Compute clean indentation line-by-line
  const lines = processed.split("\n");
  let formatted = "";
  let indent = 0;
  const tab = "  ";
  const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check if the line begins with a closing tag e.g. </div... or </style>
    const isClosingAtStart = rawLine.match(/^<\/\s*([a-zA-Z0-9:-]+)/);
    if (isClosingAtStart) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + rawLine + "\n";

    // Check if this line opened tags that were not closed on the same line
    const isComment = rawLine.startsWith("<!--") || rawLine.endsWith("-->");
    const isDoctype = rawLine.startsWith("<!DOCTYPE") || rawLine.startsWith("<![");

    if (!isComment && !isDoctype) {
      const openMatches = rawLine.match(/<([a-zA-Z0-9:-]+)(?:[^>'"]*|".*?"|'.*?')*?>/g) || [];
      const closeMatches = rawLine.match(/<\/([a-zA-Z0-9:-]+)>/g) || [];

      let netOpens = 0;
      for (const tag of openMatches) {
        if (tag.startsWith("</") || tag.endsWith("/>") || tag.startsWith("<!")) continue;
        const tagNameMatch = tag.match(/<([a-zA-Z0-9:-]+)/);
        if (tagNameMatch) {
          const tName = tagNameMatch[1];
          if (!voidTags.test(tName)) {
            netOpens++;
          }
        }
      }
      netOpens -= closeMatches.length;

      if (!isClosingAtStart && netOpens > 0) {
        indent += netOpens;
      }
    }
  }

  return formatted.trim();
}




