import Link from 'next/link';
import { Smartphone, EyeOff, PackageX, Tag, ImageOff, Users, ArrowRight, Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { hasRole } from '@/lib/roles';
import { getSeries, sortSeries, parsePrice, effectivePrice, formatPrice, IMAGE_COLUMNS } from '@/lib/helpers';
import PageHeader from '../components/PageHeader';
import { auditSubject, auditChanges, timeAgo, ACTION_LABELS } from '../components/audit';
import { LEAD_STATUS, LEAD_KIND } from '../components/leads';

export const metadata = { title: 'Tổng quan' };

function Stat({ icon: Icon, label, value, hint, href, tone = 'default' }) {
  const toneCls = {
    default: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
    warn: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  }[tone];
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="a-muted text-sm font-medium">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${toneCls}`}><Icon size={16} aria-hidden="true" /></span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="a-subtle mt-1 text-xs">{hint}</p>}
    </>
  );
  return href
    ? <Link href={href} className="a-card block p-5 transition-colors hover:border-[var(--color-accent)]">{body}</Link>
    : <div className="a-card p-5">{body}</div>;
}

export default async function DashboardPage() {
  const { supabase, role } = await requireAdmin('viewer');

  // `?? []`: Supabase returns data: null (not undefined) on error.
  const [rowsRes, leadsRes, auditRes] = await Promise.all([
    supabase.from('kho_iphone').select('*'),
    supabase.from('apple_leads').select('id, created_at, name, phone, kind, product, status').order('created_at', { ascending: false }).limit(200),
    supabase.from('apple_audit_log').select('*').order('at', { ascending: false }).limit(8),
  ]);
  const rows = rowsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const audit = auditRes.data ?? [];

  const visible = rows.filter((r) => r.is_visible);
  const models = new Set(visible.map((r) => r['Tên sản phẩm']));
  const prices = visible.map(effectivePrice).filter(Number.isFinite);
  const soldOut = rows.filter((r) => r.stock === 0).length;
  const lowStock = rows.filter((r) => r.stock > 0 && r.stock <= 2).length;
  const onSale = visible.filter((r) => effectivePrice(r) < parsePrice(r['Giá'])).length;
  const noImage = rows.filter((r) => !IMAGE_COLUMNS.some((c) => r[c])).length;
  const newLeads = leads.filter((l) => l.status === 'new');
  const leadsByStatus = Object.keys(LEAD_STATUS).map((s) => ({ s, n: leads.filter((l) => l.status === s).length }));
  const conversion = leads.length ? Math.round((leadsByStatus.find((x) => x.s === 'won').n / leads.length) * 100) : 0;

  // Per-series breakdown for the chart.
  const bySeries = new Map();
  for (const r of visible) {
    const s = getSeries(r['Tên sản phẩm']);
    const e = bySeries.get(s) ?? { variants: 0, models: new Set(), min: Infinity, max: 0 };
    const p = effectivePrice(r);
    e.variants++;
    e.models.add(r['Tên sản phẩm']);
    if (Number.isFinite(p)) { e.min = Math.min(e.min, p); e.max = Math.max(e.max, p); }
    bySeries.set(s, e);
  }
  const series = sortSeries([...bySeries.keys()]).map((s) => ({ name: s, ...bySeries.get(s) }));
  const maxVariants = Math.max(1, ...series.map((s) => s.variants));
  const priceCeil = Math.max(1, ...series.map((s) => s.max));

  return (
    <>
      <PageHeader title="Tổng quan" description="Tình hình kho hàng và khách hàng.">
        {hasRole(role, 'editor') && (
          <Link href="/admin/san-pham/moi" className="a-btn a-btn-primary"><Plus size={16} aria-hidden="true" /> Thêm sản phẩm</Link>
        )}
      </PageHeader>

      <section aria-label="Chỉ số chính" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Smartphone} label="Mẫu đang bán" value={models.size} hint={`${visible.length} phiên bản · ${series.length} dòng`} href="/admin/san-pham" />
        <Stat icon={Users} label="Khách chờ gọi" value={newLeads.length} hint={`${leads.length} yêu cầu · chốt ${conversion}%`} href="/admin/khach-hang" tone={newLeads.length ? 'danger' : 'default'} />
        <Stat icon={Tag} label="Giá trung bình" value={prices.length ? formatPrice(Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)) : '—'}
          hint={prices.length ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}` : undefined} />
        <Stat icon={PackageX} label="Hết / sắp hết hàng" value={`${soldOut} / ${lowStock}`} hint="Tồn kho = 0 / ≤ 2" href="/admin/san-pham?stock=low" tone={soldOut ? 'warn' : 'default'} />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/san-pham?vis=hidden" className="a-card flex items-center gap-3 p-4 hover:border-[var(--color-accent)]">
          <EyeOff size={18} className="a-subtle" aria-hidden="true" />
          <span className="flex-1 text-sm">Đang ẩn</span><strong className="tabular-nums">{rows.length - visible.length}</strong>
        </Link>
        <Link href="/admin/san-pham?sale=1" className="a-card flex items-center gap-3 p-4 hover:border-[var(--color-accent)]">
          <Tag size={18} className="a-subtle" aria-hidden="true" />
          <span className="flex-1 text-sm">Đang giảm giá</span><strong className="tabular-nums">{onSale}</strong>
        </Link>
        <Link href="/admin/san-pham?img=none" className="a-card flex items-center gap-3 p-4 hover:border-[var(--color-accent)]">
          <ImageOff size={18} className={noImage ? 'text-amber-600' : 'a-subtle'} aria-hidden="true" />
          <span className="flex-1 text-sm">Thiếu ảnh</span><strong className="tabular-nums">{noImage}</strong>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="a-card p-5 xl:col-span-3" aria-labelledby="series-heading">
          <h2 id="series-heading" className="font-semibold">Theo dòng máy</h2>
          <p className="a-subtle mb-5 text-xs">Số phiên bản đang bán và khoảng giá</p>
          <table className="w-full text-sm">
            <thead className="sr-only"><tr><th>Dòng</th><th>Số phiên bản</th><th>Khoảng giá</th></tr></thead>
            <tbody>
              {series.map((s) => (
                <tr key={s.name} className="align-middle">
                  <th scope="row" className="w-24 py-2 pr-3 text-left font-medium whitespace-nowrap">{s.name}</th>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 flex-1 rounded-full bg-[var(--panel-muted)]">
                        <div className="h-2.5 rounded-full bg-[var(--color-accent)]" style={{ width: `${(s.variants / maxVariants) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right tabular-nums">{s.variants} <span className="a-subtle">bản</span></span>
                    </div>
                  </td>
                  <td className="hidden w-[40%] py-2 sm:table-cell">
                    <div className="relative h-2.5 rounded-full bg-[var(--panel-muted)]" title={`${formatPrice(s.min)} – ${formatPrice(s.max)}`}>
                      <div className="absolute h-2.5 rounded-full bg-emerald-600/80"
                        style={{ left: `${(s.min / priceCeil) * 100}%`, width: `${Math.max(1.5, ((s.max - s.min) / priceCeil) * 100)}%` }} />
                    </div>
                    <p className="a-subtle mt-1 text-[11px] tabular-nums">{formatPrice(s.min)} – {formatPrice(s.max)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {series.length === 0 && <p className="a-subtle text-sm">Chưa có sản phẩm hiển thị.</p>}
        </section>

        <section className="a-card p-5 xl:col-span-2" aria-labelledby="leads-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="leads-heading" className="font-semibold">Khách mới</h2>
            <Link href="/admin/khach-hang" className="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
              Tất cả <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-[var(--panel-muted)]" aria-hidden="true">
            {leadsByStatus.map(({ s, n }) => n > 0 && (
              <div key={s} className={LEAD_STATUS[s].cls.split(' ')[0]} style={{ width: `${(n / leads.length) * 100}%` }} />
            ))}
          </div>
          <ul className="mb-4 flex flex-wrap gap-2 text-xs">
            {leadsByStatus.map(({ s, n }) => (
              <li key={s} className={`a-chip ${LEAD_STATUS[s].cls}`}>{LEAD_STATUS[s].label}: {n}</li>
            ))}
          </ul>
          <ul className="divide-y divide-[var(--line)]">
            {newLeads.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.name} · <a href={`tel:${l.phone}`} className="text-[var(--color-accent)] hover:underline">{l.phone}</a></p>
                  <p className="a-subtle truncate text-xs">{LEAD_KIND[l.kind]}{l.product ? ` · ${l.product}` : ''}</p>
                </div>
                <span className="a-subtle shrink-0 text-xs">{timeAgo(l.created_at)}</span>
              </li>
            ))}
            {newLeads.length === 0 && <li className="a-subtle py-6 text-center text-sm">Không có khách đang chờ.</li>}
          </ul>
        </section>
      </div>

      <section className="a-card mt-6 p-5" aria-labelledby="activity-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="activity-heading" className="font-semibold">Hoạt động gần đây</h2>
          <Link href="/admin/lich-su" className="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
            Xem lịch sử <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {audit.map((e) => {
            const changes = auditChanges(e);
            return (
              <li key={e.id} className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-4">
                <span className="a-subtle w-28 shrink-0 text-xs">{timeAgo(e.at)}</span>
                <span className="min-w-0 flex-1">
                  <strong className="font-medium">{ACTION_LABELS[e.action]}</strong> {auditSubject(e)}
                  {changes.length > 0 && (
                    <span className="a-muted"> — {changes.slice(0, 2).map((c) => `${c.field}: ${c.from} → ${c.to}`).join('; ')}{changes.length > 2 ? '…' : ''}</span>
                  )}
                </span>
                <span className="a-subtle truncate text-xs sm:w-48 sm:text-right">{e.actor_email ?? 'hệ thống'}</span>
              </li>
            );
          })}
          {audit.length === 0 && <li className="a-subtle py-6 text-center text-sm">Chưa có thay đổi nào.</li>}
        </ul>
      </section>
    </>
  );
}
