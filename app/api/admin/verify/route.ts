import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext } from '@/lib/admin/serverAuth';

export async function GET(request: NextRequest) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) {
    const body = await admin.error.json();
    return NextResponse.json({ isAdmin: false, error: body.error }, { status: admin.error.status });
  }

  return NextResponse.json({
    isAdmin: true,
    email: admin.user.email,
    profile: admin.profile,
  });
}
