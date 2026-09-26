'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, Trash2, Download, Inbox } from 'lucide-react';
import { updateLead, deleteLead } from '../../actions';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Confirm';
import { useRealtimeRefresh } from '../../components/useRealtimeRefresh';
import { LEAD_STATUS, LEAD_KIND } from '../../components/leads';
import { timeAgo, formatDateTime } from '../../components/audit';
import { toCsv } from '../../components/csv';

function NoteField({ lead, canEdit, onSave }) {
  const [value, setValue] = useState(lead.admin_note ?? '');
  return (
    <textarea value={value} onChange={(e) => setValue(e.target.value)} disabled={!canEdit} rows={1} maxLength={1000}
      onBlur={() => value !== (lead.admin_note ?? '') && onSave(value)}
      placeholder={canEdit ? 'Ghi chú nội bộ…' : ''} aria-label={`Ghi chú cho ${lead.name}`}
      className="a-input min-h-9 resize-y py-1.5 text-[13px]" />
  );
}

export default function LeadsBoard({ leads, canEdit }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState('new');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');

  const onRealtime = useCallback((payload) => {
    if (payload.eventType === 'INSERT') toast(`Khách mới: ${payload.new.name} · ${payload.new.phone}`);
  }, [toast]);
  useRealtimeRefresh('apple_leads', onRealtime);

  const counts = Object.fromEntries(Object.keys(LEAD_STATUS).map((s) => [s, leads.filter((l) => l.status === s).length]));
  const needle = q.trim().toLowerCase();
  const shown = leads.filter((l) =>
    (status === 'all' || l.status === status)
    && (!kind || l.kind === kind)
    && (!needle || `${l.name} ${l.phone} ${l.product ?? ''} ${l.admin_note ?? ''}`.toLowerCase().includes(needle)));

  const save = (id, patch, msg) => startTransition(async () => {
    const res = await updateLead(id, patch);
    toast(res, msg);
    if (!res.error) router.refresh();
  });
  const remove = async (lead) => {
    if (!(await confirm(`Xoá yêu cầu của ${lead.name} (${lead.phone})?`, { danger: true, confirmLabel: 'Xoá' }))) return;
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      toast(res, 'Đã xoá');
      if (!res.error) router.refresh();
    });
  };

  const exportCsv = () => {
    const rows = shown.map((l) => [formatDateTime(l.created_at), l.name, l.phone, LEAD_KIND[l.kind], l.product, LEAD_STATUS[l.status].label, l.admin_note]);
    const blob = new Blob([toCsv(['thoi_gian', 'ten', 'sdt', 'nhu_cau', 'san_pham', 'trang_thai', 'ghi_chu'], rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `khach-hang-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs = [['new', 'Mới'], ['contacted', 'Đã liên hệ'], ['won', 'Chốt đơn'], ['lost', 'Không thành'], ['all', 'Tất cả']];

  return (
    <>
      <PageHeader title="Khách hàng" description="Yêu cầu gọi lại từ website — cập nhật trực tiếp khi có khách mới.">
        <button type="button" onClick={exportCsv} className="a-btn a-btn-ghost"><Download size={16} aria-hidden="true" /> Xuất CSV</button>
      </PageHeader>

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 lg:flex-row lg:items-center">
          <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Lọc theo trạng thái">
            {tabs.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${status === k ? 'bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]' : 'a-muted hover:bg-[var(--panel-muted)]'}`}>
                {label} <span className="tabular-nums opacity-70">{k === 'all' ? leads.length : counts[k]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 gap-2 lg:justify-end">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="a-input w-auto" aria-label="Lọc nhu cầu">
              <option value="">Mọi nhu cầu</option>
              {Object.entries(LEAD_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input data-admin-search value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, SĐT… (phím /)" aria-label="Tìm khách" className="a-input lg:max-w-xs" />
          </div>
        </div>

        <ul className="divide-y divide-[var(--line)]" aria-busy={pending}>
          {shown.map((l) => (
            <li key={l.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1.2fr_1fr_1.4fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-medium">{l.name}</p>
                <p className="a-subtle text-xs" title={formatDateTime(l.created_at)}>{timeAgo(l.created_at)} · {LEAD_KIND[l.kind]}</p>
                {l.product && <p className="a-muted truncate text-[13px]">{l.product}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${l.phone}`} className="a-btn a-btn-ghost a-btn-sm tabular-nums"><Phone size={14} aria-hidden="true" /> {l.phone}</a>
                <a href={`https://zalo.me/${l.phone}`} target="_blank" rel="noopener noreferrer" className="a-btn a-btn-ghost a-btn-sm" aria-label={`Nhắn Zalo ${l.name}`}>
                  <MessageCircle size={14} aria-hidden="true" /> Zalo
                </a>
              </div>
              <NoteField key={l.admin_note ?? ''} lead={l} canEdit={canEdit} onSave={(v) => save(l.id, { admin_note: v }, 'Đã lưu ghi chú')} />
              <div className="flex items-center gap-2">
                <select value={l.status} disabled={!canEdit || pending} onChange={(e) => save(l.id, { status: e.target.value }, 'Đã cập nhật trạng thái')}
                  aria-label={`Trạng thái của ${l.name}`} className={`a-input h-8 w-36 border-0 text-[13px] font-medium ${LEAD_STATUS[l.status].cls}`}>
                  {Object.entries(LEAD_STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                </select>
                {canEdit && (
                  <button type="button" onClick={() => remove(l)} disabled={pending} className="a-btn a-btn-ghost a-btn-sm text-red-700" aria-label={`Xoá yêu cầu của ${l.name}`}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Inbox size={28} className="a-subtle" aria-hidden="true" />
            <p className="font-medium">Không có yêu cầu nào</p>
            <p className="a-subtle text-sm">Khách để lại số điện thoại trên trang sản phẩm sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </>
  );
}
