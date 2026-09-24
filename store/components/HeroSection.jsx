'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BadgeCheck,
  Camera,
  Cpu,
  Gem,
  MessageCircle,
  MousePointer2,
  PanelTop,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { HOTLINE_DISPLAY, TEL_URL, ZALO_TRAGOP_URL } from '@/lib/constants';
import Scene3DLoader from '@/components/Scene3DLoader';

const heroHighlights = [
  { icon: Smartphone, title: 'iPhone chính hãng', description: 'Dòng máy cập nhật liên tục theo kho thực tế.' },
  { icon: ShieldCheck, title: 'Bảo hành uy tín', description: 'Hỗ trợ rõ ràng, dễ hiểu, dễ theo dõi.' },
];

const stageFeatures = [
  { label: 'Thiết kế Pro Max', icon: Gem, position: 'stage-feature-titanium' },
  { label: 'A20 Pro', icon: Cpu, position: 'stage-feature-chip' },
  { label: 'Camera Pro Fusion', icon: Camera, position: 'stage-feature-camera' },
  { label: 'Dynamic Island', icon: PanelTop, position: 'stage-feature-island' },
];

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const enter = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : delay },
  });

  return (
    <section className="spline-hero relative isolate overflow-hidden">
      <div className="spline-hero-ambient" aria-hidden="true" />
      <div className="section-shell section-padding spline-hero-grid">
        <div className="spline-hero-copy">
          <motion.div {...enter(0.05)} className="spline-eyebrow glass-spline">
            <Sparkles size={15} aria-hidden="true" />
            <span>iPhone chính hãng · Giá tốt</span>
          </motion.div>

          <motion.h1 {...enter(0.12)} className="spline-hero-title">
            <span>Apple</span>
            <span className="glow-neon-blue">Store</span>
          </motion.h1>

          <motion.p {...enter(0.2)} className="spline-hero-lead">
            Chọn iPhone phù hợp, nhận tư vấn minh bạch và phương án trả góp nhanh chóng.
          </motion.p>

          <motion.div {...enter(0.27)} className="spline-hero-actions">
            <motion.a
              href={ZALO_TRAGOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-modern btn-shine-sweep btn-full-glow spline-primary-cta focus-ring"
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <MessageCircle size={20} aria-hidden="true" />
              <span>Nhận tư vấn mua trả góp ngay</span>
            </motion.a>

            <motion.a
              href={TEL_URL}
              className="spline-hotline-cta glass-spline focus-ring"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              aria-label={`Gọi hotline ${HOTLINE_DISPLAY}`}
            >
              <Phone size={19} aria-hidden="true" />
              <span>{HOTLINE_DISPLAY}</span>
            </motion.a>
          </motion.div>

          <motion.div {...enter(0.34)} className="spline-trust-row">
            <div className="hero-trust-badge-special">
              <div className="hero-trust-badge-shine" aria-hidden="true" />
              <span className="hero-trust-badge-text"><Sparkles size={14} aria-hidden="true" /> Bán trả góp</span>
            </div>
            <span className="spline-trust-note">
              <BadgeCheck size={17} aria-hidden="true" />
              Tư vấn rõ ràng, không phí ẩn
            </span>
          </motion.div>

          <motion.div {...enter(0.41)} className="spline-highlight-grid">
            {heroHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="spline-highlight-card glass-spline">
                  <span className="spline-highlight-icon"><Icon size={21} aria-hidden="true" /></span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div {...enter(0.18)} className="spline-stage" aria-label="Mô hình iPhone 3D tương tác">
          <div className="hero-stage-glow" aria-hidden="true" />
          <Scene3DLoader />
          <div className="spline-stage-frame" aria-hidden="true">
            <span className="spline-stage-index">IPHONE 18 PRO MAX / 01</span>
            <span className="spline-stage-axis spline-stage-axis-x" />
            <span className="spline-stage-axis spline-stage-axis-y" />
          </div>

          {stageFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                className={`badge-floating-3d glass-spline ${feature.position}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, index % 2 ? 7 : -7, 0] }}
                transition={reduceMotion ? { duration: 0 } : {
                  opacity: { duration: 0.4, delay: 0.35 + index * 0.08 },
                  scale: { duration: 0.4, delay: 0.35 + index * 0.08 },
                  y: { duration: 4.2 + index * 0.4, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <strong>{feature.label}</strong>
              </motion.div>
            );
          })}

          <motion.div
            className="spline-interaction-hint glass-spline"
            animate={reduceMotion ? undefined : { opacity: [0.72, 1, 0.72] }}
            transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MousePointer2 size={16} aria-hidden="true" />
            Kéo hoặc vuốt để xoay 360°
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
