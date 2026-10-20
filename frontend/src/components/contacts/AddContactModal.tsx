import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ContactItem, ContactList, ContactStatus } from "@/types/contact";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: ContactList[];
  onAddContact: (contact: ContactItem) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  open,
  onOpenChange,
  lists,
  onAddContact,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<ContactStatus>("Active");
  const [listId, setListId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kontak wajib diisi!");
      return;
    }
    if (!email.trim() && !whatsapp.trim()) {
      toast.error("Minimal salah satu dari Email atau No. WhatsApp wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedListId = listId && listId !== "all" ? Number(listId) : undefined;
      const payload: any = {
        name: name.trim(),
        email: email.trim() || undefined,
        whatsappNumber: whatsapp.trim() || undefined,
        status: status.toLowerCase(),
      };
      if (parsedListId && !isNaN(parsedListId)) {
        payload.listId = parsedListId;
      }

      await api.post("/contacts", payload);
      toast.success(`Kontak "${name}" berhasil ditambahkan!`);
      onOpenChange(false);
      setName("");
      setEmail("");
      setWhatsapp("");
      onAddContact({} as any);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menambahkan kontak");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Tambah Kontak Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Masukkan informasi penerima untuk kampanye email, WhatsApp, atau Telegram.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Alamat Email *</label>
            <input
              type="email"
              required
              placeholder="budi@startup.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp</label>
            <input
              type="tel"
              placeholder="+62 812-3456-7890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Target List (Folder Kontak)</label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {lists
                .filter((l) => l.id !== "all")
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Status Penerima</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContactStatus)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="Active">Active (Aktif)</option>
              <option value="Unsubscribed">Unsubscribed (Berhenti)</option>
              <option value="Bounced">Bounced (Gagal)</option>
            </select>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kontak"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
