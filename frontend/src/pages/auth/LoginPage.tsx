import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  // 1. STATE UNTUK MENYIMPAN NILAI INPUT
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 2. FUNGSI HANDLE SUBMIT (Saat tombol ditekan)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman

    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login berhasil");
      navigate("/"); // Arahkan ke dashboard
    } catch (err: any) {
      const msg = err.response?.data?.message || "Email atau password salah";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. TAMPILAN
  return (
      <AuthLayout
          title="Masuk ke Akun Anda"
          description="Masukkan kredensial Anda untuk melanjutkan"
          footerText="Belum punya akun?"
          footerLinkText="Daftar tenant baru"
          footerLinkHref="/register"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
                required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Link
                  to="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Lupa password?
              </Link>
            </div>
            <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-sm"
                required
            />
          </div>

          <Button
              type="submit"
              className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs mt-2"
              disabled={isLoading}
          >
            {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Memproses...
                </>
            ) : (
                "Masuk"
            )}
          </Button>
        </form>
      </AuthLayout>
  );
};
