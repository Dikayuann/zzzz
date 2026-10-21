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
} from "lucide-react";
import type { DeliveryChannel, SenderProfile, AudienceOption } from "@/types/campaignWizard";
import { getEmailTheme } from "@/data/emailThemes";
import { WizardLivePreview } from "./WizardLivePreview";

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
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2.5">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Pratinjau Pesan yang Akan Diterima Pelanggan
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pilih tab saluran di bawah untuk memeriksa tampilan visual akhir (tersedia mode Desktop dan Mobile).
            </p>
          </div>

          {/* Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            {selectedChannels.map((channel) => {
              const isCurrent = activeTab === channel;
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => onReviewChannelTabChange(channel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? "bg-white text-slate-900 shadow-2xs"
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

        <WizardLivePreview
          activeChannel={activeTab}
          emailContent={emailContent}
          emailSubject={emailSubject}
          waContent={waContent}
          telegramContent={telegramContent}
          emailBrandName={emailBrandName}
          emailHeaderStyle="clean"
          emailCtaEnabled={emailCtaEnabled}
          emailCtaText={emailCtaText}
          emailCtaColor={emailCtaColor}
          emailThemeId={emailThemeId}
          emailSenderName={currentSenderProfile.name}
          emailSenderAddress={currentSenderProfile.email}
          waSenderName={currentSenderProfile.name}
          telegramBotName={currentSenderProfile.name}
        />
      </div>
    </div>
  );
};
