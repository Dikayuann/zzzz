import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const LandingFAQ: React.FC = () => {
  const faqs = [
    {
      q: "Apakah ada biaya tersembunyi atau setup fee?",
      a: "Tidak ada sama sekali. Biaya berlangganan transparan sesuai paket bulanan yang Anda pilih. Anda bebas upgrade, downgrade, atau berhenti berlangganan kapan saja.",
    },
    {
      q: "Berapa lama proses setup awal sampai bisa siaran?",
      a: "Sangat cepat. Kurang dari 2 menit setelah mendaftar dan verifikasi email, Anda bisa langsung menghubungkan server SMTP atau Telegram Bot dan mulai mengirim pesan siaran pertama.",
    },
    {
      q: "Bagaimana sistem menjaga tingkat keterkiriman (delivery rate)?",
      a: "CampaignBlast dilengkapi dengan Intelligent Rate Limiting dan Queue Management. Sistem kami mematuhi batasan kuota provider email dan Telegram sehingga akun Anda terhindar dari spam filter atau ban.",
    },
    {
      q: "Apakah data kontak kami aman dan tidak dibagikan?",
      a: "Keamanan adalah prioritas utama kami. Seluruh database diisolasi dengan arsitektur multi-tenant. Kredensial server Anda dienkripsi dengan standar AES-256 dan data kontak Anda 100% milik Anda.",
    },
    {
      q: "Apakah bisa kirim pesan ke grup Telegram atau channel Telegram?",
      a: "Bisa! Bot Telegram yang Anda hubungkan dapat mengirimkan pesan blast ke personal user (chat ID) maupun broadcast ke Channel/Supergroup di mana bot menjadi admin.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0ea5e9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/80 mb-3">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Pertanyaan umum.
          </h2>
          <p className="mt-3.5 text-xs sm:text-base text-slate-600 leading-relaxed">
            Jawaban lengkap atas pertanyaan yang sering diajukan seputar platform CampaignBlast.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-sky-100 text-sky-700" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#fcfdfd]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
