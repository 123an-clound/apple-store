import { getContact } from '@/lib/settings';

export default async function Footer() {
  const { telUrl, zaloUrl, hotlineDisplay } = await getContact();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] pt-10 pb-28 sm:pt-14 sm:pb-14 mt-2 bg-[var(--surface)]">
      <div className="section-shell section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 text-center md:text-left">
          <div className="space-y-2.5">
            <p className="text-h2 text-[var(--text-primary)] !text-lg font-bold glow-text-blue">Apple Store</p>
            <p className="text-caption leading-relaxed">iPhone chính hãng · Giá tốt · Bảo hành uy tín</p>
          </div>

          <div className="flex flex-col gap-3 md:items-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Liên hệ</p>
            <a
              href={telUrl}
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all focus-ring rounded inline-block btn-modern"
            >
              {hotlineDisplay}
            </a>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105 transition-all focus-ring rounded inline-block btn-neon"
            >
              Nhắn Zalo
            </a>
            <a
              href="#products"
              className="text-caption hover:text-[var(--text-primary)] hover:scale-105 transition-all focus-ring rounded inline-block btn-modern btn-shine-sweep"
            >
              Xem sản phẩm
            </a>
          </div>

          <div className="md:text-right space-y-1.5">
            <p className="text-caption">© {year} Apple Store</p>
            <p className="text-micro">All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
