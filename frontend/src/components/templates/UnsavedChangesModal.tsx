import React from "react";
import { AlertCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UnsavedChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="gap-3 sm:text-left">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
              Buat Template Baru?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
              Perubahan pada template saat ini belum disimpan ke database. Apakah Anda yakin ingin mengosongkan kanvas dan membuat template baru?
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ya, Buat Baru</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
