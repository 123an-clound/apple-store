'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/helpers';

const SLIDE_INTERVAL = 3500;

export default function ProductCard({ card, onClick }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const triggerRef = useRef(null);
  const images = card.images;

  const advance = useCallback(() => {
    if (images.length <= 1 || paused || !inView) return;
    setCurrentImg((prev) => (prev + 1) % images.length);
  }, [images.length, paused, inView]);

  useEffect(() => {
    if (images.length <= 1 || paused || !inView) return;
    const timer = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, images.length, paused, inView]);

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

  const startingPrice = formatPrice(String(card.lowestPrice).replace(/\./g, ''));

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
      <div
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
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        whileHover={{
          boxShadow: '0 0 40px rgba(50,55,74,0.5), 0 0 70px rgba(50,55,74,0.3)',
          borderColor: 'rgba(50,55,74,0.6)',
          transform: 'translateY(-4px)'
        }}
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

          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 2 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ảnh ${i + 1}`}
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
            <div className="product-card-price-value" style={{
              fontWeight: 900,
              color: '#46a5e3',
              lineHeight: 1,
            }}>
              {startingPrice}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
