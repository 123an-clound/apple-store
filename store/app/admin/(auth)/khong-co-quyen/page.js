import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin-auth';
import { signOut } from '../../actions';

export const metadata = { title: 'Không có quyền' };

export default async function NoAccessPage() {
  const { user, role } = await getAdmin();
  if (!user) redirect('/admin/login');
  if (role) redirect('/admin');
  return (
    <>
      <h1 className="text-xl font-semibold">Chưa được cấp quyền</h1>
      <p className="a-muted mt-2 text-sm">
        Tài khoản <strong className="text-[var(--fg)]">{user.email}</strong> chưa có quyền quản trị.
        Liên hệ chủ cửa hàng để được thêm vào danh sách quản trị viên.
      </p>
      <form action={signOut} className="mt-6">
        <button type="submit" className="a-btn a-btn-ghost w-full">Đăng xuất</button>
      </form>
    </>
  );
}
