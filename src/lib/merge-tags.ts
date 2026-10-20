export interface ContactContext {
    id?: number | string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    attributes?: Record<string, any> | null;
    customFields?: Record<string, any> | null; // Kolom custom_fields_json di tabel contacts
    [key: string]: any;
}

export interface ExtraContext {
    orgName?: string;
    senderName?: string;
    supportEmail?: string;
    supportPhone?: string;
    websiteUrl?: string;
    unsubscribeLink?: string;
    ctaLink?: string;
    [key: string]: any;
}

/**
 * Helper untuk format tanggal bahasa Indonesia otomatis
 */
const getDateTimeTags = () => {
    const now = new Date();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return {
        tanggal_hari_ini: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        hari: days[now.getDay()],
        bulan: months[now.getMonth()],
        tahun: String(now.getFullYear()),
        jam: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`,
    };
};

/**
 * Engine pengganti merge tags 100% kompatibel dengan front-end
 */
export const applyMergeTags = (
    content: string | null | undefined,
    contact?: ContactContext | null,
    extra?: ExtraContext
): string => {
    if (!content) return "";

    const dateTags = getDateTimeTags();
    const attrs = (contact?.customFields || contact?.attributes || {}) as Record<string, any>;

    // Nama lengkap fallback
    const fullName = contact?.name || [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") || "";

    // Peta nilai bawaan (mencakup semua tag di frontend)
    const dictionary: Record<string, string> = {
        // 1. Data Kontak
        nama: fullName,
        name: fullName,
        first_name: contact?.firstName || fullName,
        firstname: contact?.firstName || fullName,
        last_name: contact?.lastName || "",
        lastname: contact?.lastName || "",
        email: contact?.email || "",
        telepon: contact?.phone || "",
        phone: contact?.phone || "",
        sapaan: attrs.sapaan || "Kak",
        kota: attrs.kota || "",
        gender: attrs.gender || "",
        company: attrs.company || attrs.perusahaan || extra?.orgName || "",
        perusahaan: attrs.perusahaan || attrs.company || extra?.orgName || "",

        // 2. Bisnis & Pengirim
        org_name: extra?.orgName || "Campaign Blast",
        sender_name: extra?.senderName || extra?.orgName || "Tim Support",
        support_email: extra?.supportEmail || "support@domain.com",
        support_phone: extra?.supportPhone || "",
        website_url: extra?.websiteUrl || "",

        // 3. Tanggal & Waktu Otomatis
        tanggal_hari_ini: dateTags.tanggal_hari_ini,
        hari: dateTags.hari,
        bulan: dateTags.bulan,
        tahun: dateTags.tahun,
        jam: dateTags.jam,

        // 4. Promo & Transaksi (diambil dari custom attributes jika ada)
        voucher: attrs.voucher || "PROMO",
        diskon: attrs.diskon || "Spesial",
        order_id: attrs.order_id || "",
        nama_produk: attrs.nama_produk || "",
        total_belanja: attrs.total_belanja || "",
        batas_waktu: attrs.batas_waktu || "Hari ini",

        // 5. Tautan Aksi
        unsubscribe_link: extra?.unsubscribeLink || "#unsubscribe",
        cta_link: extra?.ctaLink || "#",
    };

    const resolveKey = (rawKey: string): string | null => {
        const key = rawKey.toLowerCase();
        if (dictionary[key] !== undefined) return dictionary[key];
        if (attrs[rawKey] !== undefined) return String(attrs[rawKey]);
        if (attrs[key] !== undefined) return String(attrs[key]);
        if (extra && extra[rawKey] !== undefined) return String(extra[rawKey]);
        return null;
    };

    // 1. Replace {{ tag_name }}
    let result = content.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, rawKey) => {
        const val = resolveKey(rawKey);
        return val !== null ? val : "";
    });

    // 2. Replace [ tag_name ]
    result = result.replace(/\[\s*([a-zA-Z0-9_-]+)\s*\]/g, (match, rawKey) => {
        const val = resolveKey(rawKey);
        return val !== null ? val : match;
    });

    // 3. Replace { tag_name }
    result = result.replace(/\{\s*([a-zA-Z0-9_-]+)\s*\}/g, (match, rawKey) => {
        const val = resolveKey(rawKey);
        return val !== null ? val : match;
    });

    return result;
};
