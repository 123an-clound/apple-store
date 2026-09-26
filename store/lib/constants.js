// Fallback contact numbers — the live values come from the apple_settings row
// (editable in /admin/cai-dat) via buildContact(); these only apply if that
// fetch fails, so the site never renders without a phone number.
export const HOTLINE = '0878740203';
export const ZALO_TRAGOP = '0878740203';

// "0878740203" -> "0878 740 203"
export function formatPhone(digits) {
  return String(digits).replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');
}

export function buildContact({ hotline = HOTLINE, zalo = HOTLINE, zalo_tragop = ZALO_TRAGOP } = {}) {
  return {
    hotline,
    hotlineDisplay: formatPhone(hotline),
    telUrl: `tel:${hotline}`,
    zaloUrl: `https://zalo.me/${zalo}`,
    zaloTragopUrl: `https://zalo.me/${zalo_tragop}`,
  };
}

// Public origin of the deployed site. Was previously redefined separately in
// layout.js, robots.js and sitemap.js — centralized here so it can't drift.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apple-store-pro.vercel.app';
