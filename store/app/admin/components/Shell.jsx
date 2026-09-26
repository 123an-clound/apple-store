'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Apple, Menu, X, Moon, Sun, LogOut, ExternalLink, Search, Plus, KeyRound } from 'lucide-react';
import { NAV } from './nav';
import { hasRole, ROLE_LABELS } from '@/lib/roles';
import { signOut } from '../actions';
import { ToastProvider } from './Toast';
import { ConfirmProvider } from './Confirm';

function isActive(pathname, href) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  };
  return (
    <button type="button" onClick={toggle} className="a-btn a-btn-ghost a-btn-sm" aria-label="Đổi giao diện sáng/tối" title="Sáng/tối">
      <Sun size={15} className="hidden dark:block" aria-hidden="true" />
      <Moon size={15} className="dark:hidden" aria-hidden="true" />
    </button>
  );
}

function CommandPalette({ open, onClose, role }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const dialogRef = useRef(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const needle = q.trim().toLowerCase();
  const commands = [
    ...(hasRole(role, 'editor') ? [{ label: 'Thêm sản phẩm mới', href: '/admin/san-pham/moi', icon: Plus }] : []),
    ...NAV.filter((n) => hasRole(role, n.min)).map((n) => ({ label: n.label, href: n.href, icon: n.icon })),
    { label: 'Đổi mật khẩu', href: '/admin/doi-mat-khau', icon: KeyRound },
    { label: 'Mở cửa hàng', href: '/', icon: ExternalLink },
  ].filter((c) => c.label.toLowerCase().includes(needle));
  if (needle) {
    commands.push({ label: `Tìm sản phẩm “${q.trim()}”`, href: `/admin/san-pham?q=${encodeURIComponent(q.trim())}`, icon: Search });
  }

  const close = () => { setQ(''); setActive(0); onClose(); };
  const go = (c) => { close(); router.push(c.href); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, commands.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && commands[active]) { e.preventDefault(); go(commands[active]); }
  };

  return (
    <dialog ref={dialogRef} onClose={close} aria-label="Bảng lệnh"
      onClick={(e) => { if (e.target === dialogRef.current) close(); }}
      className="m-auto mt-[12vh] w-[min(560px,calc(100vw-2rem))] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-0 text-[var(--fg)] shadow-2xl backdrop:bg-black/40">
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4">
        <Search size={16} className="a-subtle" aria-hidden="true" />
        {open && (
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKeyDown}
            placeholder="Gõ lệnh hoặc tên sản phẩm…" aria-label="Tìm lệnh" role="combobox" aria-expanded="true"
            aria-controls="admin-palette-list" aria-activedescendant={commands[active] ? `cmd-${active}` : undefined}
            className="h-12 flex-1 bg-transparent text-sm outline-none" />
        )}
        <kbd className="a-subtle rounded border border-[var(--line)] px-1.5 text-[11px]">Esc</kbd>
      </div>
      <ul id="admin-palette-list" className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Lệnh">
        {commands.map((c, i) => {
          const Icon = c.icon;
          return (
            <li key={c.href + c.label} id={`cmd-${i}`} role="option" aria-selected={i === active}
              onClick={() => go(c)} onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${i === active ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : ''}`}>
              <Icon size={16} aria-hidden="true" />{c.label}
            </li>
          );
        })}
        {commands.length === 0 && <li className="a-subtle px-3 py-6 text-center text-sm">Không có kết quả</li>}
      </ul>
    </dialog>
  );
}

export default function Shell({ email, role, newLeads, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerPath, setDrawerPath] = useState(null);
  const [palette, setPalette] = useState(false);
  // The drawer is tied to the path it was opened on, so navigating closes it
  // without a setState-in-effect.
  const drawer = drawerPath === pathname;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (typing || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
      if (e.key === '/') {
        const el = document.querySelector('[data-admin-search]');
        if (el) { e.preventDefault(); el.focus(); }
      }
      if (e.key === 'n' && hasRole(role, 'editor')) router.push('/admin/san-pham/moi');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [role, router]);

  const nav = (
    <nav aria-label="Điều hướng quản trị" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      {NAV.filter((n) => hasRole(role, n.min)).map((n) => {
        const Icon = n.icon;
        const current = isActive(pathname, n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={current ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              current ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'text-[var(--fg-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--fg)]'
            }`}>
            <Icon size={17} aria-hidden="true" />
            <span className="flex-1">{n.label}</span>
            {n.badge === 'leads' && newLeads > 0 && (
              <span className="a-chip bg-red-700 text-white">
                {newLeads}<span className="sr-only"> khách mới</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t border-[var(--line)] p-3">
      <p className="truncate px-1 text-sm font-medium" title={email}>{email}</p>
      <p className="a-subtle mb-3 px-1 text-xs">{ROLE_LABELS[role]}</p>
      <div className="flex gap-2">
        <ThemeToggle />
        <Link href="/" target="_blank" className="a-btn a-btn-ghost a-btn-sm flex-1" title="Mở cửa hàng">
          <ExternalLink size={14} aria-hidden="true" /> Cửa hàng
        </Link>
        <form action={signOut}>
          <button type="submit" className="a-btn a-btn-ghost a-btn-sm" aria-label="Đăng xuất" title="Đăng xuất">
            <LogOut size={15} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-4">
      <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
        <Apple size={16} aria-hidden="true" />
      </span>
      <span className="font-semibold tracking-tight">Apple Store</span>
    </Link>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-[var(--panel)] focus:px-4 focus:py-2 focus:shadow">
        Bỏ qua đến nội dung
      </a>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--panel)] lg:flex">
          {brand}
          <button type="button" onClick={() => setPalette(true)}
            className="mx-3 mb-1 flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--fg-subtle)] hover:bg-[var(--panel-muted)]">
            <Search size={15} aria-hidden="true" /><span className="flex-1 text-left">Tìm nhanh…</span>
            <kbd className="rounded border border-[var(--line)] px-1.5 text-[11px]">Ctrl K</kbd>
          </button>
          {nav}
          {account}
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Đóng menu" onClick={() => setDrawerPath(null)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--panel)] shadow-xl">
              <div className="flex items-center justify-between pr-3">
                {brand}
                <button type="button" onClick={() => setDrawerPath(null)} className="a-btn a-btn-ghost a-btn-sm" aria-label="Đóng menu"><X size={16} /></button>
              </div>
              {nav}
              {account}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--line)] bg-[var(--panel)] px-4 lg:hidden">
            <button type="button" onClick={() => setDrawerPath(pathname)} className="a-btn a-btn-ghost a-btn-sm" aria-label="Mở menu" aria-expanded={drawer}>
              <Menu size={17} />
            </button>
            <span className="flex-1 font-semibold">Apple Store</span>
            <button type="button" onClick={() => setPalette(true)} className="a-btn a-btn-ghost a-btn-sm" aria-label="Tìm nhanh">
              <Search size={16} />
            </button>
          </header>
          <main id="admin-main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} role={role} />
      </ConfirmProvider>
    </ToastProvider>
  );
}
