import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import NotFoundContent from '@/components/NotFoundContent';
import Footer from '@/components/Footer';

// URLs that match no route at all. Needed because the app has two root layouts
// ((site) and admin), so there is no single layout to hang a not-found.js on.
// It bypasses layouts, so fonts, styles and the theme class are set up here.
const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'], variable: '--font-display', display: 'swap', weight: ['600', '700', '800'],
});

export const metadata = {
  title: 'Không tìm thấy trang | Apple Store',
  description: 'Trang bạn tìm không tồn tại.',
};

export default function GlobalNotFound() {
  return (
    <html lang="vi" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`,
          }}
        />
        <NotFoundContent />
        <Footer />
      </body>
    </html>
  );
}
