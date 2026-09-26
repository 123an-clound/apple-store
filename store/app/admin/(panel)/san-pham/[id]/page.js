import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { hasRole } from '@/lib/roles';
import { formatPrice } from '@/lib/helpers';
import PageHeader from '../../../components/PageHeader';
import { auditChanges, formatDateTime, ACTION_LABELS } from '../../../components/audit';
import ProductForm from '../ProductForm';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Sản phẩm #${id}` };
}

export default async function EditProductPage({ params }) {
  const { supabase, role } = await requireAdmin('viewer');
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { data: row } = await supabase.from('kho_iphone').select('*').eq('id', id).maybeSingle();
  if (!row) notFound();

  const [{ data: siblings }, { data: history }, { data: all }] = await Promise.all([
    supabase.from('kho_iphone').select('id, "Dung Lượng RAM/ROM", "Giá", is_visible').eq('Tên sản phẩm', row['Tên sản phẩm']).order('id'),
    supabase.from('apple_audit_log').select('*').eq('table_name', 'kho_iphone').eq('row_id', id).order('at', { ascending: false }).limit(30),
    supabase.from('kho_iphone').select('"Tên sản phẩm"'),
  ]);
  const names = [...new Set((all ?? []).map((r) => r['Tên sản phẩm']).filter(Boolean))].sort();

  return (
    <>
      <Link href="/admin/san-pham" className="a-muted mb-3 inline-flex items-center gap-1 text-sm hover:text-[var(--fg)]">
        <ChevronLeft size={16} aria-hidden="true" /> Sản phẩm
      </Link>
      <PageHeader title={`${row['Tên sản phẩm']} ${row['Dung Lượng RAM/ROM'] ?? ''}`} description={`Mã #${row.id} · STT ${row.stt ?? '—'}`} />

      {siblings?.length > 1 && (
        <nav aria-label="Các phiên bản cùng mẫu" className="mb-6 flex flex-wrap gap-2">
          {siblings.map((s) => (
            <Link key={s.id} href={`/admin/san-pham/${s.id}`} aria-current={String(s.id) === id ? 'page' : undefined}
              className={`a-chip border px-3 py-1 text-[13px] ${String(s.id) === id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--line)] hover:border-[var(--color-accent)]'} ${s.is_visible ? '' : 'opacity-60'}`}>
              {s['Dung Lượng RAM/ROM'] || 'Bản chuẩn'} · {formatPrice(s['Giá'])}
            </Link>
          ))}
        </nav>
      )}

      {/* key: switching variant remounts the form with fresh state */}
      <ProductForm key={row.id} row={row} canEdit={hasRole(role, 'editor')} names={names} />

      <section className="a-card mt-6 p-5" aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-4 font-semibold">Lịch sử thay đổi</h2>
        <ol className="space-y-3 border-l border-[var(--line)] pl-4">
          {(history ?? []).map((e) => {
            const changes = auditChanges(e);
            return (
              <li key={e.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                <p><strong className="font-medium">{ACTION_LABELS[e.action]}</strong> <span className="a-subtle">· {formatDateTime(e.at)} · {e.actor_email ?? 'hệ thống'}</span></p>
                {changes.length > 0 && (
                  <ul className="a-muted mt-1 space-y-0.5 text-[13px]">
                    {changes.map((c) => <li key={c.field}>{c.field}: <s>{c.from}</s> → <strong className="text-[var(--fg)]">{c.to}</strong></li>)}
                  </ul>
                )}
              </li>
            );
          })}
          {(history ?? []).length === 0 && <li className="a-subtle text-sm">Chưa có thay đổi nào từ khi bật lịch sử.</li>}
        </ol>
      </section>
    </>
  );
}
