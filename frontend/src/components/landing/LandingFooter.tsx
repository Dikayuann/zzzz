import React from "react";
import { Link } from "react-router-dom";
import { Send, ShieldCheck } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-base group">
              <div className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[#0ea5e9] flex items-center justify-center shadow-sm">
                <Send className="h-4 w-4 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                CampaignBlast
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Platform blast multi-channel terpercaya di Indonesia untuk email dan Telegram. Kirim pesan skala besar dengan aman, cepat, dan terukur.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Standar isolasi multi-tenant & enkripsi AES-256</span>
            </div>
          </div>

          {/* Kolom 1: Produk */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Produk
            </p>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">Email SMTP Blast</a></li>
              <li><a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">Telegram Broadcast</a></li>
              <li><a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">Segmentasi Kontak</a></li>
              <li><a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">Role & Permission</a></li>
              <li><a href="#fitur" className="hover:text-[#0ea5e9] transition-colors">Analitik Real-time</a></li>
            </ul>
          </div>

          {/* Kolom 2: Navigasi */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Halaman
            </p>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="#cara-kerja" className="hover:text-[#0ea5e9] transition-colors">Cara Kerja</a></li>
              <li><a href="#harga" className="hover:text-[#0ea5e9] transition-colors">Paket Harga</a></li>
              <li><a href="#faq" className="hover:text-[#0ea5e9] transition-colors">Pertanyaan Umum</a></li>
              <li><Link to="/login" className="hover:text-[#0ea5e9] transition-colors">Masuk ke Akun</Link></li>
              <li><Link to="/register" className="hover:text-[#0ea5e9] transition-colors">Daftar Gratis</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Bantuan
            </p>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer" className="hover:text-[#0ea5e9] transition-colors">Dokumentasi API</a></li>
              <li><a href="mailto:support@campaignblast.com" className="hover:text-[#0ea5e9] transition-colors">Hubungi Support</a></li>
              <li><a href="#faq" className="hover:text-[#0ea5e9] transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#faq" className="hover:text-[#0ea5e9] transition-colors">Syarat Layanan</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampaignBlast. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-medium text-slate-600">Semua sistem blast normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};