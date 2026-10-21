import React from "react";
import {
  Mail,
  Send,
  MessageSquare,
  Users,
  Eye,
  Copy,
  RotateCcw,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CampaignItem } from "@/types/campaign";

interface CampaignTableProps {
  campaigns: CampaignItem[];
  onOpenPreview: (item: CampaignItem) => void;
  onDuplicate: (item: CampaignItem) => void;
  onRetryFailed: (item: CampaignItem) => void;
  onDelete: (id: string, name: string) => void;
  onSendNow?: (id: string, name: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onOpenPreview,
  onDuplicate,
  onRetryFailed,
  onDelete,
  onSendNow,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">KAMPANYE</th>
              <th className="py-3 px-3">SALURAN</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-3">TARGET AUDIENS</th>
              <th className="py-3 px-3">DELIVERY HEALTH</th>
              <th className="py-3 px-3">OPEN RATE</th>
              <th className="py-3 px-4 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tidak ada kampanye yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              campaigns.map((item) => {
                const percentSuccess =
                  item.audienceCount > 0
                    ? Math.round((item.sentCount / item.audienceCount) * 100)
                    : 0;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onOpenPreview(item)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* 1. Campaign Name & Date */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {item.date} {item.scheduledTime && `• ${item.scheduledTime}`}
                        </span>
                      </div>
                    </td>

                    {/* 2. Channel Badge with Icon */}
                    <td className="py-3.5 px-3">
                      {item.channel === "Email" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          <Mail className="h-3 w-3" />
                          <span>Email</span>
                        </span>
                      )}
                      {item.channel === "WhatsApp" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <MessageSquare className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </span>
                      )}
                      {item.channel === "Telegram" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/60 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                          <Send className="h-3 w-3" />
                          <span>Telegram</span>
                        </span>
                      )}
                    </td>

                    {/* 3. Status Badge with Dot Indicator */}
                    <td className="py-3.5 px-3">
                      {item.status === "Sent" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Selesai</span>
                        </span>
                      )}
                      {item.status === "Sending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Mengirim</span>
                        </span>
                      )}
                      {item.status === "Scheduled" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                          <span>Terjadwal</span>
                        </span>
                      )}
                      {item.status === "Draft" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>Draft</span>
                        </span>
                      )}
                      {item.status === "Failed" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span>Gagal</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Audience Segment */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.audience}</span>
                      </div>
                    </td>

                    {/* 5. Delivery Health */}
                    <td className="py-3.5 px-3">
                      {item.status === "Draft" || item.status === "Scheduled" ? (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1 w-36">
                              <div className="flex items-center justify-between text-[11px] font-mono leading-none">
                                <span className="font-semibold text-slate-800">
                                  {item.sentCount.toLocaleString()}
                                </span>
                                {item.failedCount > 0 ? (
                                  <span className="text-rose-600 font-bold">
                                    {item.failedCount} gagal
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-bold">{percentSuccess}%</span>
                                )}
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 flex overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${percentSuccess}%` }} />
                                {item.failedCount > 0 && (
                                  <div
                                    className="h-full bg-rose-500"
                                    style={{
                                      width: `${(item.failedCount / item.audienceCount) * 100}%`,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs bg-slate-900 text-white p-2">
                            <p className="font-bold">{item.sentCount} terkirim berhasil</p>
                            {item.failedCount > 0 && (
                              <p className="text-rose-400 mt-0.5">⚠️ {item.failedCount} kontak gagal/bounce</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>

                    {/* 6. Open Rate */}
                    <td className="py-3.5 px-3">
                      {item.openRate !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-xs">{item.openRate}%</span>
                          <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(item.openRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* 7. Action Buttons */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {onSendNow && (item.status === "Draft" || item.status === "Scheduled") && (
                          <button
                            type="button"
                            title="Kirim Blast Sekarang"
                            onClick={() => onSendNow(item.id, item.name)}
                            className="p-1.5 text-sky-600 hover:text-white hover:bg-sky-600 rounded-lg transition cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          title="Pratinjau Pesan"
                          onClick={() => onOpenPreview(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title="Duplikat Kampanye"
                          onClick={() => onDuplicate(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            {onSendNow && (item.status === "Draft" || item.status === "Scheduled") && (
                              <DropdownMenuItem
                                onClick={() => onSendNow(item.id, item.name)}
                                className="text-xs cursor-pointer font-semibold text-sky-600 focus:text-sky-700 focus:bg-sky-50"
                              >
                                <Send className="mr-2 h-4 w-4 text-sky-600" />
                                <span>Kirim Sekarang</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onOpenPreview(item)}
                              className="text-xs cursor-pointer font-medium"
                            >
                              <Eye className="mr-2 h-4 w-4 text-slate-500" />
                              <span>Buka Pratinjau Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDuplicate(item)}
                              className="text-xs cursor-pointer font-medium"
                            >
                              <Copy className="mr-2 h-4 w-4 text-slate-500" />
                              <span>Duplikat Kampanye</span>
                            </DropdownMenuItem>
                            {item.failedCount > 0 && (
                              <DropdownMenuItem
                                onClick={() => onRetryFailed(item)}
                                className="text-xs cursor-pointer font-medium text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                <span>Retry {item.failedCount} Kontak Gagal</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(item.id, item.name)}
                              className="text-xs cursor-pointer font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Hapus Kampanye</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
