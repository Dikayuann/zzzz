import React, { useState, useRef, useEffect } from "react";
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
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importFileSize, setImportFileSize] = useState<string>("");
  const [parsedContacts, setParsedContacts] = useState<
    Array<{ name: string; email?: string; whatsappNumber?: string; teleChatId?: string }>
  >([]);
  const [importTargetListId, setImportTargetListId] = useState<string>("");
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [importTags, setImportTags] = useState<string[]>(["pelanggan", "leads"]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"merge" | "skip">("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  // Tag kustom & dinamis dari database
  const [availableTags, setAvailableTags] = useState<Array<{ id?: number; name: string }>>([
    { name: "vip" },
    { name: "customer" },
    { name: "webinar" },
    { name: "trial" },
    { name: "newsletter" },
    { name: "leads" },
  ]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Ambil tag yang sudah pernah dibuat dari database backend
  useEffect(() => {
    if (open) {
      api
        .get("/tags")
        .then((res) => {
          const dbTags: Array<{ id: number; name: string }> = res.data?.data || res.data?.tags || [];
          const defaultNames = ["vip", "customer", "webinar", "trial", "newsletter", "leads"];
          const existingNames = new Set(dbTags.map((t) => t.name.toLowerCase()));

          const combined: Array<{ id?: number; name: string }> = [...dbTags];
          defaultNames.forEach((d) => {
            if (!existingNames.has(d)) {
              combined.push({ name: d });
            }
          });
          setAvailableTags(combined);
        })
        .catch((err) => {
          console.error("Gagal memuat tags:", err);
        });
    }
  }, [open]);

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = customTagInput.trim().replace(/^#+/, "").toLowerCase();
    if (!cleanTag) return;

    if (!availableTags.some((t) => t.name.toLowerCase() === cleanTag)) {
      setAvailableTags((prev) => [...prev, { name: cleanTag }]);
    }
    if (!importTags.includes(cleanTag)) {
      setImportTags((prev) => [...prev, cleanTag]);
    }
    setCustomTagInput("");
  };

  // Fungsi download file template Excel (.xlsx) kosong siap isi untuk blast
  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();

    // Kolom standar blast:
    // - nama: untuk personalisasi pesan blast ({{nama}} / {{first_name}})
    // - whatsapp: nomor WhatsApp penerima
    // - email: alamat email penerima
    // (Catatan: Kontak Telegram masuk otomatis saat user menekan /start pada bot Telegram)
    const headerRow = [["nama", "whatsapp", "email"]];

    const worksheet = XLSX.utils.aoa_to_sheet(headerRow);

    // Atur lebar kolom agar rapi saat dibuka di Microsoft Excel
    worksheet["!cols"] = [
      { wch: 25 }, // nama
      { wch: 22 }, // whatsapp
      { wch: 30 }, // email
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Kontak Blast");

    XLSX.writeFile(workbook, "template_kontak_blast.xlsx");
    toast.success("Template Excel (.xlsx) kosong berhasil diunduh!");
  };

  // Fungsi membaca file Excel (.xlsx / .xls) maupun CSV dari komputer user
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");
    const isCsv = lowerName.endsWith(".csv");

    if (!isExcel && !isCsv) {
      toast.error("Mohon pilih file spreadsheet Excel (.xlsx/.xls) atau .csv");
      return;
    }

    setImportFileName(file.name);
    setImportFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (!buffer) return;

        const workbook = XLSX.read(buffer, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi sheet ke baris array
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rows.length < 2) {
          toast.error("File spreadsheet kosong atau hanya memiliki baris header");
          return;
        }

        const headers = (rows[0] as string[]).map((h) =>
          String(h || "").trim().toLowerCase()
        );

        const nameIdx = headers.findIndex((h) => h.includes("nama") || h.includes("name"));
        const emailIdx = headers.findIndex((h) => h.includes("email"));
        const phoneIdx = headers.findIndex(
          (h) =>
            h.includes("whatsapp") ||
            h.includes("wa") ||
            h.includes("phone") ||
            h.includes("telepon") ||
            h.includes("hp")
        );
        const teleIdx = headers.findIndex(
          (h) => h.includes("tele") || h.includes("chat_id") || h.includes("telegram")
        );

        const parsed: Array<{ name: string; email?: string; whatsappNumber?: string; teleChatId?: string }> = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row || row.length === 0) continue;

          const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : "";
          const email = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : "";
          const phone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : "";
          const tele = teleIdx !== -1 && row[teleIdx] ? String(row[teleIdx]).trim() : "";

          // Minimal nama + salah satu dari email/whatsapp
          if (name && (email || phone)) {
            parsed.push({
              name,
              email: email || undefined,
              whatsappNumber: phone || undefined,
              teleChatId: tele || undefined,
            });
          }
        }

        if (parsed.length === 0) {
          toast.error("Tidak ada data kontak valid. Pastikan ada kolom nama dan email/whatsapp.");
          return;
        }

        setParsedContacts(parsed);
        setImportFileSize(`${(file.size / 1024).toFixed(1)} KB (${parsed.length} kontak terdeteksi)`);
        toast.success(`${parsed.length} kontak berhasil dibaca dari file!`);
      } catch (err: any) {
        console.error("Gagal membaca file spreadsheet:", err);
        toast.error("Gagal membaca file spreadsheet. Pastikan format file tidak rusak.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Eksekusi pengiriman data import ke Backend API
  const handleExecuteImport = async () => {
    if (parsedContacts.length === 0) {
      toast.error("Belum ada kontak yang dipilih untuk diimpor");
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: parsedContacts.length });

    try {
      let targetListIdNum: number | undefined;

      // Jika user memilih buat list baru saat import
      if (isCreatingNewList && newListName.trim()) {
        const createListRes = await api.post("/lists", { name: newListName.trim() });
        targetListIdNum = createListRes.data?.data?.id || createListRes.data?.id;
      } else if (importTargetListId && importTargetListId !== "all") {
        targetListIdNum = Number(importTargetListId);
      }

      // Resolving atau auto-create tag ke database jika diperlukan
      const resolvedTagIds: number[] = [];
      if (importTags.length > 0) {
        for (const tagName of importTags) {
          const found = availableTags.find(
            (t) => t.name.toLowerCase() === tagName.toLowerCase() && t.id
          );
          if (found && found.id) {
            resolvedTagIds.push(found.id);
          } else {
            try {
              const tagRes = await api.post("/tags", { name: tagName });
              const newTagId = tagRes.data?.data?.id || tagRes.data?.id;
              if (newTagId) resolvedTagIds.push(newTagId);
            } catch {
              // Jika tag sudah ada / konflik nama, tetap lanjutkan
            }
          }
        }
      }

      // Chunking batch per 250 kontak agar cepat dan ada progress bar real-time
      const CHUNK_SIZE = 250;
      let totalImported = 0;

      for (let i = 0; i < parsedContacts.length; i += CHUNK_SIZE) {
        const chunk = parsedContacts.slice(i, i + CHUNK_SIZE);
        const payload: any = {
          contacts: chunk,
          listId: !isNaN(targetListIdNum as number) ? targetListIdNum : undefined,
          tagsIds: resolvedTagIds.length > 0 ? resolvedTagIds : undefined,
          duplicateStrategy: duplicateStrategy === "merge" ? "update" : "skip",
        };

        const res = await api.post("/contacts/import", payload);
        const importedData = res.data?.data;
        totalImported += (importedData?.importedCount ?? chunk.length);

        const currentCount = Math.min(i + chunk.length, parsedContacts.length);
        setImportProgress({
          current: currentCount,
          total: parsedContacts.length,
        });
      }

      toast.success(`${totalImported || parsedContacts.length} kontak berhasil diimpor ke database!`);
      onImportSuccess([], undefined);
      onOpenChange(false);
      setImportStep(1);
      setParsedContacts([]);
      setImportFileName(null);
      setImportProgress(null);
    } catch (err: any) {
      console.error("Gagal import kontak:", err);
      toast.error(err.response?.data?.message || "Gagal melakukan import kontak");
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
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
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-6 text-center bg-sky-50/20 hover:bg-sky-50/40 transition cursor-pointer"
            >
              <Upload className="h-9 w-9 text-sky-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {importFileName ? (
                  <span className="text-sky-700 font-bold">{importFileName}</span>
                ) : (
                  "Klik untuk memilih file spreadsheet (.xlsx / .csv)"
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {importFileSize || "Mendukung format Excel (.xlsx, .xls) & .CSV (Maks. 1.000 kontak)"}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px]">Format template kontak siap isi:</span>
              <a
                href="#"
                onClick={handleDownloadTemplate}
                className="font-bold text-sky-600 hover:underline flex items-center gap-1.5 text-[11px]"
              >
                <Download className="h-3.5 w-3.5" /> Unduh Template Excel (.xlsx) Kosong
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
                disabled={parsedContacts.length === 0}
                onClick={() => setImportStep(2)}
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
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
                  <option value="">Semua Kontak (Tanpa Folder List)</option>
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
                  placeholder="Ketik nama list baru (cth: Leads Promo Lebaran)"
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
              <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-0.5">
                {availableTags.map((t) => {
                  const tagLower = t.name.toLowerCase();
                  const isSelected = importTags.includes(tagLower);
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setImportTags((prev) => prev.filter((item) => item !== tagLower));
                        } else {
                          setImportTags((prev) => [...prev, tagLower]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? `✓ #${t.name}` : `+ #${t.name}`}
                    </button>
                  );
                })}
              </div>

              {/* Input Tambah Tag Kustom */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">#</span>
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Buat tag kustom baru (cth: promo-oktober, hot-leads)..."
                    className="w-full h-8 pl-7 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustomTag()}
                  disabled={!customTagInput.trim()}
                  className="px-3 h-8 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                >
                  + Tambah Tag
                </button>
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
                Pemetaan Kolom Kontak Blast:
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Kolom File</span>
                  <strong>nama</strong> ➔ <span className="text-emerald-600 font-bold">Nama</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Kolom File</span>
                  <strong>whatsapp</strong> ➔ <span className="text-emerald-600 font-bold">WhatsApp</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px]">Kolom File</span>
                  <strong>email</strong> ➔ <span className="text-emerald-600 font-bold">Email</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">WhatsApp</th>
                    <th className="py-2 px-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {parsedContacts.slice(0, 5).map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-2 px-3 text-slate-600">{c.whatsappNumber || "-"}</td>
                      <td className="py-2 px-3 text-slate-600">{c.email || "-"}</td>
                    </tr>
                  ))}
                  {parsedContacts.length > 5 && (
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-center text-[10px] text-slate-400 italic bg-slate-50">
                        ... dan {parsedContacts.length - 5} kontak lainnya dalam file ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center justify-between">
                <span>Target List:</span>
                <strong className="font-bold">
                  {isCreatingNewList && newListName
                    ? newListName
                    : lists.find((l) => l.id === importTargetListId)?.name || "Semua Kontak (Tanpa Folder)"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Kontak:</span>
                <strong className="font-bold">{parsedContacts.length} kontak</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Penanganan Duplikat:</span>
                <strong className="font-bold">
                  {duplicateStrategy === "merge" ? "Update & Gabungkan" : "Lewati Duplikat"}
                </strong>
              </div>
            </div>

            {/* PROGRESS BAR SAAT PROSES IMPORT */}
            {isImporting && importProgress && (
              <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    Memproses & Menyimpan Kontak...
                  </span>
                  <span className="font-mono font-bold text-sky-700">
                    {importProgress.current} / {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-sky-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setImportStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={isImporting || parsedContacts.length === 0}
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {importProgress && importProgress.total > 0
                        ? `Mengimpor ${Math.round((importProgress.current / importProgress.total) * 100)}%...`
                        : "Mengimpor..."}
                    </span>
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
