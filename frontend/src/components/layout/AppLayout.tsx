import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Radio,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Send },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Channel Settings", href: "/channels", icon: Radio },
  { name: "User Management", href: "/users", icon: Settings },
];

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs">
              CB
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-sm leading-tight text-foreground">
                Campaign Blast
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Management Console
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tenant Info */}
        <div className="px-6 py-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900/50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Active Tenant
              </span>
              <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                ID #{user?.tenantId ?? 1}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.name ? `${user.name}'s Org` : "Default Organization"}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-4 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Channel Status Quick Glance */}
        <div className="p-4 mx-4 mb-3 rounded-xl border bg-background/50 space-y-2">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">
            Channel Readiness
          </p>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-amber-500" />
              <span>SMTP Email</span>
            </div>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
              <span>Telegram Bot</span>
            </div>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold leading-none">
                  {user?.name || "Pengguna"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground mt-1">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive shrink-0"
              title="Keluar"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <span className="text-xs text-muted-foreground font-medium">
                Campaign Blast Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gradient"
              size="sm"
              className="gap-2 shadow-sm"
              onClick={() => navigate("/campaigns")}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Blast Baru</span>
            </Button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
