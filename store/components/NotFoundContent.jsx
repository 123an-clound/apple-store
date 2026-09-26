import Link from 'next/link';
import { Home, Smartphone, Phone } from 'lucide-react';
import { getContact } from '@/lib/settings';

// Shared by app/(site)/not-found.js (unknown product) and app/global-not-found.js
// (URL matching no route at all).
export default async function NotFoundContent() {
  const { telUrl, hotlineDisplay } = await getContact();
  return (
    <main id="products" className="min-h-[70vh] flex items-center">
      <div className="section-shell section-padding py-16 text-center">
        <p className="text-caption uppercase tracking-widest">Lỗi 404</p>
        <h1 className="text-display text-[var(--text-primary)] mt-2">Không tìm thấy trang</h1>
        <p className="text-body mt-3 max-w-md mx-auto">
          Trang bạn tìm có thể đã đổi địa chỉ hoặc sản phẩm không còn bán. Xem các mẫu iPhone đang có hoặc gọi để được tư vấn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary gap-2"><Home size={17} aria-hidden="true" /> Về trang chủ</Link>
          <Link href="/#products" className="btn-secondary gap-2"><Smartphone size={17} aria-hidden="true" /> Xem sản phẩm</Link>
        </div>
        <p className="text-caption mt-6">
          Cần hỗ trợ? <a href={telUrl} className="underline hover:text-[var(--text-primary)] inline-flex items-center gap-1"><Phone size={13} aria-hidden="true" />{hotlineDisplay}</a>
        </p>
      </div>
    </main>
  );
}
