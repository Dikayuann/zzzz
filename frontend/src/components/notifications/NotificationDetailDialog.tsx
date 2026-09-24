import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Trash2,
  CheckCheck,
  Server,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import type { NotificationItem } from "@/types/notification";
import { useNotifications } from "@/context/NotificationContext";

export const NotificationDetailDialog: React.FC = () => {
  const navigate = useNavigate();
  const { selectedNotification, setSelectedNotification, markAsRead, deleteNotification } =
    useNotifications();

  if (!selectedNotification) return null;

  const item: NotificationItem = selectedNotification;

  const getSeverityStyle = (sev: NotificationItem["severity"]) => {
    switch (sev) {
      case "success":
        return {
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          badgeColor: "bg-emerald-100 text-emerald-800",
          badgeLabel: "Sukses",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          badgeColor: "bg-amber-100 text-amber-800",
          badgeLabel: "Peringatan",
        };
      case "error":
        return {
          icon: AlertOctagon,
          iconColor: "text-rose-600",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          badgeColor: "bg-rose-100 text-rose-800",
          badgeLabel: "Kendala",
        };
      default:
        return {
          icon: Info,
          iconColor: "text-sky-600",
          bgColor: "bg-sky-50",
          borderColor: "border-sky-200",
          badgeColor: "bg-sky-100 text-sky-800",
          badgeLabel: "Informasi",
        };
    }
  };

  const style = getSeverityStyle(item.severity);
  const Icon = style.icon;

  const handleActionClick = (url?: string) => {
    if (url) {
      markAsRead(item.id);
      setSelectedNotification(null);
      navigate(url);
    }
  };

  return (
    <Dialog
      open={Boolean(selectedNotification)}
      onOpenChange={(open) => {
        if (!open) setSelectedNotification(null);
      }}
    >
      <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-hidden">
        {/* HEADER SECTION */}
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${style.badgeColor}`}
              >
                <Icon className="h-3 w-3" />
                {style.badgeLabel}
              </span>
              {item.channel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  {item.channel === "Email" && <Mail className="h-3 w-3 text-sky-600" />}
                  {item.channel === "WhatsApp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                  {item.channel === "Telegram" && <Send className="h-3 w-3 text-sky-500" />}
                  {item.channel === "Multi-Channel" && <Layers className="h-3 w-3 text-indigo-600" />}
                  <span>{item.channel}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{item.timeAgo}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${style.bgColor} ${style.borderColor} border`}
            >
              <Icon className={`h-6 w-6 ${style.iconColor}`} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-slate-900 leading-snug">
                {item.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Pemberitahuan resmi sistem CampaignBlast Engine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* FULL MESSAGE NARRATIVE */}
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
            {item.fullMessage}
          </div>

          {/* KPI / METRICS GRID (IF AVAILABLE) */}
          {item.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {item.metrics.total !== undefined && (
                <div className="p-2.5 rounded-xl border border-slate-200/90 bg-white">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Total Sasaran
                  </span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {item.metrics.total.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {item.metrics.success !== undefined && (
                <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase block">
                    Sukses Sampai
                  </span>
                  <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                    {item.metrics.success.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {item.metrics.failed !== undefined && (
                <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/40">
                  <span className="text-[10px] text-rose-600 font-semibold uppercase block">
                    Gagal / Mental
                  </span>
                  <span className="text-sm font-bold text-rose-700 block mt-0.5">
                    {item.metrics.failed.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {item.metrics.openRate && (
                <div className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40">
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase block">
                    Open Rate
                  </span>
                  <span className="text-sm font-bold text-indigo-700 block mt-0.5">
                    {item.metrics.openRate}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TECHNICAL DETAILS BOX (REAL-WORLD AUDIT TRAIL) */}
          {item.technicalDetails && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="h-3 w-3" /> Data Teknis & Audit Trail
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {item.technicalDetails.campaignId && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">ID Kampanye:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {item.technicalDetails.campaignId}
                    </span>
                  </div>
                )}
                {item.technicalDetails.deviceId && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Identitas Gateway:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {item.technicalDetails.deviceId}
                    </span>
                  </div>
                )}
                {item.technicalDetails.ipAddress && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Alamat IP:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {item.technicalDetails.ipAddress}
                    </span>
                  </div>
                )}
                {item.technicalDetails.location && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lokasi:</span>
                    <span className="font-semibold text-slate-800">
                      {item.technicalDetails.location}
                    </span>
                  </div>
                )}
                {item.technicalDetails.provider && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Provider / Driver:</span>
                    <span className="font-semibold text-slate-800">
                      {item.technicalDetails.provider}
                    </span>
                  </div>
                )}
                {item.technicalDetails.fileName && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Berkas:</span>
                    <span className="font-semibold text-slate-800">
                      {item.technicalDetails.fileName}
                    </span>
                  </div>
                )}
                {item.technicalDetails.resetTime && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block">Status Eksekusi:</span>
                    <span className="font-semibold text-slate-800">
                      {item.technicalDetails.resetTime}
                    </span>
                  </div>
                )}
                {item.technicalDetails.errorReason && (
                  <div className="sm:col-span-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="text-[10px] font-bold block">Penyebab Error:</span>
                    <span className="font-mono text-[11px] leading-tight block mt-0.5">
                      {item.technicalDetails.errorReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!item.isRead ? (
              <button
                type="button"
                onClick={() => markAsRead(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-sky-600" />
                <span>Tandai Sudah Dibaca</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                Sudah dibaca
              </span>
            )}
            <button
              type="button"
              onClick={() => deleteNotification(item.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Hapus Notifikasi Ini"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            {item.actionLabel && (
              <button
                type="button"
                onClick={() => handleActionClick(item.actionUrl)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/20 transition cursor-pointer active:scale-95"
              >
                <span>{item.actionLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
