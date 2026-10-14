import React from "react";
import { Mail, MessageSquare, Send, CheckCircle2, RotateCcw, Copy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import type { CampaignItem } from "@/types/campaign";

interface CampaignDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignItem | null;
  onRetryFailed: (campaign: CampaignItem) => void;
  onDuplicate: (campaign: CampaignItem) => void;
}

export const CampaignDetailSheet: React.FC<CampaignDetailSheetProps> = ({
  isOpen,
  onOpenChange,
  campaign,
  onRetryFailed,
  onDuplicate,
}) => {
  if (!campaign) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {campaign.channel === "Email" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                <Mail className="h-3 w-3" /> Email
              </span>
            )}
            {campaign.channel === "WhatsApp" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <MessageSquare className="h-3 w-3" /> WhatsApp
              </span>
            )}
            {campaign.channel === "Telegram" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <Send className="h-3 w-3" /> Telegram
              </span>
            )}
            <span className="text-xs text-slate-400">• {campaign.date}</span>
          </div>
          <SheetTitle className="text-lg mt-1">{campaign.name}</SheetTitle>
          <SheetDescription>
            Target Audiens: <strong className="text-slate-700">{campaign.audience}</strong> ({campaign.audienceCount.toLocaleString()} kontak)
          </SheetDescription>
        </SheetHeader>

        {/* Drawer Body */}
        <div className="space-y-5 py-4">
          {/* Delivery Health Card */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Performa Pengiriman</span>
              <span className="font-mono text-slate-500">
                {campaign.sentCount} / {campaign.audienceCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${(campaign.sentCount / campaign.audienceCount) * 100}%`,
                }}
              />
              {campaign.failedCount > 0 && (
                <div
                  className="h-full bg-rose-500"
                  style={{
                    width: `${(campaign.failedCount / campaign.audienceCount) * 100}%`,
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tersampaikan</p>
                <p className="text-sm font-bold text-emerald-600">{campaign.sentCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Gagal / Bounce</p>
                <p className="text-sm font-bold text-rose-600">{campaign.failedCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Open Rate</p>
                <p className="text-sm font-bold text-slate-900">
                  {campaign.openRate ? `${campaign.openRate}%` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Live Message Simulator Preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              Pratinjau Pesan yang Dikirim
            </h4>

            {campaign.channel === "WhatsApp" && (
              <div className="rounded-2xl bg-[#efeae2] p-4 border border-slate-300 shadow-inner font-sans">
                <div className="max-w-sm rounded-2xl rounded-tl-xs bg-[#d9fdd3] p-3 shadow-xs text-slate-900 text-xs leading-relaxed whitespace-pre-line relative">
                  {campaign.messageContent}
                  <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                    <span>10:30 WIB</span>
                    <CheckCircle2 className="h-3 w-3 text-sky-600" />
                  </div>
                </div>
              </div>
            )}

            {campaign.channel === "Telegram" && (
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 shadow-inner">
                <div className="max-w-sm rounded-2xl rounded-bl-xs bg-slate-800 p-3 shadow-xs text-slate-100 text-xs leading-relaxed whitespace-pre-line">
                  {campaign.messageContent}
                  <span className="text-[10px] text-slate-400 block text-right mt-1">10:30</span>
                </div>
              </div>
            )}

            {campaign.channel === "Email" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
                <div className="border-b border-slate-100 pb-2 text-xs">
                  <span className="text-slate-400">Subjek: </span>
                  <span className="font-semibold text-slate-800">{campaign.subject}</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                  {campaign.messageContent}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <SheetFooter className="gap-2">
          {campaign.failedCount > 0 && (
            <button
              onClick={() => onRetryFailed(campaign)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-3.5 py-2 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Kirim Ulang ke {campaign.failedCount} Gagal</span>
            </button>
          )}
          <button
            onClick={() => {
              onDuplicate(campaign);
              onOpenChange(false);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 shadow-2xs transition cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Duplikat Kampanye</span>
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
