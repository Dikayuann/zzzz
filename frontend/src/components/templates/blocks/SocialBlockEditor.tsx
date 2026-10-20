import React from "react";
import { Share2 } from "lucide-react";

export interface SocialBlockEditorProps {
  enableSocial?: boolean;
  onEnableSocialChange?: (val: boolean) => void;
  websiteUrl?: string;
  onWebsiteUrlChange?: (val: string) => void;
  instagramUrl?: string;
  onInstagramUrlChange?: (val: string) => void;
  whatsappUrl?: string;
  onWhatsappUrlChange?: (val: string) => void;
  footerAddress?: string;
  onFooterAddressChange?: (val: string) => void;
}

export const SocialBlockEditor: React.FC<SocialBlockEditorProps> = ({
  enableSocial = false,
  onEnableSocialChange,
  websiteUrl = "https://acmecorp.co",
  onWebsiteUrlChange,
  instagramUrl = "https://instagram.com/acmecorp",
  onInstagramUrlChange,
  whatsappUrl = "https://wa.me/6281234567890",
  onWhatsappUrlChange,
  footerAddress = "",
  onFooterAddressChange,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Share2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Tautan Sosial Media & Footer Kepatuhan
            </h4>
            <p className="text-[11px] text-slate-400">
              Tampilkan tautan website, media sosial, dan alamat pengirim di bagian bawah email
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableSocial}
            onChange={(e) => onEnableSocialChange?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {enableSocial && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 animate-in fade-in-50 duration-150 text-xs">
          <div>
            <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
              Website
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => onWebsiteUrlChange?.(e.target.value)}
              placeholder="https://acmecorp.co"
              className="w-full h-7 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
              Instagram
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => onInstagramUrlChange?.(e.target.value)}
              placeholder="https://instagram.com/acme"
              className="w-full h-7 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
              WhatsApp CS
            </label>
            <input
              type="text"
              value={whatsappUrl}
              onChange={(e) => onWhatsappUrlChange?.(e.target.value)}
              placeholder="https://wa.me/62812..."
              className="w-full h-7 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
              Alamat Pengirim / Footer Kepatuhan (Opsional)
            </label>
            <input
              type="text"
              value={footerAddress}
              onChange={(e) => onFooterAddressChange?.(e.target.value)}
              placeholder="Contoh: PT Nama Usaha, Jakarta, Indonesia"
              className="w-full h-7 px-2 rounded-lg border border-slate-200 text-xs text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
