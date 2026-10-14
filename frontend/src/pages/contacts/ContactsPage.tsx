import React, { useState, useMemo } from "react";
import { Search, Plus, Upload, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { ContactItem, ContactList } from "@/types/contact";
import {
  DEFAULT_LISTS,
  INITIAL_CONTACTS,
  AVAILABLE_TAGS,
} from "@/data/mockContacts";
import {
  ContactListSelector,
  ContactTable,
  AddContactModal,
  ImportContactsModal,
  ContactDetailSheet,
} from "@/components/contacts";

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

  const handleAddContact = (newContact: ContactItem) => {
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    toast.info(`${selectedIds.length} kontak telah dihapus.`);
    setSelectedIds([]);
  };

  const handleImportSuccess = (newContacts: ContactItem[], createdList?: ContactList) => {
    if (createdList) {
      setLists((prev) => [...prev, createdList]);
    }
    setContacts((prev) => [...newContacts, ...prev]);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (activeContactDetail?.id === contactId) {
      toast.info(`Kontak "${activeContactDetail.name}" telah dihapus.`);
      setActiveContactDetail(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontak</h1>
          <p className="text-xs text-slate-500 mt-1">{contacts.length} total kontak</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
          </button>

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

      {/* 2. LIST SELECTOR TABS */}
      <ContactListSelector
        lists={lists}
        selectedList={selectedList}
        onSelectList={setSelectedList}
        contacts={contacts}
      />

      {/* 3. SEARCH & TAG FILTER BAR */}
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

      {/* 4. CONTACTS DATA TABLE */}
      <ContactTable
        contacts={filteredContacts}
        lists={lists}
        selectedIds={selectedIds}
        onToggleSelectRow={handleToggleSelectRow}
        onToggleSelectAll={handleToggleSelectAll}
        onRowClick={(contact) => setActiveContactDetail(contact)}
      />

      {/* 5. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold">{selectedIds.length} kontak terpilih</span>
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

      {/* 6. MODALS & DRAWERS */}
      <AddContactModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        lists={lists}
        onAddContact={handleAddContact}
      />

      <ImportContactsModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        lists={lists}
        onImportSuccess={handleImportSuccess}
      />

      <ContactDetailSheet
        contact={activeContactDetail}
        onClose={() => setActiveContactDetail(null)}
        onDeleteContact={handleDeleteContact}
      />
    </div>
  );
};
