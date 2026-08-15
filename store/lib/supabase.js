import { createClient } from '@supabase/supabase-js';

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// Credentials come from the environment only. They used to be hard-coded here as
// a fallback, which meant a rotated key required a code change and a missing env
// var failed silently against the old project. Fail loudly instead.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Thiếu biến môi trường Supabase. Hãy đặt NEXT_PUBLIC_SUPABASE_URL và ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local (local) và trong ' +
      'Vercel → Settings → Environment Variables (production).'
  );
}

export const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/anh-iphone/`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // This is a read-only public catalogue: no sessions, no token refresh timers.
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
