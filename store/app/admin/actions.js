'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin-auth';
import { createSupabaseServer } from '@/lib/supabase-server';
import { hasRole } from '@/lib/roles';
import { IMAGE_COLUMNS, BADGES } from '@/lib/helpers';
import { SITE_URL } from '@/lib/constants';

// Every mutation re-checks the role here AND is enforced again by RLS in the
// database, so a forged request from a lower role fails twice.
async function gate(min) {
  const admin = await getAdmin();
  if (!admin.user || !hasRole(admin.role, min)) return { error: 'Bạn không có quyền thực hiện thao tác này.' };
  return admin;
}

// Product edits change the home page, product pages and sitemap at once.
function revalidateSite() {
  revalidatePath('/', 'layout');
}

function dbError(error) {
  console.error('[Admin] Supabase error:', error.message);
  return { error: 'Lưu thất bại: ' + error.message };
}

// ───────────────────────── Auth ─────────────────────────

export async function signIn(_prev, formData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Nhập email và mật khẩu.' };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for wrong email and wrong password — no account enumeration.
  if (error) return { error: 'Email hoặc mật khẩu không đúng.', email };
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function requestPasswordReset(_prev, formData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: 'Nhập email.' };
  const supabase = await createSupabaseServer();
  // Fixed origin, not the Host header — a spoofed Host must not steer the reset link.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/doi-mat-khau`,
  });
  // Always report success so the form can't be used to probe which emails exist.
  return { ok: true };
}

export async function updatePassword(_prev, formData) {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (password.length < 10) return { error: 'Mật khẩu tối thiểu 10 ký tự.' };
  if (password !== confirm) return { error: 'Hai mật khẩu không khớp.' };
  const admin = await getAdmin();
  if (!admin.user) return { error: 'Phiên đăng nhập đã hết hạn.' };
  const { error } = await admin.supabase.auth.updateUser({ password });
  if (error) return { error: 'Không đổi được mật khẩu: ' + error.message };
  return { ok: true };
}

// ─────────────────────── Products ───────────────────────

const toInt = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[^\d-]/g, ''));
  return Number.isSafeInteger(n) ? n : NaN;
};

// Validates a product payload from the form / CSV import and maps it to the
// kho_iphone column names. Returns { row } or { error }.
function toRow(input) {
  const name = String(input.name ?? '').trim();
  const spec = String(input.spec ?? '').trim();
  const price = toInt(input.price);
  const sale = toInt(input.sale_price);
  const stock = toInt(input.stock);
  const badge = input.badge || null;
  const description = String(input.description ?? '').trim();

  if (!name || name.length > 120) return { error: 'Tên sản phẩm bắt buộc (tối đa 120 ký tự).' };
  if (spec.length > 40) return { error: 'Dung lượng tối đa 40 ký tự.' };
  if (!Number.isFinite(price) || price === null || price < 0) return { error: `Giá không hợp lệ (${name}).` };
  if (Number.isNaN(sale) || (sale !== null && (sale < 0 || sale >= price))) {
    return { error: `Giá khuyến mãi phải nhỏ hơn giá gốc (${name}).` };
  }
  if (Number.isNaN(stock) || (stock !== null && stock < 0)) return { error: `Tồn kho không hợp lệ (${name}).` };
  if (badge && !BADGES[badge]) return { error: 'Nhãn không hợp lệ.' };
  if (description.length > 2000) return { error: 'Mô tả tối đa 2000 ký tự.' };

  const row = {
    'Tên sản phẩm': name,
    'Dung Lượng RAM/ROM': spec || null,
    'Giá': String(price),
    sale_price: sale,
    stock,
    badge,
    is_visible: input.is_visible !== false,
    'Mô tả': description || null,
  };
  if (Array.isArray(input.images)) {
    IMAGE_COLUMNS.forEach((col, i) => {
      const v = input.images[i];
      row[col] = typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null;
    });
  }
  return { row };
}

export async function saveProduct(id, input) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  const { row, error } = toRow(input);
  if (error) return { error };

  const q = id
    ? admin.supabase.from('kho_iphone').update(row).eq('id', id).select('id').single()
    : admin.supabase.from('kho_iphone').insert(row).select('id').single();
  const { data, error: dbErr } = await q;
  if (dbErr) return dbError(dbErr);
  revalidateSite();
  return { ok: true, id: data.id };
}

// Small whitelisted patches from the table (inline price edit, visibility toggle).
export async function patchProduct(id, patch) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  const update = {};
  if ('price' in patch) {
    const p = toInt(patch.price);
    if (!Number.isFinite(p) || p === null || p < 0) return { error: 'Giá không hợp lệ.' };
    update['Giá'] = String(p);
  }
  if ('is_visible' in patch) update.is_visible = Boolean(patch.is_visible);
  if ('stock' in patch) {
    const s = toInt(patch.stock);
    if (Number.isNaN(s) || (s !== null && s < 0)) return { error: 'Tồn kho không hợp lệ.' };
    update.stock = s;
  }
  if (Object.keys(update).length === 0) return { error: 'Không có gì để cập nhật.' };

  const { error } = await admin.supabase.from('kho_iphone').update(update).eq('id', id);
  if (error) return dbError(error);
  revalidateSite();
  return { ok: true };
}

export async function deleteProducts(ids) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  if (!Array.isArray(ids) || ids.length === 0) return { error: 'Chưa chọn sản phẩm.' };
  const { error } = await admin.supabase.from('kho_iphone').delete().in('id', ids.map(Number));
  if (error) return dbError(error);
  revalidateSite();
  return { ok: true };
}

// Bulk: show/hide, set badge, or change price by a percentage (rounded to 10.000đ).
export async function bulkUpdate(ids, action) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  if (!Array.isArray(ids) || ids.length === 0) return { error: 'Chưa chọn sản phẩm.' };
  const numIds = ids.map(Number);

  if (action.type === 'visibility' || action.type === 'badge') {
    const update = action.type === 'visibility'
      ? { is_visible: Boolean(action.value) }
      : { badge: action.value && BADGES[action.value] ? action.value : null };
    const { error } = await admin.supabase.from('kho_iphone').update(update).in('id', numIds);
    if (error) return dbError(error);
  } else if (action.type === 'price_percent') {
    const pct = Number(action.value);
    if (!Number.isFinite(pct) || pct <= -90 || pct > 200) return { error: 'Phần trăm phải trong khoảng -90% đến 200%.' };
    const { data, error } = await admin.supabase.from('kho_iphone').select('id, "Giá"').in('id', numIds);
    if (error) return dbError(error);
    // ponytail: one UPDATE per row — fine for a catalogue of ~100 rows; move to an RPC if it grows to thousands.
    const results = await Promise.all(
      data.map((r) => {
        const base = toInt(r['Giá']);
        if (!Number.isFinite(base) || base === null) return { error: null };
        const next = Math.max(0, Math.round((base * (1 + pct / 100)) / 10000) * 10000);
        return admin.supabase.from('kho_iphone').update({ 'Giá': String(next) }).eq('id', r.id);
      })
    );
    const failed = results.find((r) => r.error);
    if (failed) return dbError(failed.error);
  } else {
    return { error: 'Thao tác không hợp lệ.' };
  }
  revalidateSite();
  return { ok: true };
}

export async function duplicateProduct(id) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  const { data, error } = await admin.supabase.from('kho_iphone').select('*').eq('id', id).single();
  if (error) return dbError(error);
  const { id: _id, stt: _stt, 'Mã sản phẩm': _code, updated_at: _u, ...copy } = data;
  // Copies start hidden so the storefront never shows a half-edited duplicate.
  const { data: created, error: insErr } = await admin.supabase
    .from('kho_iphone')
    .insert({ ...copy, is_visible: false })
    .select('id')
    .single();
  if (insErr) return dbError(insErr);
  revalidateSite();
  return { ok: true, id: created.id };
}

// CSV import: rows with an existing id are updated, the rest inserted.
export async function importProducts(rows) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  if (!Array.isArray(rows) || rows.length === 0) return { error: 'File không có dòng nào.' };
  if (rows.length > 500) return { error: 'Tối đa 500 dòng mỗi lần nhập.' };

  const prepared = [];
  for (const [i, input] of rows.entries()) {
    const { row, error } = toRow(input);
    if (error) return { error: `Dòng ${i + 2}: ${error}` };
    prepared.push({ id: toInt(input.id), row });
  }

  let inserted = 0;
  let updated = 0;
  for (const { id, row } of prepared) {
    const { error, count } = id
      ? await admin.supabase.from('kho_iphone').update(row, { count: 'exact' }).eq('id', id)
      : await admin.supabase.from('kho_iphone').insert(row, { count: 'exact' });
    if (error) return { error: `Dừng sau ${inserted + updated} dòng: ${error.message}` };
    if (id && count === 0) {
      // id not found — treat as a new product rather than silently dropping it.
      const { error: e2 } = await admin.supabase.from('kho_iphone').insert(row);
      if (e2) return { error: `Dừng sau ${inserted + updated} dòng: ${e2.message}` };
      inserted++;
    } else if (id) updated++;
    else inserted++;
  }
  revalidateSite();
  return { ok: true, inserted, updated };
}

// ──────────────────────── Media ─────────────────────────

export async function deleteImages(names) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  if (!Array.isArray(names) || names.length === 0) return { error: 'Chưa chọn ảnh.' };
  const { error } = await admin.supabase.storage.from('anh-iphone').remove(names.map(String));
  if (error) return dbError(error);
  return { ok: true };
}

// ──────────────────────── Leads ─────────────────────────

const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost'];

export async function updateLead(id, patch) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  const update = {};
  if ('status' in patch) {
    if (!LEAD_STATUSES.includes(patch.status)) return { error: 'Trạng thái không hợp lệ.' };
    update.status = patch.status;
  }
  if ('admin_note' in patch) update.admin_note = String(patch.admin_note ?? '').slice(0, 1000) || null;
  const { error } = await admin.supabase.from('apple_leads').update(update).eq('id', id);
  if (error) return dbError(error);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function deleteLead(id) {
  const admin = await gate('editor');
  if (admin.error) return admin;
  const { error } = await admin.supabase.from('apple_leads').delete().eq('id', id);
  if (error) return dbError(error);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

// ─────────────────── Settings & admins ──────────────────

export async function saveSettings(_prev, formData) {
  const admin = await gate('owner');
  if (admin.error) return admin;
  const clean = (k) => String(formData.get(k) ?? '').replace(/[^0-9]/g, '');
  const values = { hotline: clean('hotline'), zalo: clean('zalo'), zalo_tragop: clean('zalo_tragop') };
  if (Object.values(values).some((v) => !/^[0-9]{8,12}$/.test(v))) {
    return { error: 'Số điện thoại phải gồm 8–12 chữ số.' };
  }

  // Store details — every field optional; empty clears it.
  const text = (k, max) => String(formData.get(k) ?? '').trim().slice(0, max) || null;
  const time = (k) => {
    const v = text(k, 5);
    return v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null;
  };
  const coord = (k, limit) => {
    const v = text(k, 20);
    if (v === null) return null;
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) && Math.abs(n) <= limit ? n : NaN;
  };
  const store = {
    address: text('address', 200),
    maps_url: text('maps_url', 500),
    open_time: time('open_time'),
    close_time: time('close_time'),
    latitude: coord('latitude', 90),
    longitude: coord('longitude', 180),
    response_promise: text('response_promise', 80),
  };
  // Rendered as a link on the public site: https only, no javascript:/data: URLs.
  if (store.maps_url && !/^https:\/\//i.test(store.maps_url)) return { error: 'Link bản đồ phải bắt đầu bằng https://' };
  if (Number.isNaN(store.latitude) || Number.isNaN(store.longitude)) return { error: 'Toạ độ không hợp lệ.' };
  if ((store.latitude === null) !== (store.longitude === null)) return { error: 'Nhập đủ cả vĩ độ và kinh độ, hoặc để trống cả hai.' };

  const { error } = await admin.supabase.from('apple_settings').update({ ...values, ...store }).eq('id', 1);
  if (error) return dbError(error);
  revalidateSite();
  return { ok: true };
}

export async function setAdminRole(email, role) {
  const admin = await gate('owner');
  if (admin.error) return admin;
  if (role !== null && !['owner', 'editor', 'viewer'].includes(role)) return { error: 'Role không hợp lệ.' };
  const { error } = await admin.supabase.rpc('apple_set_admin', { p_email: String(email), p_role: role });
  if (error) return { error: error.message };
  revalidatePath('/admin/quan-tri');
  return { ok: true };
}
