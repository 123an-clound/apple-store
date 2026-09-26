import { requireAdmin } from '@/lib/admin-auth';
import { hasRole } from '@/lib/roles';
import LeadsBoard from './LeadsBoard';

export const metadata = { title: 'Khách hàng' };

export default async function LeadsPage() {
  const { supabase, role } = await requireAdmin('viewer');
  const { data, error } = await supabase.from('apple_leads').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) return <p role="alert" className="a-card p-6 text-sm text-red-700">Không tải được danh sách: {error.message}</p>;
  return <LeadsBoard leads={data ?? []} canEdit={hasRole(role, 'editor')} />;
}
