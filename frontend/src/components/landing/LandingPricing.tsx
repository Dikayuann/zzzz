import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingPricing: React.FC = () => {
  const tiers = [
    {
      name: "Gratis",
      desc: "Cocok untuk eksplorasi dan bisnis baru yang ingin mulai siaran.",
      price: "Rp 0",
      period: "/ bulan",
      popular: false,
      buttonText: "Mulai Gratis",
      buttonVariant: "outline" as const,
      features: [
        "Hingga 1.000 kontak",
        "1 Channel Email SMTP",
        "Basic Analitik & Laporan",
        "1 Anggota Tim",
        "Komunitas Support",
      ],
    },
    {
      name: "Bisnis",
      desc: "Pilihan favorit untuk bisnis berkembang yang butuh jangkauan luas.",
      price: "Rp 299.000",
      period: "/ bulan",
      popular: true,
      buttonText: "Pilih Paket Bisnis",
      buttonVariant: "default" as const,
      features: [
        "Hingga 25.000 kontak",
        "Email SMTP + Telegram Bot",
        "Analitik Real-time (Open & Click)",
        "Multi-member Tim & Role RBAC",
        "Prioritas Antrean Pengiriman",
        "Email Support 24/7",
      ],
    },
    {
      name: "Pro",
      desc: "Solusi enterprise dengan kustomisasi penuh dan SLA terjamin.",
      price: "Rp 799.000",
      period: "/ bulan",
      popular: false,
      buttonText: "Hubungi Sales",
      buttonVariant: "outline" as const,
      features: [
        "Kontak audiens Unlimited",
        "Semua channel + Custom SMTP",
        "Akses RESTful API & Webhook",
        "Dedicated Account Manager",
        "SLA Keterkiriman 99.9%",
        "Audit Log Kepatuhan Penuh",
      ],
    },
  ];

  return (
    <section id="harga" className="py-20 sm:py-28 bg-gradient-to-b from-white via-[#EBF8FD]/70 to-white border-b border-slate-100 relative overflow-hidden">
      {/* Soft Ambient Radial Glow (Static, Zero Animation Overhead) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[400px] rounded-full pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(183, 235, 255, 0.35) 0%, rgba(209, 243, 255, 0.15) 50%, transparent 75%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0ea5e9] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/80 mb-3">
            Harga
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Transparan. Tanpa kejutan.
          </h2>
          <p className="mt-3.5 text-xs sm:text-base text-slate-600 leading-relaxed">
            Pilih paket yang sesuai dengan skala bisnis Anda. Upgrade atau downgrade kapan saja tanpa denda.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 flex flex-col justify-between relative transition-all ${
                tier.popular
                  ? "bg-white border-2 border-[#0ea5e9] shadow-xl shadow-sky-500/10 md:-translate-y-2"
                  : "bg-white border border-slate-200/80 shadow-xs hover:shadow-md"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0ea5e9] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Paling Populer
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{tier.desc}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{tier.period}</span>
                </div>

                <div className="my-6 pt-6 border-t border-slate-100">
                  <Link to="/register" className="block w-full">
                    <Button
                      variant={tier.buttonVariant}
                      className={`w-full h-11 text-xs font-semibold rounded-xl transition-all ${
                        tier.popular
                          ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md shadow-sky-500/20"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tier.buttonText}
                    </Button>
                  </Link>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Termasuk di paket:
                  </span>
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
