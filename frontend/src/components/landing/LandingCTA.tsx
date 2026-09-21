import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-[#EBF8FD] via-[#F3FAFD] to-[#DDF4FD] text-slate-900 text-center px-4 sm:px-6 relative overflow-hidden border-t border-sky-100">
      {/* Soft Radial Glow Layer (Static, Zero Animation Overhead) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full pointer-events-none opacity-70"
        style={{
          background: "radial-gradient(ellipse at center, rgba(183, 235, 255, 0.4) 0%, rgba(209, 243, 255, 0.18) 50%, transparent 75%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Siap menjangkau audiens Anda?
        </h2>
        <p className="mt-4 text-xs sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed">
          Mulai gratis hari ini. Setup selesai dalam dua menit tanpa memerlukan kartu kredit.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-lg shadow-sky-600/20 gap-2 active:scale-[0.98] transition-all">
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="mailto:support@campaignblast.com" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 text-xs sm:text-sm font-semibold bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 rounded-xl backdrop-blur-md shadow-xs transition-all"
            >
              Hubungi Tim
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
