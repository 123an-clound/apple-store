'use client';

import { useReducedMotion } from 'framer-motion';
import * as m from 'framer-motion/m';
import { Smartphone } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({ cards, onCardClick, onResetFilter }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="product-grid">
      {cards.map((card, index) => (
        <m.div key={card.name}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.035 }}
        >
          <ProductCard card={card} onClick={onCardClick} />
        </m.div>
      ))}
      {cards.length === 0 && (
        <div className="col-span-full w-full text-center py-16 sm:py-24">
          <Smartphone size={38} className="mx-auto mb-5 text-[var(--text-muted)]" strokeWidth={1.25} aria-hidden="true" />
          <p className="text-lg font-semibold text-[var(--text-primary)]">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">Thử chọn dòng iPhone khác hoặc xem toàn bộ danh mục.</p>
          {onResetFilter && <button type="button" onClick={onResetFilter} className="mt-6 btn-primary text-sm py-3 px-6">Xem tất cả sản phẩm</button>}
        </div>
      )}
    </div>
  );
}
