import { requireAdmin } from '@/lib/admin-auth';
import Shell from '../components/Shell';

export default async function PanelLayout({ children }) {
  const { supabase, user, role } = await requireAdmin('viewer');
  const { count } = await supabase
    .from('apple_leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  return (
    <Shell email={user.email} role={role} newLeads={count ?? 0}>
      {children}
    </Shell>
  );
}
