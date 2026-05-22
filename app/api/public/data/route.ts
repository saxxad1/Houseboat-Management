import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const [settings, rooms, packages, gallery, content, availability] = await Promise.all([
    supabase.from('houseboat_settings').select('*').limit(1).maybeSingle(),
    supabase.from('rooms').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('packages').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('website_content').select('*').eq('is_active', true),
    supabase.from('availability_blocks').select('*'),
  ]);

  const error = settings.error || rooms.error || packages.error || gallery.error || content.error || availability.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    settings: settings.data,
    rooms: rooms.data || [],
    packages: packages.data || [],
    gallery: gallery.data || [],
    content: content.data || [],
    availability: availability.data || [],
  });
}
