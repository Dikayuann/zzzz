import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  LogOut,
  Settings,
  ArrowRight,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchCommand } from "@/components/layout/search-command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationDetailDialog } from "@/components/notifications/NotificationDetailDialog";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import type { NotificationItem } from "@/types/notification";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setSelectedNotification,
  } = useNotifications();

  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    setIsMac(
      typeof window !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    );
  }, []);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  const getSeverityIcon = (sev: NotificationItem["severity"]) => {
    switch (sev) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertOctagon className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-sky-500" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 sm:px-6">
        {/* LEFT: Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>

        {/* RIGHT: Search, + Campaign Baru Button, Bell Notification, and User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            onClick={() => navigate("/campaigns/new")}
            className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.98] text-white font-semibold text-xs px-3.5 py-2 shadow-xs shadow-sky-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Campaign Baru</span>
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
              className="w-84 sm:w-96 rounded-2xl p-0 shadow-xl border-slate-200/90"
            >
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    Notifikasi
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      setSelectedNotification(n);
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-colors hover:bg-slate-50 cursor-pointer ${
                      !n.isRead ? "bg-sky-50/40" : ""
                    }`}
                  >
                    <div className="mt-0.5 rounded-xl p-2 bg-slate-100/80 shrink-0">
                      {getSeverityIcon(n.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 leading-tight truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="w-full py-1 text-center text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Notifikasi ({notifications.length})</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Header Dropdown with Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Profil & Pengaturan Akun"
                className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-sky-200 transition outline-none cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs shadow-2xs">
                  {userInitials}
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-60 rounded-2xl p-1.5 shadow-xl border-slate-200/90"
            >
              <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Sarah Admin"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || "sarah@acmecorp.co"}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700 font-semibold text-[10px]">
                  {user?.roles?.[0] || "ADMIN"}
                </span>
              </div>

              <DropdownMenuItem
                className="cursor-pointer text-xs font-medium rounded-lg"
                onClick={() => navigate("/account")}
              >
                <Settings className="mr-2 h-4 w-4 text-slate-500" />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer text-xs font-medium rounded-lg"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="mr-2 h-4 w-4 text-slate-500" />
                <span className="flex-1">Pusat Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-700">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-medium rounded-lg"
                onClick={() => setLogoutModalOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar Akun</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
      />
    </>
  );
};
