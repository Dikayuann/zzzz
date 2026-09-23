import React from "react";
import { List, Link2, Undo2, Redo2, Strikethrough, Code } from "lucide-react";
import type { ToolbarAction, TemplateChannel } from "@/types/template";

interface TemplateEditorToolbarProps {
  onAction: (action: ToolbarAction) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  channel?: TemplateChannel;
}

export const TemplateEditorToolbar: React.FC<TemplateEditorToolbarProps> = ({
  onAction,
  canUndo = false,
  canRedo = false,
  channel = "email",
}) => {
  const isWA = channel === "whatsapp";

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-slate-700">
      {/* Undo */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => onAction("undo")}
        className={`w-7 h-7 flex items-center justify-center rounded transition ${
          canUndo
            ? "hover:bg-slate-200/70 text-slate-700 cursor-pointer active:scale-95"
            : "text-slate-300 cursor-not-allowed"
        }`}
        title="Urungkan (Undo) - Ctrl+Z"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>

      {/* Redo */}
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => onAction("redo")}
        className={`w-7 h-7 flex items-center justify-center rounded transition ${
          canRedo
            ? "hover:bg-slate-200/70 text-slate-700 cursor-pointer active:scale-95"
            : "text-slate-300 cursor-not-allowed"
        }`}
        title="Ulangi (Redo) - Ctrl+Y / Ctrl+Shift+Z"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* Bold */}
      <button
        type="button"
        onClick={() => onAction("bold")}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 font-bold text-xs transition cursor-pointer active:scale-95"
        title={isWA ? "Tebal WhatsApp (*teks*)" : "Tebal (Bold) - **teks**"}
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => onAction("italic")}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 italic font-serif text-xs transition cursor-pointer active:scale-95"
        title={isWA ? "Miring WhatsApp (_teks_)" : "Miring (Italic) - *teks*"}
      >
        I
      </button>

      {/* Underline (for email/telegram) or Strikethrough (for WhatsApp) */}
      {!isWA ? (
        <button
          type="button"
          onClick={() => onAction("underline")}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 underline text-xs transition cursor-pointer active:scale-95"
          title="Garis Bawah (Underline) - <u>teks</u>"
        >
          U
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAction("strikethrough")}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 text-slate-700 transition cursor-pointer active:scale-95"
          title="Coret WhatsApp (~teks~)"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Code for WhatsApp */}
      {isWA && (
        <button
          type="button"
          onClick={() => onAction("code")}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 text-slate-700 transition cursor-pointer active:scale-95"
          title="Monospace WhatsApp (```teks```)"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Headings H1 & H2 (only for Email/Telegram) */}
      {!isWA && (
        <>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => onAction("h1")}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 font-bold text-xs transition cursor-pointer active:scale-95"
            title="Heading 1 - # Judul"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => onAction("h2")}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 font-bold text-xs transition cursor-pointer active:scale-95"
            title="Heading 2 - ## Subjudul"
          >
            H2
          </button>
        </>
      )}

      <div className="h-4 w-px bg-slate-200 mx-1" />

      {/* List */}
      <button
        type="button"
        onClick={() => onAction("bullet")}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 text-slate-700 transition cursor-pointer active:scale-95"
        title="Daftar Poin (Bullet List)"
      >
        <List className="h-3.5 w-3.5" />
      </button>

      {/* Link (only for Email/Telegram) */}
      {!isWA && (
        <button
          type="button"
          onClick={() => onAction("link")}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200/70 text-slate-700 transition cursor-pointer active:scale-95"
          title="Sisipkan Tautan (Link)"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
