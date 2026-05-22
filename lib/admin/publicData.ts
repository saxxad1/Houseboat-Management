'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { cabins as fallbackRooms, siteConfig } from '@/data/houseboatData';
import type { SeasonType, SeasonalContent } from '@/data/seasonalData';
import type { AvailabilityBlock, GalleryImage, HouseboatSettings, Room, TourPackage, WebsiteContent } from '@/types/database';

export async function loadPublicHouseboatData() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const [settings, rooms, packages, gallery, content, availability] = await Promise.all([
    supabase.from('houseboat_settings').select('*').limit(1).maybeSingle(),
    supabase.from('rooms').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('packages').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('website_content').select('*').eq('is_active', true),
    supabase.from('availability_blocks').select('*'),
  ]);

  if (settings.error || rooms.error || packages.error || gallery.error || content.error || availability.error) {
    return null;
  }

  return {
    settings: settings.data as HouseboatSettings | null,
    rooms: (rooms.data || []) as Room[],
    packages: (packages.data || []) as TourPackage[],
    gallery: (gallery.data || []) as GalleryImage[],
    content: (content.data || []) as WebsiteContent[],
    availability: (availability.data || []) as AvailabilityBlock[],
  };
}

export function mapSettingsToSiteConfig(settings?: HouseboatSettings | null, seasonData?: SeasonalContent) {
  const baseSite = seasonData?.site || siteConfig;
  if (!settings) return baseSite;
  return {
    ...baseSite,
    name: settings.houseboat_name || baseSite.name,
    nameEn: settings.houseboat_name || baseSite.nameEn,
    tagline: baseSite.tagline,
    description: baseSite.description,
    phone: settings.phone || baseSite.phone,
    whatsapp: settings.whatsapp || baseSite.whatsapp,
    email: settings.email || baseSite.email,
    facebook: settings.facebook_url || baseSite.facebook,
    location: baseSite.location,
    locationEn: baseSite.locationEn,
    logoUrl: settings.logo_url || '/logo-kuhelika-clean.png',
  };
}

export function mapRoomsToCabins(rooms: Room[], season: SeasonType = 'haor') {
  const filtered = rooms.filter((room) => (room.season_type || 'haor') === season);
  if (!filtered.length) return [];
  return filtered.map((room, index) => ({
    id: index + 1,
    name: room.name,
    nameEn: room.slug,
    image: room.image_url || fallbackRooms[index % fallbackRooms.length]?.image || '',
    bedType: room.bed_type || '',
    capacity: room.capacity,
    hasWashroom: room.has_attached_washroom,
    hasAC: room.has_ac,
    pricePerNight: room.price_per_night,
    priceLabel: season === 'padma' ? (room.price_per_night > 0 ? `৳${room.price_per_night.toLocaleString()} থেকে` : 'Quote on request') : undefined,
    unitLabel: season === 'padma' ? 'Event setup' : undefined,
    size: '',
    features: room.facilities || [],
    available: room.status === 'active',
    badge: index === 0 ? 'Premium' : '',
    buttonLabel: season === 'padma' ? 'এই ইভেন্ট স্পেস বুক করুন' : undefined,
  }));
}

export function mapPackagesToPublic(packages: TourPackage[], season: SeasonType = 'haor') {
  const filtered = packages.filter((pkg) => (pkg.season_type || 'haor') === season);
  if (!filtered.length) return [];
  return filtered.map((pkg, index) => ({
    id: index + 1,
    title: pkg.title,
    titleEn: pkg.slug,
    duration: pkg.duration || '',
    price: pkg.price,
    priceDisplay: season === 'padma' ? (pkg.price > 0 ? `৳${pkg.price.toLocaleString()} থেকে` : 'Custom Quote') : undefined,
    priceNote: season === 'padma' ? 'প্যাকেজ থেকে শুরু' : 'প্যাকেজ অনুযায়ী',
    maxGuests: pkg.max_guests,
    meals: season === 'padma' ? (pkg.best_for || pkg.meal_info || '') : (pkg.meal_info || ''),
    time: pkg.suggested_time || undefined,
    popular: index === 0,
    color: ['sky', 'teal', 'amber', 'emerald', 'orange', 'slate'][index % 6],
    includes: pkg.included_services || [],
    spots: pkg.route_spots || [],
    badge: index === 0 ? 'Featured' : '',
  }));
}

export function mapGalleryToPublic(gallery: GalleryImage[], season: SeasonType = 'haor') {
  const filtered = gallery.filter((image) => {
    const category = image.category || '';
    if (season === 'padma') {
      return ['Padma River', 'Padma Bridge', 'Event Decoration', 'Birthday', 'Corporate', 'Dining', 'Rooftop', 'Sunset', 'Moonlight'].includes(category);
    }
    return !['Padma River', 'Padma Bridge', 'Event Decoration', 'Birthday', 'Corporate', 'Dining', 'Sunset', 'Moonlight'].includes(category);
  });
  if (!filtered.length) return [];
  return filtered.map((image, index) => ({
    id: index + 1,
    src: image.image_url,
    alt: image.title || 'Houseboat gallery image',
    category: image.category || 'Gallery',
  }));
}
