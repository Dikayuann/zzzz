import React from "react";
import { Radio, Users, FileEdit, Send } from "lucide-react";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  hint: string;
}

const stepsData: StepItem[] = [
  {
    number: "01",
    title: "Hubungkan Saluran",
    description:
      "Konfigurasi server SMTP organisasi untuk pengiriman email, serta masukkan token Bot Telegram pribadi via BotFather.",
    icon: Radio,
    hint: "Koneksi terenkripsi & uji kirim instan",
  },
  {
    number: "02",
    title: "Kelola Audiens & Segmen",
    description:
      "Impor daftar penerima via file CSV/XLSX, kelompokkan dengan label tag, dan filter target dengan segmentasi dinamis.",
    icon: Users,
    hint: "Otomatis filter kontak opt-out",
  },
  {
    number: "03",
    title: "Susun Pesan & Merge Tags",
    description:
      "Tulis konten dengan dukungan HTML/Markdown dan sisipkan variabel personalisasi dinamis seperti {{first_name}}.",
    icon: FileEdit,
    hint: "Preview tampilan live per channel",
  },
  {
    number: "04",
    title: "Kirim & Pantau Metrik",
    description:
      "Eksekusi siaran pesan secara instan atau jadwalkan di masa depan. Pantau metrik delivery dan bounce rate secara real-time.",
    icon: Send,
    hint: "Throughput antrean RabbitMQ berkecepatan tinggi",
  },
];

export const LandingHowItWorks: React.FC = () => {
  return (
    <section
      id="cara-kerja"
      className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800"
    >
      {/* Judul Section */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Alur Kerja Sederhana
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2">
          Mulai siaran pesan dalam 4 langkah mudah
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Dirancang intuitif agar proses broadcast massal dari persiapan hingga pelaporan selesai dalam hitungan menit.
        </p>
      </div>

      {/* Grid 4 Langkah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stepsData.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              <div>
                {/* Header Step: Nomor & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-mono font-black text-zinc-300 dark:text-zinc-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {step.number}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Judul & Penjelasan */}
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Hint Tambahan di Bawah */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  ✓ {step.hint}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
