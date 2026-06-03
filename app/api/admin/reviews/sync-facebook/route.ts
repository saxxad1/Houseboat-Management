import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext } from '@/lib/admin/serverAuth';
import { syncFacebookReviews } from '@/lib/facebookReviews';

export async function POST(request: NextRequest) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  try {
    const result = await syncFacebookReviews(admin.supabase as any);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Facebook reviews sync failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
