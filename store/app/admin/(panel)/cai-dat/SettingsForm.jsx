'use client';

import { useActionState } from 'react';
import { saveSettings } from '../../actions';
import FormMessage from '../../components/FormMessage';

const PHONES = [
  ['hotline', 'Hotline', 'Số hiện trên nút “Gọi” và đầu trang'],
  ['zalo', 'Zalo tư vấn', 'Nút “Tư vấn Zalo”'],
  ['zalo_tragop', 'Zalo trả góp', 'Nút “Nhận tư vấn mua trả góp”'],
];

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

function Field({ id, label, hint, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="a-label">{label}</label>
      <input id={id} name={id} className="a-input" aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && <p id={`${id}-hint`} className="a-subtle mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export default function SettingsForm({ settings, canEdit, preview }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action}>
      <fieldset disabled={!canEdit || pending} className="space-y-4">
        <legend className="sr-only">Số liên hệ</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PHONES.map(([k, label, hint]) => (
            <Field key={k} id={k} label={label} hint={hint} defaultValue={settings[k] ?? ''} required
              inputMode="tel" pattern="[0-9 .]{8,15}" className="tabular-nums" />
          ))}
        </div>
        <p className="a-subtle text-xs">Hiện tại: {preview.hotlineDisplay} · {preview.zaloUrl}</p>
      </fieldset>

      <fieldset disabled={!canEdit || pending} className="mt-8 space-y-4 border-t border-[var(--line)] pt-6">
        <legend className="font-semibold">Cửa hàng</legend>
        <p className="a-subtle -mt-2 text-xs">
          Hiện ở chân trang, nút “Chỉ đường” và dữ liệu Google (LocalBusiness). Để trống mục nào thì web ẩn mục đó.
        </p>
        <Field id="address" label="Địa chỉ" defaultValue={settings.address ?? ''} maxLength={200}
          placeholder="VD: 123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh" />
        <Field id="maps_url" label="Link Google Maps" type="url" defaultValue={settings.maps_url ?? ''} maxLength={500}
          placeholder="https://maps.app.goo.gl/…"
          hint="Mở Google Maps → Chia sẻ → Sao chép đường liên kết. Để trống thì tự tìm theo địa chỉ." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field id="open_time" label="Giờ mở cửa" type="time" defaultValue={hhmm(settings.open_time)} />
          <Field id="close_time" label="Giờ đóng cửa" type="time" defaultValue={hhmm(settings.close_time)} />
          <Field id="latitude" label="Vĩ độ" inputMode="decimal" defaultValue={settings.latitude ?? ''} placeholder="10.7626" />
          <Field id="longitude" label="Kinh độ" inputMode="decimal" defaultValue={settings.longitude ?? ''} placeholder="106.6602" />
        </div>
        <p className="a-subtle -mt-2 text-xs">Toạ độ: trên Google Maps bấm chuột phải vào cửa hàng → bấm vào dòng số đầu tiên để sao chép.</p>
        <Field id="response_promise" label="Cam kết phản hồi" defaultValue={settings.response_promise ?? ''} maxLength={80}
          placeholder="VD: Gọi lại trong 15 phút (8:00–21:00)"
          hint="Hiện cạnh form “Để lại số” và ở chân trang." />
      </fieldset>

      <div className="mt-6 space-y-3">
        <FormMessage state={state} success="Đã lưu — website cập nhật ngay." />
        {canEdit && <button type="submit" disabled={pending} className="a-btn a-btn-primary">{pending ? 'Đang lưu…' : 'Lưu cài đặt'}</button>}
      </div>
    </form>
  );
}
