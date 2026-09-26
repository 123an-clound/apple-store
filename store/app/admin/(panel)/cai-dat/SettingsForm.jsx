'use client';

import { useActionState } from 'react';
import { saveSettings } from '../../actions';
import FormMessage from '../../components/FormMessage';

const FIELDS = [
  ['hotline', 'Hotline', 'Số hiện trên nút “Gọi” và đầu trang'],
  ['zalo', 'Zalo tư vấn', 'Nút “Tư vấn Zalo”'],
  ['zalo_tragop', 'Zalo trả góp', 'Nút “Nhận tư vấn mua trả góp”'],
];

export default function SettingsForm({ settings, canEdit, preview }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action}>
      <fieldset disabled={!canEdit || pending} className="space-y-4">
        {FIELDS.map(([k, label, hint]) => (
          <div key={k}>
            <label htmlFor={k} className="a-label">{label}</label>
            <input id={k} name={k} defaultValue={settings[k] ?? ''} required inputMode="tel" pattern="[0-9 .]{8,15}" className="a-input max-w-xs tabular-nums" aria-describedby={`${k}-hint`} />
            <p id={`${k}-hint`} className="a-subtle mt-1 text-xs">{hint}</p>
          </div>
        ))}
        <p className="a-subtle text-xs">Hiện tại: {preview.hotlineDisplay} · {preview.zaloUrl}</p>
        <FormMessage state={state} success="Đã lưu — website cập nhật ngay." />
        {canEdit && <button type="submit" className="a-btn a-btn-primary">{pending ? 'Đang lưu…' : 'Lưu cài đặt'}</button>}
      </fieldset>
    </form>
  );
}
