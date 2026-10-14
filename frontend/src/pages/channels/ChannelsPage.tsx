import React, { useState, useEffect } from "react";
import { Mail, Send, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import type { ChannelTab } from "@/types/channel";
import {
  WhatsAppChannelTab,
  SmtpChannelTab,
  TelegramChannelTab,
} from "@/components/channels";

export const ChannelsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChannelTab>("whatsapp");
  const [status, setStatus] = useState({
    whatsapp: false,
    email: false,
    telegram: false,
  });

  // Ambil ringkasan status awal untuk indikator badge/dot
  useEffect(() => {
    const fetchInitialStatuses = async () => {
      try {
        const [waRes, smtpRes, tgRes] = await Promise.allSettled([
          api.get("/channels/whatsapp/qr/status"),
          api.get("/settings/smtp"),
          api.get("/channels/telegram"),
        ]);

        const waOk =
          waRes.status === "fulfilled" &&
          waRes.value.data?.data?.status === "connected";
        const smtpOk =
          smtpRes.status === "fulfilled" &&
          Boolean(
            smtpRes.value.data?.data?.verifiedAt ||
              smtpRes.value.data?.data?.hasPassword
          );
        const tgOk =
          tgRes.status === "fulfilled" &&
          Boolean(
            tgRes.value.data?.data?.connected ||
              tgRes.value.data?.data?.bot?.status === "connected"
          );

        let metaOk = false;
        try {
          const savedMeta = localStorage.getItem("channel_meta_wa");
          if (savedMeta) {
            metaOk = Boolean(JSON.parse(savedMeta)?.phoneNumberId);
          }
        } catch {
          // Abaikan kesalahan parse
        }

        setStatus({
          whatsapp: waOk || metaOk,
          email: smtpOk,
          telegram: tgOk,
        });
      } catch (err) {
        console.error("Gagal mengambil status awal channel:", err);
      }
    };

    fetchInitialStatuses();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl mx-auto w-full">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Channel Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi cara campaign dikirimkan ke kontak Anda.
        </p>
      </div>

      {/* 2. CHANNEL NAVIGATION TABS */}
      <div className="flex flex-wrap sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 w-full sm:w-auto">
        {/* Email Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "email"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.email ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
        </button>

        {/* Telegram Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("telegram")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "telegram"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Telegram</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.telegram ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
        </button>

        {/* WhatsApp Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "whatsapp"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.whatsapp ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
        </button>
      </div>

      {/* 3. ACTIVE CHANNEL TAB CONTENT */}
      {activeTab === "whatsapp" && (
        <WhatsAppChannelTab
          onStatusChange={(connected) =>
            setStatus((prev) => ({ ...prev, whatsapp: connected }))
          }
        />
      )}

      {activeTab === "email" && (
        <SmtpChannelTab
          onStatusChange={(connected) =>
            setStatus((prev) => ({ ...prev, email: connected }))
          }
        />
      )}

      {activeTab === "telegram" && (
        <TelegramChannelTab
          onStatusChange={(connected) =>
            setStatus((prev) => ({ ...prev, telegram: connected }))
          }
        />
      )}
    </div>
  );
};
