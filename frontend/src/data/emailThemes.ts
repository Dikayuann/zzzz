// emailThemes.ts
// Curated visual email themes for the campaign blast editor.
// Clean, modern, high-converting aesthetic (Brevo, Notion, Stripe, Substack, Apple style).
// Strictly clean and elegant — no 'vibe code' or terminal themes.

export interface EmailTheme {
  id: string;
  name: string;
  badge: string;
  emoji: string;
  category: 'minimal' | 'esp' | 'editorial' | 'commerce' | 'corporate';
  description: string;
  swatches: string[];
  accentClass: string;
  config: EmailThemeConfig;
}

export interface EmailThemeConfig {
  outerBg: string;
  cardBg: string;
  cardRadius: string;
  cardShadow: string;
  cardMaxWidth: string;
  cardPadding: string;
  headerBg: string;
  headerPadding: string;
  headerBorderBottom: string;
  logoBg: string;
  logoText: string;
  logoRadius: string;
  logoPadding: string;
  logoFontSize: string;
  logoFontWeight: string;
  logoLetterSpacing: string;
  taglineFg: string;
  taglineText: string;
  bodyBg: string;
  bodyFg: string;
  bodyPadding: string;
  bodyFontSize: string;
  bodyLineHeight: string;
  dividerColor: string;
  ctaBg: string;
  ctaFg: string;
  ctaRadius: string;
  ctaPadding: string;
  footerBg: string;
  footerFg: string;
  footerPadding: string;
  footerBorderTop: string;
  footerFontSize: string;
}

export const EMAIL_THEMES: EmailTheme[] = [
  {
    id: 'plain',
    name: 'Minimalist Clean',
    badge: 'Paling Populer',
    emoji: '✨',
    category: 'minimal',
    description: 'Desain minimalis modern ala Notion & Resend. Bersih, rapi, dan mudah dibaca.',
    swatches: ['#ffffff', '#f8fafc', '#0f172a'],
    accentClass: 'border-slate-300',
    config: {
      outerBg: '#f8fafc',
      cardBg: '#ffffff',
      cardRadius: '12px',
      cardShadow: '0 1px 4px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.8)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: '#ffffff',
      headerPadding: '24px 28px 16px',
      headerBorderBottom: '1px solid #f1f5f9',
      logoBg: '#f8fafc',
      logoText: '#0f172a',
      logoRadius: '8px',
      logoPadding: '6px 14px',
      logoFontSize: '13px',
      logoFontWeight: '700',
      logoLetterSpacing: '0.04em',
      taglineFg: '#64748b',
      taglineText: 'Official Communication',
      bodyBg: '#ffffff',
      bodyFg: '#334155',
      bodyPadding: '24px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.7',
      dividerColor: '#f1f5f9',
      ctaBg: '#0f172a',
      ctaFg: '#ffffff',
      ctaRadius: '10px',
      ctaPadding: '12px 28px',
      footerBg: '#fafafa',
      footerFg: '#94a3b8',
      footerPadding: '18px 28px',
      footerBorderTop: '1px solid #f1f5f9',
      footerFontSize: '11px',
    },
  },
  {
    id: 'brevo',
    name: 'Brevo Editorial',
    badge: 'ESP Pilihan',
    emoji: '📩',
    category: 'esp',
    description: 'Format newsletter ala Brevo dengan aksen hijau signature dan card putih bersih.',
    swatches: ['#0b996e', '#ffffff', '#f3f4f6'],
    accentClass: 'border-emerald-600',
    config: {
      outerBg: '#f3f4f6',
      cardBg: '#ffffff',
      cardRadius: '8px',
      cardShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(229, 231, 235, 0.6)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: '#ffffff',
      headerPadding: '22px 28px 18px',
      headerBorderBottom: '3px solid #0b996e',
      logoBg: '#ecfdf5',
      logoText: '#0b996e',
      logoRadius: '6px',
      logoPadding: '6px 14px',
      logoFontSize: '14px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.02em',
      taglineFg: '#6b7280',
      taglineText: 'Campaign & Newsletter',
      bodyBg: '#ffffff',
      bodyFg: '#1f2937',
      bodyPadding: '24px 28px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.75',
      dividerColor: '#e5e7eb',
      ctaBg: '#0b996e',
      ctaFg: '#ffffff',
      ctaRadius: '6px',
      ctaPadding: '12px 28px',
      footerBg: '#f9fafb',
      footerFg: '#6b7280',
      footerPadding: '20px 28px',
      footerBorderTop: '1px solid #e5e7eb',
      footerFontSize: '11px',
    },
  },
  {
    id: 'saas',
    name: 'Stripe & SaaS Modern',
    badge: 'Produk',
    emoji: '🚀',
    category: 'minimal',
    description: 'Aksen indigo/violet ala Stripe & Linear. Sangat cocok untuk pengumuman fitur & produk.',
    swatches: ['#4f46e5', '#ffffff', '#f8fafc'],
    accentClass: 'border-indigo-600',
    config: {
      outerBg: '#f8fafc',
      cardBg: '#ffffff',
      cardRadius: '14px',
      cardShadow: '0 8px 30px rgba(79, 70, 229, 0.06), 0 0 0 1px rgba(226, 232, 240, 0.8)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: '#ffffff',
      headerPadding: '24px 28px 18px',
      headerBorderBottom: '1px solid #e2e8f0',
      logoBg: '#eef2ff',
      logoText: '#4f46e5',
      logoRadius: '8px',
      logoPadding: '6px 14px',
      logoFontSize: '13px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.06em',
      taglineFg: '#6366f1',
      taglineText: 'Product Updates',
      bodyBg: '#ffffff',
      bodyFg: '#1e293b',
      bodyPadding: '26px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.7',
      dividerColor: '#e2e8f0',
      ctaBg: '#4f46e5',
      ctaFg: '#ffffff',
      ctaRadius: '10px',
      ctaPadding: '12px 30px',
      footerBg: '#f8fafc',
      footerFg: '#64748b',
      footerPadding: '20px 28px',
      footerBorderTop: '1px solid #e2e8f0',
      footerFontSize: '11px',
    },
  },
  {
    id: 'newsletter',
    name: 'Editorial Substack',
    badge: 'Editorial',
    emoji: '📰',
    category: 'editorial',
    description: 'Vibe bacaan santai dan hangat dengan kanvas ivory ala Substack & Medium.',
    swatches: ['#d97706', '#ffffff', '#faf8f5'],
    accentClass: 'border-amber-600',
    config: {
      outerBg: '#faf8f5',
      cardBg: '#ffffff',
      cardRadius: '10px',
      cardShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(231, 229, 228, 0.6)',
      cardMaxWidth: '580px',
      cardPadding: '0',
      headerBg: '#ffffff',
      headerPadding: '28px 28px 16px',
      headerBorderBottom: '1px solid #f5f5f4',
      logoBg: '#fef3c7',
      logoText: '#92400e',
      logoRadius: '6px',
      logoPadding: '5px 12px',
      logoFontSize: '12px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.08em',
      taglineFg: '#78716c',
      taglineText: 'Weekly Digest & Insights',
      bodyBg: '#ffffff',
      bodyFg: '#292524',
      bodyPadding: '26px 28px 30px',
      bodyFontSize: '14.5px',
      bodyLineHeight: '1.8',
      dividerColor: '#e7e5e4',
      ctaBg: '#d97706',
      ctaFg: '#ffffff',
      ctaRadius: '8px',
      ctaPadding: '12px 28px',
      footerBg: '#faf8f5',
      footerFg: '#78716c',
      footerPadding: '20px 28px',
      footerBorderTop: '1px solid #e7e5e4',
      footerFontSize: '11px',
    },
  },
  {
    id: 'apple',
    name: 'Apple Monochrome',
    badge: 'Kemewahan',
    emoji: '💎',
    category: 'minimal',
    description: 'Estetika minimalis premium monokrom. Kontras tajam, ruang lega, dan elegan.',
    swatches: ['#000000', '#ffffff', '#f5f5f7'],
    accentClass: 'border-black',
    config: {
      outerBg: '#f5f5f7',
      cardBg: '#ffffff',
      cardRadius: '16px',
      cardShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
      cardMaxWidth: '580px',
      cardPadding: '0',
      headerBg: '#ffffff',
      headerPadding: '32px 32px 18px',
      headerBorderBottom: 'none',
      logoBg: '#000000',
      logoText: '#ffffff',
      logoRadius: '50px',
      logoPadding: '6px 16px',
      logoFontSize: '11px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.12em',
      taglineFg: '#86868b',
      taglineText: 'Special Announcement',
      bodyBg: '#ffffff',
      bodyFg: '#1d1d1f',
      bodyPadding: '24px 32px 32px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.75',
      dividerColor: '#d2d2d7',
      ctaBg: '#000000',
      ctaFg: '#ffffff',
      ctaRadius: '50px',
      ctaPadding: '12px 32px',
      footerBg: '#f5f5f7',
      footerFg: '#86868b',
      footerPadding: '22px 32px',
      footerBorderTop: 'none',
      footerFontSize: '11px',
    },
  },
  {
    id: 'ecommerce',
    name: 'Retail & Promo Spesial',
    badge: 'Promo',
    emoji: '🛍️',
    category: 'commerce',
    description: 'Warna coral/rose segar dengan kontras cerah. Menarik perhatian untuk diskon & konversi penjualan.',
    swatches: ['#e11d48', '#ffffff', '#fff1f2'],
    accentClass: 'border-rose-500',
    config: {
      outerBg: '#fff1f2',
      cardBg: '#ffffff',
      cardRadius: '14px',
      cardShadow: '0 8px 24px rgba(225, 29, 72, 0.06), 0 0 0 1px rgba(254, 205, 211, 0.5)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
      headerPadding: '24px 28px 20px',
      headerBorderBottom: 'none',
      logoBg: 'rgba(255, 255, 255, 0.2)',
      logoText: '#ffffff',
      logoRadius: '8px',
      logoPadding: '5px 14px',
      logoFontSize: '13px',
      logoFontWeight: '900',
      logoLetterSpacing: '0.08em',
      taglineFg: '#ffe4e6',
      taglineText: 'Limited Time Exclusive Offer',
      bodyBg: '#ffffff',
      bodyFg: '#1c1917',
      bodyPadding: '26px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.7',
      dividerColor: '#ffe4e6',
      ctaBg: '#e11d48',
      ctaFg: '#ffffff',
      ctaRadius: '10px',
      ctaPadding: '13px 32px',
      footerBg: '#fff1f2',
      footerFg: '#9f1239',
      footerPadding: '18px 28px',
      footerBorderTop: '1px solid #fecdd3',
      footerFontSize: '11px',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate Executive',
    badge: 'Bisnis',
    emoji: '🏢',
    category: 'corporate',
    description: 'Kombinasi navy klasik dan biru royal yang formal, kredibel, dan terpercaya.',
    swatches: ['#1e3a8a', '#ffffff', '#f0f4f8'],
    accentClass: 'border-blue-700',
    config: {
      outerBg: '#f0f4f8',
      cardBg: '#ffffff',
      cardRadius: '10px',
      cardShadow: '0 4px 16px rgba(30, 58, 138, 0.06), 0 0 0 1px rgba(203, 213, 225, 0.6)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: '#1e3a8a',
      headerPadding: '24px 28px 20px',
      headerBorderBottom: 'none',
      logoBg: 'rgba(255, 255, 255, 0.15)',
      logoText: '#ffffff',
      logoRadius: '6px',
      logoPadding: '6px 14px',
      logoFontSize: '13px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.08em',
      taglineFg: '#93c5fd',
      taglineText: 'Official Corporate Notice',
      bodyBg: '#ffffff',
      bodyFg: '#1e293b',
      bodyPadding: '26px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.7',
      dividerColor: '#e2e8f0',
      ctaBg: '#2563eb',
      ctaFg: '#ffffff',
      ctaRadius: '8px',
      ctaPadding: '12px 28px',
      footerBg: '#f8fafc',
      footerFg: '#64748b',
      footerPadding: '18px 28px',
      footerBorderTop: '1px solid #e2e8f0',
      footerFontSize: '11px',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Vitality',
    badge: 'Segar',
    emoji: '🌿',
    category: 'minimal',
    description: 'Nuansa hijau alami yang segar dan menenangkan. Cocok untuk brand wellness, edukasi, atau fintech.',
    swatches: ['#059669', '#ffffff', '#ecfdf5'],
    accentClass: 'border-emerald-500',
    config: {
      outerBg: '#ecfdf5',
      cardBg: '#ffffff',
      cardRadius: '12px',
      cardShadow: '0 6px 20px rgba(5, 150, 105, 0.06), 0 0 0 1px rgba(167, 243, 208, 0.6)',
      cardMaxWidth: '600px',
      cardPadding: '0',
      headerBg: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
      headerPadding: '24px 28px 20px',
      headerBorderBottom: 'none',
      logoBg: 'rgba(255, 255, 255, 0.2)',
      logoText: '#ffffff',
      logoRadius: '8px',
      logoPadding: '6px 14px',
      logoFontSize: '13px',
      logoFontWeight: '800',
      logoLetterSpacing: '0.06em',
      taglineFg: '#a7f3d0',
      taglineText: 'Fresh Updates & Growth',
      bodyBg: '#ffffff',
      bodyFg: '#064e3b',
      bodyPadding: '26px 28px',
      bodyFontSize: '14px',
      bodyLineHeight: '1.7',
      dividerColor: '#a7f3d0',
      ctaBg: '#059669',
      ctaFg: '#ffffff',
      ctaRadius: '8px',
      ctaPadding: '12px 28px',
      footerBg: '#f0fdf4',
      footerFg: '#047857',
      footerPadding: '18px 28px',
      footerBorderTop: '1px solid #a7f3d0',
      footerFontSize: '11px',
    },
  },
];

export function getEmailTheme(id: string): EmailTheme {
  const found = EMAIL_THEMES.find((t) => t.id === id);
  if (found) return found;

  // Backward compatibility aliases
  if (id === 'github' || id === 'dark' || id === 'minimal') {
    return EMAIL_THEMES.find((t) => t.id === 'plain') || EMAIL_THEMES[0];
  }
  if (id === 'mailchimp' || id === 'klaviyo' || id === 'sendgrid') {
    return EMAIL_THEMES.find((t) => t.id === 'brevo') || EMAIL_THEMES[0];
  }

  return EMAIL_THEMES[0];
}
