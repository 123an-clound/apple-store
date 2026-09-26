import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { hasRole } from '@/lib/roles';
import { buildContact } from '@/lib/constants';
import PageHeader from '../../components/PageHeader';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'Cài đặt' };

export default async function SettingsPage() {
  const { supabase, role, user } = await requireAdmin('viewer');
  const { data } = await supabase.from('apple_settings').select('*').eq('id', 1).maybeSingle();
  const settings = data ?? {};

  return (
    <>
      <PageHeader title="Cài đặt" description="Thông tin liên hệ hiển thị trên toàn website." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="a-card p-5 sm:p-6 lg:col-span-2" aria-labelledby="contact-h">
          <h2 id="contact-h" className="font-semibold">Liên hệ</h2>
          <p className="a-subtle mb-5 text-xs">
            Dùng cho nút gọi, Zalo và dữ liệu có cấu trúc (SEO). {hasRole(role, 'owner') ? '' : 'Chỉ chủ sở hữu được sửa.'}
          </p>
          <SettingsForm settings={settings} canEdit={hasRole(role, 'owner')} preview={buildContact(settings)} />
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="acct-h">
          <h2 id="acct-h" className="font-semibold">Tài khoản</h2>
          <p className="a-muted mt-1 break-all text-sm">{user.email}</p>
          <Link href="/admin/doi-mat-khau" className="a-btn a-btn-ghost mt-4 w-full"><KeyRound size={16} aria-hidden="true" /> Đổi mật khẩu</Link>
          <h3 className="mt-6 text-sm font-semibold">Phím tắt</h3>
          <dl className="a-muted mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt><kbd className="rounded border border-[var(--line)] px-1.5 text-xs">Ctrl K</kbd></dt><dd>Bảng lệnh / tìm nhanh</dd>
            <dt><kbd className="rounded border border-[var(--line)] px-1.5 text-xs">/</kbd></dt><dd>Tới ô tìm kiếm</dd>
            <dt><kbd className="rounded border border-[var(--line)] px-1.5 text-xs">N</kbd></dt><dd>Thêm sản phẩm mới</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
