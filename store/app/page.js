import supabase from '@/lib/supabase';
import { groupByModel, sortSeries } from '@/lib/helpers';
import HomeClient from '@/components/HomeClient';
import Footer from '@/components/Footer';

// Disable caching to get real-time price updates from Supabase
export const revalidate = 0;

async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('kho_hang_iphone')
      .select('*')
      .order('stt', { ascending: false });

    if (error) {
      console.error('[Linh Tây Store] Supabase fetch error:', error.message);
      console.error('[Linh Tây Store] Error details:', error);
      return [];
    }
    
    if (!data) {
      console.warn('[Linh Tây Store] No data returned from Supabase');
      return [];
    }
    
    console.log(`[Linh Tây Store] Successfully fetched ${data.length} products`);
    return data;
  } catch (err) {
    console.error('[Linh Tây Store] Unexpected error:', err.message);
    return [];
  }
}

export default async function HomePage() {
  const rawRows = await fetchProducts();
  const allCards = groupByModel(rawRows).sort((a, b) => (b.sttMax ?? 0) - (a.sttMax ?? 0));

  const seriesSet = new Set(allCards.map((c) => c.series));
  const series = sortSeries([...seriesSet]);

  return (
    <main className="min-h-screen">
      <HomeClient allCards={allCards} series={series} />
      <Footer />
    </main>
  );
}
