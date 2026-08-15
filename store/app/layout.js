import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SITE_URL, HOTLINE, HOTLINE_DISPLAY } from '@/lib/constants';
import ModalSlot from '@/components/ModalSlot';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700', '800'],
});

// Icons are picked up automatically from app/icon.png and app/apple-icon.png.

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Apple Store',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  telephone: HOTLINE,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: HOTLINE_DISPLAY,
    contactType: 'sales',
    areaServed: 'VN',
    availableLanguage: 'Vietnamese',
  },
};

export const metadata = {
  // Without this, Next resolves OG/Twitter image URLs against http://localhost:3000.
  metadataBase: new URL(SITE_URL),
  title: 'Apple Store — iPhone Chính Hãng Giá Tốt',
  description:
    'Mua iPhone chính hãng tại Apple Store. Đa dạng model từ iPhone X đến iPhone 17 Series. Giá tốt nhất, bảo hành uy tín, giao hàng toàn quốc.',
  keywords: 'iPhone, mua iPhone, Apple Store, iPhone chính hãng, iPhone giá rẻ',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Apple Store — iPhone Chính Hãng Giá Tốt',
    description: 'Mua iPhone chính hãng tại Apple Store. Đa dạng model, giá tốt nhất.',
    url: '/',
    siteName: 'Apple Store',
    locale: 'vi_VN',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Apple Store — iPhone chính hãng' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apple Store — iPhone Chính Hãng Giá Tốt',
    description: 'Mua iPhone chính hãng tại Apple Store. Đa dạng model, giá tốt nhất.',
    images: ['/og.png'],
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children, modal }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var saved = localStorage.getItem('theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = saved || (prefersDark ? 'dark' : 'light');
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (e) {}
            })();
          `}
        </Script>
        <a href="#products" className="skip-link">
          Bỏ qua đến sản phẩm
        </a>
        {children}
        <ModalSlot>{modal}</ModalSlot>
      </body>
    </html>
  );
}
