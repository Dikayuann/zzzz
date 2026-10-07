import React from "react";
import {
  List,
  Link2,
  Undo2,
  Redo2,
  Strikethrough,
  Code,
  MousePointerClick,
  TicketPercent,
  Minus,
  Columns2,
  Image,
} from "lucide-react";
import type { ToolbarAction, TemplateChannel } from "@/types/template";
import { DEFAULT_GRAY_IMAGE_PLACEHOLDER } from "@/utils/htmlHighlighter";

interface TemplateEditorToolbarProps {
  onAction: (action: ToolbarAction) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  channel?: TemplateChannel;
  editorMode?: "visual" | "html";
  onInsertHtmlSnippet?: (snippet: string) => void;
}

export const TemplateEditorToolbar: React.FC<TemplateEditorToolbarProps> = ({
  onAction,
  canUndo = false,
  canRedo = false,
  channel = "email",
  editorMode = "visual",
  onInsertHtmlSnippet,
}) => {
  const isWA = channel === "whatsapp";
  const isHtml = editorMode === "html";

  // Common HTML Snippets for Email Marketing
  const handleInsertButton = () => {
    onInsertHtmlSnippet?.(
      `<div style="text-align: center; margin: 24px 0;">\n  <a href="{{cta_link}}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">\n    Klaim Penawaran Sekarang →\n  </a>\n</div>`
    );
  };

  const handleInsertCouponBox = () => {
    onInsertHtmlSnippet?.(
      `<div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">\n  <p style="font-size: 11px; font-weight: 600; color: #64748b; margin: 0 0 6px; text-transform: uppercase;">Gunakan Kode Voucher:</p>\n  <span style="font-family: monospace; font-size: 18px; font-weight: 700; color: #0f172a; background: #fff; padding: 6px 16px; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block;">{{kode_promo}}</span>\n  <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 0;">Berlaku hingga {{tanggal_kadaluarsa}}</p>\n</div>`
    );
  };

  const handleInsertDivider = () => {
    onInsertHtmlSnippet?.(
      `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`
    );
  };

  const handleInsertTwoColumns = () => {
    onInsertHtmlSnippet?.(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">\n  <tr>\n    <td width="48%" valign="top" style="background-color: #f8fafc; border-radius: 10px; padding: 16px;">\n      <h4 style="margin: 0 0 6px; font-size: 14px; font-weight: 700;">Fitur Utama A</h4>\n      <p style="margin: 0; font-size: 12px; color: #64748b;">Penjelasan singkat fitur pertama.</p>\n    </td>\n    <td width="4%"></td>\n    <td width="48%" valign="top" style="background-color: #f8fafc; border-radius: 10px; padding: 16px;">\n      <h4 style="margin: 0 0 6px; font-size: 14px; font-weight: 700;">Fitur Utama B</h4>\n      <p style="margin: 0; font-size: 12px; color: #64748b;">Penjelasan singkat fitur kedua.</p>\n    </td>\n  </tr>\n</table>`
    );
  };

  const handleInsertImage = () => {
    onInsertHtmlSnippet?.(
      `<div style="text-align: center; margin: 20px 0;">\n  <img src="${DEFAULT_GRAY_IMAGE_PLACEHOLDER}" alt="Placeholder Gambar" style="max-width: 100%; width: 440px; height: auto; border-radius: 10px; display: inline-block; border: 1.5px dashed #cbd5e1;" />\n</div>`
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/60 text-slate-700">
      {/* 1. History Controls: Undo & Redo */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => onAction("undo")}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            canUndo
              ? "hover:bg-slate-200/80 text-slate-700 cursor-pointer active:scale-95"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Urungkan (Undo) - Ctrl+Z"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={() => onAction("redo")}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
            canRedo
              ? "hover:bg-slate-200/80 text-slate-700 cursor-pointer active:scale-95"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title="Ulangi (Redo) - Ctrl+Y / Ctrl+Shift+Z"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* 2. MODE: HTML CODE MODE HELPERS */}
      {isHtml ? (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Snippet:
          </span>

          <button
            type="button"
            onClick={handleInsertButton}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-[11px] font-medium text-slate-700 transition cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
            title="Sisipkan Tombol CTA HTML"
          >
            <MousePointerClick className="h-3 w-3" />
            <span>Tombol CTA</span>
          </button>

          <button
            type="button"
            onClick={handleInsertCouponBox}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-[11px] font-medium text-slate-700 transition cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
            title="Sisipkan Kotak Kupon Promo HTML"
          >
            <TicketPercent className="h-3 w-3" />
            <span>Kupon</span>
          </button>

          <button
            type="button"
            onClick={handleInsertTwoColumns}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-[11px] font-medium text-slate-700 transition cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
            title="Sisipkan Tabel 2 Kolom"
          >
            <Columns2 className="h-3 w-3" />
            <span>2 Kolom</span>
          </button>

          <button
            type="button"
            onClick={handleInsertImage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-[11px] font-medium text-slate-700 transition cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
            title="Sisipkan Gambar / Banner"
          >
            <Image className="h-3 w-3" />
            <span>Gambar</span>
          </button>

          <button
            type="button"
            onClick={handleInsertDivider}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 text-[11px] font-medium text-slate-700 transition cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
            title="Sisipkan Garis Pembagi (Divider)"
          >
            <Minus className="h-3 w-3" />
            <span>Garis</span>
          </button>
        </div>
      ) : (
        /* 3. MODE: VISUAL / TEXT FORMATTING */
        <div className="flex items-center gap-1 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onClick={() => onAction("bold")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 font-bold text-xs transition cursor-pointer active:scale-95"
            title={isWA ? "Tebal WhatsApp (*teks*)" : "Tebal (Bold) - **teks**"}
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => onAction("italic")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 italic font-serif text-xs transition cursor-pointer active:scale-95"
            title={isWA ? "Miring WhatsApp (_teks_)" : "Miring (Italic) - *teks*"}
          >
            I
          </button>

          {/* Underline / Strike */}
          {!isWA ? (
            <button
              type="button"
              onClick={() => onAction("underline")}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 underline text-xs transition cursor-pointer active:scale-95"
              title="Garis Bawah (Underline) - <u>teks</u>"
            >
              U
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAction("strikethrough")}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 text-slate-700 transition cursor-pointer active:scale-95"
              title="Coret WhatsApp (~teks~)"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Monospace Code */}
          {isWA && (
            <button
              type="button"
              onClick={() => onAction("code")}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 text-slate-700 transition cursor-pointer active:scale-95"
              title="Monospace WhatsApp (```teks```)"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Headings (Email only) */}
          {!isWA && (
            <>
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <button
                type="button"
                onClick={() => onAction("h1")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 font-bold text-xs transition cursor-pointer active:scale-95"
                title="Heading 1 - # Judul"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => onAction("h2")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 font-bold text-xs transition cursor-pointer active:scale-95"
                title="Heading 2 - ## Subjudul"
              >
                H2
              </button>
            </>
          )}

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => onAction("bullet")}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 text-slate-700 transition cursor-pointer active:scale-95"
            title="Daftar Poin (Bullet List)"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          {/* Link */}
          {!isWA && (
            <button
              type="button"
              onClick={() => onAction("link")}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 text-slate-700 transition cursor-pointer active:scale-95"
              title="Sisipkan Tautan (Link)"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
