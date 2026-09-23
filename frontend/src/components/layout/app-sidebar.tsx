import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Send,
  Users,
  FileText,
  Shield,
  UserCheck,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      title: "Campaigns",
      icon: Send,
      path: "/campaigns",
    },
    {
      title: "Contacts",
      icon: Users,
      path: "/contacts",
    },
    {
      title: "Templates",
      icon: FileText,
      path: "/templates",
    },
    {
      title: "Channels",
      icon: Shield,
      path: "/channels",
    },
    {
      title: "Users & Roles",
      icon: UserCheck,
      path: "/users",
    },
    {
      title: "Account",
      icon: Settings,
      path: "/account",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white">
      {/* 1. BRAND HEADER & WORKSPACE */}
      <SidebarHeader className="p-3">
        {/* Brand Logo */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white font-bold shadow-xs cursor-pointer mx-auto">
                <Send className="h-4 w-4 -rotate-12" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={14} className="z-50 font-medium text-xs bg-slate-900 text-white shadow-xl px-2.5 py-1.5 rounded-lg border border-slate-800">
              CampaignBlast
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs shrink-0">
              <Send className="h-4 w-4 -rotate-12" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              CampaignBlast
            </span>
          </div>
        )}

        {/* Workspace Dropdown Switcher (Acme Corp) */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200/70 cursor-pointer mx-auto hover:bg-sky-200/60 transition">
                A
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={14} className="z-50 font-medium text-xs bg-slate-900 text-white shadow-xl px-2.5 py-1.5 rounded-lg border border-slate-800">
              Acme Corp
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-sky-50/60 border border-sky-100 hover:bg-sky-100/60 transition-colors cursor-pointer">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500 text-white font-bold text-xs shrink-0 shadow-2xs">
              A
            </div>
            <span className="truncate font-semibold text-xs text-slate-800 flex-1">
              Acme Corp
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>
        )}
      </SidebarHeader>

      {/* 2. NAVIGATION MENU */}
      <SidebarContent className="px-3 py-1">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1">
              MENU
            </SidebarGroupLabel>
          )}

          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={
                      isActive
                        ? "bg-sky-50 text-sky-600 font-semibold border border-sky-100/80 hover:bg-sky-50 hover:text-sky-600"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                    }
                  >
                    <Link to={item.path}>
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-sky-600" : "text-slate-500"
                        }`}
                      />
                      <span className={isCollapsed ? "hidden" : "truncate"}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. USER PROFILE FOOTER */}
      <SidebarFooter className="p-3 border-t border-slate-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isCollapsed ? (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition mx-auto outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs shadow-2xs">
                  {userInitials}
                </div>
              </button>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left outline-none cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs shrink-0 shadow-2xs">
                  {userInitials}
                </div>
                <div className="flex flex-col flex-1 min-w-0 leading-tight">
                  <span className="truncate font-bold text-xs text-slate-900">
                    {user?.name || "Sarah Admin"}
                  </span>
                  <span className="truncate text-[11px] text-slate-400 font-normal">
                    {user?.email || "sarah@acmecorp.co"}
                  </span>
                </div>
              </button>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
              Akun Masuk
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer text-xs font-medium"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutGrid className="mr-2 h-4 w-4 text-slate-500" />
              <span>Dashboard Overview</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs font-medium"
              onClick={() => navigate("/channels")}
            >
              <Settings className="mr-2 h-4 w-4 text-slate-500" />
              <span>Pengaturan Saluran</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-medium"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
