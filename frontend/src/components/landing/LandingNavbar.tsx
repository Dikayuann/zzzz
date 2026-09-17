import React from "react";
import { Link } from "react-router-dom";
import { Send, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface LandingNavbarProps {
  appName?: string;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  appName = "Campaign Blast",
}) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:bg-zinc-950/80 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-base group">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Send className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none text-zinc-900 dark:text-white">
              {appName}
            </span>
            <span className="text-[10px] font-medium text-zinc-400">
              Multi-Channel Platform
            </span>
          </div>
        </Link>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#fitur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cara Kerja
          </a>
          <a href="#arsitektur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Spesifikasi
          </a>
        </nav>

        {/* Action Buttons: Beradaptasi dengan status Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm" className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard ({user?.name?.split(" ")[0] || "Saya"})</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                >
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 rounded-lg gap-1.5 shadow-sm"
                >
                  Daftar Gratis <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
