import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Radio,
  Settings,
  Plus,
  MessageSquare,
  Upload,
  Shield,
  History,
  Bell,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Ketik nama kontak, kampanye, template, atau menu..." />
      <CommandList>
        <CommandEmpty>Tidak ada data atau menu yang cocok dengan pencarian.</CommandEmpty>

        {/* 1. AKSI CEPAT */}
        <CommandGroup heading="Aksi Cepat">
          <CommandItem
            value="buat campaign baru broadcast kirim pesan email whatsapp telegram"
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Plus className="mr-2 h-4 w-4 text-[#0284c7]" />
            <span>Buat Kampanye / Broadcast Baru</span>
          </CommandItem>
          <CommandItem
            value="tambah kontak baru audiens database manual"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <Users className="mr-2 h-4 w-4 text-emerald-600" />
            <span>Tambah Kontak Baru</span>
          </CommandItem>
          <CommandItem
            value="import kontak csv excel spreadsheet upload segmen list"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <Upload className="mr-2 h-4 w-4 text-sky-600" />
            <span>Import Kontak via CSV / Excel</span>
          </CommandItem>
          <CommandItem
            value="ganti kata sandi password security keamanan akun shopee email otp"
            onSelect={() => runCommand(() => navigate("/account"))}
          >
            <Shield className="mr-2 h-4 w-4 text-indigo-600" />
            <span>Ubah Kata Sandi & Keamanan Akun</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 2. PENCARIAN DATA KONTAK */}
        <CommandGroup heading="Data Kontak & Audiens">
          <CommandItem
            value="budi santoso budi.santoso@startup.id pelanggan utama vip customer"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center mr-2 shrink-0">
              BS
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Budi Santoso</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">budi.santoso@startup.id</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#vip</span>
          </CommandItem>
          <CommandItem
            value="rina wijaya rina.w@tokoonline.com pelanggan utama customer newsletter"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center mr-2 shrink-0">
              RW
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Rina Wijaya</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">rina.w@tokoonline.com</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#newsletter</span>
          </CommandItem>
          <CommandItem
            value="ahmad fauzi ahmad@kreatifindonesia.co peserta webinar 2026 vip"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center mr-2 shrink-0">
              AF
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Ahmad Fauzi</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">ahmad@kreatifindonesia.co</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#webinar</span>
          </CommandItem>
          <CommandItem
            value="dewi puspita dewi.puspita@mailme.id leads marketing trial"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center mr-2 shrink-0">
              DP
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Dewi Puspita</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">dewi.puspita@mailme.id</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#leads</span>
          </CommandItem>
          <CommandItem
            value="siti rahayu siti.rahayu@nusantara.co newsletter subscriber"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center mr-2 shrink-0">
              SR
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Siti Rahayu</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">siti.rahayu@nusantara.co</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#newsletter</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 3. PENCARIAN DATA KAMPANYE */}
        <CommandGroup heading="Data Kampanye Blast">
          <CommandItem
            value="promo gajian september campaign blast email whatsapp terkirim"
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Send className="mr-2 h-4 w-4 text-emerald-600" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Promo Gajian September</span>
              <span className="text-slate-400 text-[11px] ml-2">Email & WhatsApp · 24,340 Terkirim</span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">Success</span>
          </CommandItem>
          <CommandItem
            value="flash sale 10.10 promo promo diskon whatsapp blast terjadwal"
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Send className="mr-2 h-4 w-4 text-sky-600" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Flash Sale 10.10 Promo</span>
              <span className="text-slate-400 text-[11px] ml-2">WhatsApp Blast · Dijadwalkan</span>
            </div>
            <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-bold">Scheduled</span>
          </CommandItem>
          <CommandItem
            value="webinar reminder blast email telegram draft"
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Send className="mr-2 h-4 w-4 text-slate-400" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">Webinar Reminder Blast</span>
              <span className="text-slate-400 text-[11px] ml-2">Telegram & Email · Draft</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">Draft</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 4. TEMPLATE EDITOR */}
        <CommandGroup heading="Template Pesan">
          <CommandItem
            value="monthly newsletter template email html mailchimp responsive"
            onSelect={() => runCommand(() => navigate("/templates"))}
          >
            <FileText className="mr-2 h-4 w-4 text-indigo-600" />
            <span>Monthly Newsletter (Email HTML Responsive)</span>
          </CommandItem>
          <CommandItem
            value="template whatsapp blast pesan promo voucher"
            onSelect={() => runCommand(() => navigate("/templates"))}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-emerald-600" />
            <span>Format Pesan Promo WhatsApp Blast</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* 5. NAVIGASI HALAMAN & PENGATURAN */}
        <CommandGroup heading="Halaman & Pengaturan Sistem">
          <CommandItem
            value="dashboard overview ringkasan performa analitik statistik"
            onSelect={() => runCommand(() => navigate("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" />
            <span>Dashboard Overview</span>
          </CommandItem>
          <CommandItem
            value="daftar kontak segmentasi tag list folder"
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <Users className="mr-2 h-4 w-4 text-slate-500" />
            <span>Daftar Kontak & Segmentasi Tag</span>
          </CommandItem>
          <CommandItem
            value="saluran channel smtp email whatsapp gateway telegram bot"
            onSelect={() => runCommand(() => navigate("/channels"))}
          >
            <Radio className="mr-2 h-4 w-4 text-slate-500" />
            <span>Konfigurasi Channel (WhatsApp, Email, Telegram)</span>
          </CommandItem>
          <CommandItem
            value="notifikasi notifications riwayat broadcast pesan alerts pengumuman"
            onSelect={() => runCommand(() => navigate("/notifications"))}
          >
            <Bell className="mr-2 h-4 w-4 text-sky-500" />
            <span>Pusat Notifikasi & Riwayat Aktivitas</span>
          </CommandItem>
          <CommandItem
            value="pengaturan akun profile security ubah password kata sandi shopee 2fa"
            onSelect={() => runCommand(() => navigate("/account"))}
          >
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Pengaturan Akun & Keamanan (Ubah Kata Sandi)</span>
          </CommandItem>
          <CommandItem
            value="audit log riwayat aktivitas catatan keamanan sesi"
            onSelect={() => runCommand(() => navigate("/account"))}
          >
            <History className="mr-2 h-4 w-4 text-slate-500" />
            <span>Audit Log & Sesi Login</span>
          </CommandItem>
          <CommandItem
            value="manajemen anggota tim rbac user role pengguna"
            onSelect={() => runCommand(() => navigate("/users"))}
          >
            <Users className="mr-2 h-4 w-4 text-slate-500" />
            <span>Manajemen Anggota Tim & RBAC</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
