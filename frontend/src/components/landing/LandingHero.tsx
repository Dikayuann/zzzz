import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Send 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingHero: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden text-slate-900 pt-16 sm:pt-24 pb-28 sm:pb-40 px-4 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(180deg, #D1F3FF 0%, #BFEFFF 18%, #CEF3FF 42%, #E2F7FF 68%, #EDFAFF 85%, #F7FDFF 93%, #FFFFFF 100%)",
      }}
    >
      {/* Organic Cloud Layer 1 (Drifting Upper & Side Wave Canopy) */}
      <svg
        className="absolute -top-10 -left-12 w-[120%] h-[1100px] pointer-events-none animate-cloud-1"
        viewBox="0 0 1440 1100"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#D1F3FF" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#B7EBFF" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#9DE3FF" stopOpacity="0.3" />
            <stop offset="92%" stopColor="#E0F6FF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L1440,0 L1440,780 C1240,920 1020,740 760,880 C500,1020 240,820 0,910 Z"
          fill="url(#cloudGrad1)"
        />
      </svg>

      {/* Organic Cloud Layer 2 (Counter-Drifting Deep Wave) */}
      <svg
        className="absolute -top-14 -right-12 w-[120%] h-[1200px] pointer-events-none animate-cloud-2"
        viewBox="0 0 1440 1200"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cloudGrad2" x1="100%" y1="0%" x2="25%" y2="100%">
            <stop offset="0%" stopColor="#B7EBFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#D1F3FF" stopOpacity="0.5" />
            <stop offset="75%" stopColor="#9DE3FF" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#E8F8FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L1440,0 L1440,880 C1180,750 920,980 650,840 C380,710 160,930 0,810 Z"
          fill="url(#cloudGrad2)"
        />
      </svg>

      {/* Organic Cloud Layer 3 (Lower Cloud Billow wrapping around Dashboard Mockup) */}
      <svg
        className="absolute top-[380px] sm:top-[440px] -left-10 w-[120%] h-[780px] sm:h-[880px] pointer-events-none animate-cloud-3"
        viewBox="0 0 1440 880"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cloudGrad3" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#D1F3FF" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#B7EBFF" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#9DE3FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,240 C280,130 520,330 800,200 C1080,70 1300,260 1440,150 L1440,760 C1220,830 960,680 700,810 C440,920 180,790 0,840 Z"
          fill="url(#cloudGrad3)"
        />
      </svg>

      {/* Top and Bottom Seamless Blends */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#9DE3FF] text-xs font-semibold text-[#0284c7] mb-8 shadow-xs hover:bg-white transition-all cursor-default">
          <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse" />
          <span>Campaign Blast Multi-Channel</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto">
          Kirim campaign yang benar-benar{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] underline decoration-sky-400/50 decoration-wavy decoration-2">
            terbaca.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-sm sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
          Kirim ribuan pesan email dan telegram secara personal, cepat, dan terukur dalam satu platform campaign blast.
        </p>

        {/* Call to Actions (CTA) */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-7 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98] gap-2">
              Mulai Gratis — Tanpa Kartu Kredit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#fitur" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 text-xs sm:text-sm font-semibold bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 rounded-xl backdrop-blur-md shadow-xs transition-all gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-slate-800" /> Lihat Demo Interaktif
            </Button>
          </a>
        </div>

        {/* Social Proof Metric Highlights */}
        <div className="mt-10 pt-8 border-t border-slate-300/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">18.000+</span>
            <span className="text-slate-600">Organisasi</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">24jt+</span>
            <span className="text-slate-600">Pesan Terkirim</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">99.8%</span>
            <span className="text-slate-600">Tingkat Pengiriman</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">★★★★★</span>
            <span className="font-extrabold text-slate-900 text-sm">4.9/5</span>
            <span className="text-slate-600">Rating</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FLOATING MAC-STYLE DASHBOARD MOCKUP */}
        {/* ======================================================== */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-2 sm:p-3 shadow-xl shadow-sky-900/5">
            {/* Window Topbar */}
            <div className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-sm overflow-hidden text-left">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] text-slate-500 font-mono w-72 justify-center shadow-xs">
                  <span className="text-slate-400">https://</span>app.campaignblast.com/analytics
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live System
                  </span>
                </div>
              </div>

              {/* Inside Dashboard Preview Content */}
              <div className="p-4 sm:p-6 bg-slate-50/40">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sent</span>
                      <Send className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">12,840</div>
                    <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 14.2% dari minggu lalu</div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Opened</span>
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">4,401</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">34.2% open rate</div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clicked</span>
                      <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">1,128</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">8.7% CTR rate</div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Delivery</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">99.8%</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">24 bounce tercatat</div>
                  </div>
                </div>

                {/* Performance Chart & Channel Split Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  {/* 7-Day Performance Bars */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-800">Aktivitas Blast 7 Hari Terakhir</span>
                      <span className="text-[10px] font-semibold text-slate-400">Total 12.840 Pesan</span>
                    </div>
                    <div className="flex items-end justify-between h-28 gap-2 pt-2">
                      {[
                        { day: "Sen", height: "45%" },
                        { day: "Sel", height: "70%" },
                        { day: "Rab", height: "35%" },
                        { day: "Kam", height: "92%" },
                        { day: "Jum", height: "55%" },
                        { day: "Sab", height: "65%" },
                        { day: "Min", height: "80%" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <div
                            style={{ height: item.height }}
                            className="w-full rounded-t-md bg-gradient-to-t from-[#0284c7] to-[#38bdf8] group-hover:brightness-110 transition-all cursor-pointer"
                          />
                          <span className="text-[10px] font-medium text-slate-500">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channel Distribution */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-1">Distribusi Channel</span>
                      <p className="text-[11px] text-slate-500">Kombinasi saluran blast aktif</p>
                    </div>

                    <div className="space-y-2.5 my-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sky-600" /> Email SMTP
                          </span>
                          <span>78%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Telegram Bot
                          </span>
                          <span>22%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: "22%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status Engine:</span>
                      <span className="font-semibold text-emerald-600">Operational 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
