import { cache } from 'react';
import supabase from './supabase';
import { groupByModel } from './helpers';

// Cached per-request (React's `cache`) so generateStaticParams, generateMetadata
// and the page component don't each trigger a separate Supabase round trip during
// the same render pass.
export const getAllProductCards = cache(async () => {
  try {
    const { data, error } = await supabase
      .from('kho_iphone')
      .select('*')
      .eq('is_visible', true)
      .order('stt', { ascending: false });

    if (error) {
      console.error('[Apple Store] Supabase fetch error:', error.message);
      return [];
    }

    return groupByModel(data ?? []).sort((a, b) => (b.sttMax ?? 0) - (a.sttMax ?? 0));
  } catch (err) {
    console.error('[Apple Store] Unexpected error:', err.message);
    return [];
  }
});

export async function getProductCardBySlug(slug) {
  const cards = await getAllProductCards();
  return cards.find((card) => card.slug === slug) ?? null;
}
