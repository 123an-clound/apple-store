// Shared display helpers without database imports, safe for the browser bundle.
export function formatPrice(rawPrice) {
  if (!rawPrice && rawPrice !== 0) return 'Liên hệ';
  const cleaned = String(rawPrice).replace(/\./g, '').replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return 'Liên hệ';
  return num.toLocaleString('vi-VN') + 'đ';
}

// Colours meet AA contrast with white labels.
export const BADGES = {
  NEW: { label: 'Mới', color: '#1d4ed8' },
  HOT: { label: 'Hot', color: '#b91c1c' },
  SALE: { label: 'Giảm giá', color: '#c2410c' },
  LIMITED: { label: 'Giới hạn', color: '#6d28d9' },
};
