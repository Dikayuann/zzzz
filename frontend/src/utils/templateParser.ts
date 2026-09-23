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

export const DEFAULT_TEMPLATE_CONTENT = `Hi {{first_name}},

We have some exciting news to share with you this month. Our team has been working hard to bring you new features and improvements that we think you'll love.

Here's what's new:
• **Feature one** — improved performance and reliability
• **Feature two** — new dashboard with better insights
• **Feature three** — easier contact management

We hope these updates make your experience even better. As always, feel free to reach out if you have any questions.

Best regards,
The {{org_name}} Team

---
You received this email because you're subscribed to our newsletter updates. If you no longer wish to receive these emails, you can unsubscribe at {{unsubscribe_link}}.`;

export const DEFAULT_SUBJECT = "Your monthly update is here 📩";

export const DEFAULT_PREHEADER = "Simak fitur terbaru, ringkasan performa dashboard, dan peningkatan layanan kami bulan ini.";

export const DEFAULT_WA_CONTENT = `Halo kak *{{first_name}}*, salam hangat dari *{{org_name}}*! 👋

Kami ingin menginformasikan bahwa ada pembaruan fitur eksklusif untuk akun Anda:
• *Peningkatan Kecepatan*: Pengiriman pesan kini 2x lebih cepat
• *Laporan Analitik Real-time*: Pantau CTR dan konversi langsung
• *Dukungan Multi-Channel*: Integrasi Email, WhatsApp & Telegram

Jika ada pertanyaan atau butuh panduan, silakan balas chat ini ya kak!

Terima kasih,
_Tim {{org_name}}_`;

/**
 * Replace merge tags in text with actual recipient / organization data
 */
export function interpolateMergeTags(
  text: string,
  recipient: RecipientPreview,
  orgName: string = "Acme Corp"
): string {
  if (!text) return "";

  const replacements: Record<string, string> = {
    first_name: recipient.firstName,
    last_name: recipient.lastName,
    nama: recipient.name,
    name: recipient.name,
    email: recipient.email,
    phone: recipient.phone,
    telepon: recipient.phone,
    company: recipient.company,
    perusahaan: recipient.company,
    org_name: orgName,
    unsubscribe_link: "#unsubscribe",
  };

  return text.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, tagKey) => {
    const key = tagKey.toLowerCase();
    return replacements[key] !== undefined ? replacements[key] : match;
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
      // WhatsApp strikethrough (~text~)
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
      // WhatsApp monospace (```text```)
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
      const lineEnd = currentValue.indexOf("\n", end === start ? start : end - 1);
      const effectiveLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
      const chunk = currentValue.substring(lineStart, effectiveLineEnd);
      const lines = chunk.split("\n");

      const allBulleted = lines.every((l) => l.trim().startsWith("• ") || l.trim().startsWith("- "));
      const modifiedLines = lines.map((l) => {
        if (allBulleted) {
          return l.replace(/^[•-]\s*/, "");
        }
        return l.trim() ? `• ${l.replace(/^[•-]\s*/, "")}` : l;
      });

      const updatedChunk = modifiedLines.join("\n");
      newText = currentValue.substring(0, lineStart) + updatedChunk + currentValue.substring(effectiveLineEnd);
      newCursorStart = lineStart;
      newCursorEnd = lineStart + updatedChunk.length;
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
  textarea: HTMLTextAreaElement | null,
  currentValue: string,
  tag: string
): string {
  const formattedTag = tag.startsWith("{{") ? tag : `{{${tag}}}`;

  if (!textarea) {
    return currentValue ? `${currentValue} ${formattedTag}` : formattedTag;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newValue =
    currentValue.substring(0, start) +
    formattedTag +
    currentValue.substring(end);

  setTimeout(() => {
    textarea.focus();
    const newCursor = start + formattedTag.length;
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

    // 1. Link [text](url)
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

    // 2. Underline <u>text</u>
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

    // 3. Bold **text**
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

    // 4. Italic *text*
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

    // Plain text
    return React.createElement("span", { key: index }, part);
  });
}

/**
 * WhatsApp Markdown Parser (*bold*, _italic_, ~strike~, ```code```)
 */
export function parseWhatsAppFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Regex matches: ```code```, *bold*, _italic_, ~strike~
  const pattern = /(```[\s\S]*?```|\*[^*\n]+?\*|_[^_\n]+?_|~[^~\n]+?~)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Monospace ```code```
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

    // Bold *text*
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

    // Italic _text_
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

    // Strikethrough ~text~
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
 * Includes Brand Bar, Preheader, Formatted Body, Bulletproof CTA Button, and Social Icons Footer
 */
export function compileTemplateToEmailHtml({
  subject,
  preheader,
  content,
  orgName = "Acme Corp",
  senderEmail = "hello@acmecorp.co",
  recipient = SAMPLE_RECIPIENTS[0],
  brandColor = "#4F46E5",
  enableCta = false,
  ctaText = "Klaim Voucher Sekarang 🚀",
  ctaUrl = "https://tokoonline.com/promo",
  ctaColor = "#4F46E5",
  enableSocial = true,
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
  const compiledSubj = interpolateMergeTags(subject, recipient, orgName);
  const compiledContent = interpolateMergeTags(content, recipient, orgName);
  const compiledPreheader = preheader ? interpolateMergeTags(preheader, recipient, orgName) : "";

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
        `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${inlineToHtml(trimmed)}</p>`
      );
    }
  }

  if (inList) {
    bodyHtmlParts.push(`</ul>`);
  }

  const emailBodyHtml = bodyHtmlParts.join("\n");

  // Mailchimp Bulletproof CTA Button HTML
  const ctaButtonHtml = enableCta
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 9999px; background-color: ${ctaColor};">
                <a href="${ctaUrl}" target="_blank" style="font-size: 14px; font-family: inherit; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    : "";

  // Social Links Bar
  const socialLinksHtml = enableSocial
    ? `
    <div style="margin: 16px 0; text-align: center;">
      ${websiteUrl ? `<a href="${websiteUrl}" target="_blank" style="color: #64748b; margin: 0 10px; font-size: 12px; font-weight: 600; text-decoration: none;">🌐 Website</a>` : ""}
      ${instagramUrl ? `<a href="${instagramUrl}" target="_blank" style="color: #64748b; margin: 0 10px; font-size: 12px; font-weight: 600; text-decoration: none;">📸 Instagram</a>` : ""}
      ${whatsappUrl ? `<a href="${whatsappUrl}" target="_blank" style="color: #64748b; margin: 0 10px; font-size: 12px; font-weight: 600; text-decoration: none;">💬 WhatsApp</a>` : ""}
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${compiledSubj}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${compiledPreheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${compiledPreheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Brand Bar -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <span style="background-color: ${brandColor}; color: #ffffff; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
                ${orgName.toUpperCase()}
              </span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${emailBodyHtml}
              ${ctaButtonHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              ${socialLinksHtml}
              <p style="margin: 8px 0 4px 0; font-size: 11px; color: #94a3b8;">
                ${footerAddress}
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Email ini dikirim oleh <strong>${orgName}</strong> &lt;${senderEmail}&gt;. Jika Anda ingin berhenti berlangganan, silakan <a href="#unsubscribe" style="color: #64748b; text-decoration: underline;">Klik di Sini</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
