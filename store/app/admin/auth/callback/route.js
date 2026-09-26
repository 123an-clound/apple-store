import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Password-reset / magic links land here with a one-time PKCE code.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';
  // Only same-site admin paths — never an open redirect.
  const safeNext = next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/admin/login`);
}
