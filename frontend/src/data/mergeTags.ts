export interface MergeTagItem {
  tag: string;
  label: string;
  desc: string;
  sample: string;
}

export interface MergeTagCategory {
  id: string;
  name: string;
  desc: string;
  items: MergeTagItem[];
}

export const MERGE_TAG_CATEGORIES: MergeTagCategory[] = [
  {
    id: "contact",
    name: "Data Kontak & Pelanggan",
    desc: "Informasi profil penerima pesan",
    items: [
      {
        tag: "nama",
        label: "Nama Lengkap",
        desc: "Nama lengkap penerima sesuai kontak database",
        sample: "Budi Santoso",
      },
      {
        tag: "first_name",
        label: "Nama Depan",
        desc: "Panggilan nama depan penerima",
        sample: "Budi",
      },
      {
        tag: "last_name",
        label: "Nama Belakang",
        desc: "Nama keluarga atau nama belakang",
        sample: "Santoso",
      },
      {
        tag: "email",
        label: "Alamat Email",
        desc: "Email penerima pesan",
        sample: "budi.santoso@example.com",
      },
      {
        tag: "telepon",
        label: "Nomor WhatsApp / HP",
        desc: "Nomor handphone kontak dengan kode negara",
        sample: "+62 812-3456-7890",
      },
      {
        tag: "sapaan",
        label: "Sapaan / Panggilan",
        desc: "Sapaan sopan seperti Bpk., Ibu, atau Kak",
        sample: "Bpk.",
      },
      {
        tag: "kota",
        label: "Kota Domisili",
        desc: "Lokasi kota tempat tinggal pelanggan",
        sample: "Jakarta Selatan",
      },
      {
        tag: "gender",
        label: "Jenis Kelamin",
        desc: "Laki-laki / Perempuan",
        sample: "Laki-laki",
      },
    ],
  },
  {
    id: "business",
    name: "Bisnis & Pengirim",
    desc: "Identitas brand dan kontak perusahaan Anda",
    items: [
      {
        tag: "org_name",
        label: "Nama Perusahaan / Bisnis",
        desc: "Nama brand resmi pengirim blast",
        sample: "Acme Corp",
      },
      {
        tag: "sender_name",
        label: "Nama Pengirim",
        desc: "Nama perwakilan staf atau nama pengirim kampanye",
        sample: "Tim Customer Care Acme",
      },
      {
        tag: "support_email",
        label: "Email Helpdesk",
        desc: "Alamat email customer care untuk balasan",
        sample: "support@acmecorp.co",
      },
      {
        tag: "support_phone",
        label: "Nomor WhatsApp CS",
        desc: "Nomor hotline dukungan pelanggan",
        sample: "+62 811-2233-4455",
      },
      {
        tag: "website_url",
        label: "Tautan Website",
        desc: "Alamat situs web utama perusahaan",
        sample: "https://acmecorp.co",
      },
    ],
  },
  {
    id: "commerce",
    name: "Promo, Transaksi & Pesanan",
    desc: "Detail diskon, kupon, dan transaksi pelanggan",
    items: [
      {
        tag: "voucher",
        label: "Kode Voucher Promo",
        desc: "Kupon diskon yang dipersonalisasi",
        sample: "VIP99",
      },
      {
        tag: "diskon",
        label: "Besaran Diskon",
        desc: "Persentase potongan harga atau nilai rupiah",
        sample: "50%",
      },
      {
        tag: "order_id",
        label: "Nomor Pesanan / Invoice",
        desc: "ID nomor transaksi pesanan terbaru",
        sample: "INV-2026-0988",
      },
      {
        tag: "nama_produk",
        label: "Nama Produk / Paket",
        desc: "Item produk yang dibeli atau dipromosikan",
        sample: "Paket Premium Annual Pro",
      },
      {
        tag: "total_belanja",
        label: "Total Tagihan",
        desc: "Total nominal pembayaran atau keranjang",
        sample: "Rp 750.000",
      },
      {
        tag: "batas_waktu",
        label: "Batas Waktu Berlaku",
        desc: "Tenggat waktu promo atau batas bayar",
        sample: "Malam ini pukul 23:59 WIB",
      },
    ],
  },
  {
    id: "datetime",
    name: "Waktu & Tanggal",
    desc: "Variabel tanggal dan jam saat broadcast dikirim",
    items: [
      {
        tag: "tanggal_hari_ini",
        label: "Tanggal Pengiriman",
        desc: "Format tanggal lengkap bahasa Indonesia",
        sample: "22 September 2026",
      },
      {
        tag: "hari",
        label: "Nama Hari",
        desc: "Hari pengiriman pesan (Senin, Selasa, dll)",
        sample: "Selasa",
      },
      {
        tag: "bulan",
        label: "Nama Bulan",
        desc: "Bulan saat kampanye dikirimkan",
        sample: "September",
      },
      {
        tag: "tahun",
        label: "Tahun Berjalan",
        desc: "Tahun empat digit saat ini",
        sample: "2026",
      },
      {
        tag: "jam",
        label: "Waktu Pengiriman (Jam)",
        desc: "Jam pengiriman pesan",
        sample: "10:30 WIB",
      },
    ],
  },
  {
    id: "links",
    name: "Tautan & Keamanan",
    desc: "Tautan aksi, keamanan, dan kepatuhan pesan",
    items: [
      {
        tag: "unsubscribe_link",
        label: "Tautan Berhenti Langganan",
        desc: "Link opt-out wajib untuk email marketing",
        sample: "https://acmecorp.co/unsubscribe",
      },
      {
        tag: "cta_link",
        label: "Tautan Aksi Utama (CTA)",
        desc: "Tautan tujuan tombol utama kampanye",
        sample: "https://acmecorp.co/claim-promo",
      },
      {
        tag: "otp",
        label: "Kode OTP / PIN",
        desc: "Kode verifikasi 6 digit keamanan",
        sample: "849201",
      },
      {
        tag: "web_view_link",
        label: "Tautan Buka di Browser",
        desc: "Versi web HTML online dari pesan",
        sample: "https://acmecorp.co/view-online",
      },
    ],
  },
];

// Flat list of all available tags for quick lookup
export const ALL_MERGE_TAGS = MERGE_TAG_CATEGORIES.flatMap((c) => c.items);

// Evaluator for Live Simulator previews
export const evaluateMergeTags = (rawContent: string): string => {
  if (!rawContent) return "";

  const sampleDictionary: Record<string, string> = {
    // Contact
    nama: "Budi Santoso",
    full_name: "Budi Santoso",
    first_name: "Budi",
    last_name: "Santoso",
    email: "budi.santoso@example.com",
    telepon: "+62 812-3456-7890",
    phone: "+62 812-3456-7890",
    sapaan: "Bpk.",
    kota: "Jakarta Selatan",
    gender: "Laki-laki",

    // Business
    org_name: "Acme Corp",
    company_name: "Acme Corp",
    sender_name: "Tim Customer Care Acme",
    support_email: "support@acmecorp.co",
    support_phone: "+62 811-2233-4455",
    website_url: "https://acmecorp.co",

    // Commerce
    voucher: "VIP99",
    diskon: "50%",
    order_id: "INV-2026-0988",
    nama_produk: "Paket Premium Annual",
    total_belanja: "Rp 750.000",
    batas_waktu: "Pukul 23:59 WIB malam ini",

    // Datetime
    tanggal_hari_ini: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    hari: new Date().toLocaleDateString("id-ID", { weekday: "long" }),
    bulan: new Date().toLocaleDateString("id-ID", { month: "long" }),
    tahun: new Date().getFullYear().toString(),
    jam: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),

    // Links & Security
    unsubscribe_link: "https://acmecorp.co/unsubscribe",
    cta_link: "https://acmecorp.co/claim-promo",
    otp: "849201",
    web_view_link: "https://acmecorp.co/view-online",
  };

  let evaluated = rawContent;
  Object.entries(sampleDictionary).forEach(([key, val]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    evaluated = evaluated.replace(regex, val);
  });

  return evaluated;
};
