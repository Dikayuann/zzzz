import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Send, 
  Eye, 
  EyeOff, 
  Loader2, 
  TrendingUp, 
  Mail, 
  MessageSquare,
  ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login berhasil!");
      navigate("/dashboard"); // Arahkan ke dashboard console
    } catch (err: any) {
      const msg = err.response?.data?.message || "Email atau password salah";
      toast.error(msg);
      if (msg.toLowerCase().includes("verifikasi email")) {
        setTimeout(() => {
          navigate("/verify-email", { state: { email } });
        }, 1200);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-sky-500 selection:text-white">
      {/* ======================================================== */}
      {/* SISI KIRI: BRANDING & LIVE ANALYTICS PREVIEW (FIGMA LOGIN) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-b from-[#021f3d] via-[#053d6a] to-[#0284c7] lg:p-12 xl:p-16 flex-col justify-between text-white relative overflow-hidden shrink-0">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Logo Brand */}
        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:bg-sky-500/30 transition-all">
            <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">CampaignBlast</span>
        </Link>

        {/* 2. Glassmorphic Widget: CAMPAIGN PERFORMANCE PREVIEW (Animasi Bergerak Halus) */}
        <div className="relative z-10 my-10 lg:my-0 max-w-md w-full animate-dashboard-float">
          {/* Ambient Glow di belakang kartu dashboard */}
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-400/20 via-blue-500/15 to-sky-300/25 rounded-3xl blur-xl pointer-events-none" />

          {/* Floating Live Badge di pojok kanan atas kartu */}
          <div className="absolute -top-3.5 -right-2 z-20 animate-badge-float hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/90 backdrop-blur-md border border-sky-300/40 text-white text-[10px] font-bold shadow-lg shadow-sky-950/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            <span>+1,420 Terkirim Hari Ini</span>
          </div>

          <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 shadow-2xl hover:border-white/30 transition-all">
            {/* Header Widget */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-300" />
                <span className="text-xs font-bold tracking-wider text-sky-100 uppercase">
                  Campaign Performance
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* 3 Metric Box */}
            <div className="grid grid-cols-3 gap-3 py-4 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base font-bold text-white tracking-tight">12,840</div>
                <div className="text-[10px] text-sky-200/70 uppercase tracking-wider font-medium mt-0.5">Sent</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base font-bold text-white tracking-tight">4,401</div>
                <div className="text-[10px] text-sky-200/70 uppercase tracking-wider font-medium mt-0.5">Opened</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-base font-bold text-white tracking-tight">1,128</div>
                <div className="text-[10px] text-sky-200/70 uppercase tracking-wider font-medium mt-0.5">Clicked</div>
              </div>
            </div>

            {/* Simulated 7-Day Bar Chart */}
            <div className="pt-2 pb-3">
              <div className="flex items-end justify-between h-20 gap-2 px-1">
                {[
                  { day: "Sen", height: "45%" },
                  { day: "Sel", height: "70%" },
                  { day: "Rab", height: "30%" },
                  { day: "Kam", height: "90%" },
                  { day: "Jum", height: "55%" },
                  { day: "Sab", height: "65%" },
                  { day: "Min", height: "80%" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: bar.height }}
                      className="w-full rounded-t-md bg-gradient-to-t from-sky-500/70 to-sky-300 transition-all hover:brightness-125 animate-bar-pulse"
                    />
                    <span className="text-[10px] font-medium text-sky-200/80">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Split Distribution Pills */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="flex items-center gap-1.5 text-sky-200 text-[11px] font-medium">
                  <Mail className="w-3.5 h-3.5 text-sky-300" /> Email
                </span>
                <span className="font-bold text-white text-[11px]">78%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="flex items-center gap-1.5 text-sky-200 text-[11px] font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-300" /> Telegram
                </span>
                <span className="font-bold text-white text-[11px]">22%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Testimonial Quote */}
        <div className="relative z-10 pt-6 border-t border-sky-400/20">
          <p className="text-xs sm:text-[13px] text-sky-100/90 italic leading-relaxed">
            "CampaignBlast menyederhanakan seluruh proses kami. Open rate naik 18% dalam sebulan pertama."
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-500/80 border border-violet-400 text-white font-bold text-[10px] flex items-center justify-center">
              AN
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Anisa Nugraha</div>
              <div className="text-[10px] text-sky-200/70">Marketing Lead · TokoBesar.id</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SISI KANAN: FORMULIR LOGIN (FIGMA LOGIN FRAME) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-[#fcfdfd] relative min-h-screen">
        {/* Tombol Back Minimalis di Pojok Kiri Atas (Tidak merusak layout form) */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-800 transition-colors group py-1.5 px-2 rounded-lg hover:bg-slate-100/60"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-700" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px] my-auto">
          {/* Mobile Brand Header (Tampil hanya di layar HP/Tablet < lg) */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#0ea5e9] shadow-sm">
              <Send className="w-4 h-4 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CampaignBlast</span>
          </div>

          {/* Header Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Selamat datang kembali
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Masuk ke akun organisasi Anda untuk melanjutkan.
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#0ea5e9] hover:text-[#0284c7] font-medium hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-slate-200 bg-white text-sm pr-10 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses masuk...
                </>
              ) : (
                "Masuk ke dashboard"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#fcfdfd] px-3 text-[11px] text-slate-400 font-medium tracking-wider">
                atau lanjutkan dengan
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => toast.info("Fitur Google Single Sign-On (SSO) akan segera hadir!")}
            className="w-full h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>

          {/* Footer Register Link */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-normal">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#0ea5e9] hover:text-[#0284c7] hover:underline"
              >
                Daftar gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
