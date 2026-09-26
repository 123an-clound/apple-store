import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from './supabase-server';
import { hasRole } from './roles';

// One auth round trip per request, shared by the layout, page and actions.
// getUser() (not getSession()) re-validates the JWT with Supabase Auth.
export const getAdmin = cache(async () => {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null };
  const { data } = await supabase.from('apple_admins').select('role').eq('user_id', user.id).maybeSingle();
  return { supabase, user, role: data?.role ?? null };
});

// For pages: bounce to login / no-access screens.
export async function requireAdmin(min = 'viewer') {
  const admin = await getAdmin();
  if (!admin.user) redirect('/admin/login');
  if (!hasRole(admin.role, min)) redirect('/admin/khong-co-quyen');
  return admin;
}
