import { notFound } from 'next/navigation';
import { getAllProductCards, getProductCardBySlug } from '@/lib/products';
import InterceptedProductModal from '@/components/InterceptedProductModal';

// Without generateStaticParams this segment builds as fully dynamic (ƒ), so every
// card click did a live Supabase round trip before the modal could render —
// ~260ms of pure navigation latency that felt like "images loading slowly".
// The sibling full-page route already does this; mirrored here so the
// intercepted route is served from the same static/ISR cache.
export const revalidate = 60;

export async function generateStaticParams() {
  const cards = await getAllProductCards();
  return cards.map((card) => ({ slug: card.slug }));
}

export default async function InterceptedProductPage({ params }) {
  const { slug } = await params;
  const card = await getProductCardBySlug(slug);
  if (!card) notFound();

  return <InterceptedProductModal card={card} />;
}
