import { NextRequest, NextResponse } from 'next/server';
import { syncFacebookReviews } from '@/lib/facebookReviews';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const requestSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.nextUrl.searchParams.get('secret');

  if (!cronSecret || requestSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase service client is not configured' }, { status: 503 });
  }

  try {
    const result = await syncFacebookReviews(supabase as any);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Facebook reviews sync failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
