import type { TemplateChannel } from "@/types/template";

export interface PresetTemplate {
  id: string;
  name: string;
  category: "blank" | "promotion" | "announcement" | "newsletter" | "transactional";
  categoryLabel: string;
  channel: TemplateChannel;
  description: string;
  subject: string;
  preheader: string;
  content: string;
  isHtml?: boolean;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "preset-blank",
    name: "Template Kosong (Mulai dari Nol)",
    category: "blank",
    categoryLabel: "Kustom",
    channel: "email",
    description: "Kanvas bersih tanpa elemen bawaan. Digunakan untuk membuat email kustom atau menempelkan kode HTML Anda sendiri.",
    subject: "",
    preheader: "",
    content: "",
    isHtml: true,
  },
  {
    id: "preset-promo",
    name: "Promo Voucher & Flash Sale",
    category: "promotion",
    categoryLabel: "Promosi",
    channel: "email",
    description: "Format penawaran diskon dengan kupon khusus, tenggat waktu, dan tombol aksi.",
    subject: "Spesial untuk {{nama}}: Diskon {{diskon}} Menanti Anda",
    preheader: "Gunakan kode kupon {{kode_promo}} sebelum {{tanggal_kadaluarsa}}.",
    isHtml: true,
    content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="text-align: center; padding: 24px 0 16px;">
    <span style="background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
      Penawaran Terbatas
    </span>
    <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 12px 0 8px;">
      Klaim Diskon {{diskon}} Anda Hari Ini
    </h1>
    <p style="font-size: 14px; color: #64748b; margin: 0;">
      Halo {{first_name}}, berikut kupon penawaran eksklusif untuk akun Anda.
    </p>
  </div>

  <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 24px; text-align: center; margin: 20px 0;">
    <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0 0 6px; text-transform: uppercase;">
      Kode Promo Anda:
    </p>
    <div style="display: inline-block; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 24px; font-family: monospace; font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: 2px;">
      {{kode_promo}}
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin: 10px 0 0;">
      Berlaku hingga <strong>{{tanggal_kadaluarsa}}</strong> • Syarat dan ketentuan berlaku
    </p>
  </div>

  <div style="text-align: center; margin: 28px 0 24px;">
    <a href="{{cta_link}}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">
      Klaim Promo Sekarang
    </a>
  </div>

  <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
    <p style="margin: 0 0 6px;">
      Anda menerima email ini karena terdaftar sebagai kontak <strong>{{org_name}}</strong>.
    </p>
    <p style="margin: 0;">
      Ingin berhenti berlangganan? <a href="{{unsubscribe_link}}" style="color: #64748b; text-decoration: underline;">Klik di sini</a>.
    </p>
  </div>
</div>`,
  },
  {
    id: "preset-announcement",
    name: "Pembaruan Produk & Rilis Fitur",
    category: "announcement",
    categoryLabel: "Pengumuman",
    channel: "email",
    description: "Format pengumuman resmi untuk peluncuran fitur baru atau peningkatan performa layanan.",
    subject: "Pembaruan Sistem dan Fitur Terbaru {{org_name}}",
    preheader: "Simak ringkasan peningkatan infrastruktur dan fitur baru bulan ini.",
    isHtml: true,
    content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="padding: 16px 0 20px;">
    <span style="background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
      Rilis Versi Terbaru
    </span>
    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 8px;">
      Peningkatan Fitur Terbaru Bulan Ini
    </h1>
    <p style="font-size: 14px; color: #475569;">
      Halo {{first_name}}, berikut adalah rangkuman pembaruan sistem yang telah kami rilis:
    </p>
  </div>

  <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 18px; margin: 14px 0;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px;">Peningkatan Throughput Pengiriman</h3>
    <p style="font-size: 13px; color: #64748b; margin: 0;">Infrastruktur antrean pesan baru memastikan pengiriman ribuan pesan berlangsung stabil dan cepat.</p>
  </div>

  <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 18px; margin: 14px 0;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px;">Analitik Kampanye Real-Time</h3>
    <p style="font-size: 13px; color: #64748b; margin: 0;">Pantau metrik pesan terkirim, tingkat keterbukaan, dan konversi klik secara akurat.</p>
  </div>

  <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 18px; margin: 14px 0;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px;">Personalisasi Variabel Dinamis</h3>
    <p style="font-size: 13px; color: #64748b; margin: 0;">Sematkan merge tags untuk menampilkan informasi nama, email, dan parameter khusus secara otomatis.</p>
  </div>

  <div style="margin: 28px 0 20px;">
    <a href="{{cta_link}}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-block;">
      Buka Dashboard Kampanye
    </a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8;">
    <p style="margin: 0;">Hormat kami,<br /><strong style="color: #64748b;">Tim {{org_name}}</strong></p>
  </div>
</div>`,
  },
  {
    id: "preset-newsletter",
    name: "Newsletter Bulanan Komprehensif",
    category: "newsletter",
    categoryLabel: "Newsletter",
    channel: "email",
    description: "Tata letak editorial terstruktur untuk ringkasan wawasan bisnis dan tips industri.",
    subject: "{{bulan_ini}} Digest: Update dan Laporan Terkini {{org_name}}",
    preheader: "Simak ringkasan wawasan dan tips praktis untuk tim Anda bulan ini.",
    isHtml: true,
    content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="padding: 16px 0 20px; border-bottom: 2px solid #0f172a;">
    <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">
      {{org_name}} BULANAN
    </h1>
    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">
      Edisi {{bulan_ini}} {{tahun_ini}} • Disiapkan untuk {{nama}} ({{company}})
    </p>
  </div>

  <div style="padding: 24px 0;">
    <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 10px;">
      Strategi Personalisasi Pesan Skala Besar
    </h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">
      Data menunjukkan bahwa kampanye dengan personalisasi nama dan kebutuhan spesifik kontak menghasilkan respons 40% lebih tinggi dibanding pengiriman seragam.
    </p>
    <a href="{{website_url}}" style="color: #4f46e5; font-size: 13px; font-weight: 700; text-decoration: none;">
      Baca Selengkapnya
    </a>
  </div>

  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 8px 0 20px;" />

  <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px;">
      Rekomendasi Teknis
    </h3>
    <p style="font-size: 13px; color: #64748b; margin: 0;">
      Gunakan preheader email secara efektif untuk melengkapi baris subjek dan meningkatkan open rate.
    </p>
  </div>

  <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
    <p style="margin: 0 0 6px;">
      Kontak dukungan: <a href="mailto:{{support_email}}" style="color: #64748b;">{{support_email}}</a>
    </p>
    <p style="margin: 0;">
      <a href="{{unsubscribe_link}}" style="color: #94a3b8; text-decoration: underline;">Berhenti berlangganan</a>
    </p>
  </div>
</div>`,
  },
  {
    id: "preset-welcome",
    name: "Selamat Datang & Onboarding Anggota",
    category: "transactional",
    categoryLabel: "Transaksional",
    channel: "email",
    description: "Email sambutan untuk pendaftaran akun baru dengan langkah awal dan kontak bantuan.",
    subject: "Selamat Bergabung di {{org_name}}, {{first_name}}",
    preheader: "Akun Anda telah aktif. Berikut panduan ringkas untuk memulai.",
    isHtml: true,
    content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="padding: 24px 0 16px;">
    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">
      Halo {{first_name}}, Selamat Datang
    </h1>
    <p style="font-size: 14px; color: #475569; margin: 0;">
      Terima kasih telah bergabung bersama <strong>{{org_name}}</strong>. Akun Anda untuk organisasi <strong>{{company}}</strong> kini telah siap digunakan.
    </p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
    <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px;">3 Langkah Awal:</h3>
    <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
      <li>Lengkapi konfigurasi profil dan saluran pengiriman Anda.</li>
      <li>Impor daftar kontak penerima melalui file CSV atau Excel.</li>
      <li>Pilih template pesan dan jalankan kampanye blast pertama Anda.</li>
    </ol>
  </div>

  <div style="margin: 28px 0 24px;">
    <a href="{{cta_link}}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-block;">
      Buka Panel Pengaturan
    </a>
  </div>

  <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #64748b;">
    <p style="margin: 0;">
      Bantuan teknis dapat diakses melalui <a href="mailto:{{support_email}}" style="color: #4f46e5;">{{support_email}}</a>.
    </p>
  </div>
</div>`,
  },
  {
    id: "preset-wa-promo",
    name: "Broadcast WhatsApp Flash Sale",
    category: "promotion",
    categoryLabel: "WhatsApp",
    channel: "whatsapp",
    description: "Format teks WhatsApp terstruktur untuk penawaran promosi langsung.",
    subject: "",
    preheader: "",
    isHtml: false,
    content: `Halo kak *{{first_name}}* dari *{{company}}*,

Informasi promo spesial diskon *{{diskon}}* untuk pelanggan *{{org_name}}*.

Gunakan kupon saat transaksi:
Kode Kupon: *{{kode_promo}}*
Batas Waktu: *{{tanggal_kadaluarsa}}*

Akses tautan promo berikut:
{{cta_link}}

Silakan balas pesan ini apabila memerlukan bantuan atau informasi tambahan.

Hormat kami,
*{{sender_name}}*`,
  },
];
