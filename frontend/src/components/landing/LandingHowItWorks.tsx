import React from "react";
import { Link2, Users, Rocket } from "lucide-react";

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      num: "1",
      icon: <Link2 className="w-5 h-5 text-white" />,
      title: "Hubungkan Channel",
      desc: "Masukkan kredensial server SMTP email atau token Bot Telegram Anda. Sistem akan menguji koneksi secara instan.",
    },
    {
      num: "2",
      icon: <Users className="w-5 h-5 text-white" />,
      title: "Impor Kontak",
      desc: "Upload daftar kontak dari file CSV atau Excel. Atur tag audiens dan variabel penerima untuk personalisasi nama.",
    },
    {
      num: "3",
      icon: <Rocket className="w-5 h-5 text-white" />,
      title: "Kirim Campaign",
      desc: "Susun template pesan, pilih saluran, lalu blast langsung atau jadwalkan. Pantau metrik pembacaan secara live.",
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 sm:py-28 bg-[#f8fafc] border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0ea5e9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/80 mb-3">
            Cara Kerja
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Jalan dalam tiga langkah.
          </h2>
          <p className="mt-3.5 text-xs sm:text-base text-slate-600 leading-relaxed">
            Tidak perlu keahlian teknis khusus. Setup selesai dan mulai siaran dalam waktu kurang dari dua menit.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-start relative hover:shadow-md transition-shadow"
            >
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-xl bg-[#0ea5e9] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-sky-500/20 mb-6">
                {step.num}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
