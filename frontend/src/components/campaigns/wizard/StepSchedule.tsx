import React from "react";
import { Zap, Calendar, Clock, AlertCircle, Info } from "lucide-react";
import type { DeliveryChannel } from "@/types/campaignWizard";

interface StepScheduleProps {
  scheduleType: "instant" | "scheduled";
  onScheduleTypeChange: (type: "instant" | "scheduled") => void;
  scheduledDate: string;
  onScheduledDateChange: (date: string) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
  sendStartTime?: string;
  onSendStartTimeChange?: (time: string) => void;
  sendEndTime?: string;
  onSendEndTimeChange?: (time: string) => void;
  enableSendingWindow?: boolean;
  onEnableSendingWindowChange?: (enabled: boolean) => void;
  enableEndDate?: boolean;
  onEnableEndDateChange?: (enabled: boolean) => void;
  endDate?: string;
  onEndDateChange?: (date: string) => void;
  throttleRate: string;
  onThrottleRateChange: (rate: string) => void;
  selectedChannels?: DeliveryChannel[];
}

export const StepSchedule: React.FC<StepScheduleProps> = ({
  scheduleType,
  onScheduleTypeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange,
  sendStartTime = "09:00",
  onSendStartTimeChange,
  sendEndTime = "17:00",
  onSendEndTimeChange,
  enableSendingWindow = false,
  onEnableSendingWindowChange,
  enableEndDate = false,
  onEnableEndDateChange,
  endDate = "",
  onEndDateChange,
  throttleRate,
  onThrottleRateChange,
  selectedChannels = ["Email"],
}) => {
  const primaryChannel = selectedChannels[0] || "Email";
  const isWhatsApp = primaryChannel === "WhatsApp";
  const isEmail = primaryChannel === "Email";

  const getTodayDateString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const getUpcomingTimeString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const todayStr = getTodayDateString();
  const effectiveStartDate = (isWhatsApp || scheduleType === "scheduled") && scheduledDate
    ? scheduledDate
    : todayStr;

  // Real-time validations
  const isTimeOrderInvalid = Boolean(
    (isWhatsApp || enableSendingWindow) &&
      sendStartTime &&
      sendEndTime &&
      sendStartTime >= sendEndTime
  );

  const isScheduleInPast = Boolean(
    !isWhatsApp &&
      scheduleType === "scheduled" &&
      scheduledDate &&
      scheduledTime &&
      new Date(`${scheduledDate}T${scheduledTime}:00`).getTime() < Date.now() - 60 * 1000
  );

  const isEndDateInvalid = Boolean(
    enableEndDate &&
      endDate &&
      effectiveStartDate &&
      endDate < effectiveStartDate
  );

  const isScheduleOutsideWindow = Boolean(
    !isWhatsApp &&
      scheduleType === "scheduled" &&
      enableSendingWindow &&
      scheduledTime &&
      sendStartTime &&
      sendEndTime &&
      !isTimeOrderInvalid &&
      (scheduledTime < sendStartTime || scheduledTime >= sendEndTime)
  );

  const getThrottleOptions = () => {
    if (isEmail) {
      return [
        {
          id: "safe",
          title: "Aman",
          badge: "1–3 dtk / email",
          desc: "Jeda 1–3 detik antar penerima untuk menjaga reputasi domain pengirim.",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
        {
          id: "normal",
          title: "Standar",
          badge: "0.5–1 dtk / email",
          desc: "Kecepatan optimal untuk server SMTP standar (~60–100 email/menit).",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
        {
          id: "fast",
          title: "Cepat",
          badge: "Instan / 0.1 dtk",
          desc: "Throughput maksimal untuk relay terverifikasi (Amazon SES, SendGrid).",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
      ];
    }

    if (isWhatsApp) {
      return [
        {
          id: "safe",
          title: "Smart Drip",
          badge: "Jeda 10–15 mnt (rekomendasi)",
          desc: "Pengiriman bertahap dengan batas kuota 35 pesan/hari.",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
        {
          id: "normal",
          title: "Bertahap",
          badge: "Jeda 1–3 mnt",
          desc: "Jeda reguler 1–3 menit antar nomor dalam batas kuota harian.",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
        {
          id: "fast",
          title: "Cepat",
          badge: "Jeda 15–45 dtk",
          desc: "Jeda singkat untuk kebutuhan pengiriman mendesak.",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        },
      ];
    }

    // Telegram
    return [
      {
        id: "safe",
        title: "Aman",
        badge: "1–2 dtk / pesan",
        desc: "Jeda 1–2 detik untuk stabilitas request Bot API.",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      },
      {
        id: "normal",
        title: "Standar",
        badge: "0.5 dtk / pesan",
        desc: "Kecepatan optimal untuk broadcast pesan reguler.",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      },
      {
        id: "fast",
        title: "Cepat",
        badge: "0.1 dtk / pesan",
        desc: "Throughput tinggi mendekati batas maksimal Telegram Bot API.",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      },
    ];
  };

  const throttleOptions = getThrottleOptions();

  React.useEffect(() => {
    const today = getTodayDateString();
    if (!scheduledDate || scheduledDate < today) {
      onScheduledDateChange(today);
    }
    if (!scheduledTime) {
      onScheduledTimeChange(getCurrentTimeString());
    }
    if (endDate && endDate < today) {
      onEndDateChange?.("");
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Atur Waktu Pengiriman & Kecepatan Antrean
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isWhatsApp
            ? "Tentukan tanggal mulai dan rentang jam kerja pengiriman pesan WhatsApp."
            : "Pilih apakah pesan ingin mulai dikirim segera atau dijadwalkan pada waktu tertentu."}
        </p>
      </div>

      {/* KHUSUS WHATSAPP: 1 Blok Terpadu (Tanggal Mulai + Rentang Jam Kerja) */}
      {isWhatsApp ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-2xs">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span>Jadwal & Jam Operasional WhatsApp</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tentukan tanggal mulai dan rentang jam kerja pengiriman pesan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Tanggal Mulai</label>
              <input
                type="date"
                value={scheduledDate}
                min={getTodayDateString()}
                onChange={(e) => onScheduledDateChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Jam Mulai (WIB)</label>
              <input
                type="time"
                value={sendStartTime}
                onChange={(e) => onSendStartTimeChange?.(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Jam Selesai (WIB)</label>
              <input
                type="time"
                value={sendEndTime}
                onChange={(e) => onSendEndTimeChange?.(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {isTimeOrderInvalid && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>Jam mulai kerja ({sendStartTime}) harus lebih awal dari jam selesai ({sendEndTime}).</span>
            </div>
          )}
        </div>
      ) : (
        /* EMAIL & TELEGRAM: Pilihan Kirim Sekarang vs Jadwalkan Nanti */
        <div className="space-y-3">
          {/* Instant */}
          <div
            onClick={() => {
              onScheduleTypeChange("instant");
              onScheduledDateChange(getTodayDateString());
            }}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
              scheduleType === "instant"
                ? "border-sky-600 bg-sky-50/20 shadow-2xs"
                : "border-slate-200/80 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  scheduleType === "instant"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900">Kirim Sekarang</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pesan langsung dikirimkan segera setelah kampanye diluncurkan.
                </p>
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div
            onClick={() => {
              onScheduleTypeChange("scheduled");
              const today = getTodayDateString();
              if (!scheduledDate || scheduledDate < today) {
                onScheduledDateChange(today);
              }
              const now = new Date();
              const currentHhMm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
              if ((!scheduledDate || scheduledDate === today) && (!scheduledTime || scheduledTime <= currentHhMm)) {
                onScheduledTimeChange(getUpcomingTimeString());
              }
            }}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              scheduleType === "scheduled"
                ? "border-sky-600 bg-sky-50/20 shadow-2xs"
                : "border-slate-200/80 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  scheduleType === "scheduled"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900">Jadwalkan Nanti</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tentukan tanggal dan jam untuk peluncuran otomatis di masa depan.
                </p>
              </div>
            </div>

            {scheduleType === "scheduled" && scheduledDate && scheduledTime && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                <span>{scheduledDate} pk. {scheduledTime} WIB</span>
              </div>
            )}
          </div>

          {/* Date & Time Picker */}
          {scheduleType === "scheduled" && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 space-y-3 animate-in fade-in-50">
              <span className="text-xs font-bold text-slate-900 block">
                Pilih Waktu Peluncuran Otomatis
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Tanggal Peluncuran</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    min={getTodayDateString()}
                    onChange={(e) => onScheduledDateChange(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Jam Peluncuran (WIB)</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => onScheduledTimeChange(e.target.value)}
                    className={`w-full h-10 rounded-xl border bg-white px-3 text-xs text-slate-800 focus:outline-none shadow-2xs ${
                      isScheduleInPast
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:border-sky-500"
                    }`}
                  />
                </div>
              </div>

              {isScheduleInPast && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>
                      Jam peluncuran ({scheduledTime} WIB) sudah lewat karena saat ini sudah pukul {getCurrentTimeString()} WIB.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onScheduledTimeChange(getUpcomingTimeString())}
                    className="text-[11px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer text-left sm:text-center"
                  >
                    Set ke 15 mnt lagi
                  </button>
                </div>
              )}

              {isScheduleOutsideWindow && !isScheduleInPast && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs">
                  <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                  <span>
                    Jam peluncuran ({scheduledTime} WIB) berada di luar jam kerja aktif ({sendStartTime} – {sendEndTime} WIB). Pengiriman otomatis dimulai saat jam kerja berikutnya dibuka.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Batasi Pengiriman Pada Jam Kerja (Opsional) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Batasi Pengiriman Pada Jam Kerja (Opsional)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hanya kirimkan pesan pada jam aktif. Di luar jam ini, pengiriman dijeda otomatis hingga esok hari.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableSendingWindow}
                  onChange={(e) => onEnableSendingWindowChange?.(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {enableSendingWindow && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Jam Mulai (WIB)</label>
                    <input
                      type="time"
                      value={sendStartTime}
                      onChange={(e) => onSendStartTimeChange?.(e.target.value)}
                      className={`w-full h-10 rounded-xl border bg-white px-3 text-xs text-slate-800 focus:outline-none shadow-2xs ${
                        isTimeOrderInvalid
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-slate-200 focus:border-sky-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Jam Selesai (WIB)</label>
                    <input
                      type="time"
                      value={sendEndTime}
                      onChange={(e) => onSendEndTimeChange?.(e.target.value)}
                      className={`w-full h-10 rounded-xl border bg-white px-3 text-xs text-slate-800 focus:outline-none shadow-2xs ${
                        isTimeOrderInvalid
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-slate-200 focus:border-sky-500"
                      }`}
                    />
                  </div>
                </div>

                {isTimeOrderInvalid && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>Jam mulai ({sendStartTime}) harus lebih awal dari jam selesai ({sendEndTime}).</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batas Akhir Pengiriman (Opsional) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose-500" />
              <span>Batas Akhir Pengiriman (Opsional)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hentikan pengiriman secara otomatis jika telah melewati tanggal yang ditentukan.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableEndDate}
              onChange={(e) => onEnableEndDateChange?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {enableEndDate && (
          <div className="pt-2 border-t border-slate-100 animate-in fade-in-50 space-y-2.5">
            <div className="max-w-xs space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Tanggal Batas Akhir</label>
              <input
                type="date"
                value={endDate}
                min={effectiveStartDate}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                className={`w-full h-10 rounded-xl border bg-white px-3 text-xs text-slate-800 focus:outline-none shadow-2xs ${
                  isEndDateInvalid
                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:border-rose-500"
                }`}
              />
              <span className="text-[10px] text-slate-400 block">
                Pengiriman dihentikan setelah pukul 23:59 WIB pada tanggal ini.
              </span>
            </div>

            {isEndDateInvalid && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>
                  Tanggal batas akhir ({endDate}) tidak boleh lebih awal dari {scheduleType === "instant" && !isWhatsApp ? "hari ini" : "tanggal mulai"} ({effectiveStartDate}).
                </span>
              </div>
            )}

            {!isEndDateInvalid && endDate && (
              <p className="text-[11px] text-slate-500">
                Pesan yang belum terkirim setelah {endDate} pukul 23:59 WIB akan otomatis dibatalkan.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Throttle & Speed Limiter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div>
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Kecepatan Antrean (Throttling)</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Atur jeda waktu pengiriman antar pesan ke kontak penerima.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {throttleOptions.map((th) => {
            const isSelected = throttleRate === th.id;
            return (
              <div
                key={th.id}
                onClick={() => onThrottleRateChange(th.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-sky-600 bg-sky-50/20 shadow-2xs"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{th.title}</span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mb-1.5 ${th.badgeColor}`}
                  >
                    {th.badge}
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed">
                    {th.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
