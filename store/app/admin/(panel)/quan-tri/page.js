import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '../../components/PageHeader';
import AdminsManager from './AdminsManager';

export const metadata = { title: 'Quản trị viên' };

export default async function AdminsPage() {
  const { supabase, user } = await requireAdmin('owner');
  const { data, error } = await supabase.rpc('apple_list_admins');
  return (
    <>
      <PageHeader title="Quản trị viên" description="Ai được vào trang quản trị và được làm gì." />
      {error
        ? <p role="alert" className="a-card p-6 text-sm text-red-700">{error.message}</p>
        : <AdminsManager admins={data ?? []} selfId={user.id} />}
    </>
  );
}
