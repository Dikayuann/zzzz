import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Alamat email wajib diisi");
      return;
    }

    setIsLoading(true);
    // Simulasi pengiriman reset password sesuai FR-AUTH-03
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Instruksi reset password telah dikirim ke email Anda!");
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-sky-500 selection:text-white">
      {/* SISI KIRI: BRANDING & ARTWORK */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-b from-[#021f3d] via-[#053d6a] to-[#0284c7] lg:p-12 xl:p-16 flex-col justify-between text-white relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:bg-sky-500/30 transition-all">
            <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">
            CampaignBlast
          </span>
        </Link>

        {/* Info Card */}
        <div className="relative z-10 my-10 max-w-md w-full p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
          <div className="h-10 w-10 rounded-xl bg-sky-400/20 flex items-center justify-center text-sky-300 mb-4">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Pemulihan Akun Aman</h3>
          <p className="text-xs text-sky-100/80 mt-2 leading-relaxed">
            Tautan reset password akan kedaluwarsa setelah 30 menit demi keamanan data kampanye dan kontak Anda.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-sky-200/60">
          © 2026 CampaignBlast Platform. All rights reserved.
        </div>
      </div>

      {/* SISI KANAN: FORM LUPA PASSWORD */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 xl:px-24 bg-[#fcfdfd]">
        <div className="w-full max-w-[420px]">
          {/* Tombol Kembali ke Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          {!isSubmitted ? (
            <>
              {/* Header Teks */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Lupa kata sandi?
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Masukkan email akun terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Alamat Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim tautan reset...
                    </>
                  ) : (
                    "Kirim Tautan Reset"
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Sukses State */
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in-50 duration-200">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Periksa Email Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Tautan pengaturan ulang kata sandi telah dikirim ke{" "}
                  <strong className="text-slate-800">{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-10 rounded-xl text-xs font-semibold"
                >
                  Kirim Ulang Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
