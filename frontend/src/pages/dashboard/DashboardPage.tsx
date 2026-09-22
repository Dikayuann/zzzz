import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

// Data volume pesan harian: terkirim vs dibuka (Sen - Min)
const weeklyVolumeData = [
  { day: "Sen", terkirim: 4200, dibuka: 1500 },
  { day: "Sel", terkirim: 6800, dibuka: 2300 },
  { day: "Rab", terkirim: 3800, dibuka: 1400 },
  { day: "Kam", terkirim: 9200, dibuka: 3900 },
  { day: "Jum", terkirim: 8400, dibuka: 3100 },
  { day: "Sab", terkirim: 2900, dibuka: 950 },
  { day: "Min", terkirim: 2100, dibuka: 650 },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<"Semua" | "Email" | "Telegram" | "WhatsApp">("Semua");
  const [selectedRange, setSelectedRange] = useState("7 hari terakhir");

  // Format greeting berdasarkan waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const userName = user?.name ? user.name.split(" ")[0] : "Sarah";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER SECTION: GREETING & DATE FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Begini performa kampanye kamu minggu ini.
          </p>
        </div>

        {/* Date Range Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto outline-none">
              <span>{selectedRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            {["7 hari terakhir", "30 hari terakhir", "Bulan ini", "Sepanjang waktu"].map((range) => (
              <DropdownMenuItem
                key={range}
                onClick={() => setSelectedRange(range)}
                className="cursor-pointer text-xs font-medium flex items-center justify-between"
              >
                <span>{range}</span>
                {selectedRange === range && <Check className="h-3.5 w-3.5 text-sky-600" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. CHANNEL TABS / FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedChannel("Semua")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedChannel === "Semua"
              ? "bg-[#0284c7] text-white shadow-xs shadow-sky-600/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setSelectedChannel("Email")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedChannel === "Email"
              ? "bg-[#0284c7] text-white shadow-xs shadow-sky-600/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setSelectedChannel("Telegram")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedChannel === "Telegram"
              ? "bg-[#0284c7] text-white shadow-xs shadow-sky-600/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Telegram
        </button>
        <button
          onClick={() => setSelectedChannel("WhatsApp")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedChannel === "WhatsApp"
              ? "bg-[#0284c7] text-white shadow-xs shadow-sky-600/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* 3. 5 KPI CARDS (TERKIRIM, TERSAMPAIKAN, DIBUKA, DIKLIK, GAGAL/BOUNCED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: TERKIRIM */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TERKIRIM
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            24,340
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+8.4% vs minggu lalu</span>
          </div>
        </Card>

        {/* Card 2: TERSAMPAIKAN */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TERSAMPAIKAN
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            23,891
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+7.9% vs minggu lalu</span>
          </div>
        </Card>

        {/* Card 3: DIBUKA */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            DIBUKA
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            8,201
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12.1% vs minggu lalu</span>
          </div>
        </Card>

        {/* Card 4: DIKLIK */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            DIKLIK
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            2,128
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 mt-1.5">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-2.3% vs minggu lalu</span>
          </div>
        </Card>

        {/* Card 5: GAGAL/BOUNCED */}
        <Card className="border-slate-200/80 shadow-2xs rounded-2xl bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            GAGAL/BOUNCED
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            449
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-0.5% vs minggu lalu</span>
          </div>
        </Card>
      </div>

      {/* 4. MAIN 2-COLUMN SECTION: VOLUME CHART + DISTRIBUSI CHANNEL */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left Card: Volume pesan minggu ini (8 of 12 columns) */}
        <Card className="lg:col-span-8 border-slate-200/80 shadow-2xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Volume pesan minggu ini
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Harian: terkirim vs dibuka
              </CardDescription>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#bae6fd]" />
                <span>Terkirim</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
                <span>Dibuka</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyVolumeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={6}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.96)",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Bar
                    dataKey="terkirim"
                    name="Terkirim"
                    fill="#bae6fd"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="dibuka"
                    name="Dibuka"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Distribusi channel (4 of 12 columns) */}
        <Card className="lg:col-span-4 border-slate-200/80 shadow-2xs rounded-2xl bg-white p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-5">
              Distribusi channel
            </h2>

            {/* Channels Progress */}
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>Email</span>
                  </div>
                  <span className="font-bold text-slate-900">53%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 w-[53%]" />
                </div>
              </div>

              {/* Telegram */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Telegram</span>
                  </div>
                  <span className="font-bold text-slate-900">25%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500 w-[25%]" />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="font-bold text-slate-900">22%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[22%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Divider & Stats */}
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total kontak</span>
              <span className="font-bold text-slate-900">8,910</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">List aktif</span>
              <span className="font-bold text-slate-900">14</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Template</span>
              <span className="font-bold text-slate-900">23</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Help Circle Button (Bottom Right) */}
      <button
        type="button"
        title="Bantuan & Dukungan"
        className="fixed bottom-6 right-6 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-lg hover:bg-slate-800 transition cursor-pointer hover:scale-105 active:scale-95"
      >
        <span className="text-sm font-semibold">?</span>
      </button>
    </div>
  );
};
