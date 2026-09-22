import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Bell,
  Search,
  CheckCircle2,
  Radio,
  Clock,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchCommand } from "@/components/layout/search-command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    setIsMac(
      typeof window !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    );
  }, []);

  const notifications = [
    {
      id: 1,
      title: "Kampanye Promo Merdeka Selesai",
      desc: "24,340 pesan berhasil terkirim via Email & WhatsApp",
      time: "10 menit lalu",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      unread: true,
    },
    {
      id: 2,
      title: "Saluran WhatsApp Terhubung",
      desc: "Node server gateway WhatsApp siap digunakan",
      time: "1 jam lalu",
      icon: Radio,
      iconColor: "text-sky-500",
      unread: true,
    },
    {
      id: 3,
      title: "Laporan Mingguan Siap",
      desc: "Statistik performa pesan 7 hari terakhir telah diperbarui",
      time: "Kemarin",
      icon: Clock,
      iconColor: "text-slate-400",
      unread: false,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-6">
        {/* LEFT: Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>

        {/* RIGHT: Search, + Campaign Baru Button, and Bell Notification */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            title={isMac ? "Pencarian Cepat (⌘K)" : "Pencarian Cepat (Ctrl+K)"}
            className="flex h-9 w-36 sm:w-52 items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/70 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">Cari menu/data...</span>
            </div>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-slate-500 shadow-2xs">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          {/* "+ Campaign Baru" Primary Button */}
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.98] text-white font-semibold text-xs px-3.5 py-2 shadow-xs shadow-sky-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Campaign Baru</span>
          </button>

          {/* Notification Bell with Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Notifikasi & Pemberitahuan"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-2xs outline-none"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 ring-2 ring-white" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-80 rounded-2xl p-0 shadow-xl border-slate-200/90"
            >
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    Notifikasi
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-700">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-3 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                        n.unread && unreadCount > 0 ? "bg-sky-50/30" : ""
                      }`}
                    >
                      <div className="mt-0.5 rounded-lg p-1.5 bg-slate-100 shrink-0">
                        <Icon className={`h-4 w-4 ${n.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigate("/campaigns")}
                  className="w-full py-1 text-center text-[11px] font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  Lihat Riwayat Kampanye Lengkap →
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
