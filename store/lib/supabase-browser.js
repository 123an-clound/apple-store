'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

// Browser client sharing the admin's cookie session — used for Storage uploads
// (avoids pushing image bytes through a Server Action) and Realtime.
let client;
export function getSupabaseBrowser() {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
