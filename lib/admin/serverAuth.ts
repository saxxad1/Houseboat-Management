import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import type { AdminTableName } from '@/types/database';

export const adminTables: AdminTableName[] = [
  'admin_profiles',
  'houseboat_settings',
  'rooms',
  'packages',
  'customers',
  'bookings',
  'payments',
  'income',
  'expenses',
  'availability_blocks',
  'gallery',
  'website_content',
];

export function isAdminTableName(table: string): table is AdminTableName {
  return adminTables.includes(table as AdminTableName);
}

export async function getVerifiedAdminContext(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!supabase) {
    return {
      error: NextResponse.json({ error: 'Supabase service client is not configured' }, { status: 503 }),
    };
  }

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Missing session token' }, { status: 401 }),
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) {
    return {
      error: NextResponse.json({ error: 'Invalid session token' }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, full_name, role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'manager'])
    .maybeSingle();

  if (profileError) {
    return {
      error: NextResponse.json({ error: profileError.message }, { status: 500 }),
    };
  }

  if (!profile) {
    return {
      error: NextResponse.json({ error: 'এই user admin_profiles table-এ admin হিসেবে যুক্ত নেই' }, { status: 403 }),
    };
  }

  return { supabase, user, profile };
}
