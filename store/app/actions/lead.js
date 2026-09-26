'use server';

import supabase from '@/lib/supabase';

const KINDS = ['tu_van', 'tra_gop', 'thu_cu'];

// Public callback request. Validation is repeated in the apple_submit_lead RPC
// (length checks, phone format, per-phone and global rate limits) — this layer
// only exists to give friendly messages before the round trip.
export async function submitLead(_prev, formData) {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get('website')) return { ok: true };

  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').replace(/[^0-9]/g, '');
  const kind = String(formData.get('kind') ?? 'tu_van');
  const product = String(formData.get('product') ?? '').slice(0, 120);

  if (!name || name.length > 80) return { ok: false, error: 'Vui lòng nhập họ tên (tối đa 80 ký tự).' };
  if (!/^0[0-9]{9,10}$/.test(phone)) return { ok: false, error: 'Số điện thoại không hợp lệ.' };
  if (!KINDS.includes(kind)) return { ok: false, error: 'Nhu cầu không hợp lệ.' };

  const { error } = await supabase.rpc('apple_submit_lead', {
    p_name: name,
    p_phone: phone,
    p_kind: kind,
    p_product: product || null,
    p_note: null,
  });
  if (error) {
    // Rate-limit messages from the RPC are written for end users; anything else is not.
    const friendly = /vui lòng/i.test(error.message) ? error.message : 'Không gửi được, vui lòng gọi hotline.';
    return { ok: false, error: friendly };
  }
  return { ok: true };
}
