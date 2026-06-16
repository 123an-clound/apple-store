import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

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

export const metadata = {
  title: 'Apple Store — iPhone Chính Hãng Giá Tốt',
  description:
    'Mua iPhone chính hãng tại Apple Store. Đa dạng model từ iPhone X đến iPhone 17 Series. Giá tốt nhất, bảo hành uy tín, giao hàng toàn quốc.',
  keywords: 'iPhone, mua iPhone, Apple Store, iPhone chính hãng, iPhone giá rẻ',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'Apple Store — iPhone Chính Hãng Giá Tốt',
    description: 'Mua iPhone chính hãng tại Apple Store. Đa dạng model, giá tốt nhất.',
    images: ['/logo.png'],
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased transition-colors duration-300">
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
      </body>
    </html>
  );
}
