'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2 } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/roles';
import { setAdminRole } from '../../actions';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Confirm';
import { timeAgo } from '../../components/audit';

const ROLE_HINTS = {
  owner: 'Toàn quyền, gồm cài đặt và quản trị viên',
  editor: 'Thêm/sửa/xoá sản phẩm, ảnh, khách hàng',
  viewer: 'Chỉ xem, không sửa được gì',
};

export default function AdminsManager({ admins, selfId }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  const apply = (targetEmail, newRole, msg) => startTransition(async () => {
    const res = await setAdminRole(targetEmail, newRole);
    toast(res, msg);
    if (!res.error) { setEmail(''); router.refresh(); }
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="a-card overflow-hidden lg:col-span-2" aria-labelledby="list-h">
        <h2 id="list-h" className="border-b border-[var(--line)] px-5 py-4 font-semibold">Danh sách ({admins.length})</h2>
        <ul className="divide-y divide-[var(--line)]" aria-busy={pending}>
          {admins.map((a) => {
            const self = a.user_id === selfId;
            return (
              <li key={a.user_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.email} {self && <span className="a-chip ml-1 bg-[var(--color-accent-soft)] text-[var(--color-accent)]">Bạn</span>}</p>
                  <p className="a-subtle text-xs">Đăng nhập gần nhất: {a.last_sign_in_at ? timeAgo(a.last_sign_in_at) : 'chưa từng'}</p>
                </div>
                <select value={a.role} disabled={self || pending} aria-label={`Quyền của ${a.email}`}
                  onChange={(e) => apply(a.email, e.target.value, 'Đã đổi quyền')} className="a-input h-9 w-40">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                {!self && (
                  <button type="button" disabled={pending} className="a-btn a-btn-ghost a-btn-sm text-red-700" aria-label={`Gỡ quyền ${a.email}`}
                    onClick={async () => {
                      if (await confirm(`Gỡ quyền quản trị của ${a.email}? Tài khoản vẫn tồn tại nhưng không vào được trang quản trị.`, { danger: true, confirmLabel: 'Gỡ quyền' })) {
                        apply(a.email, null, 'Đã gỡ quyền');
                      }
                    }}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="a-card p-5" aria-labelledby="add-h">
        <h2 id="add-h" className="font-semibold">Thêm quản trị viên</h2>
        <p className="a-subtle mt-1 mb-4 text-xs">
          Người này cần có tài khoản Supabase Auth trước (Dashboard → Authentication → Add user / Invite).
        </p>
        <form onSubmit={(e) => { e.preventDefault(); apply(email, role, 'Đã thêm quản trị viên'); }} className="space-y-4">
          <div>
            <label htmlFor="new-email" className="a-label">Email</label>
            <input id="new-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="a-input" />
          </div>
          <fieldset>
            <legend className="a-label">Quyền</legend>
            <div className="space-y-2">
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <label key={k} className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input type="radio" name="role" value={k} checked={role === k} onChange={() => setRole(k)} className="mt-1 accent-[var(--color-accent)]" />
                  <span><span className="font-medium">{v}</span><span className="a-subtle block text-xs">{ROLE_HINTS[k]}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" disabled={pending || !email} className="a-btn a-btn-primary w-full"><UserPlus size={16} aria-hidden="true" /> Thêm</button>
        </form>
      </section>
    </div>
  );
}
