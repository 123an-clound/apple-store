'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { formatPrice, BADGES } from '@/lib/product-display';

const SLIDE_INTERVAL = 3500;

export default function ProductCard({ card, onClick }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const images = card.images;
  const advance = useCallback(() => setCurrentImg((prev) => (prev + 1) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused || !inView || reduceMotion) return;
    const timer = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, images.length, paused, inView, reduceMotion]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startingPrice = formatPrice(card.lowestPrice);
  return (
    <article ref={cardRef} className="catalog-card" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div className="catalog-card-image">
        {images.length > 0 ? <Image src={images[currentImg]} alt={card.name + ' - ảnh ' + (currentImg + 1)} fill sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 300px" /> : <span className="absolute inset-0 flex items-center justify-center text-caption">Chưa có ảnh</span>}
      </div>
      {images.length > 1 && (
        <div className="catalog-card-slides" role="group" aria-label={'Ảnh ' + card.name}>
          {images.map((_, index) => <button type="button" key={index} aria-label={'Xem ảnh ' + (index + 1) + ' của ' + card.name} aria-pressed={index === currentImg} onClick={() => { setCurrentImg(index); setPaused(true); }} />)}
        </div>
      )}
      <div className="catalog-card-body">
        <div className="catalog-card-series"><span>{card.series}</span>{card.badge && BADGES[card.badge] && <span className="catalog-card-badge" style={{ background: BADGES[card.badge].color }}>{BADGES[card.badge].label}</span>}</div>
        <h3><button type="button" onClick={(event) => onClick(card, event.currentTarget)} aria-label={'Xem chi tiết ' + card.name + ', giá từ ' + startingPrice}>{card.name}</button></h3>
        <p className="catalog-card-variants">{card.variants.length} mẫu sẵn có</p>
        <div className="catalog-card-price">
          <div><span>Giá từ</span><strong>{startingPrice}</strong></div>
          <span className="catalog-card-arrow" aria-hidden="true"><ChevronRight size={16} /></span>
        </div>
      </div>
    </article>
  );
}
