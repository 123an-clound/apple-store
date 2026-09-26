import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '../../../components/PageHeader';
import ProductForm from '../ProductForm';

export const metadata = { title: 'Thêm sản phẩm' };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin('editor');
  const { data } = await supabase.from('kho_iphone').select('"Tên sản phẩm"');
  const names = [...new Set((data ?? []).map((r) => r['Tên sản phẩm']).filter(Boolean))].sort();

  return (
    <>
      <Link href="/admin/san-pham" className="a-muted mb-3 inline-flex items-center gap-1 text-sm hover:text-[var(--fg)]">
        <ChevronLeft size={16} aria-hidden="true" /> Sản phẩm
      </Link>
      <PageHeader title="Thêm sản phẩm" description="Mỗi dòng là một phiên bản (dung lượng). Thêm phiên bản mới cho mẫu có sẵn bằng cách chọn đúng tên." />
      <ProductForm row={null} canEdit names={names} />
    </>
  );
}
