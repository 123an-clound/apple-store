import { createClient } from '@supabase/supabase-js';

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsspvdgnhelzprcqaiek.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1i_JXF8ar4zT9eCrRdch0A_9TG-UhaP';
export const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/anh-iphone/`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
