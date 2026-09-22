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
  Mail,
  MessageSquare,
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
      <CommandInput placeholder="Ketik perintah atau cari menu..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil yang ditemukan.</CommandEmpty>
        
        <CommandGroup heading="Aksi Cepat">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Plus className="mr-2 h-4 w-4 text-[#0284c7]" />
            <span>Kirim Broadcast Baru</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <Users className="mr-2 h-4 w-4 text-emerald-600" />
            <span>Tambah Kontak Baru</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/channels"))}
          >
            <Radio className="mr-2 h-4 w-4 text-amber-500" />
            <span>Konfigurasi Channel Blast</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigasi Halaman">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" />
            <span>Dashboard Overview</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/campaigns"))}
          >
            <Send className="mr-2 h-4 w-4 text-slate-500" />
            <span>Daftar Kampanye & Broadcast</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/contacts"))}
          >
            <Users className="mr-2 h-4 w-4 text-slate-500" />
            <span>Daftar Kontak & Segmentasi Tag</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/templates"))}
          >
            <FileText className="mr-2 h-4 w-4 text-slate-500" />
            <span>Template Pesan Email & Telegram</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/channels"))}
          >
            <Radio className="mr-2 h-4 w-4 text-slate-500" />
            <span>Pengaturan SMTP & Telegram Bot</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/users"))}
          >
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Manajemen Anggota Tim & RBAC</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Saluran Tersedia">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/channels"))}
          >
            <Mail className="mr-2 h-4 w-4 text-amber-500" />
            <span>Server Email SMTP</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/channels"))}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-sky-500" />
            <span>Bot Telegram Blast</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
