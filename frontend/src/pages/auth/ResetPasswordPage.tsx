import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, Eye, EyeOff, Loader2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Kata sandi berhasil diperbarui!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-sky-500 selection:text-white">
      {/* SISI KIRI: BRANDING */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-b from-[#021f3d] via-[#053d6a] to-[#0284c7] lg:p-12 xl:p-16 flex-col justify-between text-white relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:bg-sky-500/30 transition-all">
            <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">
            CampaignBlast
          </span>
        </Link>

        <div className="relative z-10 my-10 max-w-md w-full p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
          <div className="h-10 w-10 rounded-xl bg-sky-400/20 flex items-center justify-center text-sky-300 mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Atur Ulang Kata Sandi</h3>
          <p className="text-xs text-sky-100/80 mt-2 leading-relaxed">
            Buat kata sandi baru yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
          </p>
        </div>

        <div className="relative z-10 text-xs text-sky-200/60">
          © 2026 CampaignBlast Platform. All rights reserved.
        </div>
      </div>

      {/* SISI KANAN: FORM RESET */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 xl:px-24 bg-[#fcfdfd]">
        <div className="w-full max-w-[420px]">
          {!isSuccess ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Buat Kata Sandi Baru
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Masukkan kata sandi baru Anda untuk memulihkan akses ke akun.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-pass"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Kata Sandi Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm pr-10 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm-pass"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Konfirmasi Kata Sandi Baru
                  </Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Memperbarui kata sandi...
                    </>
                  ) : (
                    "Simpan Kata Sandi Baru"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm animate-in fade-in-50 duration-200">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kata Sandi Berhasil Diperbarui!
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Kata sandi baru Anda telah aktif. Anda akan dialihkan ke halaman login dalam beberapa detik.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full h-10 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold"
                >
                  Masuk Sekarang
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
