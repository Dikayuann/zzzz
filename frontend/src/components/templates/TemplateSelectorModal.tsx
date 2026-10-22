import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LayoutTemplate,
  Plus,
  Tag,
  Check,
  Trash2,
  Calendar,
  Layers,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { PRESET_TEMPLATES, type PresetTemplate } from "@/data/presetTemplates";
import type { TemplateChannel } from "@/types/template";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface DatabaseTemplateItem {
  id: number;
  name: string;
  channelMode: string;
  category?: string;
  updatedAt: string;
  createdAt: string;
  versions?: {
    id: number;
    versionNo: number;
    subject?: string;
    preheader?: string;
    contentHtml?: string;
    contentWhatsapp?: string;
    contentTelegram?: string;
    contentJson?: any;
  }[];
}

interface TemplateSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: TemplateChannel;
  currentTemplateId?: number | null;
  savedTemplates: DatabaseTemplateItem[];
  onSelectPreset: (preset: PresetTemplate) => void;
  onSelectSavedTemplate: (template: DatabaseTemplateItem) => void;
  onNewBlankTemplate: () => void;
  onRefreshSavedTemplates: () => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  open,
  onOpenChange,
  channel: rawChannel,
  currentTemplateId,
  savedTemplates,
  onSelectPreset,
  onSelectSavedTemplate,
  onNewBlankTemplate,
  onRefreshSavedTemplates,
}) => {
  const channel: TemplateChannel =
    rawChannel === "whatsapp" || rawChannel === "telegram" ? rawChannel : "email";
  const [activeTab, setActiveTab] = useState<"presets" | "saved">("presets");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string } | null>(null);

  const channelPresets = PRESET_TEMPLATES.filter((p) => p.channel === channel);

  const handleRequestDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    setTemplateToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    const { id, name } = templateToDelete;
    setDeletingId(id);
    try {
      await api.delete(`/templates/${id}`);
      toast.success(`Template "${name}" berhasil dihapus.`);
      onRefreshSavedTemplates();
      setTemplateToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus template");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl border-slate-200">
        {/* Modal Top Header */}
        <DialogHeader className="p-6 pb-4 pr-14 border-b border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <LayoutTemplate className="h-4.5 w-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Pustaka & Pengelolaan Template
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Pilih desain siap pakai atau muat template kustom yang pernah Anda simpan.
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action: Start Fresh Blank */}
            <button
              type="button"
              onClick={() => {
                onNewBlankTemplate();
                onOpenChange(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap self-start sm:self-auto"
              title="Mulai dengan dokumen template bersih baru"
            >
              <Plus className="h-3.5 w-3.5 text-slate-500" />
              <span>Template Kosong</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "presets"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span>Template Siap Pakai ({channelPresets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "saved"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Template Tersimpan ({savedTemplates.length})</span>
            </button>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {activeTab === "presets" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channelPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    onOpenChange(false);
                  }}
                  className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 group-hover:text-slate-900 transition">
                        <Tag className="h-2.5 w-2.5" />
                        {preset.categoryLabel}
                      </span>
                      {preset.isHtml && (
                        <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          HTML Email
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition">
                      {preset.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>

                    {preset.subject && (
                      <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 truncate">
                        <span className="font-semibold text-slate-500">Subjek: </span>
                        {preset.subject}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Gunakan template ini <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {savedTemplates.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Belum ada template tersimpan
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Simpan template yang sedang Anda edit dengan tombol "Simpan" di bagian atas untuk menyimpannya.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedTemplates.map((item) => {
                    const isCurrent = currentTemplateId === item.id;
                    const latestVersion = item.versions?.[0];

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectSavedTemplate(item);
                          onOpenChange(false);
                        }}
                        className={`group p-4 rounded-xl border bg-white transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? "border-slate-800 shadow-xs ring-1 ring-slate-800"
                            : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {item.channelMode}
                              </span>
                              {latestVersion && (
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  v{latestVersion.versionNo}
                                </span>
                              )}
                              {latestVersion?.contentHtml && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  Email
                                </span>
                              )}
                              {latestVersion?.contentWhatsapp && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                  WhatsApp
                                </span>
                              )}
                              {latestVersion?.contentTelegram && (
                                <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                                  Telegram
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={deletingId === item.id}
                              onClick={(e) => handleRequestDelete(e, item.id, item.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus template"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Aktif
                              </span>
                            )}
                          </h3>

                          {latestVersion?.subject && (
                            <p className="text-[11px] text-slate-500 mt-1 truncate">
                              Subjek: {latestVersion.subject}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-semibold text-slate-800 group-hover:underline">
                            Buka Template →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Kanal aktif: <strong className="capitalize text-slate-700">{channel}</strong>
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </DialogContent>

      {/* In-App Delete Confirmation Dialog */}
      <Dialog open={Boolean(templateToDelete)} onOpenChange={(isOpen) => !isOpen && setTemplateToDelete(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </div>
              <span>Konfirmasi Hapus Template</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus template <strong>"{templateToDelete?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setTemplateToDelete(null)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={deletingId !== null}
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              {deletingId !== null ? "Menghapus..." : "Ya, Hapus Template"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
