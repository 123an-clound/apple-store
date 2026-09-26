import { SITE_URL } from './constants';

const KIND_LABELS = { tu_van: 'Tư vấn mua máy', tra_gop: 'Mua trả góp', thu_cu: 'Thu cũ đổi mới' };

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Emails the shop about a new callback request via Resend's REST API.
// Silently does nothing until RESEND_API_KEY and LEAD_NOTIFY_EMAIL are set, so
// the lead form keeps working without email configured. Lead fields are
// visitor input: HTML-escaped in the body, newlines stripped from the subject.
export async function notifyNewLead({ name, phone, kind, product }) {
  // trim(): a value piped into the Vercel CLI/dashboard can carry a BOM or newline,
  // which breaks the Authorization header ("Cannot convert … to a ByteString").
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim();
  if (!key || !to) return;

  const from = process.env.LEAD_FROM_EMAIL?.trim() || 'Apple Store <onboarding@resend.dev>';
  const kindLabel = KIND_LABELS[kind] ?? kind;
  const adminUrl = `${SITE_URL}/admin/khach-hang`;
  const subject = `Khách mới: ${name} · ${phone}`.replace(/[\r\n]+/g, ' ').slice(0, 150);

  const text = [
    `Khách vừa để lại số trên website:`,
    ``,
    `Họ tên: ${name}`,
    `SĐT: ${phone}`,
    `Nhu cầu: ${kindLabel}`,
    product ? `Sản phẩm: ${product}` : null,
    ``,
    `Gọi ngay: tel:${phone}`,
    `Quản lý: ${adminUrl}`,
  ].filter((l) => l !== null).join('\n');

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#71717a">${label}</td><td style="padding:6px 0;font-weight:600">${value}</td></tr>`;
  const html = `
<div style="font-family:Arial,sans-serif;font-size:15px;color:#18181b;max-width:480px">
  <h2 style="font-size:18px;margin:0 0 12px">Khách mới cần gọi lại</h2>
  <table style="border-collapse:collapse">
    ${row('Họ tên', escapeHtml(name))}
    ${row('SĐT', `<a href="tel:${escapeHtml(phone)}" style="color:#0369a1">${escapeHtml(phone)}</a>`)}
    ${row('Nhu cầu', escapeHtml(kindLabel))}
    ${product ? row('Sản phẩm', escapeHtml(product)) : ''}
  </table>
  <p style="margin:20px 0 0">
    <a href="${adminUrl}" style="display:inline-block;background:#0369a1;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Mở trang quản lý khách</a>
  </p>
</div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('[Lead notify] Resend error', res.status, await res.text());
  } catch (err) {
    console.error('[Lead notify] Failed:', err.message);
  }
}
