import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Clock } from 'lucide-react';
import { getContact } from '@/lib/settings';

export default async function Footer() {
  const { telUrl, zaloUrl, zaloTragopUrl, hotlineDisplay, address, directionsUrl, opens, closes, responsePromise } = await getContact();
  return (
    <footer id="contact" className="store-footer">
      <div className="section-shell section-padding">
        <div className="footer-intro">
          <p>Một chiếc iPhone mới.<br /><span>Bắt đầu bằng một cuộc trò chuyện.</span></p>
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring">Tư vấn cùng Apple Store <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" prefetch={false} className="store-wordmark focus-ring"><Image src="/logo.png" alt="" width={30} height={30} /><span>Apple Store</span></Link>
            <p>iPhone chính hãng. Giá tốt.<br />Bảo hành uy tín.</p>
            {address && <address><MapPin size={15} aria-hidden="true" />{address}</address>}
            {opens && closes && <p className="footer-hours"><Clock size={15} aria-hidden="true" />{opens} - {closes}, hằng ngày</p>}
          </div>
          <nav aria-label="Khám phá sản phẩm"><h2>Khám phá</h2><Link href="/#products" prefetch={false}>Xem sản phẩm</Link><Link href="/#highlights" prefetch={false}>Điểm nổi bật</Link><a href={zaloTragopUrl} target="_blank" rel="noopener noreferrer">Tư vấn trả góp</a></nav>
          <nav aria-label="Liên hệ cửa hàng"><h2>Luôn sẵn sàng hỗ trợ</h2><a href={telUrl}>{hotlineDisplay}</a><a href={zaloUrl} target="_blank" rel="noopener noreferrer">Nhắn Zalo <ArrowUpRight size={13} aria-hidden="true" /></a>{directionsUrl && <a href={directionsUrl} target="_blank" rel="noopener noreferrer">Chỉ đường tới cửa hàng <ArrowUpRight size={13} aria-hidden="true" /></a>}{responsePromise && <p>{responsePromise}</p>}</nav>
          <nav aria-label="Thông tin cửa hàng"><h2>Thông tin</h2><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><a href={zaloUrl} target="_blank" rel="noopener noreferrer">Tư vấn bảo hành</a></nav>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Apple Store. All rights reserved.</p><span>Việt Nam</span></div>
      </div>
    </footer>
  );
}
