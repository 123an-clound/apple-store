import { TEL_URL, ZALO_URL, HOTLINE_DISPLAY } from '@/lib/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] pt-10 pb-28 sm:pt-14 sm:pb-14 mt-2 bg-[var(--surface)]">
      <div className="section-shell section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 text-center md:text-left">
          <div className="space-y-2.5">
            <p className="text-h2 text-[var(--text-primary)] !text-lg font-bold">Linh Tây Store</p>
            <p className="text-caption leading-relaxed">iPhone chính hãng · Giá tốt · Bảo hành uy tín</p>
          </div>

          <div className="flex flex-col gap-3 md:items-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Liên hệ</p>
            <a
              href={TEL_URL}
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-pink-600 dark:hover:text-pink-400 transition-colors focus-ring rounded"
            >
              {HOTLINE_DISPLAY}
            </a>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-ring rounded"
            >
              Nhắn Zalo
            </a>
            <a
              href="#products"
              className="text-caption hover:text-[var(--text-primary)] transition-colors focus-ring rounded"
            >
              Xem sản phẩm
            </a>
          </div>

          <div className="md:text-right space-y-1.5">
            <p className="text-caption">© {year} Linh Tây Store</p>
            <p className="text-micro">All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
