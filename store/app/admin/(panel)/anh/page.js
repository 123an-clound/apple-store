import { requireAdmin } from '@/lib/admin-auth';
import { hasRole } from '@/lib/roles';
import { IMAGE_COLUMNS, imageObjectName } from '@/lib/helpers';
import MediaLibrary from './MediaLibrary';

export const metadata = { title: 'Thư viện ảnh' };

export default async function MediaPage() {
  const { supabase, role } = await requireAdmin('viewer');
  const cols = ['id', '"Tên sản phẩm"', '"Dung Lượng RAM/ROM"', ...IMAGE_COLUMNS.map((c) => `"${c}"`)].join(', ');
  const { data } = await supabase.from('kho_iphone').select(cols);

  // object name → products using it (same resolution rule as the storefront).
  const refs = {};
  for (const r of data ?? []) {
    for (const c of IMAGE_COLUMNS) {
      const name = imageObjectName(r[c]);
      if (!name) continue;
      (refs[name] ??= []).push({ id: r.id, label: `${r['Tên sản phẩm']} ${r['Dung Lượng RAM/ROM'] ?? ''}`.trim() });
    }
  }
  return <MediaLibrary refs={refs} canEdit={hasRole(role, 'editor')} />;
}
