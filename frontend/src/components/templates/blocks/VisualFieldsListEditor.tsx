import React from "react";
import { Type } from "lucide-react";
import type { ExtractedTextBlock } from "@/utils/templateParser";

interface VisualFieldsListEditorProps {
  extractedTextBlocks: ExtractedTextBlock[];
  editorHeight: number;
  onUpdateExtractedText: (oldText: string, newText: string) => void;
}

export const VisualFieldsListEditor: React.FC<VisualFieldsListEditorProps> = ({
  extractedTextBlocks,
  editorHeight,
  onUpdateExtractedText,
}) => {
  return (
    <div
      className="p-4 bg-slate-50/80 space-y-3 flex flex-col transition-all duration-150"
      style={{ height: `${editorHeight}px` }}
    >
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Type className="h-4 w-4 text-slate-700" />
          <span>Teks HTML yang Terdeteksi ({extractedTextBlocks.length} Elemen)</span>
        </span>
        <span className="text-[11px] text-slate-500">
          Ketik teks pengganti untuk langsung memperbarui email
        </span>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {extractedTextBlocks.map((block) => (
          <div
            key={block.id}
            className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                {block.label}
              </span>
              <span className="text-slate-400 font-mono">&lt;{block.tag}&gt;</span>
            </div>

            <input
              type="text"
              defaultValue={block.text}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && val !== block.text) {
                  onUpdateExtractedText(block.text, val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (val && val !== block.text) {
                    onUpdateExtractedText(block.text, val);
                    e.currentTarget.blur();
                  }
                }
              }}
              className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50/40 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800 font-medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
