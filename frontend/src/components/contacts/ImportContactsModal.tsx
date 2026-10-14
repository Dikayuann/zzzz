import React, { useState } from "react";
import {
  Upload,
  Download,
  Folder,
  Tag,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ContactItem, ContactList } from "@/types/contact";

interface ImportContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: ContactList[];
  onImportSuccess: (newContacts: ContactItem[], createdList?: ContactList) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  open,
  onOpenChange,
  lists,
  onImportSuccess,
}) => {
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFileName, setImportFileName] = useState<string | null>("leads_webinar_september.csv");
  const [importFileSize, setImportFileSize] = useState<string>("28.4 KB (12 kontak)");
  const [importTargetListId, setImportTargetListId] = useState<string>("list-webinar");
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [importTags, setImportTags] = useState<string[]>(["webinar", "leads"]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"merge" | "skip">("merge");
  const [isImporting, setIsImporting] = useState(false);

  const handleExecuteImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      let finalTargetListId = importTargetListId;
      let createdListObj: ContactList | undefined;

      if (isCreatingNewList && newListName.trim()) {
        const createdListId = `list-${Date.now()}`;
        createdListObj = {
          id: createdListId,
          name: newListName.trim(),
        };
        finalTargetListId = createdListId;
      }

      const finalTargetListName =
        createdListObj?.name ||
        lists.find((l) => l.id === importTargetListId)?.name ||
        "Default List";

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

      onImportSuccess(newImportedContacts, createdListObj);
      setIsImporting(false);
      onOpenChange(false);
      setImportStep(1);
      toast.success(`12 kontak berhasil diimpor ke List "${finalTargetListName}"!`, {
        description: `Tag diterapkan: [${importTags.join(", ")}] • Strategi: ${
          duplicateStrategy === "merge" ? "Update & Merge" : "Skip Duplicate"
        }`,
      });
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onOpenChange(false)}
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

        {/* STEP 2: PENGELOMPOKAN & TARGET LIST / TAGS */}
        {importStep === 2 && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
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
                  <span className="font-bold text-slate-800 block">Update & Gabungkan</span>
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
                  <span className="font-bold text-slate-800 block">Lewati Duplikat (Skip)</span>
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
  );
};
