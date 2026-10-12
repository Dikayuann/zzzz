import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Mail, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  RotateCw, 
  ExternalLink,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from "@/components/ui/input-otp";
import { toast } from "sonner";

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Ambil parameter dari router state, URL query parameter, atau session storage
  const emailFromState = location.state?.email || "";
  const tokenFromState = location.state?.verificationToken || "";
  const tokenFromUrl = searchParams.get("token") || "";
  const emailFromUrl = searchParams.get("email") || "";
  const savedEmail = sessionStorage.getItem("cb_pending_verify_email") || "";

  // Email aktif akun (cukup dimunculkan, tidak perlu diinput oleh pengguna)
  const [email] = useState<string>(
    emailFromState || emailFromUrl || savedEmail || "you@company.com"
  );

  // Simpan email di session agar saat refresh tidak hilang
  useEffect(() => {
    if (email && email !== "you@company.com") {
      sessionStorage.setItem("cb_pending_verify_email", email);
    }
  }, [email]);

  // Token aktif (untuk sandbox/testing)
  const [activeToken, setActiveToken] = useState<string>(tokenFromUrl || tokenFromState);

  // Status Verifikasi: 'enter_otp' | 'verified'
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Flow Step: hasSentOtp false (awal, klik Kirim Kode OTP) | true (OTP terkirim, kotak 6-digit aktif)
  const [hasSentOtp, setHasSentOtp] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem("cb_otp_sent_session"));
  });

  // State 6-digit OTP (Hanya satu-satunya input di halaman ini)
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Cooldown countdown persisten di sessionStorage (tidak reset saat refresh)
  const [cooldown, setCooldown] = useState<number>(() => {
    const savedEndTime = sessionStorage.getItem("cb_otp_cooldown_end");
    if (savedEndTime) {
      const remaining = Math.ceil((Number(savedEndTime) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Masking email untuk tampilan privasi & keamanan standar (cth: di***ma@gmail.com)
  const maskEmail = (emailStr: string): string => {
    if (!emailStr || !emailStr.includes("@")) return emailStr || "you@company.com";
    const [user, domain] = emailStr.split("@");
    if (!user || !domain) return emailStr;

    let maskedUser = user;
    if (user.length <= 2) {
      maskedUser = `${user[0]}***`;
    } else if (user.length <= 4) {
      maskedUser = `${user[0]}***${user[user.length - 1]}`;
    } else {
      maskedUser = `${user.slice(0, 2)}***${user.slice(-2)}`;
    }

    return `${maskedUser}@${domain}`;
  };

  // Deteksi Mail Provider untuk Tombol Pintas "Buka Email"
  const getEmailProvider = (emailStr: string) => {
    const domain = emailStr.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail") || domain.includes("googlemail")) {
      return { name: "Buka Gmail", url: "https://mail.google.com" };
    }
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) {
      return { name: "Buka Outlook", url: "https://outlook.live.com" };
    }
    if (domain.includes("yahoo")) {
      return { name: "Buka Yahoo Mail", url: "https://mail.yahoo.com" };
    }
    return { name: "Buka Aplikasi Email", url: `mailto:${emailStr}` };
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            sessionStorage.removeItem("cb_otp_cooldown_end");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Eksekusi verifikasi OTP ke server
  const handleVerify = useCallback(async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (!code || code.length !== 6) {
      toast.error("Harap masukkan 6 digit kode OTP secara lengkap");
      return;
    }

    setIsVerifying(true);
    try {
      await api.post("/auth/verify-email", {
        token: code,
        email: email && email !== "you@company.com" ? email : undefined,
      });
      setIsVerified(true);
      toast.success("Email berhasil diverifikasi! Akun Anda telah aktif.");
      sessionStorage.removeItem("cb_pending_verify_email");
      sessionStorage.removeItem("cb_otp_sent_session");
      sessionStorage.removeItem("cb_otp_cooldown_end");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Kode OTP salah atau sudah kadaluarsa";
      toast.error(msg);
      setOtp(""); // Reset input jika salah agar bisa langsung diketik ulang
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, navigate]);

  // Jika URL memiliki parameter ?token=..., verifikasi otomatis
  useEffect(() => {
    if (tokenFromUrl && !isVerified) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl, isVerified, handleVerify]);

  // Kirim / Kirim ulang kode OTP
  const handleSendOtp = async () => {
    if (!email || email === "you@company.com") {
      toast.error("Alamat email tidak valid");
      return;
    }

    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setHasSentOtp(true);
      sessionStorage.setItem("cb_otp_sent_session", "true");

      const endTime = Date.now() + 60 * 1000;
      sessionStorage.setItem("cb_otp_cooldown_end", String(endTime));
      setCooldown(60);
      setOtp("");

      if (res.data?.verificationToken) {
        setActiveToken(res.data.verificationToken);
      }

      toast.success("Kode OTP berhasil dikirim ke email Anda!", {
        description: "Kode sebelumnya (jika ada) otomatis hangus. Masukkan kode terbaru.",
      });
    } catch (err: any) {
      if (err.response?.data?.message?.includes("sudah aktif")) {
        toast.info("Akun Anda sudah aktif. Silakan langsung masuk.");
        navigate("/login");
        return;
      }
      toast.error(err.response?.data?.message || "Gagal mengirim kode OTP");
    } finally {
      setIsResending(false);
    }
  };

  const emailProvider = email && email !== "you@company.com" ? getEmailProvider(email) : null;

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between items-center p-6 sm:p-10 font-sans selection:bg-sky-500 selection:text-white relative overflow-hidden"
      style={{
        background: "radial-gradient(130% 65% at 50% -10%, #D1F3FF 0%, #E2F7FF 35%, #F4FAFD 75%, #FFFFFF 100%)",
      }}
    >
      {/* Tombol Back Minimalis di Pojok Kiri Atas */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors group py-1.5 px-2.5 rounded-lg hover:bg-white/70"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-800" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Container Card */}
      <main className="w-full max-w-[480px] my-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl shadow-sky-950/5 p-7 sm:p-10 text-center relative overflow-hidden transition-all">
        {isVerified ? (
          /* ======================================================== */
          /* 1. STATE SUKSES: EMAIL TERVERIFIKASI                     */
          /* ======================================================== */
          <div className="space-y-4 py-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Email Terverifikasi!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Akun dan organisasi Anda telah berhasil diaktifkan. Anda sekarang dapat masuk dan mulai mengirim blast.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-sm transition-all"
              >
                Lanjutkan ke Halaman Login
              </Button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. STATE STANDAR UTAMA: CUKUP MUNCULKAN EMAIL + OTP       */
          /* ======================================================== */
          <div>
            {/* Top Icon Badge */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7] mx-auto mb-4 shadow-xs">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.8]" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {hasSentOtp ? "Periksa Email Anda" : "Verifikasi Alamat Email"}
            </h1>

            {/* Email yang Cukup Dimunculkan Saja (Tidak Perlu Diinput) */}
            <div className="mt-2.5">
              <p className="text-xs sm:text-sm text-slate-600">
                {hasSentOtp
                  ? "Kami telah mengirimkan 6 digit kode OTP ke:"
                  : "Tekan tombol di bawah untuk mengirimkan 6 digit kode OTP ke:"}
              </p>

              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-slate-800 text-xs font-semibold font-mono">
                <Mail className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>{maskEmail(email)}</span>
              </div>
            </div>

            {/* Quick Open Email App Shortcut Button (Hanya tampil setelah OTP dikirim) */}
            {hasSentOtp && emailProvider && (
              <div className="mt-4">
                <a
                  href={emailProvider.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <span>{emailProvider.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAHAP 1: SEBELUM USER KLIK KIRIM KODE OTP                */}
            {/* ======================================================== */}
            {!hasSentOtp ? (
              <div className="mt-8 space-y-4">
                <Button
                  onClick={handleSendOtp}
                  disabled={isResending}
                  className="w-full h-12 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Mengirimkan Kode OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Kirim Kode OTP
                    </span>
                  )}
                </Button>
                <p className="text-[11px] text-slate-400 text-center">
                  Kode 6 digit akan dikirimkan ke email Anda dan berlaku selama 10 menit.
                </p>
              </div>
            ) : (
              /* ======================================================== */
              /* TAHAP 2: SETELAH KODE DIKIRIM (INPUT OTP & VERIFIKASI)   */
              /* ======================================================== */
              <>
                {/* SHADCN UI 6-DIGIT OTP INPUT (OTOMATIS KEDEPAN / AUTO-ADVANCE) */}
                <div className="my-6 sm:my-8 flex flex-col items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                    Masukkan 6 Digit Kode OTP
                  </label>

                  <InputOTP
                    maxLength={6}
                    value={otp}
                    autoFocus
                    disabled={isVerifying}
                    onChange={(val) => {
                      setOtp(val);
                      if (val.length === 6) {
                        handleVerify(val);
                      }
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <p className="text-[11px] text-slate-400 mt-2.5">
                    Ketik atau tempel (paste) 6 digit kode dari email Anda
                  </p>
                </div>

                {/* Tombol Verifikasi Manual */}
                <div>
                  <Button
                    onClick={() => handleVerify()}
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full h-11 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi Kode...
                      </span>
                    ) : (
                      "Verifikasi & Lanjutkan"
                    )}
                  </Button>
                </div>

                {/* Resend OTP dengan Cooldown Timer Standar */}
                <div className="mt-5 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <span>Tidak menerima kode?</span>
                  {cooldown > 0 ? (
                    <span className="text-slate-400 font-medium font-mono">
                      Kirim ulang dalam {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isResending}
                      className="font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isResending ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Mengirim...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <RotateCw className="w-3 h-3" /> Kirim ulang kode
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Tips & Spam Folder Note */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-left text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Tips:</strong> Kode berlaku selama 10 menit. Jika tidak menemukan email di kotak masuk utama, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
              </span>
            </div>

            {/* Mode Sandbox untuk Pengujian Cepat Lokal */}
            {activeToken && activeToken.length === 6 && (
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-left bg-sky-50/50 -mx-7 sm:-mx-10 -mb-7 sm:-mb-10 p-4 rounded-b-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    🛠️ Mode Pengujian (Dev OTP)
                  </span>
                  <span className="text-[11px] font-mono bg-sky-200/80 text-sky-900 px-2.5 py-0.5 rounded-md font-bold tracking-widest">
                    {activeToken}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setOtp(activeToken);
                    handleVerify(activeToken);
                  }}
                  disabled={isVerifying}
                  variant="outline"
                  className="w-full mt-1.5 h-8 text-[11px] font-semibold bg-white border-sky-300 text-sky-700 hover:bg-sky-50 shadow-none rounded-lg"
                >
                  Isi Otomatis & Verifikasi
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Minimalis */}
      <footer className="py-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link to="/login" className="font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Masuk dengan Akun Lain
          </Link>
          <span className="text-slate-300">·</span>
          <Link to="/register" className="font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Daftar Akun Baru
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">
          Perlu bantuan aktivasi? Hubungi tim support di{" "}
          <a href="mailto:support@campaignblast.com" className="text-slate-600 hover:underline">
            support@campaignblast.com
          </a>
        </p>
      </footer>
    </div>
  );
};
