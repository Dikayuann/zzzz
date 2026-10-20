import React from "react";
import { Folder, Eye, Trash2 } from "lucide-react";
import type { ContactItem, ContactList } from "@/types/contact";

interface ContactTableProps {
  contacts: ContactItem[];
  lists: ContactList[];
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onRowClick: (contact: ContactItem) => void;
  onRequestDeleteContact?: (contact: ContactItem) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  lists,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onRowClick,
  onRequestDeleteContact,
}) => {
  const allVisibleSelected =
    contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3.5 pl-5 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[200px]">NAMA</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[220px]">EMAIL</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[180px]">NO. WHATSAPP</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[200px]">LIST & TAGS</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[210px]">CONSENT CHANNEL</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[100px]">STATUS</th>
              <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap text-right pr-5 min-w-[130px]">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="font-medium text-sm text-slate-600">Tidak ada kontak ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian atau tag filter di atas.
                  </p>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => {
                const isChecked = selectedIds.includes(contact.id);
                return (
                  <tr
                    key={contact.id}
                    onClick={() => onRowClick(contact)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isChecked ? "bg-sky-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-4 pl-5 pr-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectRow(contact.id)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>

                    {/* NAMA */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${
                            contact.initialsBg || "bg-sky-100"
                          } ${
                            contact.initialsColor || "text-sky-700"
                          } font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs`}
                        >
                          {getInitials(contact.name)}
                        </div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {contact.name}
                        </span>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-4 text-slate-600 font-normal whitespace-nowrap">
                      {contact.email}
                    </td>

                    {/* NO. WHATSAPP */}
                    <td className="py-4 px-4 font-normal whitespace-nowrap">
                      {contact.whatsapp ? (
                        <div className="inline-flex items-center gap-2 text-slate-700 font-medium whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="whitespace-nowrap">{contact.whatsapp}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* LIST & TAGS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Folder className="h-3 w-3 text-sky-600" />
                          {lists.find((l) => l.id === contact.listId)?.name || "Pelanggan Utama"}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {contact.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/80 px-1.5 py-0.2 rounded font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* CONSENT CHANNEL */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {contact.consent.email ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            opt-in
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                            opt-out
                          </span>
                        )}

                        {contact.consent.telegram ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-bold whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                            TG
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            TG
                          </span>
                        )}

                        {contact.consent.whatsapp ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-2xs whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                            WA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            WA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {contact.status === "Active" && (
                        <span className="font-semibold text-emerald-600">Active</span>
                      )}
                      {contact.status === "Unsubscribed" && (
                        <span className="font-semibold text-slate-500">Unsubscribed</span>
                      )}
                      {contact.status === "Bounced" && (
                        <span className="font-semibold text-rose-600">Bounced</span>
                      )}
                    </td>

                    {/* AKSI / PREVIEW & HAPUS */}
                    <td
                      className="py-4 px-4 text-right pr-5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRowClick(contact)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-sky-700 text-[11px] font-semibold transition shadow-2xs cursor-pointer active:scale-95"
                          title="Lihat Detail Kontak"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Preview</span>
                        </button>

                        {onRequestDeleteContact && (
                          <button
                            type="button"
                            onClick={() => onRequestDeleteContact(contact)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus kontak ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
