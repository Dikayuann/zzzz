import React from "react";

export const LandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Anisa Nugraha",
      role: "Marketing Lead · TokoBesar.id",
      initials: "AN",
      avatarColor: "bg-violet-500",
      content:
        "CampaignBlast menyederhanakan seluruh proses promosi kami. Open rate email naik 18% dalam sebulan pertama berkat kemudahan personalisasi pesan.",
    },
    {
      name: "Budi Santoso",
      role: "Founder · KopiNusantara",
      initials: "BS",
      avatarColor: "bg-emerald-500",
      content:
        "Pengiriman notifikasi promo via Telegram blast sangat cepat dan stabil. Komunitas pelanggan kami merasa jauh lebih dekat dan responsif.",
    },
    {
      name: "Rian Hidayat",
      role: "Growth Lead · FinTech.co",
      initials: "RH",
      avatarColor: "bg-sky-500",
      content:
        "Fitur RBAC dan multi-tenant sangat membantu tim kami mengelola kampanye blast per divisi tanpa khawatir data kontak tumpang tindih.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0ea5e9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/80 mb-3">
            Testimonial
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Dipercaya tim marketing Indonesia.
          </h2>
          <p className="mt-3.5 text-xs sm:text-base text-slate-600 leading-relaxed">
            Bergabunglah dengan ribuan bisnis yang telah meningkatkan performa komunikasi dan penjualan mereka.
          </p>
        </div>

        {/* 3 Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-[#fcfdfd] border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${t.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
