'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ImagePlus, FolderOpen, Trash2, Save, Upload, Loader2, ExternalLink, Crop } from 'lucide-react';
import { IMAGE_COLUMNS, BADGES, buildImageUrl, formatPrice, getSeries, slugify } from '@/lib/helpers';
import { saveProduct, deleteProducts } from '../../actions';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Confirm';
import MediaPicker from '../../components/MediaPicker';
import { uploadImage } from '../../components/storage';
import CropDialog from '../../components/CropDialog';

function fromRow(row) {
  return {
    name: row?.['Tên sản phẩm'] ?? '',
    spec: row?.['Dung Lượng RAM/ROM'] ?? '',
    price: row?.['Giá'] ? String(row['Giá']).replace(/\D/g, '') : '',
    sale_price: row?.sale_price ?? '',
    stock: row?.stock ?? '',
    badge: row?.badge ?? '',
    is_visible: row ? row.is_visible : true,
    description: row?.['Mô tả'] ?? '',
    images: IMAGE_COLUMNS.map((c) => row?.[c] ?? null),
  };
}

const digits = (v) => String(v ?? '').replace(/\D/g, '');

function ImageSlot({ index, value, canEdit, busy, onUpload, onPick, onEdit, onRemove, onMove, name }) {
  const [over, setOver] = useState(false);
  const url = value ? buildImageUrl(value) : null;
  const inputId = `img-upload-${index}`;
  return (
    <li
      onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f && canEdit) onUpload(index, f); }}
      className={`relative rounded-lg border-2 border-dashed p-1.5 transition-colors ${over ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--line)]'}`}>
      <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--panel-muted)]">
        {busy ? (
          <Loader2 size={20} className="a-subtle absolute inset-0 m-auto animate-spin" aria-label="Đang tải ảnh" />
        ) : url ? (
          <Image src={url} alt={`${name} — ảnh ${index + 1}`} fill sizes="200px" className="object-contain p-2" />
        ) : (
          <span className="a-subtle absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs">
            <ImagePlus size={20} aria-hidden="true" />{canEdit ? 'Kéo thả ảnh' : 'Trống'}
          </span>
        )}
        <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 text-[11px] font-medium text-white">{index === 0 ? 'Ảnh chính' : index + 1}</span>
      </div>
      {canEdit && (
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <label htmlFor={inputId} className="a-btn a-btn-ghost a-btn-sm cursor-pointer px-2" title="Tải ảnh lên">
            <Upload size={13} aria-hidden="true" /><span className="sr-only">Tải ảnh lên ô {index + 1}</span>
          </label>
          <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onUpload(index, f); }} />
          <button type="button" onClick={() => onPick(index)} className="a-btn a-btn-ghost a-btn-sm px-2" title="Chọn từ thư viện">
            <FolderOpen size={13} aria-hidden="true" /><span className="sr-only">Chọn ảnh thư viện cho ô {index + 1}</span>
          </button>
          <button type="button" onClick={() => onEdit(index)} disabled={!value || busy} className="a-btn a-btn-ghost a-btn-sm px-2" title="Chỉnh / cắt ảnh">
            <Crop size={13} aria-hidden="true" /><span className="sr-only">Chỉnh ảnh {index + 1}</span>
          </button>
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0 || !value} className="a-btn a-btn-ghost a-btn-sm px-2" title="Chuyển sang trái">
            <ArrowLeft size={13} aria-hidden="true" /><span className="sr-only">Chuyển ảnh {index + 1} sang trái</span>
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === 5 || !value} className="a-btn a-btn-ghost a-btn-sm px-2" title="Chuyển sang phải">
            <ArrowRight size={13} aria-hidden="true" /><span className="sr-only">Chuyển ảnh {index + 1} sang phải</span>
          </button>
          <button type="button" onClick={() => onRemove(index)} disabled={!value} className="a-btn a-btn-ghost a-btn-sm px-2 text-red-700" title="Gỡ ảnh">
            <Trash2 size={13} aria-hidden="true" /><span className="sr-only">Gỡ ảnh {index + 1}</span>
          </button>
        </div>
      )}
    </li>
  );
}

export default function ProductForm({ row, canEdit, names }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [initial, setInitial] = useState(() => JSON.stringify(fromRow(row)));
  const [f, setF] = useState(() => fromRow(row));
  const [uploading, setUploading] = useState(() => new Set());
  const [pickerSlot, setPickerSlot] = useState(null);
  const [crop, setCrop] = useState(null); // { index, source: File | url }
  const [errors, setErrors] = useState({});
  const dirty = JSON.stringify(f) !== initial;

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setImages = (fn) => setF((s) => ({ ...s, images: fn([...s.images]) }));

  // New files and re-edits of existing images go through the crop dialog first.
  const onUpload = (index, file) => {
    if (!file.type.startsWith('image/')) { toast('File này không phải ảnh.', 'error'); return; }
    setCrop({ index, source: file });
  };
  const onEdit = (index) => setCrop({ index, source: buildImageUrl(f.images[index]) });

  const doUpload = async (index, file) => {
    setUploading((u) => new Set(u).add(index));
    try {
      const name = await uploadImage(file, f.name || 'iphone');
      setImages((imgs) => { imgs[index] = name; return imgs; });
      toast('Đã tải ảnh lên');
    } catch (err) {
      toast(`Tải ảnh thất bại: ${err.message}`, 'error');
    } finally {
      setUploading((u) => { const n = new Set(u); n.delete(index); return n; });
    }
  };
  const onMove = (i, d) => setImages((imgs) => { [imgs[i], imgs[i + d]] = [imgs[i + d], imgs[i]]; return imgs; });
  const onRemove = (i) => setImages((imgs) => { imgs[i] = null; return imgs; });

  const validate = () => {
    const e = {};
    const price = Number(digits(f.price));
    if (!f.name.trim()) e.name = 'Nhập tên sản phẩm.';
    if (!digits(f.price)) e.price = 'Nhập giá.';
    if (digits(f.sale_price) && Number(digits(f.sale_price)) >= price) e.sale_price = 'Giá khuyến mãi phải nhỏ hơn giá gốc.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Upload slots still in flight would be dropped from the saved row.
    if (uploading.size) { toast('Đợi ảnh tải xong rồi lưu.', 'error'); return; }
    const payload = {
      ...f,
      price: digits(f.price),
      sale_price: digits(f.sale_price) || null,
      stock: f.stock === '' ? null : digits(f.stock),
      badge: f.badge || null,
      // Compact: no gaps between images.
      images: [...f.images.filter(Boolean), ...Array(6).fill(null)].slice(0, 6),
    };
    startTransition(async () => {
      const res = await saveProduct(row?.id ?? null, payload);
      if (res.error) { toast(res); return; }
      setInitial(JSON.stringify(f));
      toast(row ? 'Đã lưu thay đổi' : 'Đã thêm sản phẩm');
      if (!row) router.replace(`/admin/san-pham/${res.id}`);
      else router.refresh();
    });
  };

  const onDelete = async () => {
    const ok = await confirm(`Xoá "${f.name} ${f.spec}"? Không thể hoàn tác.`, { danger: true, confirmLabel: 'Xoá' });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteProducts([row.id]);
      toast(res, 'Đã xoá sản phẩm');
      if (!res.error) router.push('/admin/san-pham');
    });
  };

  const price = Number(digits(f.price));
  const sale = Number(digits(f.sale_price));
  const shownPrice = sale && sale < price ? sale : price;
  const previewImg = f.images.find(Boolean);
  const fieldErr = (k) => errors[k] && <p id={`${k}-err`} className="mt-1 text-xs text-red-700 dark:text-red-400">{errors[k]}</p>;
  const errProps = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${k}-err` } : {});

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3" noValidate>
      <fieldset disabled={!canEdit || pending} className="space-y-6 xl:col-span-2">
        <section className="a-card p-5 sm:p-6" aria-labelledby="info-h">
          <h2 id="info-h" className="mb-4 font-semibold">Thông tin</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="a-label">Tên mẫu máy *</label>
              <input id="name" value={f.name} onChange={set('name')} list="product-names" maxLength={120} className="a-input" placeholder="VD: iPhone 16 Pro Max" {...errProps('name')} />
              <datalist id="product-names">{names.map((n) => <option key={n} value={n} />)}</datalist>
              {fieldErr('name')}
              <p className="a-subtle mt-1 text-xs">Các phiên bản cùng tên được gom thành một thẻ sản phẩm trên web ({getSeries(f.name)}).</p>
            </div>
            <div>
              <label htmlFor="spec" className="a-label">Dung lượng RAM/ROM</label>
              <input id="spec" value={f.spec} onChange={set('spec')} maxLength={40} className="a-input" placeholder="VD: 8/256" />
            </div>
            <div>
              <label htmlFor="badge" className="a-label">Nhãn</label>
              <select id="badge" value={f.badge} onChange={set('badge')} className="a-input">
                <option value="">Không có</option>
                {Object.entries(BADGES).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="a-label">Mô tả</label>
              <textarea id="description" value={f.description} onChange={set('description')} rows={4} maxLength={2000} className="a-input" />
              <p className="a-subtle mt-1 text-right text-xs tabular-nums">{f.description.length}/2000</p>
            </div>
          </div>
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="price-h">
          <h2 id="price-h" className="mb-4 font-semibold">Giá &amp; kho</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="a-label">Giá bán (đ) *</label>
              <input id="price" value={f.price} onChange={set('price')} inputMode="numeric" className="a-input tabular-nums" {...errProps('price')} />
              {fieldErr('price') || <p className="a-subtle mt-1 text-xs tabular-nums">{price ? formatPrice(price) : ' '}</p>}
            </div>
            <div>
              <label htmlFor="sale_price" className="a-label">Giá khuyến mãi (đ)</label>
              <input id="sale_price" value={f.sale_price} onChange={set('sale_price')} inputMode="numeric" className="a-input tabular-nums" placeholder="Để trống nếu không giảm" {...errProps('sale_price')} />
              {fieldErr('sale_price') || (sale > 0 && sale < price && (
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">Giảm {Math.round((1 - sale / price) * 100)}% · {formatPrice(sale)}</p>
              ))}
            </div>
            <div>
              <label htmlFor="stock" className="a-label">Tồn kho</label>
              <input id="stock" value={f.stock} onChange={set('stock')} inputMode="numeric" className="a-input tabular-nums" placeholder="Không theo dõi" />
              <p className="a-subtle mt-1 text-xs">0 = hiện “Tạm hết hàng”</p>
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={f.is_visible} onChange={set('is_visible')} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
            <span>
              <span className="block text-sm font-medium">Hiển thị trên website</span>
              <span className="a-subtle block text-xs">Tắt để ẩn phiên bản này mà không xoá.</span>
            </span>
          </label>
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="img-h">
          <h2 id="img-h" className="font-semibold">Hình ảnh</h2>
          <p className="a-subtle mb-4 text-xs">Tối đa 6 ảnh, ảnh đầu tiên là ảnh chính. PNG/JPG/WEBP/AVIF ≤ 5 MB.</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {f.images.map((v, i) => (
              <ImageSlot key={i} index={i} value={v} name={f.name} canEdit={canEdit} busy={uploading.has(i)}
                onUpload={onUpload} onPick={setPickerSlot} onEdit={onEdit} onRemove={onRemove} onMove={onMove} />
            ))}
          </ul>
        </section>
      </fieldset>

      <aside className="space-y-6">
        <section className="a-card p-5" aria-labelledby="prev-h">
          <h2 id="prev-h" className="a-muted mb-3 text-xs font-semibold uppercase tracking-wide">Xem trước trên web</h2>
          <div className="overflow-hidden rounded-xl border border-[var(--line)]">
            <div className="relative aspect-square bg-[var(--panel-muted)]">
              {previewImg && <Image src={buildImageUrl(previewImg)} alt="" fill sizes="320px" className="object-contain p-6" />}
              {f.badge && BADGES[f.badge] && (
                <span className="a-chip absolute right-2 top-2 text-white" style={{ background: BADGES[f.badge].color }}>{BADGES[f.badge].label}</span>
              )}
              {!f.is_visible && <span className="a-chip absolute left-2 top-2 bg-zinc-900 text-white">Đang ẩn</span>}
            </div>
            <div className="p-3">
              <p className="font-semibold">{f.name || 'Tên sản phẩm'}</p>
              <p className="a-subtle text-xs">{f.spec || 'Bản chuẩn'}</p>
              <p className="mt-2 font-semibold tabular-nums text-[var(--color-accent)]">{shownPrice ? formatPrice(shownPrice) : 'Liên hệ'}</p>
              {sale > 0 && sale < price && <s className="a-subtle text-xs tabular-nums">{formatPrice(price)}</s>}
              {f.stock !== '' && Number(f.stock) === 0 && <p className="text-xs font-medium text-red-700">Tạm hết hàng</p>}
            </div>
          </div>
          {row && f.name && (
            <Link href={`/san-pham/${slugify(f.name)}`} target="_blank" className="mt-3 flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
              Mở trang sản phẩm <ExternalLink size={13} aria-hidden="true" />
            </Link>
          )}
        </section>

        {canEdit && (
          <div className="a-card sticky top-4 flex flex-col gap-2 p-4">
            <button type="submit" disabled={pending || !dirty} className="a-btn a-btn-primary w-full">
              {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              {row ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </button>
            {dirty && <p className="a-subtle text-center text-xs" role="status">Có thay đổi chưa lưu</p>}
            {row && (
              <button type="button" onClick={onDelete} disabled={pending} className="a-btn a-btn-ghost w-full text-red-700 dark:text-red-400">
                <Trash2 size={16} aria-hidden="true" /> Xoá phiên bản này
              </button>
            )}
          </div>
        )}
      </aside>

      {crop && (
        <CropDialog source={crop.source}
          onDone={(file) => { setCrop(null); doUpload(crop.index, file); }}
          onSkip={typeof crop.source === 'string' ? null : () => { setCrop(null); doUpload(crop.index, crop.source); }}
          onCancel={() => setCrop(null)} />
      )}
      <MediaPicker open={pickerSlot !== null} onClose={() => setPickerSlot(null)}
        onPick={(name) => setImages((imgs) => { imgs[pickerSlot] = name; return imgs; })} />
    </form>
  );
}
