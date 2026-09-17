import React from "react";
import {
  MessageSquare,
  Mail,
  Users,
  Code2,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FeatureItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
  title: string;
  description: string;
  benefits: string[];
}

const featuresData: FeatureItem[] = [
  {
    id: "telegram",
    icon: MessageSquare,
    iconColor: "text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    badge: "Instant Push",
    title: "Telegram Bot Broadcast",
    description:
      "Hubungkan Bot Telegram pribadi Anda via BotFather. Kirim blast notifikasi instan ke ribuan chat ID atau channel grup.",
    benefits: ["Token terenkripsi per-user", "Bypass batas email", "Kecepatan kirim tanpa jeda"],
  },
  {
    id: "smtp",
    icon: Mail,
    iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badge: "Official Outreach",
    title: "Email SMTP Kustom Organisasi",
    description:
      "Gunakan kredensial server SMTP organisasi Anda sendiri (Gmail, AWS SES, SendGrid, Mailgun, atau Private Mail Server).",
    benefits: ["Dukungan HTML responsive", "Verifikasi status koneksi", "Pelacakan bounce rate"],
  },
  {
    id: "contacts",
    icon: Users,
    iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badge: "Smart Segmentation",
    title: "Manajemen Kontak & Segmen",
    description:
      "Impor ribuan audiens melalui CSV/XLSX, kelola list target, berikan tag spesifik, dan filter dengan segmentasi dinamis.",
    benefits: ["Deteksi duplikasi data", "Opt-in / Opt-out consent", "Mapping custom field"],
  },
  {
    id: "personalization",
    icon: Code2,
    iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badge: "Dynamic Content",
    title: "Merge Tags & Template Dinamis",
    description:
      "Personalisasi setiap pesan dengan merge tag seperti {{first_name}} dan variabel kustom lainnya secara otomatis.",
    benefits: ["Preview live per-channel", "Version history template", "Fallback default value"],
  },
  {
    id: "scheduler",
    icon: Clock,
    iconColor: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    badge: "Queue Throttling",
    title: "Scheduler & Anti-Spam Throttling",
    description:
      "Jadwalkan pengiriman untuk masa depan atau kirim langsung dengan rate-limiting terkontrol agar tidak diblokir provider.",
    benefits: ["Kirim sekarang atau terjadwal", "RabbitMQ background queue", "Kontrol laju pesan per detik"],
  },
  {
    id: "security",
    icon: ShieldCheck,
    iconColor: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    badge: "Enterprise RBAC",
    title: "Role Permission & Audit Log",
    description:
      "Manajemen tim dengan hak akses presisi (Org Admin, Campaign Manager, Editor, Viewer) serta pencatatan audit log lengkap.",
    benefits: ["Multi-tenant isolation", "Audit jejak pengiriman", "Enkripsi password & token"],
  },
];

interface FeatureCardProps {
  feature: FeatureItem;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${feature.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          {feature.badge && (
            <Badge variant="secondary" className="text-[11px] font-medium">
              {feature.badge}
            </Badge>
          )}
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {feature.title}
        </h3>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
          {feature.description}
        </p>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1.5">
        {feature.benefits.map((benefit, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LandingFeatures: React.FC = () => {
  return (
    <section id="fitur" className="py-20 bg-zinc-50/60 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            Spesifikasi & Fitur Platform
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Semua instrumen untuk keberhasilan siaran pesan Anda
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Dibangun dengan standar arsitektur micro-queue berkecepatan tinggi, mendukung broadcast massal aman tanpa hambatan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((item) => (
            <FeatureCard key={item.id} feature={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
