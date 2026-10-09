import './globals.css';
import './storefront.css';
import NotFoundContent from '@/components/NotFoundContent';
import Footer from '@/components/Footer';

// URLs that match no route at all. Needed because the app has two root layouts
// ((site) and admin), so there is no single layout to hang a not-found.js on.
// It bypasses layouts, so storefront styles and the theme class are set up here.

export const metadata = {
  title: 'Không tìm thấy trang | Apple Store',
  description: 'Trang bạn tìm không tồn tại.',
};

export default function GlobalNotFound() {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')==='light'?'light':'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}`,
          }}
        />
        <NotFoundContent />
        <Footer />
      </body>
    </html>
  );
}
