import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const RegisterPage: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [registeredData, setRegisteredData] = useState<{
    success: boolean;
    verificationToken?: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName || !name || !email || !password) {
      toast.error("Semua field wajib diisi");
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

      setRegisteredData({
        success: true,
        verificationToken: res.data.verificationToken,
      });

      toast.success("Akun berhasil dibuat!");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg = errors ? errors.join(", ") : err.response?.data?.message || "Registrasi gagal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoVerify = async () => {
    if (!registeredData?.verificationToken) return;

    setIsVerifying(true);
    try {
      await api.post("/auth/verify-email", {
        token: registeredData.verificationToken,
      });
      toast.success("Akun berhasil diverifikasi! Mengalihkan...");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-[420px] my-6">
        {/* Header Bersih */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Lengkapi data organisasi dan akun admin Anda
          </p>
        </div>

        {registeredData?.success ? (
          /* Success Card */
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Pendaftaran Berhasil
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Organisasi <strong className="text-zinc-900 dark:text-zinc-200">{organizationName}</strong> telah terdaftar.
            </p>

            {registeredData.verificationToken && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 mb-5 text-left">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Untuk pengujian lokal, Anda dapat langsung mengaktifkan akun tanpa membuka email:
                </p>
                <Button
                  onClick={handleAutoVerify}
                  className="w-full mt-3 h-9 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  disabled={isVerifying}
                >
                  {isVerifying ? "Memverifikasi..." : "Verifikasi & Aktifkan Sekarang"}
                </Button>
              </div>
            )}

            <Link to="/login">
              <Button variant="outline" className="w-full h-9 text-xs border-zinc-200 dark:border-zinc-800">
                Ke Halaman Login
              </Button>
            </Link>
          </div>
        ) : (
          /* Form Pendaftaran */
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="organizationName" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Organisasi / Perusahaan
                </Label>
                <Input
                  id="organizationName"
                  placeholder="PT Maju Digital"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap Admin
                </Label>
                <Input
                  id="name"
                  placeholder="Dika Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 karakter (huruf besar, angka, simbol)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  required
                />
                <p className="text-[11px] text-zinc-400">
                  Contoh: <code className="text-zinc-600 dark:text-zinc-400">Admin123!</code>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium text-xs transition-colors mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  "Buat Akun"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
          >
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};
