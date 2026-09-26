import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { getContact } from '@/lib/settings';
import Footer from '@/components/Footer';

export const revalidate = 3600;

export const metadata = {
  title: 'Chính sách bảo mật | Apple Store',
  description: 'Apple Store thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng như thế nào.',
  alternates: { canonical: `${SITE_URL}/chinh-sach-bao-mat` },
};

// Describes what the site actually does with data today (lead form → Supabase,
// email alert via Resend, cookieless analytics). Update it when that changes.
const UPDATED = '26/09/2026';

export default async function PrivacyPage() {
  const { hotlineDisplay, telUrl, zaloUrl, address } = await getContact();
  const h2 = 'text-h2 text-[var(--text-primary)] !text-lg font-bold mt-8 mb-2';
  const p = 'text-body leading-relaxed';

  return (
    <>
      <main id="products" className="min-h-screen">
        <div className="section-shell section-padding py-6 sm:py-10 max-w-3xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-caption">
              <li><Link href="/" className="hover:text-[var(--text-primary)] hover:underline focus-ring rounded">Trang chủ</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-medium text-[var(--text-primary)]">Chính sách bảo mật</li>
            </ol>
          </nav>

          <h1 className="text-display text-[var(--text-primary)] mt-6">Chính sách bảo mật</h1>
          <p className="text-caption mt-2">Cập nhật: {UPDATED}</p>

          <h2 className={h2}>1. Thông tin chúng tôi thu thập</h2>
          <p className={p}>
            Khi bạn dùng mục “Để lại số, chúng tôi gọi lại”, chúng tôi nhận: họ tên, số điện thoại, nhu cầu
            (tư vấn, trả góp, thu cũ đổi mới) và sản phẩm bạn đang xem. Để chống gửi spam, hệ thống lưu thêm một
            mã băm một chiều từ địa chỉ IP — không lưu địa chỉ IP gốc.
          </p>
          <p className={`${p} mt-2`}>
            Khi bạn gọi điện hoặc nhắn Zalo, thông tin được xử lý theo chính sách của nhà mạng và Zalo.
          </p>

          <h2 className={h2}>2. Mục đích sử dụng</h2>
          <p className={p}>
            Chỉ để liên hệ lại tư vấn sản phẩm, trả góp hoặc thu cũ đổi mới theo đúng yêu cầu bạn gửi.
            Chúng tôi không bán, cho thuê hay chia sẻ thông tin của bạn cho bên thứ ba vì mục đích quảng cáo.
          </p>

          <h2 className={h2}>3. Lưu trữ và bên xử lý</h2>
          <p className={p}>
            Dữ liệu được lưu trên hạ tầng Supabase; chỉ nhân viên được cấp quyền mới xem được. Khi có yêu cầu
            mới, hệ thống gửi email thông báo cho cửa hàng qua dịch vụ Resend. Website được vận hành trên Vercel.
            Thống kê lượt truy cập (Vercel Web Analytics) không dùng cookie và không thu thập thông tin định danh.
          </p>

          <h2 className={h2}>4. Thời gian lưu trữ</h2>
          <p className={p}>
            Thông tin được giữ trong thời gian cần thiết để tư vấn và chăm sóc sau bán hàng, hoặc đến khi bạn
            yêu cầu xoá.
          </p>

          <h2 className={h2}>5. Quyền của bạn</h2>
          <p className={p}>
            Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền được biết, xem, chỉnh sửa,
            yêu cầu xoá dữ liệu và rút lại sự đồng ý bất kỳ lúc nào. Chúng tôi xử lý yêu cầu trong thời gian sớm nhất.
          </p>

          <h2 className={h2}>6. Cookie và lưu trữ trên trình duyệt</h2>
          <p className={p}>
            Website chỉ lưu lựa chọn giao diện sáng/tối trên trình duyệt của bạn. Chúng tôi không dùng cookie quảng cáo.
          </p>

          <h2 className={h2}>7. Liên hệ</h2>
          <p className={p}>
            Mọi yêu cầu về dữ liệu cá nhân, vui lòng gọi <a href={telUrl} className="underline hover:text-[var(--text-primary)]">{hotlineDisplay}</a> hoặc{' '}
            <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">nhắn Zalo</a>
            {address ? `, hoặc đến cửa hàng tại ${address}` : ''}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
