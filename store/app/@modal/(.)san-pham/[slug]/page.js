import { notFound } from 'next/navigation';
import { getProductCardBySlug } from '@/lib/products';
import InterceptedProductModal from '@/components/InterceptedProductModal';

export default async function InterceptedProductPage({ params }) {
  const { slug } = await params;
  const card = await getProductCardBySlug(slug);
  if (!card) notFound();

  return <InterceptedProductModal card={card} />;
}
