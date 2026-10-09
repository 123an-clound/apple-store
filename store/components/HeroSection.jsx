'use client';

import { ArrowUpRight, ChevronRight, ShieldCheck } from 'lucide-react';
import { useContact } from '@/components/ContactProvider';
import Scene3DLoader from '@/components/Scene3DLoader';

export default function HeroSection() {
  const { zaloTragopUrl } = useContact();
  return (
    <section className="product-hero" aria-labelledby="hero-heading">
      <div className="hero-copy section-shell section-padding">
        <p className="hero-eyebrow hero-enter">iPhone tại Apple Store</p>
        <h1 id="hero-heading" className="hero-title hero-enter">iPhone.<br /><span>Đẹp từ mọi góc nhìn.</span></h1>
        <p className="hero-description hero-enter">Thiết kế tinh tế. Trải nghiệm khác biệt.<br className="mobile-break" /> Tìm chiếc iPhone dành cho bạn.</p>
        <div className="hero-actions hero-enter">
          <a href="#products" className="btn-primary focus-ring">Khám phá iPhone <ChevronRight size={17} aria-hidden="true" /></a>
          <a href={zaloTragopUrl} target="_blank" rel="noopener noreferrer" className="text-link focus-ring">Tư vấn trả góp <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="hero-product-stage"><Scene3DLoader /></div>
      <div className="hero-caption section-shell section-padding">
        <p>Khám phá thiết kế <strong>iPhone 18 Pro Max</strong></p>
        <span><ShieldCheck size={16} aria-hidden="true" /> Chính hãng. Tư vấn minh bạch.</span>
      </div>
    </section>
  );
}
