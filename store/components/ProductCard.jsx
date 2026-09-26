'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { formatPrice, BADGES } from '@/lib/helpers';

const SLIDE_INTERVAL = 3500;

export default function ProductCard({ card, onClick }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const triggerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const images = card.images;

  const advance = useCallback(() => {
    setCurrentImg((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    // Auto-play only when the card is on screen, not hovered/focused, and the
    // visitor has not asked for reduced motion.
    if (images.length <= 1 || paused || !inView || reduceMotion) return;
    const timer = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, images.length, paused, inView, reduceMotion]);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => { setInView(entries[0]?.isIntersecting ?? false); },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const startingPrice = formatPrice(card.lowestPrice);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(card, e.currentTarget);
    }
  };

  const goToSlide = (e, index) => {
    e.stopPropagation();
    setCurrentImg(index);
    setPaused(true);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%', height: '100%', minWidth: 0 }}
    >
      <motion.div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={(e) => onClick(card, e.currentTarget)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="ui-card ui-card-interactive focus-ring card-shine btn-modern"
        style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          textAlign: 'left',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
        whileHover={reduceMotion ? undefined : {
          y: -4,
          boxShadow: '0 0 40px rgba(50,55,74,0.5), 0 0 70px rgba(50,55,74,0.3)',
          borderColor: 'rgba(50,55,74,0.6)',
        }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        aria-label={`Xem chi tiết ${card.name}, giá từ ${startingPrice}`}
      >
        {/* ── Image area ── */}
        <div style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--surface-elevated)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.08))', pointerEvents: 'none', zIndex: 1 }} />

          {/* Series badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              borderRadius: 9999, background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)', padding: '3px 10px',
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#fff',
            }}>
              {card.series}
            </span>
          </div>

          {card.badge && BADGES[card.badge] && (
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                borderRadius: 9999, background: BADGES[card.badge].color,
                padding: '3px 10px', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff',
              }}>
                {BADGES[card.badge].label}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.div
                key={currentImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <Image
                  src={images[currentImg]}
                  alt={`${card.name} - ảnh ${currentImg + 1}`}
                  fill
                  className="object-contain sm:group-hover:scale-[1.03] transition-transform duration-500"
                  style={{ padding: '10%' }}
                  sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                />
              </motion.div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '0 12px', textAlign: 'center' }}>
                Chưa có ảnh
              </div>
            )}
          </AnimatePresence>

          {/* Decorative slide dots: hidden from assistive tech and the tab order
              so they don't nest interactive controls inside the card button. */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 2 }} aria-hidden="true">
              {images.map((_, i) => (
                // span, not button: a focusable control nested in the card's
                // role="button" is flagged by axe (nested-interactive) even with tabIndex -1.
                <span
                  key={i}
                  onClick={(e) => goToSlide(e, i)}
                  style={{
                    display: 'block', height: 4, borderRadius: 9999,
                    width: i === currentImg ? 16 : 4,
                    background: i === currentImg ? '#66b5e8' : 'rgba(0,0,0,0.25)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info area — inline style đảm bảo padding luôn có hiệu lực ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 10,
          padding: '14px 14px 14px 14px',
        }}>
          {/* Name + variant count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h3 style={{
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontSize: 13,
              lineHeight: 1.35,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {card.name}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              {card.variants.length} mẫu sẵn có
            </p>
          </div>

          {/* Price box */}
          <div style={{
            marginTop: 'auto',
            borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-elevated)',
            padding: '10px 12px',
          }}>
            <span style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}>
              Giá từ
            </span>
            {/* Sizing and colour live in .product-card-price-value so the fluid
                font-size and theme-aware contrast aren't overridden inline. */}
            <div className="product-card-price-value">
              {startingPrice}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
