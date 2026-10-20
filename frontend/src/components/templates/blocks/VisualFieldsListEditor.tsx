import React, { useState, useEffect, useMemo, useRef } from "react";
import { Type, Brackets, Search, X, RotateCcw, Sparkles } from "lucide-react";
import type { ExtractedTextBlock } from "@/utils/templateParser";

interface VisualFieldsListEditorProps {
  extractedTextBlocks: ExtractedTextBlock[];
  editorHeight: number;
  onUpdateExtractedText: (blockIndex: number, newText: string) => void;
}

const COMMON_FIELD_BRACKETS = [
  "{{nama}}",
  "{{first_name}}",
  "{{kode_promo}}",
  "{{diskon}}",
  "{{tanggal_hari_ini}}",
];

export const VisualFieldsListEditor: React.FC<VisualFieldsListEditorProps> = ({
  extractedTextBlocks,
  editorHeight,
  onUpdateExtractedText,
}) => {
  // Search query filter
  const [searchQuery, setSearchQuery] = useState("");

  // Controlled state mapping block index to current textarea value
  const [fieldValues, setFieldValues] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    extractedTextBlocks.forEach((b) => {
      initial[b.index] = b.text;
    });
    return initial;
  });

  // Track cursor position for each textarea ref
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  // Synchronize field values when template changes externally
  useEffect(() => {
    setFieldValues((prev) => {
      const next: Record<number, string> = {};
      extractedTextBlocks.forEach((b) => {
        // Keep active local edits if block index exists, otherwise sync block.text
        next[b.index] = prev[b.index] !== undefined ? prev[b.index] : b.text;
      });
      return next;
    });
  }, [extractedTextBlocks]);

  const handleFieldChange = (index: number, newVal: string) => {
    setFieldValues((prev) => ({ ...prev, [index]: newVal }));
    onUpdateExtractedText(index, newVal);
  };

  const handleResetField = (block: ExtractedTextBlock) => {
    setFieldValues((prev) => ({ ...prev, [block.index]: block.text }));
    onUpdateExtractedText(block.index, block.text);
  };

  const handleInsertBracketIntoField = (index: number, bracket: string) => {
    const textarea = textareaRefs.current[index];
    const currentVal = fieldValues[index] !== undefined ? fieldValues[index] : "";

    let newVal = currentVal;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      newVal = currentVal.substring(0, start) + bracket + currentVal.substring(end);
      setTimeout(() => {
        textarea.focus();
        const nextPos = start + bracket.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }, 0);
    } else {
      newVal = currentVal ? `${currentVal} ${bracket}` : bracket;
    }

    setFieldValues((prev) => ({ ...prev, [index]: newVal }));
    onUpdateExtractedText(index, newVal);
  };

  // Filter blocks based on search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return extractedTextBlocks;
    const query = searchQuery.toLowerCase();
    return extractedTextBlocks.filter((b) => {
      const current = (fieldValues[b.index] || b.text).toLowerCase();
      const label = b.label.toLowerCase();
      const tag = b.tag.toLowerCase();
      return current.includes(query) || label.includes(query) || tag.includes(query);
    });
  }, [extractedTextBlocks, fieldValues, searchQuery]);

  return (
    <div
      className="p-3.5 bg-slate-50/80 space-y-3 flex flex-col transition-all duration-150"
      style={{ height: `${editorHeight}px` }}
    >
      {/* Header with Search Filter */}
      <div className="shrink-0 space-y-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Type className="h-4 w-4 text-indigo-600" />
            <span>Formulir Teks Real-Time</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {extractedTextBlocks.length} Elemen
            </span>
          </span>
          <span className="text-[11px] text-slate-400">
            Perubahan langsung memperbarui Pratinjau
          </span>
        </div>

        {/* Quick Filter Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari teks dalam template... (misal: 'Thompson', 'Newsletter', '{{nama}}')"
            className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List of Extracted Text Block Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {extractedTextBlocks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada teks HTML yang terdeteksi untuk diedit.
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Tidak ada teks yang cocok dengan &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const currentValue =
              fieldValues[block.index] !== undefined ? fieldValues[block.index] : block.text;
            const isModified = currentValue !== block.text;
            const hasBrackets = /\{\{[^}]+\}\}/.test(currentValue);

            // Compute dynamic textarea rows based on text length
            const computedRows = Math.max(
              2,
              Math.min(8, Math.ceil((currentValue.length || 1) / 45))
            );

            // Badge styling based on element type
            let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
            if (block.label.includes("Judul") || block.contextTag?.startsWith("h")) {
              badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold";
            } else if (block.label.includes("Tombol") || block.contextTag === "a") {
              badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold";
            } else if (block.label.includes("Paragraf")) {
              badgeStyle = "bg-blue-50 text-blue-700 border-blue-200/80";
            }

            return (
              <div
                key={block.id}
                className={`p-3 rounded-xl bg-white border transition shadow-2xs space-y-2 ${
                  isModified ? "border-indigo-300 ring-1 ring-indigo-200/60" : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Header row: Label, tag hierarchy & character count */}
                <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeStyle}`}>
                      {block.label}
                    </span>

                    {block.contextTag ? (
                      <span className="text-slate-400 font-mono text-[10px]">
                        &lt;{block.contextTag}&gt; &rarr; &lt;{block.tag}&gt;
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">
                        &lt;{block.tag}&gt;
                      </span>
                    )}

                    {hasBrackets && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                        <span>Variabel</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <span>{currentValue.length} karakter</span>
                    {isModified && (
                      <button
                        type="button"
                        onClick={() => handleResetField(block)}
                        className="text-amber-600 hover:text-amber-800 flex items-center gap-0.5 cursor-pointer font-medium"
                        title="Kembalikan ke teks asli"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multiline, Expandable Textarea */}
                <div className="relative">
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[block.index] = el;
                    }}
                    value={currentValue}
                    rows={computedRows}
                    onChange={(e) => handleFieldChange(block.index, e.target.value)}
                    placeholder="Ketik teks pengganti..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/40 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-normal leading-relaxed transition resize-y min-h-[52px]"
                  />
                </div>

                {/* Quick Bracket Insert Chips for this Field */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mr-0.5">
                    <Brackets className="h-2.5 w-2.5 text-indigo-500" />
                    <span>+Bracket:</span>
                  </span>
                  {COMMON_FIELD_BRACKETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertBracketIntoField(block.index, tag)}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition cursor-pointer active:scale-95"
                      title={`Sisipkan ${tag} ke field ini`}
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleInsertBracketIntoField(block.index, "{{}}")}
                    className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition cursor-pointer active:scale-95"
                    title="Sisipkan {{}} kosong"
                  >
                    {"{{}}"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
