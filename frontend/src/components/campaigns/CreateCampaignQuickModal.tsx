import React, { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CampaignChannel } from "@/types/campaign";

interface CreateCampaignQuickModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, channel: CampaignChannel, audience: string, message: string) => void;
}

export const CreateCampaignQuickModal: React.FC<CreateCampaignQuickModalProps> = ({
  isOpen,
  onOpenChange,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("WhatsApp");
  const [audience, setAudience] = useState("Pelanggan VIP");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, channel, audience, message);
    setName("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Buat Kampanye Baru</DialogTitle>
          <DialogDescription>
            Tentukan saluran pengiriman, nama kampanye, dan pesan yang ingin Anda kirimkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nama Kampanye */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Nama Kampanye</label>
            <input
              type="text"
              placeholder="Contoh: Promo Gajian Akhir Bulan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Pilihan Saluran */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Pilih Saluran</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel("WhatsApp")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  channel === "WhatsApp"
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 ring-1 ring-emerald-500"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("Email")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  channel === "Email"
                    ? "border-blue-500 bg-blue-50/60 text-blue-800 ring-1 ring-blue-500"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email SMTP</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("Telegram")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  channel === "Telegram"
                    ? "border-sky-500 bg-sky-50/60 text-sky-800 ring-1 ring-sky-500"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Send className="h-4 w-4 text-sky-600" />
                <span>Telegram Bot</span>
              </button>
            </div>
          </div>

          {/* Target Audiens */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Target Audiens</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none focus:border-sky-500"
            >
              <option value="Pelanggan VIP">Pelanggan VIP (1,240 kontak)</option>
              <option value="All Subscribers">All Subscribers (3,420 kontak)</option>
              <option value="Newsletter List">Newsletter List (5,800 kontak)</option>
              <option value="Inactive 90d">Inactive 90d (450 kontak)</option>
            </select>
          </div>

          {/* Konten Pesan */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Isi Pesan / Template</label>
              <span className="text-[10px] text-slate-400 font-mono">Variabel: {"{{nama}}"}</span>
            </div>
            <textarea
              rows={4}
              placeholder="Tulis pesan kampanye di sini... Contoh: Halo {{nama}}, nikmati diskon spesial hari ini!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs shadow-sky-600/20 transition cursor-pointer"
            >
              Simpan sebagai Draft
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
