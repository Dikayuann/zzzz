import React, { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationItem } from "@/types/notification";

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    setSelectedNotification,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Semua", count: notifications.length },
    { id: "unread", label: "Belum Dibaca", count: unreadCount },
    {
      id: "campaign",
      label: "Kampanye",
      count: notifications.filter((n) => n.type === "campaign" || n.type === "schedule").length,
    },
    {
      id: "gateway",
      label: "Saluran & Gateway",
      count: notifications.filter((n) => n.type === "gateway").length,
    },
    {
      id: "quota",
      label: "Kuota & Akun",
      count: notifications.filter((n) => n.type === "quota" || n.type === "contacts").length,
    },
    {
      id: "security",
      label: "Keamanan",
      count: notifications.filter((n) => n.type === "security").length,
    },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Filter Category
      if (activeCategory === "unread" && n.isRead) return false;
      if (activeCategory === "campaign" && n.type !== "campaign" && n.type !== "schedule")
        return false;
      if (activeCategory === "gateway" && n.type !== "gateway") return false;
      if (activeCategory === "quota" && n.type !== "quota" && n.type !== "contacts") return false;
      if (activeCategory === "security" && n.type !== "security") return false;

      // Filter Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesDesc = n.desc.toLowerCase().includes(query);
        const matchesMsg = n.fullMessage.toLowerCase().includes(query);
        const matchesId = n.technicalDetails?.campaignId?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesMsg || matchesId;
      }

      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  const getSeverityMeta = (sev: NotificationItem["severity"]) => {
    switch (sev) {
      case "success":
        return {
          icon: CheckCircle2,
          iconClass: "text-emerald-500 bg-emerald-50 border-emerald-100",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          label: "Sukses",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconClass: "text-amber-500 bg-amber-50 border-amber-100",
          badge: "bg-amber-50 text-amber-700 border-amber-200/60",
          label: "Peringatan",
        };
      case "error":
        return {
          icon: AlertOctagon,
          iconClass: "text-rose-500 bg-rose-50 border-rose-100",
          badge: "bg-rose-50 text-rose-700 border-rose-200/60",
          label: "Kendala",
        };
      default:
        return {
          icon: Info,
          iconClass: "text-sky-500 bg-sky-50 border-sky-100",
          badge: "bg-sky-50 text-sky-700 border-sky-200/60",
          label: "Info",
        };
    }
  };

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: unreadCount,
      successCount: notifications.filter((n) => n.severity === "success").length,
      issuesCount: notifications.filter((n) => n.severity === "warning" || n.severity === "error").length,
    };
  }, [notifications, unreadCount]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-xs">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Notifikasi & Pemberitahuan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat riwayat aktivitas broadcast, kesehatan saluran gateway, dan audit keamanan.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-sky-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Total Notifikasi
          </span>
          <span className="text-xl font-bold text-slate-900 block mt-1">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Seluruh riwayat tersimpan</span>
        </div>

        <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-sky-600 block uppercase">
            Belum Dibaca
          </span>
          <span className="text-xl font-bold text-sky-700 block mt-1">
            {stats.unread}
          </span>
          <span className="text-[10px] text-sky-500/80 mt-0.5 block">Memerlukan perhatian</span>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 block uppercase">
            Eksekusi Sukses
          </span>
          <span className="text-xl font-bold text-emerald-700 block mt-1">
            {stats.successCount}
          </span>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">Kampanye & sinkronisasi</span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 block uppercase">
            Peringatan & Kendala
          </span>
          <span className="text-xl font-bold text-amber-700 block mt-1">
            {stats.issuesCount}
          </span>
          <span className="text-[10px] text-amber-600/80 mt-0.5 block">Gateway / limit kuota</span>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari notifikasi berdasarkan judul, konten, atau ID kampanye..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200/90 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === cat.id
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. NOTIFICATION LIST */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 bg-white space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Tidak ada notifikasi</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan notifikasi dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Semua pemberitahuan telah dibaca atau belum ada notifikasi baru di kategori ini."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const meta = getSeverityMeta(n.severity);
            const Icon = meta.icon;

            return (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  setSelectedNotification(n);
                }}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
                  !n.isRead
                    ? "bg-sky-50/30 border-sky-200/80 hover:border-sky-300"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon Avatar */}
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${meta.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}
                      >
                        {meta.label}
                      </span>

                      {n.channel && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                          {n.channel === "Email" && <Mail className="h-2.5 w-2.5 text-sky-600" />}
                          {n.channel === "WhatsApp" && <MessageSquare className="h-2.5 w-2.5 text-emerald-600" />}
                          {n.channel === "Telegram" && <Send className="h-2.5 w-2.5 text-sky-500" />}
                          {n.channel === "Multi-Channel" && <Layers className="h-2.5 w-2.5 text-indigo-600" />}
                          <span>{n.channel}</span>
                        </span>
                      )}

                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                      )}

                      <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{n.timeAgo}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-sky-600 transition">
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {n.desc}
                    </p>

                    {/* Quick Metric Pills */}
                    {n.metrics && (
                      <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-600 flex-wrap">
                        {n.metrics.total !== undefined && (
                          <span className="bg-slate-100/90 px-2 py-0.5 rounded-md font-medium">
                            Sasaran: <strong className="text-slate-800">{n.metrics.total}</strong>
                          </span>
                        )}
                        {n.metrics.deliveredRate && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                            Terkirim: {n.metrics.deliveredRate}
                          </span>
                        )}
                        {n.metrics.failed !== undefined && n.metrics.failed > 0 && (
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold">
                            Gagal: {n.metrics.failed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Action Chevron & Delete Button */}
                  <div className="shrink-0 flex items-center gap-2 self-center">
                    <button
                      type="button"
                      title="Hapus Notifikasi"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] font-semibold text-sky-600 hidden sm:inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Detail <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
