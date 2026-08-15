'use client';

import { useRouter } from 'next/navigation';
import ProductModal from './ProductModal';

// Bridges the (.)san-pham/[slug] intercepted route to the existing ProductModal:
// closing means "go back to wherever the card was clicked from", not clearing
// local state, so onClose is router.back() instead of the setState used when
// the modal was opened from HomeClient directly.
export default function InterceptedProductModal({ card }) {
  const router = useRouter();
  return <ProductModal card={card} onClose={() => router.back()} />;
}
