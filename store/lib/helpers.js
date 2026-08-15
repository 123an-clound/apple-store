import { STORAGE_BASE_URL } from './supabase';

// ─────────────────────────────────────────────
// Extract filename from Windows absolute paths
// e.g. """C:\Users\...\X Silver-.png""" → "X Silver-.png"
// ─────────────────────────────────────────────
export function extractFilename(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  // Strip surrounding quotes (single or double, repeated)
  const cleaned = rawPath.replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return null;
  // Get the part after the last backslash or forward slash
  const parts = cleaned.split(/[\\/]/);
  const filename = parts[parts.length - 1].trim();
  if (!filename) return null;
  return filename;
}

// Build a full Supabase Storage URL from a raw Windows path column value
export function buildImageUrl(rawPath) {
  const filename = extractFilename(rawPath);
  if (!filename) return null;
  // Heuristic: some rows may miss the file extension in the source column.
  // Default to ".png" (this store asset set is mostly PNG).
  const finalName = /\.[a-z0-9]+$/i.test(filename) ? filename : `${filename}.png`;
  return `${STORAGE_BASE_URL}${encodeURIComponent(finalName)}`;
}

// Return up to 6 non-null image URLs from a raw product row
export function getImageUrls(row) {
  const cols = [
    'Hình ảnh sản phẩm 1',
    'Hình ảnh sản phẩm 2',
    'Hình ảnh sản phẩm 3',
    'Hình ảnh sản phẩm 4',
    'Hình ảnh sản phẩm 5',
    'Hình ảnh sản phẩm 6',
  ];
  return cols
    .map((col) => buildImageUrl(row[col]))
    .filter(Boolean);
}

// Format price: strip dots, parse int, format as Vietnamese currency
export function formatPrice(rawPrice) {
  if (!rawPrice && rawPrice !== 0) return 'Liên hệ';
  const cleaned = String(rawPrice).replace(/\./g, '').replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return 'Liên hệ';
  return num.toLocaleString('vi-VN') + 'đ';
}

// Parse price to numeric integer for comparison
export function parsePrice(rawPrice) {
  if (!rawPrice && rawPrice !== 0) return Infinity;
  const cleaned = String(rawPrice).replace(/\./g, '').replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? Infinity : num;
}

// Spec fallback
export function getSpec(row) {
  const spec = row['Dung Lượng RAM/ROM'];
  return spec && spec.trim() ? spec.trim() : 'Bản Chuẩn';
}

// ─────────────────────────────────────────────
// Series detection: dynamically extract numeric
// series labels from product names like "iPhone 16 Pro"
// Returns e.g. "16 Series", "X Series", "SE Series"
// ─────────────────────────────────────────────
export function getSeries(name) {
  if (!name) return 'Khác';
  // iPhone X/XR/XS/XS Max → "X Series"
  if (/iPhone\s+X(\s|R|S|$)/i.test(name)) return 'X Series';
  // Match numeric series like 11, 12, 13, 14, 15, 16, 17...
  const numMatch = name.match(/iPhone\s+(\d+)/i);
  if (numMatch) return `${numMatch[1]} Series`;
  // SE
  if (/iPhone\s+SE/i.test(name)) return 'SE Series';
  return 'Khác';
}

// Sort order for series (mới nhất trước)
const SERIES_ORDER = [
  '17 Series', '16 Series', '15 Series', '14 Series',
  '13 Series', '12 Series', '11 Series', 'X Series', 'SE Series',
];

export function sortSeries(seriesArr) {
  return [...seriesArr].sort((a, b) => {
    const ai = SERIES_ORDER.indexOf(a);
    const bi = SERIES_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// URL-safe slug for a product name, e.g. "iPhone 17 Pro Max" -> "iphone-17-pro-max".
// Used for /san-pham/[slug] routes — relies on groupByModel's names already being
// unique (they're a Map key), so no collision handling is needed here.
export function slugify(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─────────────────────────────────────────────
// Group raw DB rows into unique model cards
// Each card shows the lowest starting price
// ─────────────────────────────────────────────
export function groupByModel(rows) {
  const map = new Map();
  for (const row of rows) {
    const name = row['Tên sản phẩm'];
    if (!map.has(name)) {
      map.set(name, {
        name,
        slug: slugify(name),
        series: getSeries(name),
        // Used for "mới nhất" ordering (STT lớn hơn lên trước)
        sttMax: Number.isFinite(Number(row?.stt)) ? Number(row.stt) : 0,
        lowestPrice: parsePrice(row['Giá']),
        lowestPriceRaw: row['Giá'],
        images: getImageUrls(row),
        description: row['Mô tả'] || '',
        variants: [],
      });
    }
    const card = map.get(name);
    if (Number.isFinite(Number(row?.stt))) {
      card.sttMax = Math.max(card.sttMax ?? 0, Number(row.stt));
    }
    const price = parsePrice(row['Giá']);
    if (price < card.lowestPrice) {
      card.lowestPrice = price;
      card.lowestPriceRaw = row['Giá'];
    }
    card.variants.push({
      spec: getSpec(row),
      price: parsePrice(row['Giá']),
      priceFormatted: formatPrice(row['Giá']),
      images: getImageUrls(row),
    });
  }
  return [...map.values()];
}
