import { requireAdmin } from '@/lib/admin-auth';
import ProductsTable from './ProductsTable';

export const metadata = { title: 'Sản phẩm' };

export default async function ProductsPage({ searchParams }) {
  const { supabase, role } = await requireAdmin('viewer');
  const params = await searchParams;
  const { data, error } = await supabase.from('kho_iphone').select('*').order('id', { ascending: false });

  if (error) {
    return <p role="alert" className="a-card p-6 text-sm text-red-700">Không tải được sản phẩm: {error.message}</p>;
  }
  // key: a new ?q= from the command palette resets the table's filter state.
  return <ProductsTable key={JSON.stringify(params)} rows={data ?? []} role={role} initial={params} />;
}
