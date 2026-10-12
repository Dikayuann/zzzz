import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Send, 
  Check, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft 
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { checkPasswordStrength } from "@/lib/password";

export const RegisterPage: React.FC = () => {
  // Stepper: 1 = Akun, 2 = Organisasi
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Status setelah registrasi berhasil
  const [registeredData, setRegisteredData] = useState<{
    success: boolean;
    verificationToken?: string;
  } | null>(null);

  const navigate = useNavigate();

  // Evaluasi kekuatan dan syarat kombinasi password real-time
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  // Validasi Step 1 (Akun)
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Format email kerja tidak valid");
      return;
    }
    if (!passwordStrength.isValid) {
      const unmet = passwordStrength.criteria.find((c) => !c.met);
      toast.error(
        unmet
          ? `Password belum memenuhi syarat: ${unmet.label}`
          : "Password harus memenuhi seluruh kombinasi keamanan"
      );
      return;
    }
    setStep(2);
  };

  // Submit Registrasi Lengkap di Step 2
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim()) {
      toast.error("Nama organisasi/perusahaan wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        organizationName,
        name,
        email,
        password,
      });

      toast.success("Pendaftaran berhasil!");
      setRegisteredData({
        success: true,
        verificationToken: res.data.verificationToken,
      });
      navigate("/verify-email", {
        state: {
          email,
          verificationToken: res.data.verificationToken,
          fromRegister: true,
        },
      });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg = errors ? errors.join(", ") : err.response?.data?.message || "Registrasi gagal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verifikasi Instan untuk Pengujian Lokal
  const handleAutoVerify = async () => {
    if (!registeredData?.verificationToken) return;

    setIsVerifying(true);
    try {
      await api.post("/auth/verify-email", {
        token: registeredData.verificationToken,
      });
      toast.success("Akun berhasil diverifikasi! Mengalihkan ke login...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal verifikasi");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-sky-500 selection:text-white">
      {/* ======================================================== */}
      {/* SISI KIRI: BRANDING & VALUE PROPOSITION (FIGMA NODE 1-1044) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-b from-[#021f3d] via-[#053d6a] to-[#0284c7] lg:p-12 xl:p-16 flex-col justify-between text-white relative overflow-hidden shrink-0">
        {/* Subtle Background Glow Effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Logo Brand */}
        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner group-hover:bg-sky-500/30 transition-all">
            <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">CampaignBlast</span>
        </Link>

        {/* 2. Main Hero Content */}
        <div className="relative z-10 my-10 lg:my-0 max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-white leading-[1.18]">
            Kirim lebih cerdas.<br />
            Capai lebih banyak.
          </h1>
          <p className="text-sky-100/80 text-sm sm:text-[15px] mt-4 leading-relaxed font-normal">
            Mulai gratis, tanpa kartu kredit. Setup selesai dalam dua menit.
          </p>

          {/* Checklist Fitur Unggulan */}
          <div className="mt-8 space-y-3.5">
            {[
              "Email & Telegram blast dalam satu dashboard",
              "Campaign wizard — tidak perlu keahlian teknis",
              "Analitik real-time: open, click, bounce",
              "Undang tim dengan role & permission",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-sky-400/20 border border-sky-300/40 flex items-center justify-center text-sky-200 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm text-sky-100/90 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-sky-400/20 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-[#053d6a] flex items-center justify-center text-[10px] font-bold text-white">
              AN
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#053d6a] flex items-center justify-center text-[10px] font-bold text-white">
              RF
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-[#053d6a] flex items-center justify-center text-[10px] font-bold text-white">
              PH
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-400 border-2 border-[#053d6a] flex items-center justify-center text-[10px] font-bold text-white">
              DW
            </div>
          </div>
          <p className="text-xs text-sky-100/80 font-medium">
            18.000+ organisasi sudah bergabung
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SISI KANAN: FORMULIR MULTI-STEP REGISTRASI (FIGMA NODE 1-1044) */}
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

        <div className="w-full max-w-[420px] my-auto">
          {/* Mobile Brand Header (Tampil hanya di layar HP/Tablet < lg) */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#0ea5e9] shadow-sm">
              <Send className="w-4 h-4 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CampaignBlast</span>
          </div>

          {registeredData?.success ? (
            /* ======================================================== */
            /* KARTU SUKSES SETELAH PENDAFTARAN */
            /* ======================================================== */
            <div className="text-center p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <div className="w-14 h-14 rounded-full bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Akun untuk organisasi <strong className="text-slate-800">{organizationName}</strong> telah berhasil dibuat.
              </p>

              {registeredData.verificationToken && (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                  <p className="text-[11px] font-medium text-slate-600">
                    Mode Pengujian Lokal: Aktifkan akun langsung tanpa buka email:
                  </p>
                  <Button
                    onClick={handleAutoVerify}
                    className="w-full mt-3 h-10 text-xs font-semibold bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg transition-colors"
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
                  </Button>
                </div>
              )}

              <Link to="/login" className="block mt-4">
                <Button variant="outline" className="w-full h-10 text-xs font-medium border-slate-200 text-slate-700">
                  Ke Halaman Login
                </Button>
              </Link>
            </div>
          ) : (
            /* ======================================================== */
            /* FORMULIR PENDAFTARAN DENGAN STEPPER */
            /* ======================================================== */
            <div>
              {/* Stepper Header */}
              <div className="flex items-center gap-3 mb-8">
                {/* Step 1 Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      step === 1
                        ? "bg-[#0ea5e9] text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      step === 1 ? "text-[#0ea5e9]" : "text-slate-600"
                    }`}
                  >
                    Akun
                  </span>
                </div>

                {/* Stepper Connector Line */}
                <div className="w-10 h-[1.5px] bg-slate-200" />

                {/* Step 2 Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      step === 2
                        ? "bg-[#0ea5e9] text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      step === 2 ? "text-[#0ea5e9]" : "text-slate-400"
                    }`}
                  >
                    Organisasi
                  </span>
                </div>
              </div>

              {/* Judul & Subjudul Form */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {step === 1 ? "Buat akun Anda" : "Data Organisasi Anda"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {step === 1
                    ? "Gratis selamanya hingga 1.000 kontak."
                    : "Tentukan nama ruang kerja tim Anda."}
                </p>
              </div>

              {/* FORM STEP 1: INFORMASI AKUN */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      placeholder="Sarah Putri"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Email Kerja
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
                    <Label
                      htmlFor="password"
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 karakter & kombinasi"
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

                    {/* Indikator Kekuatan & Rekomendasi Ringkas (Hanya tampil saat password diketik) */}
                    {password.length > 0 && (
                      <div className="pt-2 pb-1 space-y-2 transition-all">
                        {/* Bar meter & status kekuatan */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Kekuatan Password:
                            </span>
                            <span className={`text-[11px] font-semibold transition-colors ${passwordStrength.textColor}`}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 h-1.5">
                            {[1, 2, 3, 4].map((stepNumber) => (
                              <div
                                key={stepNumber}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  stepNumber <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-slate-100"
                                }`}
                              />
                            ))}
                          </div>
                        </div>


                        {passwordStrength.isValid ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span>Password kuat & memenuhi seluruh syarat</span>
                          </div>
                        ) : (
                          <div className="pt-0.5 space-y-1.5">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Rekomendasi agar kuat:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {passwordStrength.unmetCriteria.map((item) => (
                                <span
                                  key={item.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70"
                                >
                                  <span className="text-amber-500 font-bold">+</span>
                                  {item.recommendation}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-2"
                  >
                    Lanjutkan
                  </Button>
                </form>
              )}

              {/* FORM STEP 2: NAMA ORGANISASI */}
              {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="orgName"
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Nama Organisasi / Perusahaan
                    </Label>
                    <Input
                      id="orgName"
                      placeholder="PT Maju Bersama"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="h-11 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] placeholder:text-slate-400"
                      autoFocus
                      required
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nama ini akan digunakan sebagai identitas ruang kerja blast Anda.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mendaftarkan akun...
                        </>
                      ) : (
                        "Daftar Sekarang"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Kembali ke data akun
                    </button>
                  </div>
                </form>
              )}

              {/* Footer Login Link */}
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500 font-normal">
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#0ea5e9] hover:text-[#0284c7] hover:underline"
                  >
                    Masuk
                  </Link>
                </p>

                <p className="text-[11px] text-slate-400 mt-5 leading-relaxed">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <a href="#terms" className="text-slate-600 hover:underline">
                    Syarat Layanan
                  </a>{" "}
                  dan{" "}
                  <a href="#privacy" className="text-slate-600 hover:underline">
                    Kebijakan Privasi
                  </a>{" "}
                  kami.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
