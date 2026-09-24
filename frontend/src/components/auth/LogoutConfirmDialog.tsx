import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast.info("Mengakhiri sesi akun...");
      await logout();
      toast.success("Berhasil keluar dari akun.");
    } catch {
      toast.error("Gagal keluar dari sesi. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <LogOut className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Keluar dari CampaignBlast?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sesi login Anda akan diakhiri pada perangkat ini. Untuk mengakses workspace kembali, Anda perlu memasukkan email dan kata sandi Anda.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleConfirmLogout}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Ya, Keluar Akun</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
