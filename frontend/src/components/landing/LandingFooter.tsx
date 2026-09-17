import React from "react";
import { Link } from "react-router-dom";
import { Send, ShieldCheck } from "lucide-react";

export const LandingFooter: React.FC = () => {
    return (
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Kolom 1: Brand & Keterangan */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-white">
                            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center">
                                <Send className="h-3.5 w-3.5" />
                            </div>
                            <span>Campaign Blast Platform</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                            Platform siaran pesan massal handal dengan integrasi multi-saluran Telegram Bot API dan Email SMTP kustom organisasi.
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Sesuai standar perlindungan data kontak & CAN-SPAM</span>
                        </div>
                    </div>

                    {/* Kolom 2: Fitur Platform */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                            Fitur Platform
                        </p>
                        <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <li><a href="#fitur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Telegram Broadcast</a></li>
                            <li><a href="#fitur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">SMTP Email Engine</a></li>
                            <li><a href="#fitur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Segmentasi & Tag Kontak</a></li>
                            <li><a href="#fitur" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Merge Tags Dinamis</a></li>
                        </ul>
                    </div>

                    {/* Kolom 3: Akses Cepat */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                            Akses Portal
                        </p>
                        <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <li><Link to="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Masuk ke Console</Link></li>
                            <li><Link to="/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Registrasi Akun Baru</Link></li>
                            <li><a href="#cara-kerja" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Dokumentasi Alur</a></li>
                        </ul>
                    </div>
                </div>

                {/* Baris Bawah: Copyright */}
                <div className="pt-8 border-t border-zinc-200/60 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                    <p>© {new Date().getFullYear()} Campaign Blast Platform. Seluruh hak cipta dilindungi.</p>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Semua engine operasional</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};