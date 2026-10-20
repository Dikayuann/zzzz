import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Upload, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ContactItem, ContactList } from "@/types/contact";
import {
  ContactListSelector,
  ContactTable,
  AddContactModal,
  ImportContactsModal,
  ContactDetailSheet,
  ConfirmDeleteModal,
} from "@/components/contacts";

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [lists, setLists] = useState<ContactList[]>([{ id: "all", name: "Semua kontak" }]);
  const [selectedList, setSelectedList] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state (Server-side)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Drawers state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeContactDetail, setActiveContactDetail] = useState<ContactItem | null>(null);

  // Konfirmasi Hapus Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "single" | "bulk" | "list";
    targetId?: string;
    targetName?: string;
    isDeleting?: boolean;
  }>({ open: false, type: "single" });

  const loadContactsAndLists = async (
    targetPage = page,
    targetLimit = limit,
    targetList = selectedList,
    targetSearch = searchQuery
  ) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", String(targetPage));
      params.append("limit", String(targetLimit));
      if (targetList && targetList !== "all") {
        params.append("listId", targetList);
      }
      if (targetSearch.trim()) {
        params.append("search", targetSearch.trim());
      }

      const [contactRes, listsRes] = await Promise.all([
        api.get(`/contacts?${params.toString()}`),
        api.get("/lists"),
      ]);

      const rawContacts = contactRes.data?.contacts || contactRes.data?.data || [];
      const pagination = contactRes.data?.pagination;

      const total = pagination?.total ?? contactRes.data?.total ?? rawContacts.length;
      setTotalContacts(total);
      setTotalPages(pagination?.totalPages ?? Math.max(1, Math.ceil(total / targetLimit)));
      setPage(pagination?.page ?? targetPage);

      const mappedContacts: ContactItem[] = rawContacts.map((c: any) => {
        const primaryList = c.lists?.[0]?.id ? String(c.lists[0].id) : undefined;
        const tagNames = c.tags ? c.tags.map((t: any) => (typeof t === "string" ? t : t.name)) : [];
        const joinedDate = c.createdAt
          ? new Date(c.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Baru saja";

        return {
          id: String(c.id),
          name: c.name || "Tanpa Nama",
          email: c.email || "-",
          whatsapp: c.whatsappNumber || c.phone || undefined,
          consent: {
            email: Boolean(c.consent?.email),
            whatsapp: Boolean(c.consent?.whatsapp),
            telegram: Boolean(c.consent?.telegram || c.teleChatId),
          },
          status:
            c.status === "unsubscribed"
              ? "Unsubscribed"
              : c.status === "bounced"
              ? "Bounced"
              : "Active",
          joinedDate,
          tags: tagNames.length > 0 ? tagNames : ["kontak"],
          listId: primaryList,
          initialsBg: "bg-sky-100",
          initialsColor: "text-sky-700",
        };
      });

      setContacts(mappedContacts);

      // Konversi daftar list & jumlah kontak asli per list
      const rawLists = listsRes.data?.lists || listsRes.data?.data || [];
      const mappedLists: ContactList[] = [
        { id: "all", name: "Semua kontak" },
        ...rawLists.map((l: any) => ({
          id: String(l.id),
          name: l.name,
          description: l.description || "",
          contactCount: l.contactCount ?? 0,
        })),
      ];
      setLists(mappedLists);
    } catch (err: any) {
      console.error("Gagal memuat kontak:", err);
      toast.error(err.response?.data?.message || "Gagal memuat kontak dari database");
    } finally {
      setIsLoading(false);
    }
  };

  // Muat data saat halaman / list / limit berubah
  useEffect(() => {
    loadContactsAndLists(page, limit, selectedList, searchQuery);
  }, [page, limit, selectedList]);

  // Debounce search agar responsif
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadContactsAndLists(1, limit, selectedList, searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tag dinamis dari kontak yang tertera
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [contacts]);

  // Client-side filter tambahan untuk Tag
  const displayedContacts = useMemo(() => {
    if (selectedTag === "All") return contacts;
    return contacts.filter((c) => c.tags.includes(selectedTag));
  }, [contacts, selectedTag]);

  // Checkbox Selection
  const allVisibleSelected =
    displayedContacts.length > 0 &&
    displayedContacts.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(displayedContacts.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = displayedContacts.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddContact = () => {
    loadContactsAndLists(1, limit, selectedList, searchQuery);
  };

  const handleImportSuccess = () => {
    loadContactsAndLists(1, limit, selectedList, searchQuery);
  };

  // Trigger modal konfirmasi hapus
  const requestDeleteSingle = (contact: ContactItem) => {
    setDeleteConfirm({
      open: true,
      type: "single",
      targetId: contact.id,
      targetName: contact.name,
    });
  };

  const requestDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({
      open: true,
      type: "bulk",
      targetName: `${selectedIds.length} kontak terpilih`,
    });
  };

  const requestDeleteList = (listId: string, listName: string) => {
    setDeleteConfirm({
      open: true,
      type: "list",
      targetId: listId,
      targetName: listName,
    });
  };

  // Eksekusi penghapusan setelah konfirmasi di modal
  const handleConfirmDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (deleteConfirm.type === "single" && deleteConfirm.targetId) {
        await api.delete(`/contacts/${deleteConfirm.targetId}`);
        toast.success(`Kontak "${deleteConfirm.targetName}" berhasil dihapus.`);
        if (activeContactDetail?.id === deleteConfirm.targetId) {
          setActiveContactDetail(null);
        }
      } else if (deleteConfirm.type === "bulk") {
        const numIds = selectedIds.map(Number).filter((id) => !isNaN(id));
        await api.post("/contacts/bulk-delete", { contactIds: numIds });
        toast.success(`${selectedIds.length} kontak berhasil dihapus.`);
        setSelectedIds([]);
      } else if (deleteConfirm.type === "list" && deleteConfirm.targetId) {
        await api.delete(`/lists/${deleteConfirm.targetId}`);
        toast.success(`Kategori list "${deleteConfirm.targetName}" berhasil dihapus.`);
        if (selectedList === deleteConfirm.targetId) {
          setSelectedList("all");
        }
      }

      setDeleteConfirm({ open: false, type: "single" });
      loadContactsAndLists(page, limit, selectedList, searchQuery);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal melakukan penghapusan");
    } finally {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontak</h1>
          <p className="text-xs text-slate-500 mt-1">
            <strong className="text-slate-800 font-semibold">{totalContacts.toLocaleString()}</strong> total kontak di database
          </p>
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
        onSelectList={(id) => {
          setSelectedList(id);
          setPage(1);
        }}
        totalContacts={totalContacts}
        onDeleteList={requestDeleteList}
      />

      {/* 3. SEARCH & TAG FILTER BAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, nomor WA..."
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

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {availableTags.map((t) => {
            const isSelected = selectedTag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "All" ? "All" : `#${t}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CONTACTS DATA TABLE */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 text-sky-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat data kontak dari database...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <ContactTable
            contacts={displayedContacts}
            lists={lists}
            selectedIds={selectedIds}
            onToggleSelectRow={handleToggleSelectRow}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={(contact) => setActiveContactDetail(contact)}
            onRequestDeleteContact={requestDeleteSingle}
          />

          {/* 5. PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan{" "}
                <strong className="text-slate-700 font-bold">
                  {totalContacts > 0 ? (page - 1) * limit + 1 : 0}
                </strong>{" "}
                -{" "}
                <strong className="text-slate-700 font-bold">
                  {Math.min(page * limit, totalContacts)}
                </strong>{" "}
                dari{" "}
                <strong className="text-slate-900 font-bold">
                  {totalContacts.toLocaleString()}
                </strong>{" "}
                kontak
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Per halaman:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                Sebelumnya
              </button>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-800">
                Halaman {page} dari {totalPages || 1}
              </div>
              <button
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold">{selectedIds.length} kontak terpilih</span>
          <div className="h-4 w-px bg-slate-700" />
          <button
            type="button"
            onClick={requestDeleteBulk}
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

      {/* 7. MODALS & DRAWERS */}
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
        onDeleteContact={(id) => {
          const c = contacts.find((item) => item.id === id);
          if (c) requestDeleteSingle(c);
        }}
      />

      {/* 8. MODAL KONFIRMASI HAPUS */}
      <ConfirmDeleteModal
        open={deleteConfirm.open}
        onOpenChange={(val) => setDeleteConfirm((prev) => ({ ...prev, open: val }))}
        title={
          deleteConfirm.type === "list"
            ? `Hapus Kategori List "${deleteConfirm.targetName}"?`
            : deleteConfirm.type === "bulk"
            ? `Hapus ${selectedIds.length} Kontak Terpilih?`
            : `Hapus Kontak "${deleteConfirm.targetName}"?`
        }
        description={
          deleteConfirm.type === "list"
            ? `List "${deleteConfirm.targetName}" akan dihapus dari daftar kategori. Kontak-kontak di dalamnya tidak akan terhapus dan tetap tersimpan di database (Semua Kontak).`
            : deleteConfirm.type === "bulk"
            ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} kontak ini? Kontak yang dihapus tidak akan lagi menerima blast kampanye.`
            : `Apakah Anda yakin ingin menghapus kontak "${deleteConfirm.targetName}"? Tindakan ini dapat dibatalkan hanya melalui restore database.`
        }
        confirmLabel={deleteConfirm.type === "list" ? "Ya, Hapus List" : "Ya, Hapus Kontak"}
        isDeleting={deleteConfirm.isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
