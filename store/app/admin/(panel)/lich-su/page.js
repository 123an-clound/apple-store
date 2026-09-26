import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '../../components/PageHeader';
import { auditChanges, auditSubject, formatDateTime, ACTION_LABELS } from '../../components/audit';

export const metadata = { title: 'Lịch sử thay đổi' };

const PAGE = 50;
const TABLES = { kho_iphone: 'Sản phẩm', apple_leads: 'Khách hàng', apple_settings: 'Cài đặt', apple_admins: 'Quản trị viên' };
const ACTION_CLS = {
  INSERT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  UPDATE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export default async function HistoryPage({ searchParams }) {
  const { supabase } = await requireAdmin('viewer');
  const sp = await searchParams;
  const table = TABLES[sp.table] ? sp.table : '';
  const action = ACTION_LABELS[sp.action] ? sp.action : '';
  const page = Math.max(0, Number.parseInt(sp.page ?? '0', 10) || 0);

  let query = supabase.from('apple_audit_log').select('*', { count: 'exact' }).order('at', { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE - 1);
  if (table) query = query.eq('table_name', table);
  if (action) query = query.eq('action', action);
  const { data, count, error } = await query;

  const href = (p) => {
    const u = new URLSearchParams();
    if (table) u.set('table', table);
    if (action) u.set('action', action);
    if (p) u.set('page', String(p));
    const s = u.toString();
    return `/admin/lich-su${s ? `?${s}` : ''}`;
  };
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  return (
    <>
      <PageHeader title="Lịch sử thay đổi" description="Mọi thao tác thêm/sửa/xoá đều được ghi lại tự động ở cơ sở dữ liệu." />
      <div className="a-card">
        <form className="flex flex-wrap items-end gap-3 border-b border-[var(--line)] p-4" action="/admin/lich-su">
          <div>
            <label htmlFor="f-table" className="a-label">Mục</label>
            <select id="f-table" name="table" defaultValue={table} className="a-input w-auto">
              <option value="">Tất cả</option>
              {Object.entries(TABLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-action" className="a-label">Thao tác</label>
            <select id="f-action" name="action" defaultValue={action} className="a-input w-auto">
              <option value="">Tất cả</option>
              {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className="a-btn a-btn-ghost">Lọc</button>
          <span className="a-subtle ml-auto text-sm tabular-nums">{count ?? 0} bản ghi</span>
        </form>

        {error && <p role="alert" className="p-4 text-sm text-red-700">{error.message}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Nhật ký thay đổi</caption>
            <thead className="border-b border-[var(--line)] bg-[var(--panel-muted)]">
              <tr>
                <th scope="col" className="a-th w-40">Thời gian</th>
                <th scope="col" className="a-th w-20">Thao tác</th>
                <th scope="col" className="a-th">Đối tượng &amp; thay đổi</th>
                <th scope="col" className="a-th w-56">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {(data ?? []).map((e) => {
                const changes = auditChanges(e);
                const subject = auditSubject(e);
                return (
                  <tr key={e.id} className="align-top">
                    <td className="a-td a-subtle whitespace-nowrap tabular-nums">{formatDateTime(e.at)}</td>
                    <td className="a-td"><span className={`a-chip ${ACTION_CLS[e.action]}`}>{ACTION_LABELS[e.action]}</span></td>
                    <td className="a-td">
                      {e.table_name === 'kho_iphone' && e.action !== 'DELETE'
                        ? <Link href={`/admin/san-pham/${e.row_id}`} className="font-medium hover:text-[var(--color-accent)] hover:underline">{subject}</Link>
                        : <span className="font-medium">{subject}</span>}
                      {changes.length > 0 && (
                        <ul className="a-muted mt-1 space-y-0.5 text-[13px]">
                          {changes.map((c) => <li key={c.field}>{c.field}: <s>{c.from}</s> → <strong className="text-[var(--fg)]">{c.to}</strong></li>)}
                        </ul>
                      )}
                    </td>
                    <td className="a-td a-muted break-all">{e.actor_email ?? 'hệ thống'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(data ?? []).length === 0 && !error && <p className="a-subtle px-4 py-16 text-center text-sm">Chưa có bản ghi nào.</p>}
        </div>
        {pages > 1 && (
          <nav aria-label="Phân trang" className="flex items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3 text-sm">
            {page > 0 ? <Link href={href(page - 1)} className="a-btn a-btn-ghost a-btn-sm">Trước</Link> : <span className="a-btn a-btn-ghost a-btn-sm opacity-50">Trước</span>}
            <span className="a-subtle tabular-nums">Trang {page + 1}/{pages}</span>
            {page < pages - 1 ? <Link href={href(page + 1)} className="a-btn a-btn-ghost a-btn-sm">Sau</Link> : <span className="a-btn a-btn-ghost a-btn-sm opacity-50">Sau</span>}
          </nav>
        )}
      </div>
    </>
  );
}
