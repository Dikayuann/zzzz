import React from "react";
import { 
  Send, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Lock, 
  Clock 
} from "lucide-react";

export const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Send className="w-5 h-5 text-sky-600" />,
      bg: "bg-sky-50 border-sky-100",
      title: "Multi-Channel Engine",
      description:
        "Kirim pesan siaran email resmi melalui server SMTP dan notifikasi kilat lewat Bot Telegram dalam satu alur kampanye terpadu.",
    },
    {
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 border-indigo-100",
      title: "Segmentasi & Kontak Dinamis",
      description:
        "Impor kontak tanpa batas, kelompokkan berdasarkan tag, atribut kustom, dan filter audiens agar promosi selalu tepat sasaran.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-100",
      title: "Multi-tenant & Role RBAC",
      description:
        "Isolasi data antar organisasi secara terjamin dengan kontrol akses bertingkat: Admin, Campaign Manager, Editor, dan Viewer.",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-violet-600" />,
      bg: "bg-violet-50 border-violet-100",
      title: "Analitik Real-time & Tracking",
      description:
        "Pantau metrik keterkiriman secara langsung: tingkat pesan terkirim (delivery), dibaca (open rate), diklik, hingga bounce otomatis.",
    },
    {
      icon: <Lock className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 border-amber-100",
      title: "Keamanan Kredensial Channel",
      description:
        "Konfigurasi server SMTP dan token Telegram Anda disimpan dengan proteksi enkripsi kuat untuk menjaga keamanan data bisnis.",
    },
    {
      icon: <Clock className="w-5 h-5 text-cyan-600" />,
      bg: "bg-cyan-50 border-cyan-100",
      title: "Pengiriman Terjadwal & Seketika",
      description:
        "Luncurkan broadcast langsung dalam hitungan detik atau jadwalkan otomatis pada waktu terbaik saat audiens Anda paling aktif.",
    },
  ];

  return (
    <section id="fitur" className="py-20 sm:py-28 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0ea5e9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/80 mb-3">
            Fitur Unggulan
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Semua yang dibutuhkan tim marketing.
          </h2>
          <p className="mt-3.5 text-xs sm:text-base text-slate-600 leading-relaxed">
            Fitur lengkap untuk merancang, mengirim, dan menganalisis performa campaign blast Anda dalam satu antarmuka.
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300/80 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border ${feature.bg} shadow-xs mb-5 group-hover:scale-105 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0ea5e9] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-2.5 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
