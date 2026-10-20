import React, { useState } from "react";
import type { TemplateChannel } from "@/types/template";

export interface SubjectPreheaderInputsProps {
  channel: TemplateChannel;
  subject: string;
  onSubjectChange: (val: string) => void;
  preheader?: string;
  onPreheaderChange?: (val: string) => void;
  currentActiveTarget: "subject" | "preheader" | "content";
  setActiveTarget: (target: "subject" | "preheader" | "content") => void;
  subjectInputRef: React.RefObject<HTMLInputElement | null>;
  preheaderInputRef: React.RefObject<HTMLInputElement | null>;
  subjectSelectionRef: React.MutableRefObject<{ start: number; end: number }>;
  preheaderSelectionRef: React.MutableRefObject<{ start: number; end: number }>;
  onOpenMergeTagsModal: () => void;
  handleInsertSubjectTag: (tag: string) => void;
  handleInsertPreheaderTag: (tag: string) => void;
}

export const SubjectPreheaderInputs: React.FC<SubjectPreheaderInputsProps> = ({
  channel: rawChannel,
  subject,
  onSubjectChange,
  preheader = "",
  onPreheaderChange,
  currentActiveTarget,
  setActiveTarget,
  subjectInputRef,
  preheaderInputRef,
  subjectSelectionRef,
  preheaderSelectionRef,
  onOpenMergeTagsModal,
  handleInsertSubjectTag,
  handleInsertPreheaderTag,
}) => {
  const channel: TemplateChannel =
    rawChannel === "whatsapp" || rawChannel === "telegram" ? rawChannel : "email";

  const [showPreheaderInput, setShowPreheaderInput] = useState(Boolean(preheader));

  const updateSubjectSelection = () => {
    if (subjectInputRef.current) {
      const start = subjectInputRef.current.selectionStart ?? subject.length;
      const end = subjectInputRef.current.selectionEnd ?? subject.length;
      subjectSelectionRef.current = { start, end };
    }
  };

  const updatePreheaderSelection = () => {
    if (preheaderInputRef.current) {
      const start = preheaderInputRef.current.selectionStart ?? preheader.length;
      const end = preheaderInputRef.current.selectionEnd ?? preheader.length;
      preheaderSelectionRef.current = { start, end };
    }
  };

  if (channel !== "email") {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span>Subjek Email</span>
            {currentActiveTarget === "subject" && (
              <span className="text-[10px] text-slate-600 bg-slate-100 font-medium px-1.5 py-0.5 rounded border border-slate-200">
                Target aktif
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={() => setShowPreheaderInput(!showPreheaderInput)}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
          >
            {showPreheaderInput ? "Sembunyikan Preheader" : "Tambah Preheader"}
          </button>
        </div>
        <input
          ref={subjectInputRef}
          type="text"
          value={subject}
          onFocus={() => {
            setActiveTarget("subject");
            updateSubjectSelection();
          }}
          onClick={() => {
            setActiveTarget("subject");
            updateSubjectSelection();
          }}
          onSelect={() => {
            setActiveTarget("subject");
            updateSubjectSelection();
          }}
          onKeyUp={() => {
            setActiveTarget("subject");
            updateSubjectSelection();
          }}
          onChange={(e) => {
            onSubjectChange(e.target.value);
            const pos = e.target.selectionStart ?? e.target.value.length;
            subjectSelectionRef.current = { start: pos, end: pos };
          }}
          placeholder="Contoh: Spesial untuk {{first_name}}: Penawaran terbatas hari ini"
          className={`w-full h-10 px-3.5 rounded-xl border bg-white text-xs text-slate-900 focus:outline-none shadow-2xs transition ${
            currentActiveTarget === "subject"
              ? "border-slate-800 ring-1 ring-slate-800"
              : "border-slate-200/90"
          }`}
        />

        {/* Quick Merge Tags for Subject Line */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-semibold text-slate-400">
            Sisipkan ke Subjek:
          </span>
          {["{{first_name}}", "{{nama}}", "{{kode_promo}}", "{{diskon}}", "{{org_name}}", "[nama]", "{{}}"].map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleInsertSubjectTag(tag)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition cursor-pointer active:scale-95"
              title={`Sisipkan ${tag} langsung ke Subjek Email`}
            >
              {tag}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setActiveTarget("subject");
              onOpenMergeTagsModal();
            }}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
            title="Buka pustaka merge tag lengkap untuk subjek"
          >
            Tag Lain...
          </button>
        </div>
      </div>

      {showPreheaderInput && onPreheaderChange && (
        <div className="space-y-1.5 animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <span>Preheader (Teks cuplikan inbox sebelum email dibuka)</span>
              {currentActiveTarget === "preheader" && (
                <span className="text-[10px] text-slate-600 bg-slate-100 font-medium px-1.5 py-0.5 rounded border border-slate-200">
                  Target aktif
                </span>
              )}
            </label>
          </div>
          <input
            ref={preheaderInputRef}
            type="text"
            value={preheader}
            onFocus={() => {
              setActiveTarget("preheader");
              updatePreheaderSelection();
            }}
            onClick={() => {
              setActiveTarget("preheader");
              updatePreheaderSelection();
            }}
            onSelect={() => {
              setActiveTarget("preheader");
              updatePreheaderSelection();
            }}
            onKeyUp={() => {
              setActiveTarget("preheader");
              updatePreheaderSelection();
            }}
            onChange={(e) => {
              onPreheaderChange(e.target.value);
              const pos = e.target.selectionStart ?? e.target.value.length;
              preheaderSelectionRef.current = { start: pos, end: pos };
            }}
            placeholder="Contoh: Gunakan kode promo {{kode_promo}} sebelum {{tanggal_kadaluarsa}}..."
            className={`w-full h-8 px-3 rounded-lg border bg-slate-50/50 text-xs text-slate-800 focus:outline-none transition ${
              currentActiveTarget === "preheader"
                ? "border-slate-800 ring-1 ring-slate-800 bg-white"
                : "border-slate-200"
            }`}
          />

          {/* Quick Merge Tags for Preheader */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-semibold text-slate-400">
              Sisipkan ke Preheader:
            </span>
            {["{{first_name}}", "{{kode_promo}}", "{{tanggal_kadaluarsa}}"].map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsertPreheaderTag(tag)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition cursor-pointer active:scale-95"
                title={`Sisipkan ${tag} langsung ke Preheader`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
