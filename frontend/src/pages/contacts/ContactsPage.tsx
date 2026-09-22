import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  X,
  Mail,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export type ContactStatus = "Active" | "Unsubscribed" | "Bounced";

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: ContactStatus;
  joinedDate: string;
  tags: string[];
  initialsBg?: string;
  initialsColor?: string;
}

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "ct-1",
    name: "Budi Santoso",
    email: "budi.santoso@startup.id",
    phone: "+62 812-3456-7890",
    status: "Active",
    joinedDate: "Jan 12, 2026",
    tags: ["customer", "vip"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-2",
    name: "Rina Wijaya",
    email: "rina.w@tokoonline.com",
    phone: "+62 813-9876-5432",
    status: "Active",
    joinedDate: "Mar 3, 2026",
    tags: ["customer", "newsletter"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-3",
    name: "Ahmad Fauzi",
    email: "ahmad@kreatifindonesia.co",
    phone: "+62 811-2345-6789",
    status: "Active",
    joinedDate: "May 20, 2026",
    tags: ["vip", "webinar"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-4",
    name: "Dewi Puspita",
    email: "dewi.puspita@mailme.id",
    phone: "+62 815-6789-0123",
    status: "Unsubscribed",
    joinedDate: "Feb 8, 2026",
    tags: ["trial"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-5",
    name: "Hendra Gunawan",
    email: "hendra.g@techwave.id",
    phone: "+62 817-1234-5678",
    status: "Active",
    joinedDate: "Jun 15, 2026",
    tags: ["customer", "webinar"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-6",
    name: "Siti Rahayu",
    email: "siti.rahayu@nusantara.co",
    phone: "+62 819-8765-4321",
    status: "Active",
    joinedDate: "Apr 2, 2026",
    tags: ["newsletter"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-7",
    name: "Fajar Nugroho",
    email: "fajar.n@digitalstudio.id",
    phone: "+62 821-3456-7890",
    status: "Bounced",
    joinedDate: "Jul 22, 2026",
    tags: ["trial"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "ct-8",
    name: "Maya Indah",
    email: "maya.indah@corpora.id",
    phone: "+62 822-9012-3456",
    status: "Active",
    joinedDate: "Aug 11, 2026",
    tags: ["vip", "customer", "newsletter"],
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
];

const AVAILABLE_TAGS = ["All", "vip", "customer", "newsletter", "trial", "webinar"];

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeContactDetail, setActiveContactDetail] = useState<ContactItem | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState<ContactStatus>("Active");
  const [newTags] = useState<string[]>(["customer"]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === "All" ? true : c.tags.includes(selectedTag);
      return matchSearch && matchTag;
    });
  }, [contacts, searchQuery, selectedTag]);

  // Checkbox Selection
  const allVisibleSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredContacts.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = filteredContacts.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Add Contact Handler
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Nama dan Email wajib diisi!");
      return;
    }

    const created: ContactItem = {
      id: `ct-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || "+62 812-0000-0000",
      status: newStatus,
      joinedDate: "Hari ini",
      tags: newTags.length > 0 ? newTags : ["customer"],
      initialsBg: "bg-indigo-100",
      initialsColor: "text-indigo-700",
    };

    setContacts((prev) => [created, ...prev]);
    toast.success(`Kontak "${created.name}" berhasil ditambahkan!`);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    toast.info(`${selectedIds.length} kontak telah dihapus.`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contacts</h1>
          <p className="text-xs text-slate-500 mt-1">
            {contacts.length} total contacts
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Import Button */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
          </button>

          {/* Add Contact Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & TAG FILTER BAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50/60 border border-transparent focus:border-indigo-400 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-0.5">
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTACTS DATA TABLE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-3.5 pl-5 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-500">Name</th>
                <th className="py-3.5 px-4 font-bold text-slate-500">Email</th>
                <th className="py-3.5 px-4 font-bold text-slate-500">Status</th>
                <th className="py-3.5 px-4 font-bold text-slate-500">Joined</th>
                <th className="py-3.5 pr-5 pl-4 text-right font-bold text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm text-slate-600">Tidak ada kontak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau tag filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isChecked = selectedIds.includes(contact.id);
                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(contact.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Name + Initials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full ${
                              contact.initialsBg || "bg-indigo-100"
                            } ${
                              contact.initialsColor || "text-indigo-700"
                            } font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs`}
                          >
                            {getInitials(contact.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {contact.name}
                            </span>
                            {contact.phone && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-normal">
                        {contact.email}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
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

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-normal">
                        {contact.joinedDate}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-5 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveContactDetail(contact)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs cursor-pointer hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold">
            {selectedIds.length} kontak terpilih
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-slate-200 ml-2 transition cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* 5. ADD CONTACT MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Tambah Kontak Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Masukkan informasi penerima untuk kampanye email, WhatsApp, atau Telegram.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Alamat Email *</label>
              <input
                type="email"
                required
                placeholder="budi@startup.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nomor Telepon (WhatsApp)</label>
              <input
                type="tel"
                placeholder="+62 812-3456-7890"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Status Penerima</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ContactStatus)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">Active (Aktif)</option>
                <option value="Unsubscribed">Unsubscribed (Berhenti)</option>
                <option value="Bounced">Bounced (Gagal)</option>
              </select>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                Simpan Kontak
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. IMPORT CONTACTS MODAL */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Import Kontak via CSV / Excel
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unggah file spreadsheet untuk menambahkan banyak penerima sekaligus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer">
              <Upload className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Klik untuk memilih file atau seret file ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Mendukung format .CSV, .XLSX (Maks. 10.000 baris kontak)
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span>Gunakan format template standar kami:</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Template CSV sedang diunduh...");
                }}
                className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> Unduh Template
              </a>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("8 kontak berhasil diimpor dari file sample.");
                  setShowImportModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                Mulai Import
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. CONTACT DETAIL DRAWER */}
      <Sheet open={Boolean(activeContactDetail)} onOpenChange={(open) => !open && setActiveContactDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto space-y-6">
          {activeContactDetail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3 pb-2">
                  <div
                    className={`h-12 w-12 rounded-full ${
                      activeContactDetail.initialsBg || "bg-indigo-100"
                    } ${
                      activeContactDetail.initialsColor || "text-indigo-700"
                    } font-bold text-base flex items-center justify-center shadow-xs`}
                  >
                    {getInitials(activeContactDetail.name)}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-slate-900">
                      {activeContactDetail.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-slate-500">
                      Bergabung pada {activeContactDetail.joinedDate}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Status & Contact Info */}
              <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Akun:</span>
                  {activeContactDetail.status === "Active" && (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  )}
                  {activeContactDetail.status === "Unsubscribed" && (
                    <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Unsubscribed</span>
                  )}
                  {activeContactDetail.status === "Bounced" && (
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Bounced</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-800">{activeContactDetail.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telepon (WhatsApp):</span>
                  <span className="font-semibold text-slate-800">{activeContactDetail.phone || "-"}</span>
                </div>
              </div>

              {/* Channel Consents */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Saluran Izin Pengiriman</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <Mail className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <span className="font-bold text-[11px] text-emerald-800 block">Email</span>
                    <span className="text-[10px] text-emerald-600">Opted-in</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <MessageSquare className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <span className="font-bold text-[11px] text-emerald-800 block">WhatsApp</span>
                    <span className="text-[10px] text-emerald-600">Opted-in</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/50">
                    <Send className="h-4 w-4 text-sky-600 mx-auto mb-1" />
                    <span className="font-bold text-[11px] text-sky-800 block">Telegram</span>
                    <span className="text-[10px] text-sky-600">Terkoneksi</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Tag Segmen</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeContactDetail.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Riwayat Interaksi Kampanye</span>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Flash Sale Alert 9.9</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Dibuka</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">WhatsApp • 22 Sep 2026, 10:14 WIB</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Product Launch Announcement</span>
                      <span className="text-[10px] text-sky-600 font-semibold">Terkirim</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Email • 18 Sep 2026, 09:30 WIB</span>
                  </div>
                </div>
              </div>

              <SheetFooter className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setContacts((prev) => prev.filter((c) => c.id !== activeContactDetail.id));
                    toast.info(`Kontak "${activeContactDetail.name}" telah dihapus.`);
                    setActiveContactDetail(null);
                  }}
                  className="w-full h-10 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus Kontak Ini
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
