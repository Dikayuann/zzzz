import React from "react";
import {
  Send,
  Mail,
  MessageSquare,
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
  sendStartTime?: string;
  sendEndTime?: string;
  enableSendingWindow?: boolean;
  enableEndDate?: boolean;
  endDate?: string;
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
  sendStartTime = "09:00",
  sendEndTime = "17:00",
  enableSendingWindow = false,
  enableEndDate = false,
  endDate = "",
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
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Header Section */}
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">
          Tinjau Kampanye
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Periksa kembali detail konfigurasi dan pesan sebelum diluncurkan.
        </p>
      </div>

      {/* 4 Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Saluran & Pengirim */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Saluran & Pengirim</span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Saluran:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedChannels.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs"
                  >
                    {c === "Email" && <Mail className="h-3 w-3 text-slate-600" />}
                    {c === "WhatsApp" && <MessageSquare className="h-3 w-3 text-slate-600" />}
                    {c === "Telegram" && <Send className="h-3 w-3 text-slate-600" />}
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
            {selectedChannels.includes("Email") && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Pengirim:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">
                    {currentSenderProfile.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Alamat Email:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">
                    {currentSenderProfile.email}
                  </span>
                </div>
              </>
            )}
            {selectedChannels.includes("WhatsApp") && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-medium text-slate-800">WhatsApp Gateway</span>
              </div>
            )}
            {selectedChannels.includes("Telegram") && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bot:</span>
                <span className="font-medium text-slate-800">Telegram Bot</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Target Penerima */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Target Penerima</span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Segmen Audiens:</span>
              <span className="font-medium text-slate-800 truncate max-w-[180px]">
                {currentAudienceObj.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Kontak:</span>
              <span className="font-semibold text-slate-900">
                {currentAudienceObj.count.toLocaleString()} penerima
              </span>
            </div>
            {currentAudienceObj.desc && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-50 leading-relaxed truncate">
                {currentAudienceObj.desc}
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Waktu & Pengiriman */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Waktu & Pengiriman</span>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Waktu Mulai:</span>
              <span className="font-medium text-slate-800">
                {selectedChannels.includes("WhatsApp")
                  ? `${scheduledDate} (pkl ${sendStartTime}–${sendEndTime} WIB)`
                  : scheduleType === "instant"
                  ? "Kirim Sekarang"
                  : `${scheduledDate} pkl ${scheduledTime} WIB`}
              </span>
            </div>
            {!selectedChannels.includes("WhatsApp") && enableSendingWindow && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jam Kerja:</span>
                <span className="font-medium text-slate-800">
                  {sendStartTime} – {sendEndTime} WIB
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Batas Akhir:</span>
              <span className="font-medium text-slate-800">
                {enableEndDate && endDate ? `${endDate} (23:59 WIB)` : "Tidak dibatasi"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Kecepatan:</span>
              <span className="font-medium text-slate-800">
                {selectedChannels.includes("WhatsApp")
                  ? throttleRate === "safe"
                    ? "Smart Drip (maks 35/hari)"
                    : throttleRate === "normal"
                    ? "Bertahap (1–3 mnt)"
                    : "Cepat (15–45 dtk)"
                  : selectedChannels.includes("Email")
                  ? throttleRate === "safe"
                    ? "Aman (1–3 dtk/email)"
                    : throttleRate === "normal"
                    ? "Standar (0.5–1 dtk/email)"
                    : "Cepat (instan)"
                  : throttleRate}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Konten Pesan */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Konten Pesan</span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
            >
              Ubah
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nama Kampanye:</span>
              <span className="font-medium text-slate-800 truncate max-w-[180px]">
                {campaignName || "(Tanpa Nama)"}
              </span>
            </div>
            {selectedChannels.includes("Email") && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subjek Email:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">
                    {emailSubject || "(Tanpa Subjek)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tema Email:</span>
                  <span className="font-medium text-slate-800">
                    {getEmailTheme(emailThemeId).name}
                  </span>
                </div>
              </>
            )}
            {selectedChannels.includes("WhatsApp") && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-medium text-slate-800">Teks WhatsApp</span>
              </div>
            )}
            {selectedChannels.includes("Telegram") && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-medium text-slate-800">Teks Telegram Bot</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pratinjau Pesan */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-800">
            Pratinjau Pesan
          </span>

          {selectedChannels.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              {selectedChannels.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => onReviewChannelTabChange(channel)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    activeTab === channel
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          )}
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
