import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send, Loader2, Mail, User, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { RecipientPreview } from "@/types/template";

interface ContactOption {
  id: number;
  name: string;
  email: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  customFields?: Record<string, any>;
}

interface TestSendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: number | null;
  subject: string;
  compiledHtml: string;
  activeRecipient?: RecipientPreview;
}

export const TestSendModal: React.FC<TestSendModalProps> = ({
  open,
  onOpenChange,
  templateId,
  subject,
  compiledHtml,
  activeRecipient,
}) => {
  const { user } = useAuth();

  // Mode selection: "manual" or "contact"
  const [sourceMode, setSourceMode] = useState<"manual" | "contact">("manual");

  // Form states - prefill from logged-in user if available
  const [targetEmail, setTargetEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Database contacts list state (loaded lazily only when contact tab opened)
  const [dbContacts, setDbContacts] = useState<ContactOption[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [sendToTesterEmail, setSendToTesterEmail] = useState(true);

  // Sync default email and name when modal opens
  useEffect(() => {
    if (open) {
      if (!targetEmail) {
        setTargetEmail(user?.email || "");
      }
      if (!customName) {
        setCustomName(user?.name || activeRecipient?.name || "Tester");
      }
    }
  }, [open, user]);

  // Fetch contacts from DB lazily only when "contact" mode is active
  useEffect(() => {
    if (open && sourceMode === "contact" && dbContacts.length === 0) {
      const fetchContacts = async () => {
        setIsLoadingContacts(true);
        try {
          const res = await api.get("/contacts?limit=50");
          const list = res.data?.data || [];
          setDbContacts(list);
          if (list.length > 0 && !selectedContactId) {
            setSelectedContactId(list[0].id);
          }
        } catch (err) {
          console.warn("Could not fetch contacts for test modal:", err);
        } finally {
          setIsLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [open, sourceMode, dbContacts.length]);

  // When selected contact changes in "contact" mode
  const handleContactSelect = (contactId: number) => {
    setSelectedContactId(contactId);
    const found = dbContacts.find((c) => c.id === contactId);
    if (found) {
      setCustomName(found.name);
      if (!sendToTesterEmail && found.email) {
        setTargetEmail(found.email);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetEmail.trim()) {
      toast.error("Alamat email tujuan wajib diisi");
      return;
    }

    setIsSending(true);
    try {
      let sampleContactPayload: any = null;
      let contactIdPayload: number | undefined = undefined;

      if (sourceMode === "contact" && selectedContactId) {
        const found = dbContacts.find((c) => c.id === selectedContactId);
        contactIdPayload = selectedContactId;
        if (found) {
          const nameParts = (found.name || "").trim().split(/\s+/);
          sampleContactPayload = {
            name: found.name,
            firstName: nameParts[0] || found.name,
            lastName: nameParts.slice(1).join(" ") || "",
            email: targetEmail.trim(), // Send to targetEmail
            phone: found.phone || found.whatsappNumber,
          };
        }
      } else {
        // Manual mode
        const defaultTesterName = user?.name || "Tester";
        const nameParts = (customName || defaultTesterName).trim().split(/\s+/);
        sampleContactPayload = {
          name: customName || defaultTesterName,
          firstName: nameParts[0] || defaultTesterName,
          lastName: nameParts.slice(1).join(" ") || "",
          email: targetEmail.trim(),
        };
      }

      const payload = {
        targetEmail: targetEmail.trim(),
        subject: subject || "Uji Coba Template",
        contentHtml: compiledHtml,
        contactId: contactIdPayload,
        sampleContact: sampleContactPayload,
        orgName: "Campaign Blast",
      };

      const endpoint = templateId
        ? `/templates/${templateId}/test-send`
        : `/templates/test-send`;

      const res = await api.post(endpoint, payload);

      toast.success("Email uji coba berhasil dikirim! 🚀", {
        description: res.data?.message || `Periksa inbox ${targetEmail.trim()}`,
      });

      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim email uji coba";
      toast.error("Pengiriman gagal", { description: msg });
    } finally {
      setIsSending(false);
    }
  };

  const selectedContact = dbContacts.find((c) => c.id === selectedContactId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
              <Mail className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Kirim Email Uji Coba
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Pilih apakah ingin memasukkan email & nama penerima secara manual, atau mengambil simulasi profil dari daftar kontak database.
          </DialogDescription>
        </DialogHeader>

        {/* MODE SELECTOR PILLS */}
        <div className="flex p-1 bg-slate-100 rounded-xl gap-1 mt-1">
          <button
            type="button"
            onClick={() => setSourceMode("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              sourceMode === "manual"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Ketik Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("contact")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              sourceMode === "contact"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pilih dari Kontak ({dbContacts.length})</span>
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4 pt-2">
          {/* TAB 1: MANUAL MODE */}
          {sourceMode === "manual" ? (
            <div className="space-y-3">
              {/* Email Tujuan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Tujuan Pengujian:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama.anda@gmail.com"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Nama Penerima (Merge Tags) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nama Penerima (untuk variabel {"{{first_name}}"}):
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Dika Pratama"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Variabel seperti <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{"{{nama}}"}</code> akan otomatis menggunakan nama ini.
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: CONTACT DATABASE MODE */
            <div className="space-y-3">
              {/* Kontak Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pilih Kontak Pelanggan:
                </label>
                {isLoadingContacts ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-indigo-500" />
                    Memuat daftar kontak...
                  </div>
                ) : dbContacts.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    Belum ada kontak tersimpan di database. Silakan gunakan mode <strong>Ketik Manual</strong>.
                  </div>
                ) : (
                  <select
                    value={selectedContactId || ""}
                    onChange={(e) => handleContactSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                  >
                    {dbContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.email ? `(${c.email})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Kirim ke Email Tester vs Email Kontak */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToTesterEmail}
                    onChange={(e) => setSendToTesterEmail(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800">
                      Kirim ke email saya (simulasikan profil kontak ini)
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Email fisik masuk ke kotak masuk Anda, namun merge tags (nama, data profil) meniru kontak terpilih.
                    </p>
                  </div>
                </label>

                {sendToTesterEmail ? (
                  <div className="pt-1">
                    <input
                      type="email"
                      required
                      placeholder="Masukkan email pribadi Anda (misal: dika@gmail.com)"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Email akan dikirim langsung ke: <strong>{selectedContact?.email || "Email kontak"}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSending || !targetEmail}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengirim Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
