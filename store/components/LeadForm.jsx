'use client';

import { useActionState, useId, useState } from 'react';
import { PhoneCall, CheckCircle2 } from 'lucide-react';
import { submitLead } from '@/app/actions/lead';

const field = {
  width: '100%', minHeight: 44, borderRadius: 10, padding: '0 12px', fontSize: 14,
  border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text-primary)',
};
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 };

export default function LeadForm({ product }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitLead, null);
  const id = useId();

  if (state?.ok) {
    return (
      <p role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', margin: 0 }}>
        <CheckCircle2 size={16} aria-hidden="true" /> Đã nhận yêu cầu — chúng tôi sẽ gọi lại sớm.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="focus-ring"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px', borderRadius: 10, border: '1px dashed var(--border-strong)', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <PhoneCall size={15} aria-hidden="true" /> Để lại số, chúng tôi gọi lại
      </button>
    );
  }

  return (
    <form action={action} style={{ display: 'grid', gap: 10, borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)', padding: 12 }}>
      <input type="hidden" name="product" value={product} />
      {/* Honeypot, hidden from people and assistive tech */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      <div>
        <label htmlFor={`${id}-name`} style={label}>Họ tên</label>
        <input id={`${id}-name`} name="name" required maxLength={80} autoComplete="name" style={field} />
      </div>
      <div>
        <label htmlFor={`${id}-phone`} style={label}>Số điện thoại</label>
        <input id={`${id}-phone`} name="phone" required type="tel" inputMode="tel" autoComplete="tel" maxLength={15} style={field} />
      </div>
      <div>
        <label htmlFor={`${id}-kind`} style={label}>Nhu cầu</label>
        <select id={`${id}-kind`} name="kind" defaultValue="tu_van" style={field}>
          <option value="tu_van">Tư vấn mua máy</option>
          <option value="tra_gop">Mua trả góp</option>
          <option value="thu_cu">Thu cũ đổi mới</option>
        </select>
      </div>
      {state?.error && <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{state.error}</p>}
      <button type="submit" disabled={pending} className="focus-ring"
        style={{ minHeight: 44, borderRadius: 10, border: 'none', background: 'var(--color-primary-hover)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1 }}>
        {pending ? 'Đang gửi…' : 'Gửi yêu cầu'}
      </button>
    </form>
  );
}
