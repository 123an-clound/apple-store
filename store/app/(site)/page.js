import { sortSeries } from '@/lib/helpers';
import { getAllProductCards } from '@/lib/products';
import HomeClient from '@/components/HomeClient';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/constants';

// Rebuild the page at most once a minute instead of hitting Supabase on every
// request. Price edits still show up within 60s, but visitors get a cached page
// (fast TTFB) rather than waiting on a round trip to the database.
export const revalidate = 60;

// `<` escaping guards against a product name/description from Supabase ever
// containing "</script>" and breaking out of the tag.
function buildProductListJsonLd(cards) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: card.name,
        description: card.description || undefined,
        image: card.images.length > 0 ? card.images : undefined,
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/san-pham/${card.slug}`,
          priceCurrency: 'VND',
          price: Number.isFinite(card.lowestPrice) ? card.lowestPrice : undefined,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c');
}

export default async function HomePage() {
  const allCards = await getAllProductCards();

  const seriesSet = new Set(allCards.map((c) => c.series));
  const series = sortSeries([...seriesSet]);

  return (
    <main className="min-h-screen">
      {allCards.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildProductListJsonLd(allCards) }}
        />
      )}
      <HomeClient allCards={allCards} series={series} />
      <Footer />
    </main>
  );
}
