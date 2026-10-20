import React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  isDeleting = false,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="gap-3">
          <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
