import React from "react";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CancelCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDraftAndExit: () => void;
  onDiscardAndExit: () => void;
}

export const CancelCampaignModal: React.FC<CancelCampaignModalProps> = ({
  open,
  onOpenChange,
  onSaveDraftAndExit,
  onDiscardAndExit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-1">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Tinggalkan Pembuatan Kampanye?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Data yang telah Anda isi otomatis tersimpan dengan aman sebagai Draf. Anda dapat melanjutkannya kapan saja tanpa takut kehilangan isian.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-3">
          <button
            type="button"
            onClick={onSaveDraftAndExit}
            className="w-full h-10 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Simpan sebagai Draf & Keluar</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
          >
            Lanjutkan Mengedit
          </button>
          <button
            type="button"
            onClick={onDiscardAndExit}
            className="w-full h-9 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 mt-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Buang Draf & Hapus Isian</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ResetCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export const ResetCampaignModal: React.FC<ResetCampaignModalProps> = ({
  open,
  onOpenChange,
  onReset,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-1">
            <Trash2 className="h-5 w-5 text-rose-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Reset Draf & Mulai Baru?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Tindakan ini akan mengosongkan seluruh isian nama kampanye, saluran, dan template yang tersimpan di browser ini.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            Ya, Reset & Bersihkan Draf
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
          >
            Batal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
