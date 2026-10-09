'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { Menu, X, Phone, Sun, Moon, Search, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useContact } from '@/components/ContactProvider';

const themeListeners = new Set();
const subscribeToTheme = (listener) => {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
};
const getThemeSnapshot = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export default function Navbar() {
  const { telUrl, hotlineDisplay, zaloUrl } = useContact();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => 'dark');

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const items = () => Array.from(menuRef.current?.querySelectorAll('a[href], button') ?? []);
    items()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setMobileMenuOpen(false); menuButtonRef.current?.focus(); }
      if (event.key !== 'Tab') return;
      const controls = [menuButtonRef.current, ...items()].filter(Boolean);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem('theme', next); } catch {}
    themeListeners.forEach((listener) => listener());
  };

  return (
    <header className="store-nav">
      <div className="nav-inner section-shell section-padding">
        <Link href="/" prefetch={false} className="store-wordmark focus-ring" aria-label="Apple Store, trang chủ">
          <Image src="/logo.png" alt="" width={30} height={30} /><span>Apple Store</span>
        </Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          <Link href="/#products" prefetch={false}>Sản phẩm</Link><Link href="/#highlights" prefetch={false}>Điểm nổi bật</Link>
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer">Tư vấn</a>
        </nav>
        <div className="nav-actions">
          <Link href="/#product-search" prefetch={false} className="icon-button nav-search" aria-label="Tìm kiếm iPhone"><Search size={18} strokeWidth={1.5} /></Link>
          <button type="button" onClick={toggleTheme} className="icon-button theme-toggle" aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}>
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <Link href="/#products" prefetch={false} className="icon-button nav-shop" aria-label="Xem sản phẩm"><ShoppingBag size={18} strokeWidth={1.5} /></Link>
          <button ref={menuButtonRef} type="button" className="icon-button mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}>
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav ref={menuRef} id="mobile-navigation" className="mobile-navigation" aria-label="Điều hướng di động">
          <Link href="/#products" prefetch={false} onClick={() => setMobileMenuOpen(false)}>Xem sản phẩm <ShoppingBag size={22} /></Link>
          <Link href="/#highlights" prefetch={false} onClick={() => setMobileMenuOpen(false)}>Điểm nổi bật <ArrowUpRight size={22} /></Link>
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>Tư vấn qua Zalo <ArrowUpRight size={22} /></a>
          <button type="button" onClick={() => { toggleTheme(); setMobileMenuOpen(false); menuButtonRef.current?.focus(); }}>{theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'} {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
          <a href={telUrl} className="mobile-hotline"><Phone size={18} /> {hotlineDisplay}</a>
        </nav>
      )}
    </header>
  );
}
