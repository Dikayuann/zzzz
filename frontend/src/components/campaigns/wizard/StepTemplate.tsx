import React from "react";
import {
  Mail,
  MessageSquare,
  Send,
  Tag,
  Bookmark,
  Check,
  Palette,
  Code2,
  Eye,
} from "lucide-react";
import type { DeliveryChannel, PresetTemplate } from "@/types/campaignWizard";
import { RichCampaignEditor } from "@/components/campaigns/RichCampaignEditor";
import { WizardLivePreview } from "./WizardLivePreview";

interface StepTemplateProps {
  campaignName: string;
  selectedChannels: DeliveryChannel[];
  activeTemplateTab: DeliveryChannel;
  onActiveTemplateTabChange: (ch: DeliveryChannel) => void;
  selectedTemplateId: string;
  onSelectTemplate: (tmpl: PresetTemplate) => void;
  presetTemplates: PresetTemplate[];
  emailSubject: string;
  onEmailSubjectChange: (val: string) => void;
  emailContent: string;
  onEmailContentChange: (val: string) => void;
  waContent: string;
  onWaContentChange: (val: string) => void;
  telegramContent: string;
  onTelegramContentChange: (val: string) => void;
  emailEditorMode: "visual" | "html";
  onEmailEditorModeChange: (mode: "visual" | "html") => void;
  emailBrandName: string;
  emailHeaderStyle: "clean" | "banner" | "minimal";
  emailCtaEnabled: boolean;
  emailCtaText: string;
  emailCtaUrl: string;
  emailCtaColor: string;
  emailThemeId: string;
  onOpenMergeModal: () => void;
  onSaveTemplate: () => void;
}

export const StepTemplate: React.FC<StepTemplateProps> = ({
  campaignName,
  selectedChannels,
  activeTemplateTab,
  onActiveTemplateTabChange,
  selectedTemplateId,
  onSelectTemplate,
  presetTemplates,
  emailSubject,
  onEmailSubjectChange,
  emailContent,
  onEmailContentChange,
  waContent,
  onWaContentChange,
  telegramContent,
  onTelegramContentChange,
  emailEditorMode,
  onEmailEditorModeChange,
  emailBrandName,
  emailHeaderStyle,
  emailCtaEnabled,
  emailCtaText,
  emailCtaUrl,
  emailCtaColor,
  emailThemeId,
  onOpenMergeModal,
  onSaveTemplate,
}) => {
  const currentContent =
    activeTemplateTab === "Email"
      ? emailContent
      : activeTemplateTab === "WhatsApp"
      ? waContent
      : telegramContent;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* A. Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{campaignName || "Monthly Newsletter"}</span>
            <span className="text-[11px] font-medium text-slate-400">
              ({selectedChannels.join(" & ")})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tulis pesan di sebelah kiri, preview real-time (Google Gmail, WhatsApp, Telegram) muncul di sebelah kanan.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Channel Selector Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            {selectedChannels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onActiveTemplateTabChange(ch)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTemplateTab === ch
                    ? ch === "Email"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : ch === "WhatsApp"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {ch === "Email" && <Mail className="h-3 w-3" />}
                {ch === "WhatsApp" && <MessageSquare className="h-3 w-3" />}
                {ch === "Telegram" && <Send className="h-3 w-3" />}
                <span>{ch}</span>
              </button>
            ))}
          </div>

          {/* Merge Tags Button */}
          <button
            type="button"
            onClick={onOpenMergeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 shadow-2xs transition cursor-pointer"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>&lt;&gt; Pustaka Tag (28+)</span>
          </button>

          {/* Save Template Button */}
          <button
            type="button"
            onClick={onSaveTemplate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Save template</span>
          </button>
        </div>
      </div>

      {/* B. Template Preset Picker Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Pilihan Template Cepat
          </span>
          <span className="text-[11px] text-slate-400">
            Pilih salah satu untuk memuat teks rekomendasi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {presetTemplates.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplateId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                  isSelected
                    ? "border-[#0284c7] bg-sky-50/30 shadow-xs ring-1 ring-sky-400"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg p-1.5 ${tmpl.iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        tmpl.id === "blank"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-[11px] text-slate-900 leading-snug line-clamp-1">
                    {tmpl.name}
                  </h4>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-1 border-t border-sky-100 flex items-center justify-end">
                    <span className="text-[9px] font-bold text-sky-600 flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Dipakai
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* C. Split View: Left Editor & Right Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* LEFT COLUMN: EDITOR */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                EDITOR ({activeTemplateTab})
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {activeTemplateTab === "Email" ? "Tampilan & Format Email" : "Format pesan saluran aktif"}
              </span>
            </div>

            {/* Subject Line (Email only) */}
            {activeTemplateTab === "Email" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Subject line
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => onEmailSubjectChange(e.target.value)}
                    placeholder="Your monthly update is here ✉️"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Mode Editor Switcher (Email only) */}
            {activeTemplateTab === "Email" && (
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-slate-700">
                  Isi Pesan Email
                </label>
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => onEmailEditorModeChange("visual")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      emailEditorMode === "visual"
                        ? "bg-white text-indigo-700 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Palette className="h-3 w-3" />
                    <span>Mode Visual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEmailEditorModeChange("html")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      emailEditorMode === "html"
                        ? "bg-white text-indigo-700 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code2 className="h-3 w-3" />
                    <span>&lt;&gt; Custom HTML</span>
                  </button>
                </div>
              </div>
            )}

            {/* Editor View */}
            {activeTemplateTab === "Email" && emailEditorMode === "html" ? (
              <div className="space-y-1.5">
                <textarea
                  rows={12}
                  value={emailContent}
                  onChange={(e) => onEmailContentChange(e.target.value)}
                  placeholder="Paste template email HTML kustom Anda di sini... (contoh: <div><h1>Promo</h1><p>Halo {{nama}}, ...</p></div>)"
                  className="w-full rounded-2xl border border-slate-700 p-4 text-xs font-mono text-emerald-400 bg-slate-950 leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>💡 Paste kode template HTML dari Canva, Figma, Stripo, atau framework email lainnya.</span>
                  <button
                    type="button"
                    onClick={onOpenMergeModal}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    + Sisipkan Tag
                  </button>
                </div>
              </div>
            ) : (
              <RichCampaignEditor
                key={activeTemplateTab}
                value={currentContent}
                channel={activeTemplateTab}
                onChange={(val) => {
                  if (activeTemplateTab === "Email") onEmailContentChange(val);
                  else if (activeTemplateTab === "WhatsApp") onWaContentChange(val);
                  else onTelegramContentChange(val);
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SIMULATOR */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              LIVE PREVIEW ({activeTemplateTab})
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              1:1 Real Client Mockup
            </span>
          </div>

          <WizardLivePreview
            activeChannel={activeTemplateTab}
            emailContent={emailContent}
            emailSubject={emailSubject}
            waContent={waContent}
            telegramContent={telegramContent}
            emailBrandName={emailBrandName}
            emailHeaderStyle={emailHeaderStyle}
            emailCtaEnabled={emailCtaEnabled}
            emailCtaText={emailCtaText}
            emailCtaUrl={emailCtaUrl}
            emailCtaColor={emailCtaColor}
            emailThemeId={emailThemeId}
          />
        </div>
      </div>
    </div>
  );
};
