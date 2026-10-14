import React from "react";
import { Mail, MessageSquare, Send, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

export const StepChannel: React.FC<StepChannelProps> = ({
  campaignName,
  onCampaignNameChange,
  selectedChannels,
  onToggleChannel,
  emailSender,
  onEmailSenderChange,
  replyToEmail,
  onReplyToEmailChange,
  waSender,
  telegramBot,
  senderProfiles,
}) => {
  const currentSenderProfile =
    senderProfiles.find((p) => p.id === emailSender) || senderProfiles[0];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Pilih Saluran & Identitas Pengirim
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Bisa memilih lebih dari satu saluran pengiriman sekaligus (Multi-Channel).
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
            Saluran Pengiriman (Bisa pilih lebih dari satu) <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            {selectedChannels.length} saluran terpilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Email Card */}
          <div
            onClick={() => onToggleChannel("Email")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              selectedChannels.includes("Email")
                ? "border-sky-500 bg-sky-50/20 shadow-xs"
                : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  selectedChannels.includes("Email")
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  selectedChannels.includes("Email")
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selectedChannels.includes("Email") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Email SMTP</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                HTML email dengan tracking open & click
              </p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div
            onClick={() => onToggleChannel("WhatsApp")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              selectedChannels.includes("WhatsApp")
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  selectedChannels.includes("WhatsApp")
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  selectedChannels.includes("WhatsApp")
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selectedChannels.includes("WhatsApp") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">WhatsApp Gateway</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pesan instan langsung ke nomor WhatsApp
              </p>
            </div>
          </div>

          {/* Telegram Card */}
          <div
            onClick={() => onToggleChannel("Telegram")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              selectedChannels.includes("Telegram")
                ? "border-blue-500 bg-blue-50/20 shadow-xs"
                : "border-slate-200/80 hover:border-slate-300 bg-white opacity-80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  selectedChannels.includes("Telegram")
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Send className="h-4.5 w-4.5" />
              </div>
              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                  selectedChannels.includes("Telegram")
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selectedChannels.includes("Telegram") && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Telegram Bot</h4>
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
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-sky-600" />
              Konfigurasi Alamat Email Pengirim (From)
            </span>
            <span className="text-[11px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-semibold">
              SMTP Organisasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Pilih Email Pengirim (From Address)
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500 flex items-center justify-between shadow-2xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600 shrink-0">
                        <Mail className="h-3 w-3" />
                      </div>
                      <div className="text-left truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {currentSenderProfile.name}
                          </span>
                          <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-bold text-sky-700">
                            {currentSenderProfile.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {currentSenderProfile.email}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-2" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-[320px] rounded-2xl p-1.5 shadow-lg">
                  {senderProfiles.map((prof) => (
                    <DropdownMenuItem
                      key={prof.id}
                      onClick={() => onEmailSenderChange(prof.id)}
                      className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs ${
                        emailSender === prof.id
                          ? "bg-sky-50 text-sky-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{prof.name}</span>
                          <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600">
                            {prof.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">{prof.email}</span>
                        <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                          {prof.quota}
                        </span>
                      </div>
                      {emailSender === prof.id && (
                        <Check className="h-4 w-4 text-sky-600 stroke-[2.5]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-[10px] text-slate-400 block mt-0.5">
                {currentSenderProfile.quota}
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
                placeholder="support@acmecorp.co"
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
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">
                Nomor Gateway WhatsApp Aktif
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {waSender} (Sesi Server Online & Terhubung)
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            ● Siap Blast
          </span>
        </div>
      )}

      {/* PENGATURAN SENDER TELEGRAM */}
      {selectedChannels.includes("Telegram") && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-3.5 flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">
                Bot Telegram Pribadi (FR-CHN-02)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {telegramBot} (Token Tersambung)
              </span>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
            ● Bot Aktif
          </span>
        </div>
      )}
    </div>
  );
};
