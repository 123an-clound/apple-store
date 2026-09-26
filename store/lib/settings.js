import { cache } from 'react';
import supabase from './supabase';
import { buildContact } from './constants';

export const getContact = cache(async () => {
  try {
    const { data, error } = await supabase
      .from('apple_settings')
      .select('hotline, zalo, zalo_tragop, address, maps_url, open_time, close_time, latitude, longitude, response_promise')
      .eq('id', 1)
      .maybeSingle();
    if (error) console.error('[Apple Store] Settings fetch error:', error.message);
    return buildContact(data ?? {});
  } catch (err) {
    console.error('[Apple Store] Unexpected settings error:', err.message);
    return buildContact();
  }
});
