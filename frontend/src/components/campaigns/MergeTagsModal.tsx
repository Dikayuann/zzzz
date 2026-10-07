import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Tag,
  Plus,
  User,
  Building2,
  TicketPercent,
  Calendar,
  Link2,
  Check,
} from "lucide-react";
import {
  MERGE_TAG_CATEGORIES,
  type MergeTagItem,
} from "@/data/mergeTags";
import { toast } from "sonner";

interface MergeTagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTag: (tag: string, target?: "subject" | "preheader" | "content") => void;
  targetField?: "subject" | "preheader" | "content";
  onTargetFieldChange?: (field: "subject" | "preheader" | "content") => void;
  showTargetSelector?: boolean;
}

export const MergeTagsModal: React.FC<MergeTagsModalProps> = ({
  open,
  onOpenChange,
  onSelectTag,
  targetField,
  onTargetFieldChange,
  showTargetSelector = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [customTagInput, setCustomTagInput] = useState("");

  const categories = [
    { id: "all", name: "Semua Tag", icon: Tag },
    { id: "contact", name: "Kontak", icon: User },
    { id: "business", name: "Bisnis", icon: Building2 },
    { id: "commerce", name: "Promo & Transaksi", icon: TicketPercent },
    { id: "datetime", name: "Waktu & Tanggal", icon: Calendar },
    { id: "links", name: "Tautan & Keamanan", icon: Link2 },
  ];

  const filteredItems = useMemo(() => {
    let items: (MergeTagItem & { categoryName: string })[] = [];

    MERGE_TAG_CATEGORIES.forEach((cat) => {
      if (activeCategory === "all" || activeCategory === cat.id) {
        cat.items.forEach((item) => {
          items.push({ ...item, categoryName: cat.name });
        });
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (it) =>
          it.tag.toLowerCase().includes(q) ||
          it.label.toLowerCase().includes(q) ||
          it.desc.toLowerCase().includes(q) ||
          it.sample.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeCategory, searchQuery]);

  const handleInsert = (tag: string) => {
    onSelectTag(tag, targetField);
    onOpenChange(false);
  };

  const handleInsertCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = customTagInput
      .trim()
      .toLowerCase()
      .replace(/[{}]/g, "")
      .replace(/\s+/g, "_");

    if (!cleanTag) {
      toast.error("Nama variabel kustom tidak boleh kosong");
      return;
    }

    onSelectTag(cleanTag, targetField);
    setCustomTagInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border-slate-200">
        <DialogHeader className="p-5 pb-3 pr-14 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Pustaka Merge Tag & Variabel Dinamis
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Pilih variabel untuk menyisipkan data unik pelanggan secara otomatis saat broadcast dikirim.
              </DialogDescription>
            </div>
          </div>

          {/* Optional Target Field Switcher */}
          {showTargetSelector && targetField && (
            <div className="mt-2.5 flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                Sisipkan tag ke kolom:
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onTargetFieldChange?.("subject")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    targetField === "subject"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Subjek Email
                </button>
                <button
                  type="button"
                  onClick={() => onTargetFieldChange?.("preheader")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    targetField === "preheader"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Preheader
                </button>
                <button
                  type="button"
                  onClick={() => onTargetFieldChange?.("content")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    targetField === "content"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Isi Pesan
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari variabel (contoh: nama, email, diskon, voucher)..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-2xs transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* Custom Tag Injector Box */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-600">
            <strong>Punya kolom data custom di Excel / CSV?</strong>
            <p className="text-[10px] text-slate-400">
              Ketik nama kolom untuk disisipkan langsung:
            </p>
          </div>
          <form onSubmit={handleInsertCustom} className="flex items-center gap-1.5">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500 font-bold">
                {"{{"}
              </span>
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="poin_reward"
                className="h-8 pl-7 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 w-36 sm:w-44"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500 font-bold">
                {"}}"}
              </span>
            </div>
            <button
              type="submit"
              className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Sisipkan</span>
            </button>
          </form>
        </div>

        {/* Tag Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400">
              Tidak ada variabel merge tag yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.tag}
                onClick={() => handleInsert(item.tag)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/50 bg-white transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition">
                      {`{{${item.tag}}}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.categoryName}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 mt-2">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate">
                    Contoh: <strong className="text-slate-700 font-medium">"{item.sample}"</strong>
                  </span>
                  <span className="text-slate-900 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                    <Check className="h-3 w-3" /> Pilih
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Total: <strong>{filteredItems.length}</strong> variabel dinamis tersedia
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
