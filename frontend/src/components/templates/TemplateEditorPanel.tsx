import React, { useRef, useState, useEffect } from "react";
import type { TemplateChannel, ToolbarAction } from "@/types/template";
import { TemplateEditorToolbar } from "./TemplateEditorToolbar";
import {
  applyToolbarAction,
  insertTagAtCursor,
} from "@/utils/templateParser";
import {
  MousePointerClick,
  Share2,
  Globe,
  Camera,
  MessageCircle,
} from "lucide-react";

interface TemplateEditorPanelProps {
  channel: TemplateChannel;
  subject: string;
  onSubjectChange: (newSubject: string) => void;
  preheader?: string;
  onPreheaderChange?: (newPreheader: string) => void;
  content: string;
  onContentChange: (newContent: string) => void;
  onOpenMergeTagsModal: () => void;
  // Mailchimp CTA Button Props
  enableCta?: boolean;
  onEnableCtaChange?: (val: boolean) => void;
  ctaText?: string;
  onCtaTextChange?: (val: string) => void;
  ctaUrl?: string;
  onCtaUrlChange?: (val: string) => void;
  ctaColor?: string;
  onCtaColorChange?: (val: string) => void;
  // Mailchimp Social Links Props
  enableSocial?: boolean;
  onEnableSocialChange?: (val: boolean) => void;
  websiteUrl?: string;
  onWebsiteUrlChange?: (val: string) => void;
  instagramUrl?: string;
  onInstagramUrlChange?: (val: string) => void;
  whatsappUrl?: string;
  onWhatsappUrlChange?: (val: string) => void;
}

const QUICK_MERGE_TAGS = [
  "{{first_name}}",
  "{{org_name}}",
  "{{unsubscribe_link}}",
];

const CTA_COLORS = [
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Amber", hex: "#D97706" },
  { name: "Slate", hex: "#0F172A" },
];

export const TemplateEditorPanel: React.FC<TemplateEditorPanelProps> = ({
  channel,
  subject,
  onSubjectChange,
  preheader = "",
  onPreheaderChange,
  content,
  onContentChange,
  enableCta = false,
  onEnableCtaChange,
  ctaText = "Klaim Voucher Sekarang 🚀",
  onCtaTextChange,
  ctaUrl = "https://tokoonline.com/promo",
  onCtaUrlChange,
  ctaColor = "#4F46E5",
  onCtaColorChange,
  enableSocial = true,
  onEnableSocialChange,
  websiteUrl = "https://acmecorp.co",
  onWebsiteUrlChange,
  instagramUrl = "https://instagram.com/acmecorp",
  onInstagramUrlChange,
  whatsappUrl = "https://wa.me/6281234567890",
  onWhatsappUrlChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo / Redo History Management
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mailchimp Preheader accordion toggle
  const [showPreheaderInput, setShowPreheaderInput] = useState(false);

  const pushToHistory = (newVal: string) => {
    if (newVal === history[historyIndex]) return;

    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      if (truncated.length >= 50) truncated.shift();
      return [...truncated, newVal];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetVal = history[targetIndex];
      setHistoryIndex(targetIndex);
      isUndoRedoAction.current = true;
      onContentChange(targetVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetVal = history[targetIndex];
      setHistoryIndex(targetIndex);
      isUndoRedoAction.current = true;
      onContentChange(targetVal);
    }
  };

  const handleToolbarAction = (action: ToolbarAction) => {
    if (action === "undo") {
      handleUndo();
      return;
    }
    if (action === "redo") {
      handleRedo();
      return;
    }

    if (!textareaRef.current) return;
    const updated = applyToolbarAction(textareaRef.current, action, content, channel);
    if (updated !== content) {
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  const handleInsertTag = (tag: string) => {
    const updated = insertTagAtCursor(textareaRef.current, content, tag);
    if (updated !== content) {
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onContentChange(newVal);

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      pushToHistory(newVal);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="space-y-4">
      {/* SECTION TITLE: EDITOR */}
      <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        EDITOR
      </h2>

      {/* EMAIL HEADER & PREHEADER (Only for Email) */}
      {channel === "email" && (
        <div className="space-y-2">
          {/* Subject Line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Subject line
              </label>
              <button
                type="button"
                onClick={() => setShowPreheaderInput(!showPreheaderInput)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
              >
                {showPreheaderInput ? "- Sembunyikan Preheader" : "+ Tambah Preheader"}
              </button>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Subjek email..."
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
            />
          </div>

          {/* Optional Preheader */}
          {showPreheaderInput && onPreheaderChange && (
            <div className="space-y-1 animate-in fade-in-50 duration-150">
              <label className="text-[11px] font-medium text-slate-500">
                Preheader (Teks pratinjau cuplikan di inbox penerima)
              </label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => onPreheaderChange(e.target.value)}
                placeholder="Contoh: Dapatkan diskon 30% dan pembaruan sistem bulan ini..."
                className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {/* RICH EDITOR CONTAINER */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col focus-within:border-indigo-400 transition">
        {/* Toolbar with Undo / Redo & Channel-aware syntax */}
        <TemplateEditorToolbar
          onAction={handleToolbarAction}
          canUndo={canUndo}
          canRedo={canRedo}
          channel={channel}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={
            channel === "whatsapp"
              ? "Tulis pesan broadcast WhatsApp di sini... Gunakan *tebal*, _miring_, ~coret~, ```kode```."
              : channel === "email"
              ? "Tulis konten email di sini... Gunakan **tebal**, *miring*, <u>garis bawah</u>, atau bullet."
              : "Tulis pesan Telegram di sini..."
          }
          rows={15}
          className="w-full p-4 text-xs font-mono text-slate-800 resize-none focus:outline-none leading-relaxed bg-white selection:bg-indigo-100 placeholder:text-slate-400"
          style={{ minHeight: "320px" }}
        />

        {/* Editor Bottom Bar */}
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            {content.length} characters
          </span>

          {/* Quick Merge Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_MERGE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleInsertTag(tag)}
                className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100/80 font-mono text-[11px] font-medium transition cursor-pointer active:scale-95"
                title={`Klik untuk menyisipkan ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAILCHIMP COMPONENT BLOCKS (Only for Email) */}
      {channel === "email" && (
        <div className="space-y-3 pt-2">
          {/* 1. MAILCHIMP CTA BUTTON BLOCK */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MousePointerClick className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Tombol CTA (Call to Action)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Tombol aksi utama untuk konversi klik pelanggan
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCta}
                  onChange={(e) => onEnableCtaChange?.(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {enableCta && (
              <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Teks Tombol</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => onCtaTextChange?.(e.target.value)}
                      placeholder="Contoh: Belanja Sekarang"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Tautan Tujuan (URL)</label>
                    <input
                      type="url"
                      value={ctaUrl}
                      onChange={(e) => onCtaUrlChange?.(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Color presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium text-slate-500">Warna Tombol:</span>
                  <div className="flex items-center gap-1.5">
                    {CTA_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => onCtaColorChange?.(c.hex)}
                        className={`h-5 w-5 rounded-full border-2 transition cursor-pointer ${
                          ctaColor === c.hex ? "border-slate-800 scale-110" : "border-white"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. MAILCHIMP SOCIAL & FOOTER BLOCK */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Tautan Sosial Media & Footer
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Tampilkan ikon Instagram, WhatsApp, dan Website di footer
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSocial}
                  onChange={(e) => onEnableSocialChange?.(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {enableSocial && (
              <div className="pt-2 border-t border-slate-100 space-y-2.5 animate-in fade-in-50 duration-200 text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => onWebsiteUrlChange?.(e.target.value)}
                    placeholder="URL Website resmi (https://...)"
                    className="flex-1 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => onInstagramUrlChange?.(e.target.value)}
                    placeholder="Instagram URL (https://instagram.com/...)"
                    className="flex-1 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={whatsappUrl}
                    onChange={(e) => onWhatsappUrlChange?.(e.target.value)}
                    placeholder="WhatsApp Link (https://wa.me/...)"
                    className="flex-1 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
