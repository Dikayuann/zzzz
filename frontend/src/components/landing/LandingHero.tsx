import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const LandingHero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Background Glow Effect */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Mini status badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200/80 bg-zinc-50/80 dark:bg-zinc-900/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-6 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Multi-Channel Engine:</span>
        Email SMTP & Telegram Bot API
      </div>

      {/* Headline (H1) */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
        Kirim pesan siaran massal dengan{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          akurasi tinggi
        </span>{" "}
        dan aman.
      </h1>

      {/* Sub-headline */}
      <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Kombinasikan kecepatan notifikasi instan Telegram dengan jangkauan resmi email SMTP.
        Kelola daftar kontak, segmentasi dinamis, merge tag personalisasi, dan pantau metrik keterkiriman secara real-time.
      </p>

      {/* Action Buttons (CTA) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {isAuthenticated ? (
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-medium gap-2 shadow-md">
              <LayoutDashboard className="h-4 w-4" /> Buka Dashboard Console
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-medium gap-2 shadow-md">
                Mulai Siaran Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-11 px-6 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-sm font-medium">
                Masuk ke Akun
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Feature Highlights Under CTA */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Tanpa batas kontak list</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Bot Telegram pribadi per user</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Server SMTP organisasi sendiri</span>
        </div>
      </div>

      {/* Interactive Mock Dashboard Preview Box */}
      <div className="mt-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-2 sm:p-4 shadow-xl">
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 text-left shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-zinc-400">campaign-broadcast-engine v1.0</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              queue: operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saluran Aktif</p>
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">SMTP & Telegram</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Dual-channel broadcast</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tingkat Pengiriman</p>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Tinggi</span>
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">99.8% Sukses</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Otomatis deteksi bounce</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Kecepatan Kirim</p>
                <span className="text-[11px] font-mono text-zinc-400">Queue Worker</span>
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">&ge; 50 pesan / detik</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">RabbitMQ worker pipeline</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
