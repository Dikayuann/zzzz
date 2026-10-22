import React from "react";
import { Mail, MessageSquare, Send, Check } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryChannel, SenderProfile } from "@/types/campaignWizard";

interface StepChannelProps {
  campaignName: string;
  onCampaignNameChange: (val: string) => void;
  selectedChannels: DeliveryChannel[];
  onToggleChannel: (channel: DeliveryChannel) => void;
  emailSender: string;
  onEmailSenderChange: (val: string) => void;
  replyToEmail: string;
  onReplyToEmailChange: (val: string) => void;
  waSender: string;
  telegramBot: string;
  senderProfiles: SenderProfile[];
  channelStatus?: {
    email: { connected: boolean; fromEmail: string; fromName: string };
    whatsapp: { connected: boolean; phoneNumber: string; pushName: string };
    telegram: { connected: boolean; botUsername: string };
  };
}

export const StepChannel: React.FC<StepChannelProps> = ({
  campaignName,
  onCampaignNameChange,
  selectedChannels,
  onToggleChannel,
  emailSender,
  onEmailSenderChange: _onEmailSenderChange,
  replyToEmail,
  onReplyToEmailChange,
  waSender,
  telegramBot,
  senderProfiles,
  channelStatus,
}) => {
  const currentSenderProfile =
    senderProfiles.find((p) => p.id === emailSender) || senderProfiles[0];

  const isEmailConnected = channelStatus?.email?.connected ?? false;
  const isWaConnected = channelStatus?.whatsapp?.connected ?? false;
  const isTgConnected = channelStatus?.telegram?.connected ?? false;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Pilih Saluran & Identitas Pengirim
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pilih 1 saluran pengiriman utama untuk kampanye broadcast ini.
        </p>
      </div>

      {/* Input: Campaign Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-800">
          Nama Kampanye <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => onCampaignNameChange(e.target.value)}
          placeholder="Contoh: September Super Promo & Onboarding"
          className="w-full h-11 rounded-2xl border border-slate-200/90 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
        />
      </div>

      {/* Delivery Channel Multi-Selection Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800">
            Saluran Pengiriman <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
              Saluran terpilih: <strong className="text-sky-600">{selectedChannels[0]}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Email Card */}
          <div
            onClick={() => {
              if (!isEmailConnected) {
                toast.error("Saluran Email SMTP belum dikonfigurasi. Silakan atur di menu Saluran.");
                return;
              }
              onToggleChannel("Email");
            }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 relative ${
              !isEmailConnected
                ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                : selectedChannels.includes("Email")
                ? "border-sky-500 bg-sky-50/20 shadow-xs cursor-pointer"
                : "border-slate-200/80 hover:border-slate-300 bg-white cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  !isEmailConnected
                    ? "bg-slate-200 text-slate-400"
                    : selectedChannels.includes("Email")
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  !isEmailConnected
                    ? "border-slate-300 bg-slate-100"
                    : selectedChannels.includes("Email")
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isEmailConnected && selectedChannels.includes("Email") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900">Email SMTP</h4>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isEmailConnected
                      ? "bg-sky-100 text-sky-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isEmailConnected ? "Terhubung" : "Belum Terhubung"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                HTML email dengan tracking open & click
              </p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div
            onClick={() => {
              if (!isWaConnected) {
                toast.error("Saluran WhatsApp belum terhubung. Silakan scan QR di menu Saluran.");
                return;
              }
              onToggleChannel("WhatsApp");
            }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 relative ${
              !isWaConnected
                ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                : selectedChannels.includes("WhatsApp")
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs cursor-pointer"
                : "border-slate-200/80 hover:border-slate-300 bg-white cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  !isWaConnected
                    ? "bg-slate-200 text-slate-400"
                    : selectedChannels.includes("WhatsApp")
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  !isWaConnected
                    ? "border-slate-300 bg-slate-100"
                    : selectedChannels.includes("WhatsApp")
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isWaConnected && selectedChannels.includes("WhatsApp") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900">WhatsApp Gateway</h4>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isWaConnected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isWaConnected ? "Terhubung" : "Belum Terhubung"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pesan instan langsung ke nomor WhatsApp
              </p>
            </div>
          </div>

          {/* Telegram Card */}
          <div
            onClick={() => {
              if (!isTgConnected) {
                toast.error("Saluran Telegram belum terhubung. Silakan atur token di menu Saluran.");
                return;
              }
              onToggleChannel("Telegram");
            }}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 relative ${
              !isTgConnected
                ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                : selectedChannels.includes("Telegram")
                ? "border-blue-500 bg-blue-50/20 shadow-xs cursor-pointer"
                : "border-slate-200/80 hover:border-slate-300 bg-white cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  !isTgConnected
                    ? "bg-slate-200 text-slate-400"
                    : selectedChannels.includes("Telegram")
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Send className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  !isTgConnected
                    ? "border-slate-300 bg-slate-100"
                    : selectedChannels.includes("Telegram")
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isTgConnected && selectedChannels.includes("Telegram") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900">Telegram Bot</h4>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isTgConnected
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isTgConnected ? "Terhubung" : "Belum Terhubung"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kirim via bot token pribadi pengguna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PENGATURAN SENDER EMAIL */}
      {selectedChannels.includes("Email") && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3.5 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-600" />
              Alamat Email Pengirim (From)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Email Pengirim
              </label>

              <div className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600 shrink-0">
                    <Mail className="h-3 w-3" />
                  </div>
                  <div className="text-left truncate">
                    <span className="font-semibold text-slate-900 text-xs block truncate">
                      {channelStatus?.email?.fromName || currentSenderProfile.name || "Email Pengirim Resmi"}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {channelStatus?.email?.fromEmail || emailSender || currentSenderProfile.email}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 block mt-0.5">
                Alamat pengirim otomatis sesuai konfigurasi SMTP
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Alamat Balasan (Reply-To)
              </label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => onReplyToEmailChange(e.target.value)}
                placeholder={channelStatus?.email?.fromEmail || "no-reply@domain.com"}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Email tempat balasan dari penerima akan diarahkan
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PENGATURAN SENDER WHATSAPP */}
      {selectedChannels.includes("WhatsApp") && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">
                {channelStatus?.whatsapp?.pushName || "WhatsApp Gateway"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {channelStatus?.whatsapp?.phoneNumber || waSender} • Terhubung
              </span>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Aktif
          </span>
        </div>
      )}

      {/* PENGATURAN SENDER TELEGRAM */}
      {selectedChannels.includes("Telegram") && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shrink-0">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">
                {channelStatus?.telegram?.botUsername || telegramBot ? `${channelStatus?.telegram?.botUsername || telegramBot}` : "Telegram Bot"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {telegramBot || channelStatus?.telegram?.botUsername} • Terhubung
              </span>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Aktif
          </span>
        </div>
      )}
    </div>
  );
};
