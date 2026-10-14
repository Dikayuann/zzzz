import {
  FilePlus,
  Rocket,
  Flame,
  HandHeart,
  BellRing,
} from "lucide-react";
import type { PresetTemplate, SenderProfile, AudienceOption } from "@/types/campaignWizard";

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "blank",
    name: "Blank Template",
    badge: "Mulai dari Nol",
    desc: "Kanvas kosong untuk menulis pesan kustom bebas.",
    icon: FilePlus,
    iconColor: "text-slate-600 bg-slate-100",
    emailSubject: "",
    emailContent: "",
    waContent: "",
    telegramContent: "",
  },
  {
    id: "newsletter",
    name: "Monthly Newsletter",
    badge: "Terpopuler",
    desc: "Update bulanan seputar fitur baru dan kabar penting.",
    icon: Rocket,
    iconColor: "text-indigo-600 bg-indigo-50",
    emailSubject: "Your monthly update is here ✉️",
    emailContent:
      "Hi {{nama}},\n\nWe have some exciting news to share with you this month. Our team has been working hard to bring you new features and improvements that we think you'll love.\n\nHere's what's new:\n• Feature one — improved performance and reliability\n• Feature two — new dashboard with better insights\n• Feature three — easier contact management\n\nWe hope these updates make your experience even better. As always, feel free to reach out if you have any questions.\n\nBest regards,\nThe {{org_name}} Team\n\n---\nYou received this email because you're subscribed to our newsletter.\n{{unsubscribe_link}}",
    waContent:
      "🚀 *KABAR BULANAN TERBARU TELAH TIBA!* 🚀\n\nHalo {{nama}},\n\nBulan ini kami merilis fitur baru untuk meningkatkan performa blast Anda:\n• Pengiriman multi-channel lebih cepat\n• Dashboard analitik real-time\n• Proteksi anti-banned otomatis\n\nCek update selengkapnya di:\n👉 https://acmecorp.co/updates",
    telegramContent:
      "🚀 *MONTHLY UPDATE ALERT* 🚀\n\nHalo {{nama}}, selamat datang di rilis terbaru kami. Kami telah meningkatkan reliabilitas pengiriman dan pemantauan analitik.\n\nSelengkapnya: https://acmecorp.co/updates",
  },
  {
    id: "flash-sale",
    name: "Flash Sale & Promo Diskon",
    badge: "Promo",
    desc: "Format promo eksklusif dengan voucher dan urgensi batas waktu.",
    icon: Flame,
    iconColor: "text-rose-600 bg-rose-50",
    emailSubject: "🔥 Flash Sale 24 Jam: Diskon Spesial s.d 70% Khusus Anda!",
    emailContent:
      "Halo {{nama}},\n\nJangan lewatkan Flash Sale terbatas kami hari ini! Dapatkan diskon istimewa hingga 70% untuk produk pilihan.\n\n🎟️ Kode Voucher: {{voucher}}\n⏰ Batas Waktu: Pukul 23:59 WIB malam ini\n\nKlik link di bawah untuk mulai berbelanja sekarang:\nhttps://acmecorp.co/flash-sale\n\nSalam hangat,\nTim Marketing Acme",
    waContent:
      "🔥 *FLASH SALE SPESIAL 24 JAM!* 🔥\n\nHalo {{nama}}, nikmati diskon khusus member hingga 70% hari ini saja!\n\n🎟️ Kode Voucher: *{{voucher}}*\n⏰ Berakhir: 23:59 WIB\n\nKlaim diskon Anda sekarang:\n👉 https://acmecorp.co/flash-sale",
    telegramContent:
      "🔥 *FLASH SALE 24 JAM DIMULAI!* 🔥\n\nHalo {{nama}}, promo terbesar bulan ini telah dibuka!\n\nGunakan voucher: `{{voucher}}`\nLink: https://acmecorp.co/flash-sale",
  },
  {
    id: "onboarding",
    name: "Welcome & Onboarding Pengguna",
    badge: "Esensial",
    desc: "Menyambut anggota baru dengan panduan langkah awal.",
    icon: HandHeart,
    iconColor: "text-emerald-600 bg-emerald-50",
    emailSubject: "Selamat Datang di Acme Corp, {{nama}}! Panduan Memulai Anda",
    emailContent:
      "Halo {{nama}},\n\nTerima kasih telah bergabung bersama kami. Akun Anda telah siap digunakan.\n\nBerikut 3 langkah mudah untuk memulai:\n1. Lengkapi profil tim Anda\n2. Hubungkan gateway pengiriman pesan\n3. Kirim pesan broadcast pertama Anda\n\nJika ada pertanyaan, tim kami siap membantu kapan saja.\n\nSalam hangat,\nTim Customer Success",
    waContent:
      "👋 *SELAMAT DATANG DI ACME CORP!* 👋\n\nHalo {{nama}}, senang Anda bergabung bersama kami. Akun Anda sudah aktif dan siap digunakan!\n\nButuh bantuan untuk memulai? Balas pesan ini atau buka panduan kami di:\n👉 https://acmecorp.co/docs",
    telegramContent:
      "👋 *SELAMAT DATANG!* 👋\n\nHalo {{nama}}, akun Anda berhasil diaktifkan. Ketik /help untuk melihat menu panduan.",
  },
  {
    id: "event-reminder",
    name: "Pengingat Event / Webinar H-1",
    badge: "Pengingat",
    desc: "Pengingat jadwal acara atau pertemuan live virtual.",
    icon: BellRing,
    iconColor: "text-amber-600 bg-amber-50",
    emailSubject: "⏰ Pengingat: Sesi Live Workshop Anda Dimulai Besok Pukul 10:00 WIB",
    emailContent:
      "Halo {{nama}},\n\nIni adalah pengingat bahwa sesi workshop interaktif kita akan dimulai besok pagi.\n\n📅 Tanggal: Besok\n⏰ Waktu: 10:00 - 12:00 WIB\n📍 Akses: Zoom Meeting\n\nLink Bergabung:\nhttps://zoom.us/j/acmecorp-live\n\nSampai jumpa di sesi live!",
    waContent:
      "⏰ *PENGINGAT SESI LIVE BESOK PAGI!* ⏰\n\nHalo {{nama}}, jangan lewatkan workshop kita besok pukul 10:00 WIB via Zoom.\n\nLink akses:\n👉 https://zoom.us/j/acmecorp-live\n\nSampai bertemu besok!",
    telegramContent:
      "⏰ *REMINDER WEBINAR BESOK* ⏰\n\nHalo {{nama}}, sesi dimulai besok pukul 10:00 WIB. Link Zoom: https://zoom.us/j/acmecorp-live",
  },
];

export const SENDER_PROFILES: SenderProfile[] = [
  {
    id: "promo@acmecorp.co",
    name: "Acme Promo & Marketing",
    email: "promo@acmecorp.co",
    quota: "Batas harian: 15,000 email",
    badge: "Marketing",
  },
  {
    id: "newsletter@acmecorp.co",
    name: "Acme Weekly Newsletter",
    email: "newsletter@acmecorp.co",
    quota: "Batas harian: 20,000 email",
    badge: "Buletin",
  },
  {
    id: "support@acmecorp.co",
    name: "Acme Customer Care",
    email: "support@acmecorp.co",
    quota: "Transaksional / Notifikasi Akun",
    badge: "Support",
  },
];

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    id: "all-subscribers",
    name: "All Subscribers",
    desc: "Semua kontak aktif yang terdaftar di database",
    count: 3420,
    badge: "Umum",
  },
  {
    id: "vip-customers",
    name: "Pelanggan VIP",
    desc: "Pelanggan dengan riwayat transaksi minimal 3 kali",
    count: 1240,
    badge: "Prioritas",
  },
  {
    id: "newsletter-list",
    name: "Newsletter List",
    desc: "Pelanggan yang berlangganan kabar mingguan",
    count: 5800,
    badge: "Marketing",
  },
  {
    id: "inactive-90d",
    name: "Inactive 90d",
    desc: "Pengguna yang tidak membuka pesan dalam 90 hari terakhir",
    count: 450,
    badge: "Re-engagement",
  },
];
