'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Download, Upload, Copy, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, ImageOff, X,
} from 'lucide-react';
import { hasRole } from '@/lib/roles';
import { getSeries, sortSeries, parsePrice, formatPrice, buildImageUrl, IMAGE_COLUMNS, BADGES } from '@/lib/helpers';
import { patchProduct, deleteProducts, bulkUpdate, duplicateProduct, importProducts } from '../../actions';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Confirm';
import { useRealtimeRefresh } from '../../components/useRealtimeRefresh';
import { parseCsv, toCsv, csvToProducts, PRODUCT_CSV_HEADER, productToCsvRow } from '../../components/csv';
import { timeAgo } from '../../components/audit';

const PAGE_SIZE = 25;

const SORTS = {
  name: (r) => r['Tên sản phẩm'] ?? '',
  price: (r) => parsePrice(r['Giá']),
  stock: (r) => r.stock ?? Infinity,
  updated: (r) => r.updated_at ?? '',
};

function firstImage(r) {
  for (const c of IMAGE_COLUMNS) {
    const url = buildImageUrl(r[c]);
    if (url) return url;
  }
  return null;
}

function PriceCell({ row, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const price = parsePrice(row['Giá']);
  const sale = row.sale_price && row.sale_price < price ? row.sale_price : null;

  if (editing) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget).get('price')); setEditing(false); }}>
        <input name="price" defaultValue={Number.isFinite(price) ? price : ''} autoFocus inputMode="numeric"
          aria-label={`Giá mới cho ${row['Tên sản phẩm']}`} className="a-input h-8 w-32 tabular-nums"
          onKeyDown={(e) => e.key === 'Escape' && setEditing(false)} onBlur={() => setEditing(false)} />
      </form>
    );
  }
  const label = (
    <>
      <span className={sale ? 'a-subtle text-xs line-through' : 'font-medium'}>{formatPrice(row['Giá'])}</span>
      {sale && <span className="block font-medium text-emerald-700 dark:text-emerald-400">{formatPrice(sale)}</span>}
    </>
  );
  return canEdit ? (
    <button type="button" onClick={() => setEditing(true)} title="Bấm để sửa giá"
      className="rounded px-1 -mx-1 text-left tabular-nums hover:bg-[var(--panel-muted)]">
      {label}<span className="sr-only"> — sửa giá</span>
    </button>
  ) : <span className="tabular-nums">{label}</span>;
}

function SortHeader({ k, sort, onSort, children }) {
  return (
    <th scope="col" className="a-th" aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className="inline-flex items-center gap-1 uppercase hover:text-[var(--fg)]">
        {children}
        {sort.key === k && (sort.dir === 'asc' ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />)}
      </button>
    </th>
  );
}

export default function ProductsTable({ rows, role, initial }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const canEdit = hasRole(role, 'editor');
  useRealtimeRefresh('kho_iphone');

  const [q, setQ] = useState(initial.q ?? '');
  const [series, setSeries] = useState('');
  const [vis, setVis] = useState(initial.vis ?? 'all');
  const [stock, setStock] = useState(initial.stock ?? 'all');
  const [onlySale, setOnlySale] = useState(initial.sale === '1');
  const [noImg, setNoImg] = useState(initial.img === 'none');
  const [sort, setSort] = useState({ key: 'updated', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const importDialog = useRef(null);

  const allSeries = useMemo(() => sortSeries([...new Set(rows.map((r) => getSeries(r['Tên sản phẩm'])))]), [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (needle && !`${r['Tên sản phẩm']} ${r['Dung Lượng RAM/ROM']} ${r['Mã sản phẩm']} ${r.id}`.toLowerCase().includes(needle)) return false;
      if (series && getSeries(r['Tên sản phẩm']) !== series) return false;
      if (vis === 'visible' && !r.is_visible) return false;
      if (vis === 'hidden' && r.is_visible) return false;
      if (stock === 'low' && !(r.stock !== null && r.stock <= 2)) return false;
      if (stock === 'out' && r.stock !== 0) return false;
      if (onlySale && !(r.sale_price && r.sale_price < parsePrice(r['Giá']))) return false;
      if (noImg && IMAGE_COLUMNS.some((c) => r[c])) return false;
      return true;
    });
    const key = SORTS[sort.key];
    const dir = sort.dir === 'asc' ? 1 : -1;
    return out.sort((a, b) => {
      const x = key(a); const y = key(b);
      return (typeof x === 'string' ? x.localeCompare(y, 'vi') : x - y) * dir;
    });
  }, [rows, q, series, vis, stock, onlySale, noImg, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visibleRows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  // Selection only counts rows that still exist (deleted rows drop out on refresh).
  const selectedIds = rows.filter((r) => selected.has(r.id)).map((r) => r.id);
  const allOnPageSelected = visibleRows.length > 0 && visibleRows.every((r) => selected.has(r.id));

  const run = (fn, success) => startTransition(async () => {
    const res = await fn();
    toast(res, success);
    if (!res?.error) router.refresh();
    return res;
  });

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  const toggleRow = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const togglePage = () => setSelected((s) => {
    const n = new Set(s);
    visibleRows.forEach((r) => (allOnPageSelected ? n.delete(r.id) : n.add(r.id)));
    return n;
  });
  const resetFilters = () => { setQ(''); setSeries(''); setVis('all'); setStock('all'); setOnlySale(false); setNoImg(false); setPage(0); };
  const filtersOn = q || series || vis !== 'all' || stock !== 'all' || onlySale || noImg;

  const bulkDelete = async () => {
    const ok = await confirm(`Xoá vĩnh viễn ${selectedIds.length} phiên bản? Thao tác được ghi vào lịch sử nhưng không thể hoàn tác.`, { danger: true, confirmLabel: 'Xoá' });
    if (!ok) return;
    run(() => deleteProducts(selectedIds), `Đã xoá ${selectedIds.length} phiên bản`);
    setSelected(new Set());
  };
  const bulkPrice = async (e) => {
    e.preventDefault();
    const pct = Number(new FormData(e.currentTarget).get('pct'));
    if (!pct) return;
    const ok = await confirm(`${pct > 0 ? 'Tăng' : 'Giảm'} giá ${Math.abs(pct)}% cho ${selectedIds.length} phiên bản (làm tròn 10.000đ)?`, { confirmLabel: 'Áp dụng' });
    if (ok) run(() => bulkUpdate(selectedIds, { type: 'price_percent', value: pct }), 'Đã cập nhật giá');
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(PRODUCT_CSV_HEADER, filtered.map(productToCsvRow))], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `san-pham-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const products = csvToProducts(parseCsv(await file.text()));
      if (products.length === 0) throw new Error('File không có dòng dữ liệu.');
      setPreview({ name: file.name, products });
      importDialog.current?.showModal();
    } catch (err) {
      toast(`Không đọc được file: ${err.message}`, 'error');
    }
  };
  const confirmImport = () => {
    importDialog.current?.close();
    const products = preview.products;
    setPreview(null);
    startTransition(async () => {
      const res = await importProducts(products);
      toast(res.error ? res : `Đã nhập: ${res.inserted} mới, ${res.updated} cập nhật`, 'success');
      if (!res.error) router.refresh();
    });
  };

  return (
    <>
      <PageHeader title="Sản phẩm" description={`${rows.length} phiên bản · ${new Set(rows.map((r) => r['Tên sản phẩm'])).size} mẫu máy`}>
        <button type="button" onClick={exportCsv} className="a-btn a-btn-ghost"><Download size={16} aria-hidden="true" /> Xuất CSV</button>
        {canEdit && (
          <>
            <button type="button" onClick={() => fileRef.current?.click()} className="a-btn a-btn-ghost" disabled={pending}>
              <Upload size={16} aria-hidden="true" /> Nhập CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} aria-hidden="true" tabIndex={-1} />
            <Link href="/admin/san-pham/moi" className="a-btn a-btn-primary"><Plus size={16} aria-hidden="true" /> Thêm sản phẩm</Link>
          </>
        )}
      </PageHeader>

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="a-subtle pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input data-admin-search value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Tìm theo tên, dung lượng, mã… (phím /)" aria-label="Tìm sản phẩm" className="a-input pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={series} onChange={(e) => { setSeries(e.target.value); setPage(0); }} className="a-input w-auto" aria-label="Lọc theo dòng">
              <option value="">Tất cả dòng</option>
              {allSeries.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={vis} onChange={(e) => { setVis(e.target.value); setPage(0); }} className="a-input w-auto" aria-label="Lọc hiển thị">
              <option value="all">Mọi trạng thái</option>
              <option value="visible">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
            </select>
            <select value={stock} onChange={(e) => { setStock(e.target.value); setPage(0); }} className="a-input w-auto" aria-label="Lọc tồn kho">
              <option value="all">Mọi tồn kho</option>
              <option value="low">Sắp hết (≤ 2)</option>
              <option value="out">Hết hàng</option>
            </select>
            <label className="a-btn a-btn-ghost cursor-pointer font-normal">
              <input type="checkbox" checked={onlySale} onChange={(e) => { setOnlySale(e.target.checked); setPage(0); }} className="accent-[var(--color-accent)]" /> Giảm giá
            </label>
            <label className="a-btn a-btn-ghost cursor-pointer font-normal">
              <input type="checkbox" checked={noImg} onChange={(e) => { setNoImg(e.target.checked); setPage(0); }} className="accent-[var(--color-accent)]" /> Thiếu ảnh
            </label>
            {filtersOn && (
              <button type="button" onClick={resetFilters} className="a-btn a-btn-ghost"><X size={15} aria-hidden="true" /> Xoá lọc</button>
            )}
          </div>
        </div>

        {canEdit && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--color-accent-soft)] px-4 py-2.5" role="region" aria-label="Thao tác hàng loạt">
            <span className="mr-2 text-sm font-medium">Đã chọn {selectedIds.length}</span>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={pending} onClick={() => run(() => bulkUpdate(selectedIds, { type: 'visibility', value: true }), 'Đã hiện sản phẩm')}>
              <Eye size={14} aria-hidden="true" /> Hiện
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={pending} onClick={() => run(() => bulkUpdate(selectedIds, { type: 'visibility', value: false }), 'Đã ẩn sản phẩm')}>
              <EyeOff size={14} aria-hidden="true" /> Ẩn
            </button>
            <select className="a-input h-8 w-auto text-[13px]" aria-label="Gán nhãn" disabled={pending} value=""
              onChange={(e) => run(() => bulkUpdate(selectedIds, { type: 'badge', value: e.target.value === 'none' ? null : e.target.value }), 'Đã gán nhãn')}>
              <option value="" disabled>Gán nhãn…</option>
              {Object.entries(BADGES).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}
              <option value="none">Bỏ nhãn</option>
            </select>
            <form onSubmit={bulkPrice} className="flex items-center gap-1">
              <input name="pct" type="number" step="1" min="-89" max="200" placeholder="±%" aria-label="Phần trăm thay đổi giá" className="a-input h-8 w-20 text-[13px]" />
              <button type="submit" className="a-btn a-btn-ghost a-btn-sm" disabled={pending}>Đổi giá</button>
            </form>
            <button type="button" className="a-btn a-btn-danger a-btn-sm ml-auto" disabled={pending} onClick={bulkDelete}>
              <Trash2 size={14} aria-hidden="true" /> Xoá
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setSelected(new Set())}>Bỏ chọn</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm" aria-busy={pending}>
            <caption className="sr-only">Danh sách phiên bản sản phẩm</caption>
            <thead className="border-b border-[var(--line)] bg-[var(--panel-muted)]">
              <tr>
                {canEdit && (
                  <th scope="col" className="a-th w-10">
                    <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} aria-label="Chọn tất cả trên trang" className="size-4 accent-[var(--color-accent)]" />
                  </th>
                )}
                <SortHeader k="name" sort={sort} onSort={toggleSort}>Sản phẩm</SortHeader>
                <SortHeader k="price" sort={sort} onSort={toggleSort}>Giá</SortHeader>
                <SortHeader k="stock" sort={sort} onSort={toggleSort}>Tồn kho</SortHeader>
                <th scope="col" className="a-th">Hiển thị</th>
                <SortHeader k="updated" sort={sort} onSort={toggleSort}>Cập nhật</SortHeader>
                <th scope="col" className="a-th text-right"><span className="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {visibleRows.map((r) => {
                const img = firstImage(r);
                const badge = r.badge && BADGES[r.badge];
                const name = `${r['Tên sản phẩm']} ${r['Dung Lượng RAM/ROM'] ?? ''}`.trim();
                return (
                  <tr key={r.id} className={`hover:bg-[var(--panel-muted)] ${selected.has(r.id) ? 'bg-[var(--color-accent-soft)]' : ''}`}>
                    {canEdit && (
                      <td className="a-td">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} aria-label={`Chọn ${name}`} className="size-4 accent-[var(--color-accent)]" />
                      </td>
                    )}
                    <td className="a-td">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel-muted)]">
                          {img
                            ? <Image src={img} alt="" fill sizes="44px" className="object-contain p-1" />
                            : <ImageOff size={16} className="a-subtle absolute inset-0 m-auto" aria-label="Chưa có ảnh" />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/san-pham/${r.id}`} className="font-medium hover:text-[var(--color-accent)] hover:underline">{r['Tên sản phẩm']}</Link>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="a-subtle">{r['Dung Lượng RAM/ROM'] || 'Bản chuẩn'} · #{r.id}</span>
                            {badge && <span className="a-chip text-white" style={{ background: badge.color }}>{badge.label}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="a-td">
                      <PriceCell row={r} canEdit={canEdit} onSave={(price) => run(() => patchProduct(r.id, { price }), 'Đã cập nhật giá')} />
                    </td>
                    <td className="a-td tabular-nums">
                      {r.stock === null ? <span className="a-subtle">—</span>
                        : r.stock === 0 ? <span className="a-chip bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Hết hàng</span>
                          : r.stock <= 2 ? <span className="a-chip bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Còn {r.stock}</span>
                            : r.stock}
                    </td>
                    <td className="a-td">
                      <button type="button" role="switch" aria-checked={r.is_visible} aria-label={`Hiển thị ${name}`}
                        disabled={!canEdit || pending} onClick={() => run(() => patchProduct(r.id, { is_visible: !r.is_visible }), r.is_visible ? 'Đã ẩn' : 'Đã hiện')}
                        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${r.is_visible ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${r.is_visible ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="a-td a-subtle whitespace-nowrap text-xs">{r.updated_at ? timeAgo(r.updated_at) : '—'}</td>
                    <td className="a-td">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/san-pham/${r.id}`} className="a-btn a-btn-ghost a-btn-sm" aria-label={`Sửa ${name}`} title="Sửa">
                          <Pencil size={14} aria-hidden="true" />
                        </Link>
                        {canEdit && (
                          <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label={`Nhân bản ${name}`} title="Nhân bản" disabled={pending}
                            onClick={() => startTransition(async () => {
                              const res = await duplicateProduct(r.id);
                              toast(res, 'Đã nhân bản (đang ẩn)');
                              if (res.id) router.push(`/admin/san-pham/${res.id}`);
                            })}>
                            <Copy size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="font-medium">Không có sản phẩm phù hợp</p>
              {filtersOn && <button type="button" onClick={resetFilters} className="mt-2 text-sm text-[var(--color-accent)] hover:underline">Xoá bộ lọc</button>}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <nav aria-label="Phân trang" className="flex items-center justify-between border-t border-[var(--line)] px-4 py-3 text-sm">
            <span className="a-subtle tabular-nums">
              {current * PAGE_SIZE + 1}–{Math.min((current + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div className="flex gap-2">
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Trước</button>
              <span className="a-subtle self-center tabular-nums">Trang {current + 1}/{pages}</span>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Sau</button>
            </div>
          </nav>
        )}
      </div>

      <dialog ref={importDialog} onClose={() => setPreview(null)} aria-labelledby="import-title"
        className="m-auto w-[min(720px,calc(100vw-2rem))] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 text-[var(--fg)] shadow-2xl backdrop:bg-black/40">
        {preview && (
          <>
            <h2 id="import-title" className="text-base font-semibold">Nhập {preview.products.length} dòng từ {preview.name}</h2>
            <p className="a-muted mt-1 text-sm">
              {preview.products.filter((p) => p.id).length} dòng có id sẽ được cập nhật, {preview.products.filter((p) => !p.id).length} dòng sẽ được thêm mới.
              Ảnh sản phẩm không bị thay đổi.
            </p>
            <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-[var(--line)]">
              <table className="w-full text-xs">
                <thead className="bg-[var(--panel-muted)]"><tr>{['id', 'Tên', 'Dung lượng', 'Giá', 'Giá KM', 'Tồn', 'Hiện'].map((h) => <th key={h} className="a-th">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {preview.products.slice(0, 50).map((p, i) => (
                    <tr key={i}>
                      <td className="a-td">{p.id ?? 'mới'}</td><td className="a-td">{p.name}</td><td className="a-td">{p.spec}</td>
                      <td className="a-td tabular-nums">{formatPrice(p.price)}</td><td className="a-td tabular-nums">{p.sale_price ? formatPrice(p.sale_price) : ''}</td>
                      <td className="a-td">{p.stock ?? ''}</td><td className="a-td">{p.is_visible ? 'Có' : 'Không'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="a-btn a-btn-ghost" onClick={() => importDialog.current?.close()}>Huỷ</button>
              <button type="button" className="a-btn a-btn-primary" onClick={confirmImport}>Nhập dữ liệu</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
