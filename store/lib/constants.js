// Fallback contact numbers — the live values come from the apple_settings row
// (editable in /admin/cai-dat) via buildContact(); these only apply if that
// fetch fails, so the site never renders without a phone number.
export const HOTLINE = '0878740203';
export const ZALO_TRAGOP = '0878740203';

// "0878740203" -> "0878 740 203"
export function formatPhone(digits) {
  return String(digits).replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');
}

// Postgres `time` comes back as "08:00:00" — keep "08:00".
const hhmm = (t) => (t ? String(t).slice(0, 5) : null);
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

export function buildContact({
  hotline = HOTLINE, zalo = HOTLINE, zalo_tragop = ZALO_TRAGOP,
  address = null, maps_url = null, open_time = null, close_time = null,
  latitude = null, longitude = null, response_promise = null,
} = {}) {
  const lat = num(latitude);
  const lng = num(longitude);
  return {
    hotline,
    hotlineDisplay: formatPhone(hotline),
    telUrl: `tel:${hotline}`,
    zaloUrl: `https://zalo.me/${zalo}`,
    zaloTragopUrl: `https://zalo.me/${zalo_tragop}`,
    // Store details are optional; each consumer hides what is still empty.
    address: address || null,
    directionsUrl: maps_url || (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null),
    opens: hhmm(open_time),
    closes: hhmm(close_time),
    geo: Number.isFinite(lat) && Number.isFinite(lng) && lat !== null && lng !== null ? { lat, lng } : null,
    responsePromise: response_promise || null,
  };
}

// Public origin of the deployed site. Was previously redefined separately in
// layout.js, robots.js and sitemap.js — centralized here so it can't drift.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apple-store-pro.vercel.app';
