import { Inter } from 'next/font/google';
import Script from 'next/script';
import './admin.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  title: { template: '%s · Quản trị Apple Store', default: 'Quản trị Apple Store' },
  robots: { index: false, follow: false },
};

// Separate root layout: the admin shares no chrome, metadata or skip links with
// the storefront (app/(site)/layout.js).
export default function AdminRootLayout({ children }) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
