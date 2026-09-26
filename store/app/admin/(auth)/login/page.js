import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin-auth';
import LoginForm from './LoginForm';

export const metadata = { title: 'Đăng nhập' };

export default async function LoginPage() {
  const { user } = await getAdmin();
  if (user) redirect('/admin');
  return (
    <>
      <h1 className="text-xl font-semibold">Đăng nhập</h1>
      <p className="a-muted mt-1 mb-6 text-sm">Dành cho quản trị viên cửa hàng.</p>
      <LoginForm />
    </>
  );
}
