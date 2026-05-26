import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
import { cabins as fallbackCabins } from '@/data/houseboatData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Delete all existing rooms (demo data)
    const { error: deleteError } = await supabase
      .from('rooms')
      .delete()
      .not('id', 'is', null); // This safely deletes all rows

    if (deleteError) {
      return NextResponse.json({ success: false, message: 'Failed to delete old rooms', error: deleteError });
    }

    // 2. Map fallbackCabins to Supabase schema
    const roomsToInsert = fallbackCabins.map((cabin, index) => {
      // Use raw string for capacity to support "2-3", encode as integer
      let capacity = 2;
      const strCap = String(cabin.capacity);
      if (strCap.includes('-')) {
        const parts = strCap.split('-');
        capacity = parseInt(parts[0], 10) * 1000 + parseInt(parts[1], 10);
      } else {
        const match = strCap.match(/\d+/);
        capacity = match ? parseInt(match[0], 10) : 2;
      }

      // Extract price from string like "৳12,000/14,000" -> take only the first number part
      const priceStrRaw = String(cabin.mainPrice).replace(/৳/g, '').replace(/,/g, '').trim();
      const firstPriceMatch = priceStrRaw.match(/^\d+/);
      const price = firstPriceMatch ? parseInt(firstPriceMatch[0], 10) : 0;

      return {
        name: cabin.name,
        slug: cabin.nameEn,
        season_type: 'haor', // Assuming these are for haor season
        capacity: capacity,
        bed_type: cabin.bedType,
        has_attached_washroom: cabin.bath?.toLowerCase().includes('private'),
        has_ac: cabin.ac?.toLowerCase().includes('ac available') && !cabin.ac?.toLowerCase().includes('non'),
        price_per_night: price,
        facilities: cabin.features.join(', '),
        image_url: cabin.image,
        status: 'active',
        sort_order: index + 1,
      };
    });

    // 3. Insert new rooms
    const { error: insertError } = await supabase
      .from('rooms')
      .insert(roomsToInsert);

    if (insertError) {
      return NextResponse.json({ success: false, message: 'Failed to insert new rooms', error: insertError });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully migrated 8 new cabins to the database! You can now check your Admin Panel.' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Unexpected error', error: error.message });
  }
}
