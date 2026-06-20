'use client';

import { useState, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import ProductModal from '@/components/ProductModal';
import FloatingContact from '@/components/FloatingContact';
import { motion, AnimatePresence } from 'framer-motion';
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
    setActiveSeries(null);
  };

  const handleSeriesClick = (seriesName) => {
    if (activeSeries === seriesName) {
      setActiveSeries(null);
    } else {
      setActiveSeries(seriesName);
    }
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
          <motion.div 
            className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 lg:mx-0 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              style={{ background: 'var(--surface-section)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '12px 16px', boxShadow: 'var(--shadow-1)' }}
              whileHover={{ boxShadow: '0 8px 32px rgba(50,55,74,0.15)' }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          </motion.div>

          {/* Section header */}
          <header className="section-header">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                id="products-heading" 
                className="text-h1 text-[var(--text-primary)] glow-text-blue"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {activeSeries ? activeSeries : 'Tất cả sản phẩm'}
              </motion.h2>
              <motion.p 
                className="text-body mt-1" 
                aria-live="polite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <span className="font-semibold text-[var(--text-primary)] animate-scale-pulse glow-text-blue">
                  {visibleCards.length}
                </span>{' '}
                mẫu iPhone
              </motion.p>
            </motion.div>

            {activeSeries && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap items-center gap-2"
              >
                <motion.span 
                  className="filter-chip"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeSeries}
                  <motion.button
                    type="button"
                    onClick={() => setActiveSeries(null)}
                    className="p-0.5 rounded-full hover:bg-blue-500/20 focus-ring btn-modern"
                    aria-label="Xóa bộ lọc"
                    whileHover={{ 
                      rotate: 90,
                      scale: 1.1,
                      boxShadow: '0 0 15px rgba(50,55,74,0.4)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <X size={14} />
                  </motion.button>
                </motion.span>
                <motion.button
                  type="button"
                  onClick={() => setActiveSeries(null)}
                  className="btn-ghost text-xs sm:text-sm btn-modern"
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: '0 0 20px rgba(50,55,74,0.3), 0 0 35px rgba(50,55,74,0.2)'
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  Xóa lọc
                </motion.button>
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
    <motion.button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`series-pill focus-ring ${active ? 'series-pill--active' : ''}`}
      animate={active ? {
        boxShadow: ['0 0 0 0 rgba(70,165,227,0.5)', '0 0 0 8px rgba(70,165,227,0)']
      } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        animate={active ? {
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
