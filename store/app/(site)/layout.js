import Script from 'next/script';
import '../globals.css';
import '../storefront.css';
import { SITE_URL } from '@/lib/constants';
import { getContact } from '@/lib/settings';
import ModalSlot from '@/components/ModalSlot';
import { ContactProvider } from '@/components/ContactProvider';
import { Analytics } from '@vercel/analytics/next';

// Icons are picked up automatically from app/icon.png and app/apple-icon.png.

// LocalBusiness (MobilePhoneStore) once the owner has entered an address in
// /admin/cai-dat — Google requires an address for it — plain Organization before that.
const buildOrganizationJsonLd = (contact) => ({
  '@context': 'https://schema.org',
  '@type': contact.address ? 'MobilePhoneStore' : 'Organization',
  name: 'Apple Store',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.png`,
  telephone: contact.hotline,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: contact.hotlineDisplay,
    contactType: 'sales',
    areaServed: 'VN',
    availableLanguage: 'Vietnamese',
  },
  ...(contact.address && {
    address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'VN' },
    hasMap: contact.directionsUrl,
    priceRange: '₫₫',
  }),
  ...(contact.address && contact.opens && contact.closes && {
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: contact.opens,
      closes: contact.closes,
    },
  }),
  ...(contact.address && contact.geo && {
    geo: { '@type': 'GeoCoordinates', latitude: contact.geo.lat, longitude: contact.geo.lng },
  }),
});

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
  themeColor: '#080809',
};

export default async function RootLayout({ children, modal }) {
  const contact = await getContact();
  return (
    <html
      lang="vi"
      className="dark"
      suppressHydrationWarning
    >
      <body className="antialiased transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(contact)).replace(/</g, '\\u003c') }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var saved = localStorage.getItem('theme');
                var theme = saved === 'light' ? 'light' : 'dark';
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = theme;
              } catch (e) {}
            })();
          `}
        </Script>
        <a href="#products" className="skip-link">
          Bỏ qua đến sản phẩm
        </a>
        <ContactProvider value={contact}>
          {children}
          <ModalSlot>{modal}</ModalSlot>
        </ContactProvider>
        {/* Cookieless Vercel Web Analytics; only on Vercel, where /_vercel/insights is served
            same-origin (dev would load a debug script from a host the CSP blocks). */}
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  );
}
