'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Menu, X, Phone, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { TEL_URL, HOTLINE_DISPLAY } from '@/lib/constants';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const scrolled = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('scroll', onStoreChange, { passive: true });
      return () => window.removeEventListener('scroll', onStoreChange);
    },
    () => window.scrollY > 16,
    () => false
  );

  useEffect(() => {
    // Sync initial theme from HTML class set in layout script.
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--surface)]/96 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-[var(--shadow-1)]'
          : 'bg-[var(--surface)]/80 backdrop-blur-md'
      }`}
    >
      <div className="section-shell section-padding flex items-center justify-between h-14 sm:h-16 lg:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus-ring rounded-lg logo-container-glow">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-[var(--radius-md)] overflow-hidden ring-1 ring-[var(--border-subtle)] group-hover:ring-blue-500/40 transition-all logo-glow">
            <Image
              src="/logo.png"
              alt="Apple Store logo"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 32px, 36px"
            />
          </div>
          <span className="font-bold text-base sm:text-lg lg:text-xl tracking-tight heading-display">
            <span className="text-[var(--text-primary)]">Apple</span>{' '}
            <span className="text-blue-gradient glow-text-blue">Store</span>
          </span>
        </Link>

        <motion.div className="hidden lg:flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 0 25px rgba(50,55,74,0.5), 0 0 50px rgba(50,55,74,0.3)'
            }}
            whileTap={{ scale: 0.9 }}
            className="btn-ghost gap-2 !min-h-[40px] px-4 btn-modern btn-liquid"
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            <Sun size={18} className={theme === 'dark' ? 'icon-float' : 'icon-float-delayed'} />
            {theme === 'dark' ? 'Sáng' : 'Tối'}
          </motion.button>
          <motion.a 
            href={TEL_URL} 
            className="btn-ghost gap-2 !min-h-[40px] px-4 btn-neon"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 25px rgba(70,165,227,0.5), 0 0 40px rgba(70,165,227,0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden />
            {HOTLINE_DISPLAY}
          </motion.a>
          <motion.a 
            href="#products" 
            className="btn-primary btn-sm !min-h-[40px] px-5 btn-modern btn-shine-sweep"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 35px rgba(70,165,227,0.6), 0 0 60px rgba(70,165,227,0.4)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Sản phẩm
          </motion.a>
        </motion.div>

        <button
          type="button"
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-primary)] focus-ring rounded-[var(--radius-md)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)' }}
            className="lg:hidden"
          >
            {/* Menu card */}
            <div style={{ margin: '12px 16px 16px', borderRadius: 16, border: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)', overflow: 'hidden' }}>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: 'transparent', border: 'none',
                  borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                  </span>
                  {theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '3px 10px', fontWeight: 500 }}>
                  {theme === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'}
                </span>
              </button>

              {/* Xem sản phẩm */}
              <a
                href="#products"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', textDecoration: 'none',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/></svg>
                  </span>
                  Xem sản phẩm
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 9999, padding: '3px 10px', fontWeight: 500 }}>
                  Khám phá
                </span>
              </a>

              {/* Call CTA */}
              <div style={{ padding: '16px 20px' }}>
                <a
                  href={TEL_URL}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    width: '100%', minHeight: 52, borderRadius: 12,
                    background: 'linear-gradient(135deg, #66b5e8, #86c5ed)',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                    textDecoration: 'none', boxShadow: '0 4px 16px rgba(70,165,227,0.5)',
                  }}
                >
                  <Phone size={18} />
                  Gọi {HOTLINE_DISPLAY}
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
