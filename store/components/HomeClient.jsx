'use client';

import { useState, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import ProductModal from '@/components/ProductModal';
import FloatingContact from '@/components/FloatingContact';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function HomeClient({ allCards, series }) {
  const [activeSeries, setActiveSeries] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const lastTriggerElRef = useRef(null);

  const visibleCards = useMemo(() => {
    const bySeries = activeSeries ? allCards.filter((c) => c.series === activeSeries) : allCards;
    return [...bySeries].sort((a, b) => (b.sttMax ?? 0) - (a.sttMax ?? 0));
  }, [allCards, activeSeries]);

  const isModalOpen = Boolean(selectedCard);

  const onCardClick = (card, triggerEl) => {
    lastTriggerElRef.current = triggerEl || null;
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
    requestAnimationFrame(() => {
      lastTriggerElRef.current?.focus?.();
    });
  };

  return (
    <>
      <Navbar />
      <HeroSection />

      <section
        id="products"
        className="relative -mt-4 sm:-mt-8 rounded-t-[var(--radius-2xl)] bg-[var(--surface-section)] border-t border-[var(--border-subtle)]"
        aria-labelledby="products-heading"
      >
        <div className="section-shell section-padding pb-28 sm:pb-24 md:pb-28 pt-8 sm:pt-12 md:pt-14">

          {/* Sticky controls */}
          <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 lg:mx-0 mb-6 sm:mb-8">
            <div style={{ background: 'var(--surface-section)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '12px 16px', boxShadow: 'var(--shadow-1)' }}>
              {/* Series filter pills */}
              <div
                className="series-nav flex items-center gap-2 overflow-x-auto py-1"
                role="tablist"
                aria-label="Lọc theo dòng iPhone"
              >
                <SeriesPill label="Tất cả" active={activeSeries === null} onClick={() => setActiveSeries(null)} />
                {series.map((s) => (
                  <SeriesPill key={s} label={s} active={activeSeries === s} onClick={() => setActiveSeries(s)} />
                ))}
              </div>
            </div>
          </div>

          {/* Section header */}
          <header className="section-header">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 id="products-heading" className="text-h1 text-[var(--text-primary)]">
                {activeSeries ? activeSeries : 'Tất cả sản phẩm'}
              </h2>
              <p className="text-body mt-1" aria-live="polite">
                <span className="font-semibold text-[var(--text-primary)]">
                  {visibleCards.length}
                </span>{' '}
                mẫu iPhone
              </p>
            </motion.div>

            {activeSeries && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="filter-chip">
                  {activeSeries}
                  <button
                    type="button"
                    onClick={() => setActiveSeries(null)}
                    className="p-0.5 rounded-full hover:bg-pink-500/20 focus-ring"
                    aria-label="Xóa bộ lọc"
                  >
                    <X size={14} />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSeries(null)}
                  className="btn-ghost text-xs sm:text-sm"
                >
                  Xóa lọc
                </button>
              </motion.div>
            )}
          </header>

          <ProductGrid
            cards={visibleCards}
            onCardClick={onCardClick}
            onResetFilter={() => setActiveSeries(null)}
          />
        </div>
      </section>

      {selectedCard && (
        <ProductModal card={selectedCard} onClose={closeModal} />
      )}

      <FloatingContact hidden={isModalOpen} />
    </>
  );
}

function SeriesPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`series-pill focus-ring ${active ? 'series-pill--active' : ''}`}
    >
      {label}
    </button>
  );
}
