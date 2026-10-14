import React from "react";
import { Mail, MessageSquare, Send, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import type { ContactItem } from "@/types/contact";

interface ContactDetailSheetProps {
  contact: ContactItem | null;
  onClose: () => void;
  onDeleteContact: (id: string) => void;
}

export const ContactDetailSheet: React.FC<ContactDetailSheetProps> = ({
  contact,
  onClose,
  onDeleteContact,
}) => {
  if (!contact) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={Boolean(contact)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto space-y-6">
        <SheetHeader>
          <div className="flex items-center gap-3 pb-2">
            <div
              className={`h-12 w-12 rounded-full ${
                contact.initialsBg || "bg-sky-100"
              } ${
                contact.initialsColor || "text-sky-700"
              } font-bold text-base flex items-center justify-center shadow-xs`}
            >
              {getInitials(contact.name)}
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">
                {contact.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                Bergabung pada {contact.joinedDate}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Status & Contact Info */}
        <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status Akun:</span>
            {contact.status === "Active" && (
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
            )}
            {contact.status === "Unsubscribed" && (
              <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Unsubscribed</span>
            )}
            {contact.status === "Bounced" && (
              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Bounced</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-semibold text-slate-800">{contact.email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">WhatsApp:</span>
            <span className="font-semibold text-slate-800">{contact.whatsapp || "—"}</span>
          </div>
        </div>

        {/* Channel Consents */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 block">Saluran Izin Pengiriman (Consent)</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className={`p-2.5 rounded-xl border ${
                contact.consent.email
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <Mail
                className={`h-4 w-4 mx-auto mb-1 ${
                  contact.consent.email ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span className="font-bold text-[11px] block">Email</span>
              <span
                className={`text-[10px] ${
                  contact.consent.email ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {contact.consent.email ? "Opt-in" : "Opt-out"}
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                contact.consent.whatsapp
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <MessageSquare
                className={`h-4 w-4 mx-auto mb-1 ${
                  contact.consent.whatsapp ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span className="font-bold text-[11px] block">WhatsApp</span>
              <span
                className={`text-[10px] ${
                  contact.consent.whatsapp ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {contact.consent.whatsapp ? "Aktif" : "Non-aktif"}
              </span>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                contact.consent.telegram
                  ? "border-sky-100 bg-sky-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <Send
                className={`h-4 w-4 mx-auto mb-1 ${
                  contact.consent.telegram ? "text-sky-600" : "text-slate-400"
                }`}
              />
              <span className="font-bold text-[11px] block">Telegram</span>
              <span
                className={`text-[10px] ${
                  contact.consent.telegram ? "text-sky-600" : "text-slate-400"
                }`}
              >
                {contact.consent.telegram ? "Terkoneksi" : "Non-aktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 block">Tag Segmen</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {contact.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 font-bold text-xs"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        <SheetFooter className="pt-4">
          <button
            type="button"
            onClick={() => onDeleteContact(contact.id)}
            className="w-full h-10 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus Kontak Ini
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
