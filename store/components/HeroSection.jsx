'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Smartphone, Sparkles, MessageCircle } from 'lucide-react';
import { ZALO_TRAGOP_URL } from '@/lib/constants';

const heroHighlights = [
  {
    icon: Smartphone,
    title: 'iPhone chính hãng',
    description: 'Dòng máy cập nhật liên tục theo kho thực tế.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo hành uy tín',
    description: 'Hỗ trợ rõ ràng, dễ hiểu, dễ theo dõi.',
  },
];

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-0 sm:pt-0 lg:pt-28 pb-8 sm:pb-10 lg:pb-16 lg:min-h-[80svh] lg:flex lg:items-end lg:justify-center">

      {/* Desktop SVG Background. It is purely decorative and driven by ~30 SMIL
          <animate> elements, which no CSS media query can switch off — so skip
          rendering it entirely when reduced motion is requested. */}
      {!reduceMotion && (
      <motion.div
        className="absolute inset-0 z-0 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="50%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#46a5e3" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#46a5e3" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#46a5e3" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a853" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d4a853" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="1920" height="1080" fill="url(#bgGradient)" />

          {/* Decorative circles */}
          <circle cx="200" cy="200" r="300" fill="url(#primaryGradient)" opacity="0.6">
            <animate attributeName="r" values="280;300;280" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="1700" cy="300" r="250" fill="url(#secondaryGradient)" opacity="0.5">
            <animate attributeName="r" values="230;250;230" dur="10s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.6;0.4" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="960" cy="800" r="400" fill="url(#primaryGradient)" opacity="0.4">
            <animate attributeName="r" values="380;400;380" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="6s" repeatCount="indefinite" />
          </circle>

          {/* Phone outlines - stylized iPhone shapes */}
          <g opacity="0.2" fill="#46a5e3">
            {/* Left phone */}
            <rect x="100" y="350" width="180" height="380" rx="40" transform="rotate(-15 190 540)" />
            <rect x="120" y="370" width="140" height="320" rx="30" transform="rotate(-15 190 540)" fill="rgba(255,255,255,0.5)" />
            {/* Camera notch */}
            <rect x="170" y="385" width="40" height="12" rx="6" transform="rotate(-15 190 540)" fill="rgba(70,165,227,0.8)" />

            {/* Right phone */}
            <rect x="1640" y="400" width="200" height="400" rx="45" transform="rotate(15 1740 600)" />
            <rect x="1660" y="420" width="160" height="340" rx="35" transform="rotate(15 1740 600)" fill="rgba(255,255,255,0.5)" />
            {/* Camera notch */}
            <rect x="1715" y="435" width="45" height="12" rx="6" transform="rotate(15 1740 600)" fill="rgba(70,165,227,0.8)" />

            {/* Top phone */}
            <rect x="800" y="100" width="150" height="300" rx="35" transform="rotate(-5 875 250)" />
            <rect x="815" y="115" width="120" height="260" rx="28" transform="rotate(-5 875 250)" fill="rgba(255,255,255,0.5)" />
            {/* Camera notch */}
            <rect x="855" y="125" width="35" height="10" rx="5" transform="rotate(-5 875 250)" fill="rgba(70,165,227,0.8)" />

            {/* Bottom left small phone */}
            <rect x="50" y="750" width="100" height="200" rx="25" transform="rotate(-20 100 850)" opacity="0.7">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" />
            </rect>

            {/* Bottom right small phone */}
            <rect x="1750" y="700" width="110" height="220" rx="28" transform="rotate(10 1805 810)" opacity="0.7">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="5s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* Apple Logo decorations */}
          <g opacity="0.15" fill="#46a5e3">
            {/* Large Apple logo center */}
            <g transform="translate(960, 540)">
              <path d="M0,-60 C-15,-60 -25,-45 -25,-30 C-25,-15 -15,0 0,0 C15,0 25,-15 25,-30 C25,-45 15,-60 0,-60 Z M-10,-25 C-15,-25 -18,-20 -18,-15 C-18,-10 -15,-5 -10,-5 C-5,-5 -2,-10 -2,-15 C-2,-20 -5,-25 -10,-25 Z M10,-25 C5,-25 2,-20 2,-15 C2,-10 5,-5 10,-5 C15,-5 18,-10 18,-15 C18,-20 15,-25 10,-25 Z M0,-10 C-20,-10 -35,5 -35,25 C-35,45 -25,60 0,60 C25,60 35,45 35,25 C35,5 20,-10 0,-10 Z" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur="6s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="6s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Small Apple logos floating */}
            <g transform="translate(200, 150) scale(0.3)">
              <path d="M0,-60 C-15,-60 -25,-45 -25,-30 C-25,-15 -15,0 0,0 C15,0 25,-15 25,-30 C25,-45 15,-60 0,-60 Z M-10,-25 C-15,-25 -18,-20 -18,-15 C-18,-10 -15,-5 -10,-5 C-5,-5 -2,-10 -2,-15 C-2,-20 -5,-25 -10,-25 Z M10,-25 C5,-25 2,-20 2,-15 C2,-10 5,-5 10,-5 C15,-5 18,-10 18,-15 C18,-20 15,-25 10,-25 Z M0,-10 C-20,-10 -35,5 -35,25 C-35,45 -25,60 0,60 C25,60 35,45 35,25 C35,5 20,-10 0,-10 Z">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
              </path>
            </g>

            <g transform="translate(1700, 200) scale(0.4)">
              <path d="M0,-60 C-15,-60 -25,-45 -25,-30 C-25,-15 -15,0 0,0 C15,0 25,-15 25,-30 C25,-45 15,-60 0,-60 Z M-10,-25 C-15,-25 -18,-20 -18,-15 C-18,-10 -15,-5 -10,-5 C-5,-5 -2,-10 -2,-15 C-2,-20 -5,-25 -10,-25 Z M10,-25 C5,-25 2,-20 2,-15 C2,-10 5,-5 10,-5 C15,-5 18,-10 18,-15 C18,-20 15,-25 10,-25 Z M0,-10 C-20,-10 -35,5 -35,25 C-35,45 -25,60 0,60 C25,60 35,45 35,25 C35,5 20,-10 0,-10 Z">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
              </path>
            </g>

            <g transform="translate(400, 850) scale(0.25)">
              <path d="M0,-60 C-15,-60 -25,-45 -25,-30 C-25,-15 -15,0 0,0 C15,0 25,-15 25,-30 C25,-45 15,-60 0,-60 Z M-10,-25 C-15,-25 -18,-20 -18,-15 C-18,-10 -15,-5 -10,-5 C-5,-5 -2,-10 -2,-15 C-2,-20 -5,-25 -10,-25 Z M10,-25 C5,-25 2,-20 2,-15 C2,-10 5,-5 10,-5 C15,-5 18,-10 18,-15 C18,-20 15,-25 10,-25 Z M0,-10 C-20,-10 -35,5 -35,25 C-35,45 -25,60 0,60 C25,60 35,45 35,25 C35,5 20,-10 0,-10 Z">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
              </path>
            </g>

            <g transform="translate(1500, 800) scale(0.35)">
              <path d="M0,-60 C-15,-60 -25,-45 -25,-30 C-25,-15 -15,0 0,0 C15,0 25,-15 25,-30 C25,-45 15,-60 0,-60 Z M-10,-25 C-15,-25 -18,-20 -18,-15 C-18,-10 -15,-5 -10,-5 C-5,-5 -2,-10 -2,-15 C-2,-20 -5,-25 -10,-25 Z M10,-25 C5,-25 2,-20 2,-15 C2,-10 5,-5 10,-5 C15,-5 18,-10 18,-15 C18,-20 15,-25 10,-25 Z M0,-10 C-20,-10 -35,5 -35,25 C-35,45 -25,60 0,60 C25,60 35,45 35,25 C35,5 20,-10 0,-10 Z">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.5s" repeatCount="indefinite" />
              </path>
            </g>
          </g>

          {/* iPhone signal/wave decorations */}
          <g opacity="0.12" stroke="#46a5e3" strokeWidth="2" fill="none">
            {/* Signal waves from phones */}
            <g transform="translate(190, 540)">
              <circle r="50" strokeDasharray="8 8">
                <animate attributeName="r" values="50;70;50" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle r="80" strokeDasharray="12 12">
                <animate attributeName="r" values="80;100;80" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
              </circle>
            </g>

            <g transform="translate(1740, 600)">
              <circle r="60" strokeDasharray="8 8">
                <animate attributeName="r" values="60;85;60" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle r="90" strokeDasharray="12 12">
                <animate attributeName="r" values="90;115;90" dur="4.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4.5s" repeatCount="indefinite" />
              </circle>
            </g>

            <g transform="translate(875, 250)">
              <circle r="40" strokeDasharray="6 6">
                <animate attributeName="r" values="40;60;40" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle r="65" strokeDasharray="10 10">
                <animate attributeName="r" values="65;85;65" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>

          {/* Gradient overlay */}
          <rect width="1920" height="1080" fill="url(#bgGradient)" opacity="0.3" />
        </svg>

        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-[var(--bg-color)]/90 dark:from-black/30 dark:via-black/20 dark:to-[var(--bg-color)]/95"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-pink-400/15 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-[-8%] h-80 w-80 rounded-full bg-amber-300/15 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </motion.div>
      )}

      {/* Hero card */}
      <div className="relative z-10 w-full max-w-4xl xl:max-w-5xl mx-auto section-padding mt-5 lg:mt-0">
        <div className="hero-glass-card text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] border border-pink-500/25 bg-[var(--color-primary-soft)] text-pink-700 dark:text-pink-400 text-xs sm:text-sm font-semibold shine-effect"
          >
            <Sparkles size={14} className="shrink-0" />
            iPhone chính hãng · Giá tốt
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            whileHover={{ scale: 1.02 }}
            className="text-display"
          >
            <motion.span 
              className="block text-[var(--text-primary)] glow-text-pink"
              whileHover={{
                textShadow: '0 0 30px rgba(53,87,240,0.8), 0 0 60px rgba(236,72,153,0.4)'
              }}
              transition={{ duration: 0.3 }}
            >
              Apple
            </motion.span>
            <span className="block glow-text-blue logo-text-glow">Store</span>
          </motion.h1>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.a
              href={ZALO_TRAGOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-modern btn-shine-sweep btn-full-glow"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 35px rgba(70,165,227,0.6), 0 0 60px rgba(70,165,227,0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, minHeight: 56, padding: '0 36px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #46a5e3, #3899d0)',
                color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <MessageCircle size={20} />
              Nhận tư vấn mua trả góp ngay
            </motion.a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div
              className="hero-trust-badge-special"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {/* Static highlight stripe — used to sweep on a 1.5s infinite loop
                  regardless of interaction; now only the parent badge animates,
                  on hover/focus (see .hero-trust-badge-special in globals.css). */}
              <div className="hero-trust-badge-shine" />
              <span className="hero-trust-badge-text">✨ Bán trả góp</span>
            </motion.div>
          </motion.div>

          {/* Highlight cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
            className="hero-highlights-grid"
          >
            {heroHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="hero-highlight-card card-shine"
                  style={{ animationDelay: `${index * 90}ms` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="hero-highlight-icon">
                    <Icon size={22} />
                  </div>
                  <div className="hero-highlight-text">
                    <p className="hero-highlight-title">{item.title}</p>
                    <p className="hero-highlight-desc">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
