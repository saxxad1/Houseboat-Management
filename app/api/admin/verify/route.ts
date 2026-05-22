import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!supabase) {
    return NextResponse.json({ isAdmin: false, error: 'Supabase service client is not configured' }, { status: 503 });
  }

  if (!token) {
    return NextResponse.json({ isAdmin: false, error: 'Missing session token' }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ isAdmin: false, error: 'Invalid session token' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, full_name, role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'manager'])
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ isAdmin: false, error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    isAdmin: Boolean(profile),
    email: user.email,
    profile,
  });
}
