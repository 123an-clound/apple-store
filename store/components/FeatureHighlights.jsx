'use client';

import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import * as m from 'framer-motion/m';
import { ArrowUpRight, BatteryFull, Camera, Cpu, ShieldCheck } from 'lucide-react';
import { useContact } from './ContactProvider';

export default function FeatureHighlights() {
  const reduceMotion = useReducedMotion();
  const { zaloUrl } = useContact();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section id="highlights" className="highlights-section section-shell section-padding" aria-labelledby="highlights-heading">
      <m.header className="showcase-heading" {...reveal()}>
        <p className="section-eyebrow">Từng chi tiết. Đều đáng giá.</p>
        <h2 id="highlights-heading">Có nhiều điều để yêu.<br /><span>Có một chiếc dành cho bạn.</span></h2>
      </m.header>
      <div className="feature-grid">
        <m.article className="feature-card feature-camera" {...reveal()}>
          <div className="feature-copy">
            <Camera size={23} strokeWidth={1.5} aria-hidden="true" />
            <p className="feature-label">Camera iPhone</p>
            <h3>Giữ trọn khoảnh khắc.<br />Kể câu chuyện của bạn.</h3>
            <p>Từ ảnh chân dung đến những thước phim đời thường. Khám phá hệ thống camera trên từng dòng iPhone.</p>
          </div>
          <Image src="/images/iphone-camera.webp" alt="Cận cảnh cụm camera trên mô hình iPhone màu burgundy" fill sizes="(max-width: 767px) 100vw, 65vw" className="camera-detail-image" />
        </m.article>
        <m.article className="feature-card feature-performance" {...reveal(0.07)}>
          <Cpu size={24} strokeWidth={1.5} aria-hidden="true" />
          <p className="feature-label">Hiệu năng</p>
          <h3>Mượt mà.<br />Trong từng chạm.</h3>
          <p>Làm việc, giải trí, sáng tạo. Chọn cấu hình phù hợp với cách bạn sử dụng mỗi ngày.</p>
          <div className="chip-visual" aria-hidden="true"><Cpu size={38} strokeWidth={1} /><span>Apple<br /><strong>silicon</strong></span></div>
        </m.article>
        <m.article className="feature-card feature-battery" {...reveal()}>
          <BatteryFull size={26} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="feature-label">Pin & trải nghiệm</p>
            <h3>Theo kịp nhịp sống của bạn.</h3>
            <p>Được tư vấn về pin, dung lượng và tình trạng máy trước khi chọn mua.</p>
          </div>
        </m.article>
        <m.article className="feature-card feature-service" {...reveal(0.07)}>
          <ShieldCheck size={26} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="feature-label">An tâm chọn mua</p>
            <h3>Chiếc máy phù hợp.<br />Sự hỗ trợ tận tâm.</h3>
            <p>iPhone chính hãng, bảo hành rõ ràng và tư vấn phương án trả góp.</p>
            <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="text-link focus-ring">Trò chuyện với cửa hàng <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </m.article>
      </div>
    </section>
  );
}
