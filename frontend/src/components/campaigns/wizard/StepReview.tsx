import React from "react";
import {
  Users,
  Clock,
  Send,
  Edit3,
  Mail,
  MessageSquare,
  Calendar,
  Zap,
  Palette,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import type { DeliveryChannel, SenderProfile, AudienceOption } from "@/types/campaignWizard";
import { getEmailTheme } from "@/data/emailThemes";
import { evaluateMergeTags } from "@/data/mergeTags";
import { renderFormattedPreview } from "./WizardLivePreview";

interface StepReviewProps {
  selectedChannels: DeliveryChannel[];
  campaignName: string;
  currentSenderProfile: SenderProfile;
  currentAudienceObj: AudienceOption;
  scheduleType: "instant" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  throttleRate: string;
  emailSubject: string;
  emailContent: string;
  waContent: string;
  telegramContent: string;
  emailBrandName: string;
  emailCtaEnabled: boolean;
  emailCtaText: string;
  emailCtaColor: string;
  emailThemeId: string;
  reviewChannelTab: DeliveryChannel;
  onReviewChannelTabChange: (ch: DeliveryChannel) => void;
  onEditStep: (step: number) => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  selectedChannels,
  campaignName,
  currentSenderProfile,
  currentAudienceObj,
  scheduleType,
  scheduledDate,
  scheduledTime,
  throttleRate,
  emailSubject,
  emailContent,
  waContent,
  telegramContent,
  emailBrandName,
  emailCtaEnabled,
  emailCtaText,
  emailCtaColor,
  emailThemeId,
  reviewChannelTab,
  onReviewChannelTabChange,
  onEditStep,
}) => {
  const activeTab = selectedChannels.includes(reviewChannelTab) ? reviewChannelTab : selectedChannels[0];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">
              Tinjau & Konfirmasi Peluncuran
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Siap Diluncurkan (4/4 Lolos Verifikasi)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Periksa kembali seluruh konfigurasi saluran, audiens, dan pesan sebelum dikirimkan.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-bold text-slate-800">{currentAudienceObj.count.toLocaleString()}</span>
            <span className="text-slate-400 text-[11px]">Penerima</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-bold text-slate-800">
              ~{Math.max(1, Math.ceil(currentAudienceObj.count / (throttleRate === "turbo" ? 120 : throttleRate === "safe" ? 30 : 60)))}m
            </span>
            <span className="text-slate-400 text-[11px]">Est. Durasi</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Saluran & Pengirim */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="h-3 w-3 text-sky-500" /> Saluran & Akun Pengirim
              </span>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="h-3 w-3" /> Ubah
              </button>
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedChannels.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-bold flex items-center gap-1.5"
                  >
                    {c === "Email" && <Mail className="h-3 w-3 text-sky-600" />}
                    {c === "WhatsApp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                    {c === "Telegram" && <Send className="h-3 w-3 text-sky-500" />}
                    <span>{c}</span>
                  </span>
                ))}
              </div>
              {selectedChannels.includes("Email") && (
                <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Pengirim:</span>
                    <span className="font-semibold text-slate-800">{currentSenderProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Email:</span>
                    <span className="font-medium text-slate-700">{currentSenderProfile.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Target Audiens */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3 w-3 text-indigo-500" /> Target Penerima
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="h-3 w-3" /> Ubah
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  {currentAudienceObj.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                  {currentAudienceObj.count.toLocaleString()} kontak
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {currentAudienceObj.desc}
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Kontak Valid & Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Waktu Peluncuran & Proteksi */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-amber-500" /> Waktu & Proteksi Kirim
              </span>
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="h-3 w-3" /> Ubah
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                {scheduleType === "instant" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                    <Zap className="h-3 w-3 text-emerald-600" /> Kirim Sekarang (Instan)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/70">
                    <Calendar className="h-3 w-3 text-sky-600" /> Terjadwal: {scheduledDate} {scheduledTime} WIB
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                <span>Proteksi Throttle:</span>
                <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {throttleRate === "safe" ? "Aman (Anti-Banned)" : throttleRate === "normal" ? "Standar" : "Cepat (Turbo)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Identitas & Desain */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-purple-500" /> Identitas & Desain
              </span>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="h-3 w-3" /> Ubah
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Nama Kampanye:</span>
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {campaignName || "(Tanpa Nama)"}
                </span>
              </div>
              {selectedChannels.includes("Email") && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Tema Desain:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      {getEmailTheme(emailThemeId).swatches.map((s, idx) => (
                        <span
                          key={idx}
                          className="h-2.5 w-2.5 rounded-full border border-white shadow-xs"
                          style={{ background: s }}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {getEmailTheme(emailThemeId).name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Multi-Channel Live Preview */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Tab Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Pratinjau Pesan yang Akan Diterima Pelanggan
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pilih tab saluran di bawah untuk memeriksa tampilan visual akhir sebelum dikirim.
            </p>
          </div>

          {/* Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            {selectedChannels.map((channel) => {
              const isCurrent = activeTab === channel;
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => onReviewChannelTabChange(channel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {channel === "Email" && <Mail className="h-3 w-3" />}
                  {channel === "WhatsApp" && <MessageSquare className="h-3 w-3" />}
                  {channel === "Telegram" && <Send className="h-3 w-3" />}
                  <span>{channel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel Preview Content */}
        <div className="p-5 bg-slate-50/40">
          {activeTab === "Email" && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {emailSubject || "(Subjek Email Belum Diisi)"}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold flex-shrink-0">
                    {getEmailTheme(emailThemeId).name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="font-semibold text-slate-800">{currentSenderProfile.name}</span>
                  <span className="text-[11px] text-slate-400">&lt;{currentSenderProfile.email}&gt;</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500">Kepada: {currentAudienceObj.name}</span>
                </div>
              </div>

              {(() => {
                const theme = getEmailTheme(emailThemeId);
                const cfg = theme.config;
                const showHeader = cfg.headerPadding !== "0" && cfg.headerPadding !== "";
                const ctaBgClass =
                  emailCtaColor === "emerald" ? "bg-emerald-600" :
                  emailCtaColor === "rose" ? "bg-rose-600" :
                  emailCtaColor === "amber" ? "bg-amber-600" :
                  emailCtaColor === "dark" ? "bg-slate-900" :
                  "bg-indigo-600";

                return (
                  <div style={{ background: cfg.outerBg, padding: "20px 16px" }}>
                    <div
                      style={{
                        background: cfg.cardBg,
                        borderRadius: cfg.cardRadius,
                        boxShadow: cfg.cardShadow,
                        margin: "0 auto",
                        maxWidth: "560px",
                        overflow: "hidden",
                      }}
                    >
                      {showHeader && (
                        <div
                          style={{
                            background: cfg.headerBg,
                            padding: cfg.headerPadding,
                            borderBottom: cfg.headerBorderBottom !== "none" ? cfg.headerBorderBottom : undefined,
                          }}
                        >
                          <div
                            style={{
                              background: cfg.logoBg !== "transparent" && cfg.logoBg !== "" ? cfg.logoBg : undefined,
                              borderRadius: cfg.logoRadius || "6px",
                              padding: cfg.logoPadding || "4px 10px",
                              display: "inline-block",
                            }}
                          >
                            <span
                              style={{
                                color: cfg.logoText,
                                fontSize: cfg.logoFontSize,
                                fontWeight: cfg.logoFontWeight,
                                letterSpacing: cfg.logoLetterSpacing,
                                display: "block",
                              }}
                            >
                              {emailBrandName || "ACME CORP"}
                            </span>
                          </div>
                          {cfg.taglineText && (
                            <p style={{ color: cfg.taglineFg, fontSize: "10px", margin: "4px 0 0", opacity: 0.85 }}>
                              {cfg.taglineText}
                            </p>
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          background: cfg.bodyBg,
                          color: cfg.bodyFg,
                          padding: cfg.bodyPadding,
                          fontSize: cfg.bodyFontSize,
                          lineHeight: cfg.bodyLineHeight,
                        }}
                      >
                        <div className="space-y-2.5">
                          {renderFormattedPreview(emailContent, "Email") || (
                            <span style={{ color: cfg.bodyFg, opacity: 0.45, fontStyle: "italic" }}>
                              (Konten email belum diisi)
                            </span>
                          )}
                        </div>

                        {emailCtaEnabled && emailCtaText && (
                          <div style={{ paddingTop: "20px", textAlign: "center" }}>
                            <span
                              className={`inline-block font-bold text-xs text-white shadow-sm ${ctaBgClass}`}
                              style={{
                                background: cfg.ctaBg !== "#4f46e5" && cfg.ctaBg !== "#0f172a" ? cfg.ctaBg : undefined,
                                color: cfg.ctaFg,
                                borderRadius: cfg.ctaRadius,
                                padding: cfg.ctaPadding,
                                textDecoration: "none",
                                display: "inline-block",
                              }}
                            >
                              {evaluateMergeTags(emailCtaText)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          background: cfg.footerBg,
                          color: cfg.footerFg,
                          padding: cfg.footerPadding,
                          borderTop: cfg.footerBorderTop,
                          fontSize: cfg.footerFontSize,
                          lineHeight: "1.6",
                        }}
                      >
                        <p style={{ margin: "0 0 4px" }}>
                          Anda menerima email ini karena terdaftar sebagai pelanggan kami di {emailBrandName || "Acme Corp"}.
                        </p>
                        <p style={{ margin: 0 }}>
                          <span style={{ color: cfg.footerFg, opacity: 0.8, textDecoration: "underline" }}>
                            Berhenti berlangganan (Unsubscribe)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "WhatsApp" && (
            <div className="max-w-md mx-auto rounded-2xl border border-slate-300 bg-[#efeae2] shadow-sm overflow-hidden">
              <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">{emailBrandName || "Acme Official"}</span>
                    <span className="text-[10px] text-emerald-100/80 block">Official Business Account</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-semibold">WhatsApp</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-2xs max-w-[92%] space-y-2">
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {renderFormattedPreview(waContent, "WhatsApp") || (
                      <span className="text-slate-400 italic">(Konten WhatsApp belum diisi)</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>10:00</span>
                    <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Telegram" && (
            <div className="max-w-md mx-auto rounded-2xl border border-slate-700 bg-[#0f172a] shadow-sm overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Send className="h-3.5 w-3.5 text-sky-400" /> Telegram Channel Preview
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Bot Broadcast</span>
              </div>
              <div className="bg-[#1e293b] rounded-2xl p-4 shadow-xs space-y-2 border border-slate-700/60">
                <span className="text-xs font-bold text-sky-400 block">{emailBrandName || "Acme Bot"}</span>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {renderFormattedPreview(telegramContent, "Telegram") || (
                    <span className="text-slate-400 italic">(Konten Telegram belum diisi)</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block text-right">10:00</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
