import React from "react";
import { Zap, Calendar, Clock } from "lucide-react";

interface StepScheduleProps {
  scheduleType: "instant" | "scheduled";
  onScheduleTypeChange: (type: "instant" | "scheduled") => void;
  scheduledDate: string;
  onScheduledDateChange: (date: string) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
  throttleRate: string;
  onThrottleRateChange: (rate: string) => void;
}

export const StepSchedule: React.FC<StepScheduleProps> = ({
  scheduleType,
  onScheduleTypeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange,
  throttleRate,
  onThrottleRateChange,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Atur Waktu Pengiriman & Kecepatan Antrean
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tentukan apakah kampanye ingin dikirim langsung sekarang atau terjadwal pada waktu tertentu.
        </p>
      </div>

      <div className="space-y-3">
        {/* Instant */}
        <div
          onClick={() => onScheduleTypeChange("instant")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
            scheduleType === "instant"
              ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
              : "border-slate-200/80 hover:border-slate-300 bg-white"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              scheduleType === "instant"
                ? "bg-[#0284c7] text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Kirim Sekarang</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kampanye langsung masuk ke antrean pengiriman segera setelah konfirmasi.
            </p>
          </div>
        </div>

        {/* Scheduled */}
        <div
          onClick={() => onScheduleTypeChange("scheduled")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
            scheduleType === "scheduled"
              ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
              : "border-slate-200/80 hover:border-slate-300 bg-white"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              scheduleType === "scheduled"
                ? "bg-[#0284c7] text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Jadwalkan Nanti</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tentukan tanggal dan jam otomatis blast akan dieksekusi oleh server.
            </p>
          </div>
        </div>
      </div>

      {/* Date & Time Picker */}
      {scheduleType === "scheduled" && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3 animate-in fade-in-50">
          <span className="text-xs font-bold text-slate-900 block">
            Pilih Waktu Peluncuran
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Tanggal</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => onScheduledDateChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Jam (WIB)</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => onScheduledTimeChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Throttle & Speed Limiter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          Proteksi Kecepatan Antrean (Anti-Banned Throttle)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "safe",
              title: "Aman (Direkomendasikan)",
              desc: "Jeda acak 5-15 detik antar kontak. Sangat aman dari risiko blokir WhatsApp.",
            },
            {
              id: "normal",
              title: "Standar",
              desc: "Jeda 2-5 detik antar kontak. Cocok untuk pengiriman Email & Telegram.",
            },
            {
              id: "fast",
              title: "Cepat (Turbo)",
              desc: "Maksimal throughput server. Gunakan hanya jika domain SMTP telah terverifikasi tinggi.",
            },
          ].map((th) => (
            <div
              key={th.id}
              onClick={() => onThrottleRateChange(th.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                throttleRate === th.id
                  ? "border-[#0284c7] bg-sky-50/20"
                  : "border-slate-200/80 hover:border-slate-300 bg-white"
              }`}
            >
              <span className="font-bold text-xs text-slate-900 block">{th.title}</span>
              <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">
                {th.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
