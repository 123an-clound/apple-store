'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { buildImageUrl } from '@/lib/helpers';
import { listImages } from './storage';

// Pick an existing image from the bucket. `onPick(name)` receives the object name.
export default function MediaPicker({ open, onClose, onPick }) {
  const ref = useRef(null);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      listImages().then(setItems, (e) => setError(e.message));
    }
    if (!open && d.open) d.close();
  }, [open]);

  const shown = (items ?? []).filter((o) => o.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="picker-title"
      className="m-auto w-[min(880px,calc(100vw-2rem))] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-0 text-[var(--fg)] shadow-2xl backdrop:bg-black/40">
      <div className="flex items-center gap-3 border-b border-[var(--line)] p-4">
        <h2 id="picker-title" className="font-semibold">Chọn ảnh từ thư viện</h2>
        <div className="relative ml-auto w-full max-w-xs">
          <Search size={15} className="a-subtle pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên file…" aria-label="Tìm ảnh" className="a-input h-9 pl-9" />
        </div>
        <button type="button" onClick={onClose} className="a-btn a-btn-ghost a-btn-sm" aria-label="Đóng"><X size={16} /></button>
      </div>
      <div className="max-h-[65vh] overflow-y-auto p-4">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!items && !error && <p className="a-subtle text-sm">Đang tải…</p>}
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {shown.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => { onPick(o.name); onClose(); }}
                className="group w-full rounded-lg border border-[var(--line)] p-1.5 text-left hover:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]">
                <span className="relative block aspect-square overflow-hidden rounded bg-[var(--panel-muted)]">
                  <Image src={buildImageUrl(o.name)} alt="" fill sizes="160px" className="object-contain p-1" />
                </span>
                <span className="a-subtle mt-1 block truncate text-[11px]" title={o.name}>{o.name}</span>
              </button>
            </li>
          ))}
        </ul>
        {items && shown.length === 0 && <p className="a-subtle py-8 text-center text-sm">Không có ảnh phù hợp.</p>}
      </div>
    </dialog>
  );
}
