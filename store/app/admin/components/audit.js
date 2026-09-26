import { formatPrice } from '@/lib/helpers';

const FIELD_LABELS = {
  'Tên sản phẩm': 'Tên',
  'Dung Lượng RAM/ROM': 'Dung lượng',
  'Giá': 'Giá',
  sale_price: 'Giá KM',
  stock: 'Tồn kho',
  is_visible: 'Hiển thị',
  badge: 'Nhãn',
  'Mô tả': 'Mô tả',
  hotline: 'Hotline',
  zalo: 'Zalo',
  zalo_tragop: 'Zalo trả góp',
  address: 'Địa chỉ',
  maps_url: 'Link bản đồ',
  open_time: 'Giờ mở cửa',
  close_time: 'Giờ đóng cửa',
  latitude: 'Vĩ độ',
  longitude: 'Kinh độ',
  response_promise: 'Cam kết phản hồi',
  status: 'Trạng thái',
  admin_note: 'Ghi chú',
  role: 'Quyền',
};
const PRICE_FIELDS = new Set(['Giá', 'sale_price']);
const IGNORED = new Set(['updated_at', 'created_at', 'id', 'stt', 'Mã sản phẩm']);

const TABLE_LABELS = {
  kho_iphone: 'Sản phẩm',
  apple_settings: 'Cài đặt',
  apple_admins: 'Quản trị viên',
  apple_leads: 'Khách hàng',
};
export const ACTION_LABELS = { INSERT: 'Thêm', UPDATE: 'Sửa', DELETE: 'Xoá' };

function show(field, v) {
  if (v === null || v === undefined || v === '') return '—';
  if (PRICE_FIELDS.has(field)) return formatPrice(v);
  if (typeof v === 'boolean') return v ? 'Có' : 'Không';
  const s = String(v);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

// Human-readable changes for one audit entry: [{ field, from, to }].
export function auditChanges(entry) {
  if (entry.action !== 'UPDATE' || !entry.before || !entry.after) return [];
  const out = [];
  for (const key of Object.keys(entry.after)) {
    if (IGNORED.has(key)) continue;
    const a = entry.before[key];
    const b = entry.after[key];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    const label = FIELD_LABELS[key] ?? (key.startsWith('Hình ảnh') ? key.replace('Hình ảnh sản phẩm', 'Ảnh') : key);
    out.push({ field: label, from: show(key, a), to: show(key, b) });
  }
  return out;
}

export function auditSubject(entry) {
  const row = entry.after ?? entry.before ?? {};
  const table = TABLE_LABELS[entry.table_name] ?? entry.table_name;
  if (entry.table_name === 'kho_iphone') {
    return [row['Tên sản phẩm'], row['Dung Lượng RAM/ROM']].filter(Boolean).join(' ') || `${table} #${entry.row_id}`;
  }
  if (entry.table_name === 'apple_leads') return `${table}: ${row.name ?? ''} ${row.phone ?? ''}`.trim();
  return table;
}

export function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return formatDateTime(iso);
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
}
