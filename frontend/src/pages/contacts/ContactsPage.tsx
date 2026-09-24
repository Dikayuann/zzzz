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
  Folder,
  Tag,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  Users,
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

export interface ContactConsent {
  email: boolean; // true: opt-in, false: opt-out
  telegram: boolean; // true: active, false: inactive
  whatsapp: boolean; // true: active, false: inactive
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  consent: ContactConsent;
  status: ContactStatus;
  joinedDate: string;
  tags: string[];
  listId?: string;
  initialsBg?: string;
  initialsColor?: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_LISTS: ContactList[] = [
  { id: "all", name: "Semua Kontak" },
  { id: "list-customers", name: "Pelanggan Utama" },
  { id: "list-webinar", name: "Peserta Webinar 2026" },
  { id: "list-newsletter", name: "Newsletter Subscriber" },
  { id: "list-leads", name: "Leads Marketing" },
];

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "ct-1",
    name: "Budi Santoso",
    email: "budi.santoso@startup.id",
    whatsapp: "+62 812-3456-7890",
    consent: { email: true, telegram: true, whatsapp: true },
    status: "Active",
    joinedDate: "Jan 12, 2026",
    tags: ["customer", "vip"],
    listId: "list-customers",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-2",
    name: "Rina Wijaya",
    email: "rina.w@tokoonline.com",
    whatsapp: "+62 857-2345-6789",
    consent: { email: true, telegram: false, whatsapp: true },
    status: "Active",
    joinedDate: "Mar 3, 2026",
    tags: ["customer", "newsletter"],
    listId: "list-customers",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-3",
    name: "Ahmad Fauzi",
    email: "ahmad@kreatifindonesia.co",
    whatsapp: undefined,
    consent: { email: true, telegram: true, whatsapp: false },
    status: "Active",
    joinedDate: "May 20, 2026",
    tags: ["vip", "webinar"],
    listId: "list-webinar",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-4",
    name: "Dewi Puspita",
    email: "dewi.puspita@mailme.id",
    whatsapp: "+62 813-4567-8901",
    consent: { email: false, telegram: false, whatsapp: false },
    status: "Unsubscribed",
    joinedDate: "Feb 8, 2026",
    tags: ["trial"],
    listId: "list-leads",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-5",
    name: "Hendra Gunawan",
    email: "hendra.g@techwave.id",
    whatsapp: "+62 878-5678-9012",
    consent: { email: true, telegram: false, whatsapp: true },
    status: "Active",
    joinedDate: "Jun 15, 2026",
    tags: ["customer", "webinar"],
    listId: "list-webinar",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-6",
    name: "Siti Rahayu",
    email: "siti.rahayu@nusantara.co",
    whatsapp: "+62 819-8765-4321",
    consent: { email: true, telegram: false, whatsapp: true },
    status: "Active",
    joinedDate: "Apr 2, 2026",
    tags: ["newsletter"],
    listId: "list-newsletter",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-7",
    name: "Fajar Nugroho",
    email: "fajar.n@digitalstudio.id",
    whatsapp: "+62 821-3456-7890",
    consent: { email: false, telegram: false, whatsapp: false },
    status: "Bounced",
    joinedDate: "Jul 22, 2026",
    tags: ["trial"],
    listId: "list-leads",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
  {
    id: "ct-8",
    name: "Maya Indah",
    email: "maya.indah@corpora.id",
    whatsapp: "+62 822-9012-3456",
    consent: { email: true, telegram: true, whatsapp: true },
    status: "Active",
    joinedDate: "Aug 11, 2026",
    tags: ["vip", "customer", "newsletter"],
    listId: "list-customers",
    initialsBg: "bg-sky-100",
    initialsColor: "text-sky-700",
  },
];

const AVAILABLE_TAGS = ["All", "vip", "customer", "newsletter", "trial", "webinar", "leads"];

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [lists, setLists] = useState<ContactList[]>(DEFAULT_LISTS);
  const [selectedList, setSelectedList] = useState<string>("all");
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
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newStatus, setNewStatus] = useState<ContactStatus>("Active");
  const [newTags] = useState<string[]>(["customer"]);
  const [newListId, setNewListId] = useState<string>("list-customers");

  // Import Wizard State (FR-CON-01, FR-CON-03, FR-CON-04)
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFileName, setImportFileName] = useState<string | null>("leads_webinar_september.csv");
  const [importFileSize, setImportFileSize] = useState<string>("28.4 KB (12 kontak)");
  const [importTargetListId, setImportTargetListId] = useState<string>("list-webinar");
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [importTags, setImportTags] = useState<string[]>(["webinar", "leads"]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"merge" | "skip">("merge");
  const [isImporting, setIsImporting] = useState(false);

  // Filtered Contacts with comprehensive search across name, email, phone, list name, and tags
  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return contacts.filter((c) => {
      const listName = lists.find((l) => l.id === c.listId)?.name?.toLowerCase() || "";
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.whatsapp && c.whatsapp.toLowerCase().includes(q)) ||
        listName.includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q.replace(/^#/, "")));
      const matchTag = selectedTag === "All" ? true : c.tags.includes(selectedTag);
      const matchList = selectedList === "all" ? true : c.listId === selectedList;
      return matchSearch && matchTag && matchList;
    });
  }, [contacts, searchQuery, selectedTag, selectedList, lists]);

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
      whatsapp: newWhatsapp.trim() || undefined,
      consent: {
        email: true,
        telegram: false,
        whatsapp: Boolean(newWhatsapp.trim()),
      },
      status: newStatus,
      joinedDate: "Hari ini",
      tags: newTags.length > 0 ? newTags : ["customer"],
      listId: newListId,
      initialsBg: "bg-sky-100",
      initialsColor: "text-sky-700",
    };

    setContacts((prev) => [created, ...prev]);
    toast.success(`Kontak "${created.name}" berhasil ditambahkan!`);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewWhatsapp("");
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    toast.info(`${selectedIds.length} kontak telah dihapus.`);
    setSelectedIds([]);
  };

  // Execute Import Handler
  const handleExecuteImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      let finalTargetListId = importTargetListId;
      let finalTargetListName =
        lists.find((l) => l.id === importTargetListId)?.name || "Default List";

      // If user created a new list during import
      if (isCreatingNewList && newListName.trim()) {
        const createdListId = `list-${Date.now()}`;
        const createdList: ContactList = {
          id: createdListId,
          name: newListName.trim(),
        };
        setLists((prev) => [...prev, createdList]);
        finalTargetListId = createdListId;
        finalTargetListName = createdList.name;
      }

      // Sample imported contacts from the file
      const newImportedContacts: ContactItem[] = [
        {
          id: `ct-imp-${Date.now()}-1`,
          name: "Farhan Maulana",
          email: "farhan.m@gmail.com",
          whatsapp: "+62 812-9988-7766",
          consent: { email: true, telegram: false, whatsapp: true },
          status: "Active",
          joinedDate: "Hari ini (Import)",
          tags: Array.from(new Set([...importTags, "imported"])),
          listId: finalTargetListId,
          initialsBg: "bg-emerald-100",
          initialsColor: "text-emerald-700",
        },
        {
          id: `ct-imp-${Date.now()}-2`,
          name: "Anisa Putri",
          email: "anisa.p@corp.id",
          whatsapp: "+62 856-1122-3344",
          consent: { email: true, telegram: true, whatsapp: true },
          status: "Active",
          joinedDate: "Hari ini (Import)",
          tags: Array.from(new Set([...importTags, "imported"])),
          listId: finalTargetListId,
          initialsBg: "bg-indigo-100",
          initialsColor: "text-indigo-700",
        },
        {
          id: `ct-imp-${Date.now()}-3`,
          name: "Reza Ramadhan",
          email: "reza.r@startup.io",
          whatsapp: "+62 878-3344-5566",
          consent: { email: true, telegram: false, whatsapp: true },
          status: "Active",
          joinedDate: "Hari ini (Import)",
          tags: Array.from(new Set([...importTags, "imported"])),
          listId: finalTargetListId,
          initialsBg: "bg-sky-100",
          initialsColor: "text-sky-700",
        },
      ];

      setContacts((prev) => [...newImportedContacts, ...prev]);
      setIsImporting(false);
      setShowImportModal(false);
      setImportStep(1);
      toast.success(
        `12 kontak berhasil diimpor ke List "${finalTargetListName}"!`,
        {
          description: `Tag diterapkan: [${importTags.join(", ")}] • Strategi: ${
            duplicateStrategy === "merge" ? "Update & Merge" : "Skip Duplicate"
          }`,
        }
      );
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontak</h1>
          <p className="text-xs text-slate-500 mt-1">
            {contacts.length} total kontak
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Tambah Kontak</span>
          </button>
        </div>
      </div>

      {/* 1.5 LIST SELECTOR TABS (FR-CON-04) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {lists.map((l) => {
          const count =
            l.id === "all"
              ? contacts.length
              : contacts.filter((c) => c.listId === l.id).length;
          const isSelected = selectedList === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setSelectedList(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
                isSelected
                  ? "bg-[#0284c7] text-white shadow-2xs"
                  : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Folder className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-sky-600"}`} />
              <span>{l.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. SEARCH & TAG FILTER BAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50/70 border border-transparent focus:border-sky-400 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
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
                    ? "bg-[#0284c7] text-white shadow-2xs"
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
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[200px]">NAMA</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[220px]">EMAIL</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[180px]">NO. WHATSAPP</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[200px]">LIST & TAGS</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[210px]">CONSENT CHANNEL</th>
                <th className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[120px]">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
                      onClick={() => setActiveContactDetail(contact)}
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
                          onChange={() => handleToggleSelectRow(contact.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      {/* 1. NAMA */}
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
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {contact.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. EMAIL */}
                      <td className="py-4 px-4 text-slate-600 font-normal whitespace-nowrap">
                        {contact.email}
                      </td>

                      {/* 3. NO. WHATSAPP */}
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

                      {/* 3.5 LIST & TAGS (FR-CON-04) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Folder className="h-3 w-3 text-sky-600" />
                            {lists.find((l) => l.id === contact.listId)?.name || "Pelanggan Utama"}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {contact.tags.map((t) => (
                              <span key={t} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/80 px-1.5 py-0.2 rounded font-medium">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* 4. CONSENT CHANNEL */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {/* Email Consent Pill */}
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

                          {/* Telegram Consent Pill */}
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

                          {/* WhatsApp Consent Pill */}
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

                      {/* 5. STATUS */}
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
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
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
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp</label>
              <input
                type="tel"
                placeholder="+62 812-3456-7890"
                value={newWhatsapp}
                onChange={(e) => setNewWhatsapp(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target List (Folder Kontak)</label>
              <select
                value={newListId}
                onChange={(e) => setNewListId(e.target.value)}
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
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ContactStatus)}
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
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                Simpan Kontak
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. IMPORT CONTACTS WIZARD (FR-CON-01, FR-CON-03, FR-CON-04) */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                  Import Kontak via CSV / Excel
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Tambahkan banyak kontak sekaligus ke dalam daftar & segmen yang tepat.
                </DialogDescription>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-3 gap-2 pt-3 pb-1 border-b border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setImportStep(1)}
                className={`py-2 px-1 text-center font-bold border-b-2 transition ${
                  importStep === 1
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                1. Upload File
              </button>
              <button
                type="button"
                onClick={() => setImportStep(2)}
                className={`py-2 px-1 text-center font-bold border-b-2 transition ${
                  importStep === 2
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                2. Pengelompokan
              </button>
              <button
                type="button"
                onClick={() => setImportStep(3)}
                className={`py-2 px-1 text-center font-bold border-b-2 transition ${
                  importStep === 3
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                3. Preview & Selesai
              </button>
            </div>
          </DialogHeader>

          {/* STEP 1: FILE UPLOAD */}
          {importStep === 1 && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-150">
              <div
                onClick={() => {
                  setImportFileName("leads_webinar_september.csv");
                  setImportFileSize("28.4 KB (12 kontak terdeteksi)");
                  toast.success("File sampel 'leads_webinar_september.csv' dipilih!");
                }}
                className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-6 text-center bg-sky-50/20 hover:bg-sky-50/40 transition cursor-pointer"
              >
                <Upload className="h-9 w-9 text-sky-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {importFileName ? (
                    <span className="text-sky-700 font-bold">{importFileName}</span>
                  ) : (
                    "Klik untuk memilih file spreadsheet (.CSV atau .XLSX)"
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {importFileSize || "Mendukung format .CSV, .XLSX (Maks. 10.000 kontak)"}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px]">Format template standar:</span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Mengunduh template_kontak_broadcast.csv...");
                  }}
                  className="font-bold text-sky-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Download className="h-3 w-3" /> Unduh Template CSV
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
                  onClick={() => setImportStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Lanjut: Pengelompokan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 2: PENGELOMPOKAN & TARGET LIST / TAGS (JAWABAN PERTANYAAN USER) */}
          {importStep === 2 && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-150">
              {/* 1. Target List */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Folder className="h-4 w-4 text-sky-600" />
                    Pilih Target List (Folder Kontak)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewList(!isCreatingNewList)}
                    className="text-[11px] font-bold text-sky-600 hover:underline"
                  >
                    {isCreatingNewList ? "Pilih dari List Ada" : "+ Buat List Baru"}
                  </button>
                </div>

                {!isCreatingNewList ? (
                  <select
                    value={importTargetListId}
                    onChange={(e) => setImportTargetListId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:border-sky-500"
                  >
                    {lists
                      .filter((l) => l.id !== "all")
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Ketik nama list baru (cth: Leads Expo Surabaya 2026)"
                    className="w-full h-10 px-3 rounded-xl border border-sky-400 bg-white text-xs text-slate-800 focus:outline-none"
                    autoFocus
                  />
                )}
                <p className="text-[11px] text-slate-400">
                  Semua kontak dari file ini akan dikelompokkan ke folder ini agar tidak tercampur dengan kontak lain.
                </p>
              </div>

              {/* 2. Auto-Tagging */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-sky-600" />
                  Tempelkan Tag Otomatis (Label Segmen)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["vip", "customer", "webinar", "trial", "newsletter", "leads"].map((t) => {
                    const isSelected = importTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setImportTags((prev) => prev.filter((item) => item !== t));
                          } else {
                            setImportTags((prev) => [...prev, t]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? `✓ #${t}` : `+ #${t}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Penanganan Duplikat (FR-CON-03) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-600" />
                  Penanganan Jika Kontak Sudah Ada (Duplikat)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setDuplicateStrategy("merge")}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      duplicateStrategy === "merge"
                        ? "border-sky-500 bg-sky-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-800 block">
                      Update & Gabungkan
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Perbarui data & tambahkan ke list ini tanpa membuat kontak ganda.
                    </span>
                  </label>

                  <label
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      duplicateStrategy === "skip"
                        ? "border-sky-500 bg-sky-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-800 block">
                      Lewati Duplikat (Skip)
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Abaikan kontak jika email/WhatsApp sudah pernah didaftarkan.
                    </span>
                  </label>
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportStep(3)}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Lanjut: Preview Kolom</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: PREVIEW & COLUMN MAPPING */}
          {importStep === 3 && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-150">
              {/* Column Mapping Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Pemetaan Kolom Otomatis:
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">Kolom CSV</span>
                    <strong>Full Name</strong> ➔ <span className="text-emerald-600 font-bold">Nama</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">Kolom CSV</span>
                    <strong>Email Address</strong> ➔ <span className="text-emerald-600 font-bold">Email</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">Kolom CSV</span>
                    <strong>WhatsApp Phone</strong> ➔ <span className="text-emerald-600 font-bold">WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Sample Rows Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Farhan Maulana</td>
                      <td className="py-2 px-3 text-slate-600">farhan.m@gmail.com</td>
                      <td className="py-2 px-3 text-slate-600">+62 812-9988-7766</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Anisa Putri</td>
                      <td className="py-2 px-3 text-slate-600">anisa.p@corp.id</td>
                      <td className="py-2 px-3 text-slate-600">+62 856-1122-3344</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Reza Ramadhan</td>
                      <td className="py-2 px-3 text-slate-600">reza.r@startup.io</td>
                      <td className="py-2 px-3 text-slate-600">+62 878-3344-5566</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Import Summary */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Target List:</span>
                  <strong className="font-bold">
                    {isCreatingNewList && newListName
                      ? newListName
                      : lists.find((l) => l.id === importTargetListId)?.name}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tag yang Ditempel:</span>
                  <strong className="font-bold">#{importTags.join(", #")}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Penanganan Duplikat:</span>
                  <strong className="font-bold">
                    {duplicateStrategy === "merge" ? "Update & Gabungkan" : "Lewati Duplikat"}
                  </strong>
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportStep(2)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Selesaikan & Mulai Import</span>
                    </>
                  )}
                </button>
              </DialogFooter>
            </div>
          )}
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
                      activeContactDetail.initialsBg || "bg-sky-100"
                    } ${
                      activeContactDetail.initialsColor || "text-sky-700"
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
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{activeContactDetail.whatsapp || "—"}</span>
                </div>
              </div>

              {/* Channel Consents */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Saluran Izin Pengiriman (Consent)</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-xl border ${
                    activeContactDetail.consent.email
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}>
                    <Mail className={`h-4 w-4 mx-auto mb-1 ${activeContactDetail.consent.email ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="font-bold text-[11px] block">Email</span>
                    <span className={`text-[10px] ${activeContactDetail.consent.email ? "text-emerald-600" : "text-slate-400"}`}>
                      {activeContactDetail.consent.email ? "Opt-in" : "Opt-out"}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    activeContactDetail.consent.whatsapp
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}>
                    <MessageSquare className={`h-4 w-4 mx-auto mb-1 ${activeContactDetail.consent.whatsapp ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="font-bold text-[11px] block">WhatsApp</span>
                    <span className={`text-[10px] ${activeContactDetail.consent.whatsapp ? "text-emerald-600" : "text-slate-400"}`}>
                      {activeContactDetail.consent.whatsapp ? "Aktif" : "Non-aktif"}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    activeContactDetail.consent.telegram
                      ? "border-sky-100 bg-sky-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}>
                    <Send className={`h-4 w-4 mx-auto mb-1 ${activeContactDetail.consent.telegram ? "text-sky-600" : "text-slate-400"}`} />
                    <span className="font-bold text-[11px] block">Telegram</span>
                    <span className={`text-[10px] ${activeContactDetail.consent.telegram ? "text-sky-600" : "text-slate-400"}`}>
                      {activeContactDetail.consent.telegram ? "Terkoneksi" : "Non-aktif"}
                    </span>
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
