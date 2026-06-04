import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext, isAdminTableName, requireWritableAdmin } from '@/lib/admin/serverAuth';
import type { AdminRow } from '@/lib/admin/data';
import type { AdminTableName } from '@/types/database';

type RouteContext = {
  params: Promise<{ table: string }>;
};

function withTimestamps(row: Partial<AdminRow> & { id?: string }) {
  const timestamp = new Date().toISOString();
  return {
    ...row,
    updated_at: timestamp,
    created_at: row.created_at || timestamp,
  };
}

async function getTable(context: RouteContext) {
  const { table } = await context.params;
  return table;
}

function requireOwnerAdmin(table: string, role?: string) {
  if (table === 'admin_profiles' && role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can manage admin profiles' }, { status: 403 });
  }

  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }

  const db = admin.supabase as any;
  const { data, error } = await db.from(table).select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ rows: data || [] });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }
  const writeError = requireWritableAdmin(admin.profile?.role, table as AdminTableName);
  if (writeError) return writeError;
  const roleError = requireOwnerAdmin(table, admin.profile?.role);
  if (roleError) return roleError;

  const body = await request.json().catch(() => ({}));
  const row = (body.row || {}) as Partial<AdminRow> & { id?: string };
  const payload = withTimestamps(row);
  const db = admin.supabase as any;

  if (table === 'houseboat_settings' && !row.id) {
    const { data: existing, error: existingError } = await db
      .from('houseboat_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 });
    }

    if (existing?.id) {
      payload.id = existing.id;
    }
  }

  if (payload.id) {
    const { id, ...updatePayload } = payload;
    const { data, error } = await db
      .from(table)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ row: data });
  }

  const { id: _id, ...insertPayload } = payload;
  const { data, error } = await db
    .from(table)
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }
  const writeError = requireWritableAdmin(admin.profile?.role, table as AdminTableName);
  if (writeError) return writeError;
  const roleError = requireOwnerAdmin(table, admin.profile?.role);
  if (roleError) return roleError;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing row id' }, { status: 400 });
  }

  const db = admin.supabase as any;
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
