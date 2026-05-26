import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const [settings, rooms, packages, gallery, content, availability, trip_slots, special_dates, reviews] = await Promise.all([
    supabase
      .from('houseboat_settings')
      .select('id, houseboat_name, tagline, description, phone, whatsapp, email, facebook_url, location, address, bkash_number, nagad_number, bank_info, primary_color, secondary_color, logo_url, active_season, season_updated_at, created_at, updated_at')
      .limit(1)
      .maybeSingle(),
    supabase.from('rooms').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('packages').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('website_content').select('id, section_key, title, subtitle, content, image_url, button_text, button_url, is_active, created_at, updated_at'),
    supabase.from('availability_blocks').select('*'),
    supabase.from('trip_slots').select('*'),
    supabase
      .from('special_dates')
      .select('id, date, title, date_type, is_discount_excluded, is_active, note, created_at, updated_at')
      .eq('is_active', true)
      .order('date'),
    supabase.from('reviews').select('id, name, location, rating, review, avatar, is_published, created_at, updated_at').eq('is_published', true).order('created_at', { ascending: false }),
  ]);

  const error = settings.error || rooms.error || packages.error || gallery.error || content.error || availability.error || trip_slots.error || reviews.error;
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
    trip_slots: trip_slots.data || [],
    special_dates: special_dates.error ? [] : special_dates.data || [],
    reviews: reviews.data || [],
  });
}
