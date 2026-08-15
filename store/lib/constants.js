export const HOTLINE = '0878740203';
export const HOTLINE_DISPLAY = '0878 740 203';
export const TEL_URL = `tel:${HOTLINE}`;
export const ZALO_URL = `https://zalo.me/${HOTLINE}`;

export const ZALO_TRAGOP = '0878740203';
export const ZALO_TRAGOP_URL = `https://zalo.me/${ZALO_TRAGOP}`;

// Public origin of the deployed site. Was previously redefined separately in
// layout.js, robots.js and sitemap.js — centralized here so it can't drift.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apple-store-store.vercel.app';