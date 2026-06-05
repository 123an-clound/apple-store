'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, Sparkles, MessageCircle } from 'lucide-react';
import { ZALO_TRAGOP_URL } from '@/lib/constants';

// Remove unused Image import since we're using SVG now

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
  return (
    <section className="relative overflow-hidden pt-0 sm:pt-0 lg:pt-28 pb-8 sm:pb-10 lg:pb-16 lg:min-h-[80svh] lg:flex lg:items-end lg:justify-center">

      {/* Desktop SVG Background */}
      <motion.div 
        className="absolute inset-0 z-0 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="50%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#db2777" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="1920" height="1080" fill="url(#bgGradient)" />

          {/* Decorative circles */}
          <circle cx="200" cy="200" r="300" fill="url(#pinkGradient)" opacity="0.6">
            <animate attributeName="r" values="280;300;280" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="1700" cy="300" r="250" fill="url(#goldGradient)" opacity="0.5">
            <animate attributeName="r" values="230;250;230" dur="10s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.6;0.4" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="960" cy="800" r="400" fill="url(#pinkGradient)" opacity="0.4">
            <animate attributeName="r" values="380;400;380" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="6s" repeatCount="indefinite" />
          </circle>

          {/* Phone outlines - stylized iPhone shapes */}
          <g opacity="0.15" fill="#ec4899">
            {/* Left phone */}
            <rect x="100" y="350" width="180" height="380" rx="40" transform="rotate(-15 190 540)" />
            <rect x="120" y="370" width="140" height="320" rx="30" transform="rotate(-15 190 540)" fill="rgba(255,255,255,0.5)" />

            {/* Right phone */}
            <rect x="1640" y="400" width="200" height="400" rx="45" transform="rotate(15 1740 600)" />
            <rect x="1660" y="420" width="160" height="340" rx="35" transform="rotate(15 1740 600)" fill="rgba(255,255,255,0.5)" />

            {/* Top phone */}
            <rect x="800" y="100" width="150" height="300" rx="35" transform="rotate(-5 875 250)" />
            <rect x="815" y="115" width="120" height="260" rx="28" transform="rotate(-5 875 250)" fill="rgba(255,255,255,0.5)" />
          </g>

          {/* Decorative lines */}
          <g opacity="0.2" stroke="#ec4899" strokeWidth="2" fill="none">
            <path d="M0 500 Q400 400 800 500 T1600 500 T1920 400" strokeDasharray="10 10">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M0 600 Q400 700 800 600 T1600 600 T1920 700" strokeDasharray="15 15">
              <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.3;0.2" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M0 700 Q400 800 800 700 T1600 700 T1920 800" strokeDasharray="8 8">
              <animate attributeName="stroke-dashoffset" from="50" to="0" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.35;0.2" dur="4s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Small decorative elements */}
          <g opacity="0.3" fill="#f472b6">
            <circle cx="300" cy="150" r="8">
              <animate attributeName="cy" values="150;140;150" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="1600" cy="200" r="12">
              <animate attributeName="cy" values="200;215;200" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="850" r="10">
              <animate attributeName="cy" values="850;835;850" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="1400" cy="750" r="15">
              <animate attributeName="cy" values="750;770;750" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="900" cy="300" r="6">
              <animate attributeName="cy" values="300;290;300" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="1100" cy="450" r="9">
              <animate attributeName="cy" values="450;465;450" dur="4.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3.5s" repeatCount="indefinite" />
            </circle>
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

      {/* Mobile/Tablet SVG Background */}
      <motion.div 
        className="relative z-10 lg:hidden" 
        style={{ paddingTop: '56px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '52vw',
          minHeight: 180,
          maxHeight: 260,
          overflow: 'hidden',
        }}>
          <svg
            className="w-full h-full"
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mobileBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="100%" stopColor="#fce7f3" />
              </linearGradient>
              <linearGradient id="mobilePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <rect width="400" height="200" fill="url(#mobileBgGradient)" />

            <circle cx="80" cy="60" r="50" fill="url(#mobilePinkGradient)" opacity="0.6" />
            <circle cx="320" cy="140" r="60" fill="url(#mobilePinkGradient)" opacity="0.4" />

            <g opacity="0.2" fill="#ec4899">
              <rect x="150" y="40" width="60" height="120" rx="15" transform="rotate(-10 180 100)" />
              <rect x="160" y="50" width="40" height="90" rx="8" transform="rotate(-10 180 100)" fill="rgba(255,255,255,0.5)" />
            </g>

            <g opacity="0.3" fill="#f472b6">
              <circle cx="50" cy="50" r="6" />
              <circle cx="350" cy="40" r="8" />
              <circle cx="200" cy="160" r="10" />
            </g>

            <rect width="400" height="200" fill="url(#mobileBgGradient)" opacity="0.4" />
            
            {/* Animated particles */}
            <g>
              <circle cx="50" cy="30" r="2" fill="#ec4899">
                <animate attributeName="cy" values="30;40;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="350" cy="50" r="3" fill="#f472b6">
                <animate attributeName="cy" values="50;35;50" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="100" r="2" fill="#ec4899">
                <animate attributeName="cy" values="100;110;100" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="150" r="2.5" fill="#f472b6">
                <animate attributeName="cy" values="150;140;150" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="300" cy="170" r="2" fill="#ec4899">
                <animate attributeName="cy" values="170;180;170" dur="4.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4.5s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
        </div>
      </motion.div>

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
            <Sparkles size={14} className="shrink-0 icon-float" />
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
                textShadow: '0 0 30px rgba(236,72,153,0.8), 0 0 60px rgba(236,72,153,0.4)'
              }}
              transition={{ duration: 0.3 }}
            >
              Linh Tây
            </motion.span>
            <span className="block shimmer-text">Store</span>
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
              className="btn-neon btn-modern btn-liquid btn-3d"
              whileHover={{ 
                boxShadow: '0 20px 50px -6px rgba(236,72,153,0.9), 0 0 70px rgba(236,72,153,0.7), 0 0 100px rgba(236,72,153,0.5)',
                background: 'linear-gradient(135deg, #f472b6, #ec4899, #db2777, #be185d)'
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, minHeight: 56, padding: '0 36px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 8px 28px -4px rgba(236,72,153,0.5), 0 0 40px rgba(236,72,153,0.3), 0 0 60px rgba(236,72,153,0.2)', whiteSpace: 'nowrap',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <MessageCircle size={20} className="icon-float" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' }} />
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
            <motion.span 
              className="hero-trust-badge"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(236,72,153,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" aria-hidden />
              Cập nhật theo kho thực tế
            </motion.span>
            <motion.span 
              className="hero-trust-badge"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59,130,246,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden />
              Tư vấn nhanh trên Zalo
            </motion.span>
            <motion.span 
              className="hero-trust-badge"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(245,158,11,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
              Hỗ trợ mua trả góp
            </motion.span>
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
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 8px 24px rgba(236,72,153,0.2)',
                    borderColor: 'rgba(236,72,153,0.3)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="hero-highlight-icon"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon size={22} className="icon-float" />
                  </motion.div>
                  <div className="hero-highlight-text">
                    <motion.p 
                      className="hero-highlight-title"
                      whileHover={{ color: '#ec4899' }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                    </motion.p>
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
