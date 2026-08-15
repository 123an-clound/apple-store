import { SITE_URL } from '@/lib/constants';
import { getAllProductCards } from '@/lib/products';

export default async function sitemap() {
  const cards = await getAllProductCards();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...cards.map((card) => ({
      url: `${SITE_URL}/san-pham/${card.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
