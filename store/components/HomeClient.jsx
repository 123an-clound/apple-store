'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LazyMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureHighlights from '@/components/FeatureHighlights';
import ProductGrid from '@/components/ProductGrid';
import FloatingContact from '@/components/FloatingContact';

const loadAnimationFeatures = () => import('./motion-features').then((module) => module.default);

export default function HomeClient({ allCards, series }) {
  const [activeSeries, setActiveSeries] = useState(null);
  const [search, setSearch] = useState('');
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const visibleCards = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return allCards.filter((card) => (!activeSeries || card.series === activeSeries) && card.name.toLocaleLowerCase('vi').includes(query))
      .sort((a, b) => (b.sttMax ?? 0) - (a.sttMax ?? 0));
  }, [allCards, activeSeries, search]);
  const isModalOpen = pathname.startsWith('/san-pham/');

  useEffect(() => {
    const hero = document.querySelector('.product-hero');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setIsHeroVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const resetFilters = () => { setActiveSeries(null); setSearch(''); };

  return (
    <LazyMotion features={loadAnimationFeatures} strict>
      <Navbar />
      <HeroSection />
      <FeatureHighlights />
      <section id="products" className="catalog-section" aria-labelledby="products-heading">
        <div className="section-shell section-padding">
          <header className="catalog-heading">
            <div>
              <p className="section-eyebrow">Bộ sưu tập iPhone</p>
              <h2 id="products-heading">Tìm chiếc iPhone của bạn.</h2>
              <p className="catalog-description">Chọn dòng máy. Khám phá phiên bản phù hợp.</p>
            </div>
            <div className="catalog-search">
              <label htmlFor="product-search" className="sr-only">Tìm kiếm iPhone</label>
              <Search size={18} aria-hidden="true" />
              <input id="product-search" type="search" placeholder="Tìm iPhone của bạn" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" />
            </div>
          </header>
          <div className="catalog-toolbar">
            <div className="series-nav" role="group" aria-label="Lọc theo dòng iPhone">
              <button type="button" aria-pressed={!activeSeries} className={'series-pill focus-ring ' + (!activeSeries ? 'series-pill--active' : '')} onClick={() => setActiveSeries(null)}>Tất cả</button>
              {series.map((item) => <button type="button" key={item} aria-pressed={activeSeries === item} className={'series-pill focus-ring ' + (activeSeries === item ? 'series-pill--active' : '')} onClick={() => setActiveSeries(item)}>{item}</button>)}
            </div>
          </div>
          <div className="catalog-results">
            <p role="status" aria-live="polite">{visibleCards.length} mẫu iPhone{activeSeries ? ' thuộc ' + activeSeries : ''}</p>
            {(activeSeries || search) && <button type="button" className="text-link focus-ring" onClick={resetFilters}>Xóa lọc <X size={15} aria-hidden="true" /></button>}
          </div>
          <ProductGrid cards={visibleCards} onCardClick={(card) => router.push('/san-pham/' + card.slug)} onResetFilter={resetFilters} />
        </div>
      </section>
      <FloatingContact hidden={isModalOpen || isHeroVisible} />
    </LazyMotion>
  );
}
