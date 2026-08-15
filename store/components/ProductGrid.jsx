'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import ProductCard from './ProductCard';

// Stagger only the first screenful. At 0.05s per card an uncapped stagger meant the
// last of ~50 cards did not appear until 2.5s after the grid rendered.
const STAGGER_STEP = 0.04;
const MAX_STAGGERED = 8;

export default function ProductGrid({ cards, onCardClick, onResetFilter }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="product-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(index, MAX_STAGGERED) * STAGGER_STEP,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ProductCard card={card} onClick={onCardClick} />
          </motion.div>
        ))}
      </AnimatePresence>

      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full w-full text-center py-16 sm:py-24"
        >
          {/* Static on purpose: an empty state that pulses forever reads as an
              error and keeps the compositor busy for no reason. */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] mb-5 glow-blue">
            <Smartphone size={32} className="text-[var(--text-muted)]" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Không tìm thấy sản phẩm
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">
            Thử chọn dòng iPhone khác hoặc xem toàn bộ danh mục.
          </p>
          {onResetFilter && (
            <motion.button
              type="button"
              onClick={onResetFilter}
              className="mt-6 btn-primary text-sm py-3 px-6 min-h-[44px] btn-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Xem tất cả sản phẩm
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
