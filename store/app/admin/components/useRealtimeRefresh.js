'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

// Re-fetch the server component when another admin (or a visitor submitting a
// lead) changes `table`. Bursts (bulk edits) collapse into one refresh.
export function useRealtimeRefresh(table, onChange) {
  const router = useRouter();
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let timer;
    const channel = supabase
      .channel(`admin-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        onChange?.(payload);
        clearTimeout(timer);
        timer = setTimeout(() => router.refresh(), 400);
      })
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [table, router, onChange]);
}
