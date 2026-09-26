'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, Maximize, Minimize, Undo2, Loader2, AlertTriangle } from 'lucide-react';

// Product shots are shown square (object-contain) everywhere on the storefront,
// so the editor works on a square frame and exports a square image.
const VIEW = 320; // on-screen frame, CSS px
const OUT = 1200; // exported image, px
const SMALL = 600; // below this the source will look soft when enlarged

async function loadImage(source) {
  const img = new Image();
  // Supabase public URLs send CORS headers; without this the canvas is tainted
  // and toBlob() throws when re-editing an already uploaded image.
  img.crossOrigin = 'anonymous';
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  img.src = url;
  try {
    await img.decode();
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url);
  }
  return img;
}

function draw(ctx, size, img, { zoom, x, y, rot, bg }) {
  const k = size / VIEW;
  const turned = rot % 180 !== 0;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  // zoom 1 = whole image fits inside the frame ("contain").
  const base = VIEW / Math.max(turned ? h : w, turned ? w : h);
  const s = base * zoom * k;
  ctx.clearRect(0, 0, size, size);
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
  ctx.save();
  ctx.translate(size / 2 + x * k, size / 2 + y * k);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (-w * s) / 2, (-h * s) / 2, w * s, h * s);
  ctx.restore();
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

const INITIAL = { zoom: 1, x: 0, y: 0, rot: 0, bg: '' };

// source: File (new upload) or URL string (re-edit an existing image).
// onDone(File) with the edited square image; onSkip() uploads the original.
export default function CropDialog({ source, onDone, onSkip, onCancel }) {
  const dialogRef = useRef(null);
  const canvasRef = useRef(null);
  const drag = useRef(null);
  const [img, setImg] = useState(null);
  const [error, setError] = useState('');
  const [t, setT] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
    let alive = true;
    loadImage(source).then(
      (i) => alive && setImg(i),
      () => alive && setError('Không đọc được ảnh này.')
    );
    return () => { alive = false; };
  }, [source]);

  // Redraw the preview on every change, at device resolution so it stays sharp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIEW * dpr;
    canvas.height = VIEW * dpr;
    draw(canvas.getContext('2d'), VIEW * dpr, img, t);
  }, [img, t]);

  const fillZoom = img
    ? Math.max(img.naturalWidth, img.naturalHeight) / Math.min(img.naturalWidth, img.naturalHeight)
    : 1;
  const set = useCallback((patch) => setT((s) => ({ ...s, ...patch })), []);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: t.x, y: t.y };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    set({ x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) });
  };
  const onKeyDown = (e) => {
    const step = e.shiftKey ? 20 : 4;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); set({ x: t.x + moves[e.key][0], y: t.y + moves[e.key][1] }); }
    if (e.key === '+' || e.key === '=') set({ zoom: Math.min(4, t.zoom + 0.05) });
    if (e.key === '-') set({ zoom: Math.max(0.2, t.zoom - 0.05) });
  };

  const save = async () => {
    setSaving(true);
    try {
      const out = document.createElement('canvas');
      out.width = OUT;
      out.height = OUT;
      draw(out.getContext('2d'), OUT, img, t);
      // WebP keeps transparency at a fraction of PNG size; fall back to PNG
      // on browsers that can't encode WebP.
      let blob = await toBlob(out, 'image/webp', 0.9);
      if (!blob || blob.type !== 'image/webp') blob = await toBlob(out, 'image/png');
      const ext = blob.type === 'image/webp' ? 'webp' : 'png';
      onDone(new File([blob], `anh.${ext}`, { type: blob.type }));
    } catch {
      setError('Không xuất được ảnh (ảnh gốc chặn chỉnh sửa).');
      setSaving(false);
    }
  };

  const small = img && Math.min(img.naturalWidth, img.naturalHeight) < SMALL;

  return (
    <dialog ref={dialogRef} onClose={onCancel} aria-labelledby="crop-title"
      className="m-auto w-[min(420px,calc(100vw-1rem))] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-[var(--fg)] shadow-2xl backdrop:bg-black/50">
      <h2 id="crop-title" className="font-semibold">Chỉnh ảnh trước khi tải lên</h2>
      <p className="a-subtle mt-0.5 text-xs">
        Kéo để di chuyển, dùng thanh trượt để phóng to/thu nhỏ. Xuất ảnh vuông {OUT}×{OUT}px.
      </p>

      <div className="mx-auto mt-4 overflow-hidden rounded-lg border border-[var(--line)]"
        style={{
          width: VIEW, maxWidth: '100%', aspectRatio: '1 / 1',
          // Checkerboard shows which areas stay transparent.
          backgroundImage: 'conic-gradient(#e4e4e7 25%, #fff 0 50%, #e4e4e7 0 75%, #fff 0)',
          backgroundSize: '16px 16px',
        }}>
        {img ? (
          <canvas ref={canvasRef} tabIndex={0} role="img"
            aria-label="Khung chỉnh ảnh. Dùng phím mũi tên để di chuyển, + và - để phóng to thu nhỏ."
            onPointerDown={onPointerDown} onPointerMove={onPointerMove}
            onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
            onKeyDown={onKeyDown}
            className="block size-full cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)] active:cursor-grabbing" />
        ) : (
          <div className="flex size-full items-center justify-center">
            {error ? <p role="alert" className="px-4 text-center text-sm text-red-700">{error}</p>
              : <Loader2 size={22} className="a-subtle animate-spin" aria-label="Đang tải ảnh" />}
          </div>
        )}
      </div>

      {img && (
        <>
          <p className={`mt-2 flex items-center justify-center gap-1.5 text-xs ${small ? 'text-amber-700 dark:text-amber-400' : 'a-subtle'}`}>
            {small && <AlertTriangle size={13} aria-hidden="true" />}
            Ảnh gốc {img.naturalWidth}×{img.naturalHeight}px{small ? ' — nhỏ, phóng to sẽ bị mờ' : ''}
          </p>

          <div className="mt-4">
            <label htmlFor="crop-zoom" className="a-label flex justify-between">
              <span>Kích thước</span><span className="tabular-nums">{Math.round(t.zoom * 100)}%</span>
            </label>
            <input id="crop-zoom" type="range" min="0.2" max="4" step="0.01" value={t.zoom}
              onChange={(e) => set({ zoom: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => set({ zoom: 1, x: 0, y: 0 })} title="Toàn bộ ảnh nằm trong khung">
              <Minimize size={14} aria-hidden="true" /> Vừa khung
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => set({ zoom: fillZoom, x: 0, y: 0 })} title="Ảnh phủ kín khung, cắt phần thừa">
              <Maximize size={14} aria-hidden="true" /> Lấp đầy
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => set({ rot: (t.rot + 90) % 360 })}>
              <RotateCw size={14} aria-hidden="true" /> Xoay
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setT(INITIAL)}>
              <Undo2 size={14} aria-hidden="true" /> Đặt lại
            </button>
          </div>

          <fieldset className="mt-3 flex items-center gap-4 text-sm">
            <legend className="sr-only">Nền</legend>
            <span className="a-muted text-[13px]">Nền:</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="radio" name="crop-bg" checked={t.bg === ''} onChange={() => set({ bg: '' })} className="accent-[var(--color-accent)]" /> Trong suốt
            </label>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="radio" name="crop-bg" checked={t.bg === '#ffffff'} onChange={() => set({ bg: '#ffffff' })} className="accent-[var(--color-accent)]" /> Trắng
            </label>
          </fieldset>
        </>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className="a-btn a-btn-ghost" onClick={onCancel}>Huỷ</button>
        {onSkip && <button type="button" className="a-btn a-btn-ghost" onClick={onSkip} disabled={saving}>Dùng ảnh gốc</button>}
        <button type="button" className="a-btn a-btn-primary" onClick={save} disabled={!img || saving}>
          {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />} Lưu ảnh
        </button>
      </div>
    </dialog>
  );
}
