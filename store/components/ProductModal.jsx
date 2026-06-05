'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Phone, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { TEL_URL, ZALO_URL } from '@/lib/constants';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function ProductModal({ card, onClose }) {
  const [activeVariant, setActiveVariant] = useState(card.variants[0]);
  const [currentImg, setCurrentImg] = useState(0);
  const isMobile = useIsMobile();
  const images = activeVariant.images.length > 0 ? activeVariant.images : card.images;
  const isActive = (v) => activeVariant.spec === v.spec && activeVariant.price === v.price;

  const selectVariant = (v) => { setActiveVariant(v); setCurrentImg(0); };
  const prevImage = useCallback(() => setCurrentImg((p) => (p - 1 + images.length) % images.length), [images.length]);
  const nextImage = useCallback(() => setCurrentImg((p) => (p + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prevImage, nextImage]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />

      {isMobile ? (
        /* ═══════════════════════════════
            MOBILE — compact bottom sheet
           ═══════════════════════════════ */
        <motion.div
          key="mobile"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog" aria-modal="true" aria-label={card.name}
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            /* Chiều cao vừa đủ để hiển thị ảnh + info, không quá dài */
            maxHeight: '88svh',
            borderRadius: '20px 20px 0 0',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* Drag handle */}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border-strong)' }} />
          </div>

          {/* Header: tên + nút X */}
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '4px 16px 10px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#db2777', background: 'rgba(236,72,153,0.1)', borderRadius: 9999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Sparkles size={9} className="icon-float" />{card.series}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '2px 8px' }}>
                  <ShieldCheck size={9} />Chính hãng
                </span>
              </div>
            </div>
            <motion.button type="button" onClick={onClose} aria-label="Đóng"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </motion.button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

            {/* Ảnh — chiều cao cố định nhỏ gọn */}
            <div style={{ position: 'relative', height: 200, background: 'var(--surface-elevated)', flexShrink: 0 }}>
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.div key={`${activeVariant.spec}-${currentImg}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', inset: 0 }}>
                    <Image src={images[currentImg]} alt={card.name} fill
                      style={{ objectFit: 'contain', padding: '8% 10%' }} priority sizes="100vw" />
                  </motion.div>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Không có ảnh</div>
                )}
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <motion.button type="button" onClick={prevImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <ChevronLeft size={16} />
                  </motion.button>
                  <motion.button type="button" onClick={nextImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <ChevronRight size={16} />
                  </motion.button>
                  <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 2 }}>
                    {images.map((_, i) => (
                      <button key={i} type="button" onClick={() => setCurrentImg(i)}
                        style={{ height: 4, borderRadius: 9999, border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.2s', width: i === currentImg ? 16 : 4, background: i === currentImg ? '#ec4899' : 'rgba(0,0,0,0.2)' }} />
                    ))}
                  </div>
                  <div style={{ position: 'absolute', top: 6, right: 8, zIndex: 2, background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: '1px 6px', fontSize: 10, fontWeight: 600, color: '#fff' }}>
                    {currentImg + 1}/{images.length}
                  </div>
                </>
              )}
            </div>

            {/* Giá + spec */}
            <div style={{ padding: '12px 14px 0' }}>
              <motion.div 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}
                style={{ borderRadius: 12, border: '1px solid rgba(236,72,153,0.2)', background: 'linear-gradient(135deg,rgba(236,72,153,0.07),var(--surface-elevated))', padding: '10px 14px' }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#db2777', margin: '0 0 4px' }}>Giá bán</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#db2777', lineHeight: 1 }}>{activeVariant.priceFormatted}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '2px 7px' }}>{activeVariant.spec}</span>
                </div>
              </motion.div>
            </div>

            {/* Variants */}
            <div style={{ padding: '12px 14px 0' }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 8px' }}>Dung lượng / RAM</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
                {card.variants.map((v, i) => (
                  <button key={`${v.spec}-${v.price}-${i}`} type="button" onClick={() => selectVariant(v)}
                    style={{ padding: '8px 10px', borderRadius: 9, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', border: isActive(v) ? '2px solid #ec4899' : '1.5px solid var(--border-subtle)', background: isActive(v) ? 'rgba(236,72,153,0.07)' : 'var(--surface-elevated)', outline: 'none' }}>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isActive(v) ? '#db2777' : 'var(--text-primary)', lineHeight: 1.3 }}>{v.spec}</span>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, marginTop: 2, color: isActive(v) ? '#db2777' : 'var(--text-muted)' }}>{v.priceFormatted}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            {card.description && (
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)', padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 6px' }}>Mô tả</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{card.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA cố định đáy */}
          <div style={{
            flexShrink: 0,
            padding: '10px 14px',
            paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
            display: 'flex', gap: 8,
          }}>
            <motion.a href={TEL_URL}
              whileHover={{ 
                scale: 1.08,
                boxShadow: '0 0 35px rgba(236,72,153,0.7), 0 0 60px rgba(236,72,153,0.5)'
              }}
              whileTap={{ scale: 0.92 }}
              className="flex-1 flex items-center justify-center gap-6 h-46 rounded-[12px] btn-neon btn-liquid btn-3d"
              style={{ background: 'linear-gradient(135deg,#ec4899,#db2777)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(236,72,153,0.35), 0 0 30px rgba(236,72,153,0.3)' }}>
              <Phone size={15} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />Gọi mua ngay
            </motion.a>
            <motion.a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
              whileHover={{ 
                scale: 1.08,
                boxShadow: '0 0 35px rgba(37,99,235,0.7), 0 0 60px rgba(37,99,235,0.5)'
              }}
              whileTap={{ scale: 0.92 }}
              className="flex-1 flex items-center justify-center gap-6 h-46 rounded-[12px] btn-modern btn-shine-sweep btn-3d"
              style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.3), 0 0 30px rgba(37,99,235,0.3)' }}>
              <MessageCircle size={15} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />Tư vấn Zalo
            </motion.a>
          </div>
        </motion.div>

      ) : (

        /* ═══════════════════════════════
            DESKTOP — centered modal
           ═══════════════════════════════ */
        <motion.div
          key="desktop"
          initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div role="dialog" aria-modal="true" aria-label={card.name}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 960, maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', background: 'var(--surface)', boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px var(--border-subtle)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(236,72,153,0.1)', color: '#db2777', borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}><Sparkles size={11} />{card.series}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}><ShieldCheck size={11} />Chính hãng</span>
              </div>
              <button type="button" onClick={onClose} aria-label="Đóng"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            {/* Body 2 cols */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ width: '44%', flexShrink: 0, position: 'relative', background: 'var(--surface-elevated)', minHeight: 420 }}>
                <AnimatePresence mode="wait">
                  {images.length > 0 ? (
                    <motion.div key={`d-${activeVariant.spec}-${currentImg}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ position: 'absolute', inset: 0 }}>
                      <Image src={images[currentImg]} alt={card.name} fill style={{ objectFit: 'contain', padding: '10%' }} priority sizes="44vw" />
                    </motion.div>
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: 14, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Không có ảnh</p>}
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    <button type="button" onClick={prevImage} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ChevronLeft size={18} /></button>
                    <button type="button" onClick={nextImage} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ChevronRight size={18} /></button>
                    <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2 }}>
                      {images.map((_, i) => <button key={i} type="button" onClick={() => setCurrentImg(i)} style={{ height: 5, borderRadius: 9999, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', width: i === currentImg ? 22 : 5, background: i === currentImg ? '#ec4899' : 'rgba(0,0,0,0.2)' }} />)}
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#fff' }}>{currentImg + 1}/{images.length}</div>
                  </>
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, padding: '24px 28px', borderLeft: '1px solid var(--border-subtle)' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>{card.name}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5 }}>Chọn phiên bản phù hợp với bạn</p>
                </div>
                <div style={{ borderRadius: 14, border: '1px solid rgba(16,185,129,0.22)', background: 'linear-gradient(135deg,rgba(16,185,129,0.08),var(--surface-elevated))', padding: '16px 20px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#db2777', margin: '0 0 8px' }}>Giá bán</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 34, fontWeight: 900, color: '#db2777', lineHeight: 1 }}>{activeVariant.priceFormatted}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '3px 10px' }}>Giá theo phiên bản</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{activeVariant.spec}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Dung lượng / RAM</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
                    {card.variants.map((v, i) => (
                      <button key={`${v.spec}-${v.price}-${i}`} type="button" onClick={() => selectVariant(v)}
                        style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', border: isActive(v) ? '2px solid #ec4899' : '1px solid var(--border-subtle)', background: isActive(v) ? 'rgba(236,72,153,0.1)' : 'var(--surface-elevated)', outline: 'none' }}>
                        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: isActive(v) ? '#db2777' : 'var(--text-primary)', lineHeight: 1.3 }}>{v.spec}</span>
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginTop: 3, color: isActive(v) ? '#db2777' : 'var(--text-muted)' }}>{v.priceFormatted}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {card.description && (
                  <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)', padding: '14px 18px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: '0 0 8px' }}>Mô tả</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{card.description}</p>
                  </div>
                )}
                <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', gap: 10 }}>
                  <motion.a href={TEL_URL}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: '0 0 40px rgba(236,72,153,0.7), 0 0 70px rgba(236,72,153,0.5)'
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="flex-1 flex items-center justify-center gap-8 min-h-50 rounded-[12px] btn-neon btn-liquid btn-3d"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#db2777)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 16px rgba(236,72,153,0.35), 0 0 35px rgba(236,72,153,0.3)' }}>
                    <Phone size={17} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />Gọi mua ngay
                  </motion.a>
                  <motion.a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: '0 0 40px rgba(37,99,235,0.7), 0 0 70px rgba(37,99,235,0.5)'
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="flex-1 flex items-center justify-center gap-8 min-h-50 rounded-[12px] btn-modern btn-shine-sweep btn-3d"
                    style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.3), 0 0 35px rgba(37,99,235,0.3)' }}>
                    <MessageCircle size={17} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />Tư vấn Zalo
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
