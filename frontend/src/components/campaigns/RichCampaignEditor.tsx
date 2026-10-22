import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  Eraser,
  ChevronDown,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RichCampaignEditorProps {
  value: string;
  onChange: (value: string) => void;
  channel: "Email" | "WhatsApp" | "Telegram";
  placeholder?: string;
}

export const RichCampaignEditor: React.FC<RichCampaignEditorProps> = ({
  value,
  onChange,
  channel,
}) => {
  const [showMergeModal, setShowMergeModal] = useState(false);
  // Convert plain text with newlines to HTML paragraphs if necessary
  const formatInitialContent = (content: string) => {
    if (!content) return "<p></p>";
    if (content.includes("<p>") || content.includes("<div>") || content.includes("<h")) {
      return content;
    }
    // Convert plain text \n\n to <p> and \n to <br>
    const paragraphs = content.split(/\n\n+/);
    return paragraphs
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-sky-600 underline font-medium hover:text-sky-800",
        },
      }),
    ],
    content: formatInitialContent(value),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[240px] px-4 py-3 text-slate-800 text-xs sm:text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Keep editor content in sync when value changes externally (e.g., template selection or tab change)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    const targetHTML = formatInitialContent(value);
    // Only update if fundamentally different to preserve selection/history
    if (value !== currentHTML && targetHTML !== currentHTML) {
      editor.commands.setContent(targetHTML, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-64 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-center text-xs text-slate-400">
        Memuat Rich Text Editor...
      </div>
    );
  }

  const handleInsertTag = (tag: string) => {
    const mergeTag = `{{${tag}}}`;
    editor.chain().focus().insertContent(` ${mergeTag} `).run();
    toast.success(`Variabel ${mergeTag} disisipkan!`);
  };

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkOpenInNewTab(true);
    setIsLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    let finalUrl = trimmed;
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("mailto:") &&
      !trimmed.startsWith("tel:") &&
      !trimmed.startsWith("{{") &&
      !trimmed.startsWith("#")
    ) {
      finalUrl = `https://${trimmed}`;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: finalUrl,
        target: linkOpenInNewTab ? "_blank" : undefined,
      })
      .run();

    setIsLinkModalOpen(false);
    toast.success("Tautan berhasil disisipkan!");
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkModalOpen(false);
    toast.success("Tautan dihapus!");
  };

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();
  const charCount = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
      {/* Editor Main Toolbar */}
      <div className="border-b border-slate-200/80 bg-slate-50/70 p-1.5 flex items-center justify-between gap-1 flex-wrap">
        {/* Left Toolbar Controls */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* UNDO BUTTON (Bisa di undo!) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!canUndo}
            title="Undo / Batalkan (Ctrl+Z)"
            aria-label="Undo"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              canUndo
                ? "text-slate-700 hover:bg-white hover:shadow-2xs active:scale-95 text-indigo-900 bg-slate-100/80"
                : "text-slate-300 cursor-not-allowed opacity-50"
            }`}
          >
            <Undo2 className="h-4 w-4" />
            <span className="text-[11px] hidden sm:inline font-medium">Undo</span>
          </button>

          {/* REDO BUTTON */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!canRedo}
            title="Redo / Ulangi (Ctrl+Y atau Ctrl+Shift+Z)"
            aria-label="Redo"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              canRedo
                ? "text-slate-700 hover:bg-white hover:shadow-2xs active:scale-95 text-indigo-900 bg-slate-100/80"
                : "text-slate-300 cursor-not-allowed opacity-50"
            }`}
          >
            <Redo2 className="h-4 w-4" />
            <span className="text-[11px] hidden sm:inline font-medium">Redo</span>
          </button>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* BOLD */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold / Huruf Tebal (Ctrl+B)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("bold")
                ? "bg-indigo-600 text-white font-bold shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <Bold className="h-4 w-4" />
          </button>

          {/* ITALIC */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic / Huruf Miring (Ctrl+I)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("italic")
                ? "bg-indigo-600 text-white font-bold shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <Italic className="h-4 w-4" />
          </button>

          {/* UNDERLINE */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline / Garis Bawah (Ctrl+U)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("underline")
                ? "bg-indigo-600 text-white font-bold shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          {/* STRIKETHROUGH */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough / Coretan Teks"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("strike")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* HEADING 1 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Judul Utama (H1)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            H1
          </button>

          {/* HEADING 2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Sub Judul (H2)"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            H2
          </button>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* BULLET LIST */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Daftar Poin (Bullet List)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <List className="h-4 w-4" />
          </button>

          {/* ORDERED LIST */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Daftar Bernomor (Numbered List)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("orderedList")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          {/* BLOCKQUOTE */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Kutipan (Blockquote)"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("blockquote")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <Quote className="h-4 w-4" />
          </button>

          {/* CODE */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Kode / Monospace"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("code")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <Code className="h-4 w-4" />
          </button>

          {/* LINK */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            title="Sisipkan Tautan Web"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              editor.isActive("link")
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Hapus Tautan"
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Unlink className="h-4 w-4" />
            </button>
          )}

          {/* CLEAR FORMATTING */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Hapus Semua Format (Clear Formatting)"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition cursor-pointer"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Right Toolbar Status & Merge Tag Quick Injector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Editor Visual ({channel})
          </span>

          {/* Merge Tags Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowMergeModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Tag className="h-3 w-3" />
            <span className="text-[11px]">&lt;&gt; Tag Variabel</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* Editor Content Area (ProseMirror with Tailwind Typography) */}
      <div className="relative flex-1 bg-white cursor-text min-h-[260px] max-h-[460px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Status Bar: Minimal & Clean */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-mono">
          <strong className="text-slate-800">{charCount}</strong> karakter • <strong className="text-slate-800">{wordCount}</strong> kata
        </span>

        <button
          type="button"
          onClick={() => setShowMergeModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 transition shadow-2xs cursor-pointer"
        >
          <Tag className="h-3 w-3 text-indigo-600" />
          <span>Sisipkan Tag Variabel</span>
        </button>
      </div>

      {/* Complete Merge Tags Modal */}
      <MergeTagsModal
        open={showMergeModal}
        onOpenChange={setShowMergeModal}
        onSelectTag={handleInsertTag}
      />

      {/* Sleek In-App Link Modal Dialog */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <LinkIcon className="h-4 w-4" />
              </div>
              <span>Sisipkan atau Edit Tautan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Masukkan alamat URL website atau pilih tag variabel dinamis untuk teks yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Alamat URL Tautan</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://domainanda.com/promo atau {{unsubscribe_link}}"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs font-mono"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyLink();
                  }
                }}
              />
            </div>

            {/* Quick Tag Recommendations for Email Links */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500 block">
                Tag Cepat (Email):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Unsubscribe", tag: "{{unsubscribe_link}}" },
                  { label: "Lihat di Web", tag: "{{web_view_link}}" },
                  { label: "CTA Promo", tag: "{{cta_link}}" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setLinkUrl(item.tag)}
                    className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Open in new tab checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={linkOpenInNewTab}
                onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Buka tautan di tab baru (target="_blank")</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-2">
            <div>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  <span>Hapus Tautan</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                Terapkan Tautan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
