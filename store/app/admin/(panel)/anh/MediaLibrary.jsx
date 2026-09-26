'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Upload, Trash2, Link2, AlertTriangle, Loader2 } from 'lucide-react';
import { buildImageUrl } from '@/lib/helpers';
import { deleteImages } from '../../actions';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Confirm';
import { listImages, uploadImage } from '../../components/storage';
import CropDialog from '../../components/CropDialog';

const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaLibrary({ refs, canEdit }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();
  const [cropFile, setCropFile] = useState(null);

  const load = useCallback(() => listImages().then(setItems, (e) => setLoadError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const names = new Set((items ?? []).map((o) => o.name));
  const missing = Object.entries(refs).filter(([n]) => items && !names.has(n));
  const unusedCount = (items ?? []).filter((o) => !refs[o.name]).length;
  const totalSize = (items ?? []).reduce((a, o) => a + (o.metadata?.size ?? 0), 0);

  const shown = (items ?? []).filter((o) => {
    if (filter === 'unused' && refs[o.name]) return false;
    if (filter === 'used' && !refs[o.name]) return false;
    return o.name.toLowerCase().includes(q.trim().toLowerCase());
  });

  // A single image goes through the crop editor; a batch uploads as-is.
  const uploadFiles = async (files, { crop = true, hint } = {}) => {
    const list = [...files];
    if (!list.length) return;
    if (crop && list.length === 1) { setCropFile(list[0]); return; }
    setUploading(list.length);
    let ok = 0;
    for (const file of list) {
      try { await uploadImage(file, hint ?? file.name.replace(/\.[^.]+$/, '')); ok++; }
      catch (e) { toast(`${file.name}: ${e.message}`, 'error'); }
      setUploading((n) => n - 1);
    }
    if (ok) toast(`Đã tải lên ${ok} ảnh`);
    load();
  };

  const toggle = (name) => setSelected((s) => { const n = new Set(s); if (n.has(name)) n.delete(name); else n.add(name); return n; });

  const removeSelected = async () => {
    const list = [...selected];
    const inUse = list.filter((n) => refs[n]);
    const msg = inUse.length
      ? `Xoá ${list.length} ảnh? ${inUse.length} ảnh đang được sản phẩm sử dụng và sẽ bị vỡ trên web.`
      : `Xoá vĩnh viễn ${list.length} ảnh không dùng?`;
    if (!(await confirm(msg, { danger: true, confirmLabel: 'Xoá ảnh' }))) return;
    startTransition(async () => {
      const res = await deleteImages(list);
      toast(res, `Đã xoá ${list.length} ảnh`);
      if (!res.error) { setSelected(new Set()); load(); }
    });
  };

  const copyUrl = async (name) => {
    try { await navigator.clipboard.writeText(buildImageUrl(name)); toast('Đã sao chép link ảnh'); }
    catch { toast('Không sao chép được', 'error'); }
  };

  return (
    <>
      <PageHeader title="Thư viện ảnh"
        description={items ? `${items.length} ảnh · ${kb(totalSize)} · ${unusedCount} ảnh chưa dùng` : 'Đang tải…'}>
        {canEdit && (
          <label className="a-btn a-btn-primary cursor-pointer">
            <Upload size={16} aria-hidden="true" /> Tải ảnh lên
            <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only"
              onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
          </label>
        )}
      </PageHeader>

      {missing.length > 0 && (
        <section className="a-card mb-6 border-amber-300 p-4 dark:border-amber-800" aria-labelledby="missing-h">
          <h2 id="missing-h" className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle size={16} aria-hidden="true" /> {missing.length} ảnh được tham chiếu nhưng không có trong kho
          </h2>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {missing.map(([n, users]) => (
              <li key={n} className="a-muted">
                <code className="text-xs">{n}</code> — {users.map((u, i) => (
                  <span key={u.id}>{i > 0 && ', '}<Link href={`/admin/san-pham/${u.id}`} className="text-[var(--color-accent)] hover:underline">{u.label}</Link></span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div
        className={`a-card transition-colors ${dragOver ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : ''}`}
        onDragOver={(e) => { if (canEdit) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (canEdit) uploadFiles(e.dataTransfer.files); }}>
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center">
          <input data-admin-search value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên file… (phím /)" aria-label="Tìm ảnh" className="a-input sm:max-w-xs" />
          <div className="flex gap-1 rounded-lg border border-[var(--line)] p-1" role="group" aria-label="Lọc ảnh">
            {[['all', 'Tất cả'], ['used', 'Đang dùng'], ['unused', 'Chưa dùng']].map(([k, label]) => (
              <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
                className={`rounded-md px-3 py-1 text-sm ${filter === k ? 'bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]' : 'a-muted'}`}>{label}</button>
            ))}
          </div>
          {uploading > 0 && <span className="a-muted flex items-center gap-2 text-sm" role="status"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Đang tải {uploading} ảnh…</span>}
          {canEdit && selected.size > 0 && (
            <div className="flex gap-2 sm:ml-auto">
              {filter === 'unused' && (
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setSelected(new Set(shown.map((o) => o.name)))}>Chọn tất cả</button>
              )}
              <button type="button" onClick={removeSelected} disabled={pending} className="a-btn a-btn-danger a-btn-sm">
                <Trash2 size={14} aria-hidden="true" /> Xoá {selected.size}
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {loadError && <p role="alert" className="text-sm text-red-700">Không tải được thư viện: {loadError}</p>}
          {!items && !loadError && <p className="a-subtle text-sm">Đang tải…</p>}
          {canEdit && items && <p className="a-subtle mb-3 text-xs">Kéo thả ảnh vào khung này để tải lên.</p>}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {shown.map((o) => {
              const users = refs[o.name];
              const checked = selected.has(o.name);
              return (
                <li key={o.id} className={`group rounded-lg border p-1.5 ${checked ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30' : 'border-[var(--line)]'}`}>
                  <div className="relative aspect-square overflow-hidden rounded bg-[var(--panel-muted)]">
                    <Image src={buildImageUrl(o.name)} alt="" fill sizes="180px" className="object-contain p-1.5" />
                    {canEdit && (
                      <input type="checkbox" checked={checked} onChange={() => toggle(o.name)} aria-label={`Chọn ${o.name}`}
                        className="absolute left-1.5 top-1.5 size-4 accent-[var(--color-accent)]" />
                    )}
                    <span className={`a-chip absolute bottom-1.5 left-1.5 ${users ? 'bg-emerald-700 text-white' : 'bg-zinc-800/80 text-white'}`}>
                      {users ? `Dùng ${users.length}` : 'Chưa dùng'}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-xs font-medium" title={o.name}>{o.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="a-subtle text-[11px]">{o.metadata?.size ? kb(o.metadata.size) : ''}</span>
                    <button type="button" onClick={() => copyUrl(o.name)} className="a-subtle rounded p-1 hover:text-[var(--fg)]" aria-label={`Sao chép link ${o.name}`} title="Sao chép link">
                      <Link2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                  {users && (
                    <p className="a-subtle truncate text-[11px]" title={users.map((u) => u.label).join(', ')}>
                      <Link href={`/admin/san-pham/${users[0].id}`} className="hover:underline">{users[0].label}</Link>{users.length > 1 ? ` +${users.length - 1}` : ''}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {items && shown.length === 0 && <p className="a-subtle py-10 text-center text-sm">Không có ảnh phù hợp.</p>}
        </div>
      </div>

      {cropFile && (
        <CropDialog source={cropFile}
          onDone={(file) => { const hint = cropFile.name.replace(/\.[^.]+$/, ''); setCropFile(null); uploadFiles([file], { crop: false, hint }); }}
          onSkip={() => { const f = cropFile; setCropFile(null); uploadFiles([f], { crop: false }); }}
          onCancel={() => setCropFile(null)} />
      )}
    </>
  );
}
