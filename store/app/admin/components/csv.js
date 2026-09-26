// Minimal RFC 4180 CSV: quoted fields, escaped quotes (""), commas/newlines
// inside quotes, CRLF or LF. Enough for Excel/Google Sheets round trips.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start).
  const safe = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(header, rows) {
  // BOM so Excel opens Vietnamese text as UTF-8.
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}

export const PRODUCT_CSV_HEADER = ['id', 'ten', 'dung_luong', 'gia', 'gia_km', 'ton_kho', 'nhan', 'hien_thi', 'mo_ta'];

export function productToCsvRow(r) {
  return [r.id, r['Tên sản phẩm'], r['Dung Lượng RAM/ROM'], r['Giá'], r.sale_price, r.stock, r.badge, r.is_visible ? 1 : 0, r['Mô tả']];
}

// CSV rows → payloads for the importProducts action (validated again server-side).
export function csvToProducts(rows) {
  const [header, ...body] = rows;
  const idx = Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), i]));
  const missing = ['ten', 'gia'].filter((k) => !(k in idx));
  if (missing.length) throw new Error(`Thiếu cột: ${missing.join(', ')}`);
  const get = (r, k) => (k in idx ? (r[idx[k]] ?? '').trim() : '');
  return body.map((r) => ({
    id: get(r, 'id') || null,
    name: get(r, 'ten'),
    spec: get(r, 'dung_luong'),
    price: get(r, 'gia'),
    sale_price: get(r, 'gia_km') || null,
    stock: get(r, 'ton_kho') || null,
    badge: get(r, 'nhan').toUpperCase() || null,
    is_visible: !['0', 'false', 'khong', 'không', 'an', 'ẩn'].includes(get(r, 'hien_thi').toLowerCase()),
    description: get(r, 'mo_ta'),
  }));
}
