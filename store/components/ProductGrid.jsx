'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ cards, onCardClick, onResetFilter }) {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
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
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] mb-5 glow-pink"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Smartphone size={32} className="text-[var(--text-muted)] icon-float" strokeWidth={1.5} />
          </motion.div>
          <motion.p 
            className="text-lg font-semibold text-[var(--text-primary)]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Không tìm thấy sản phẩm
          </motion.p>
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
