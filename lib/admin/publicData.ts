'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { galleryImages, packages as fallbackPackages, cabins as fallbackRooms, siteConfig } from '@/data/houseboatData';
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

export function mapSettingsToSiteConfig(settings?: HouseboatSettings | null) {
  if (!settings) return siteConfig;
  return {
    ...siteConfig,
    name: settings.houseboat_name || siteConfig.name,
    nameEn: settings.houseboat_name || siteConfig.nameEn,
    tagline: settings.tagline || siteConfig.tagline,
    description: settings.description || siteConfig.description,
    phone: settings.phone || siteConfig.phone,
    whatsapp: settings.whatsapp || siteConfig.whatsapp,
    email: settings.email || siteConfig.email,
    facebook: settings.facebook_url || siteConfig.facebook,
    location: settings.location || siteConfig.location,
    locationEn: settings.address || siteConfig.locationEn,
    logoUrl: settings.logo_url || '/logo-kuhelika-clean.png',
  };
}

export function mapRoomsToCabins(rooms: Room[]) {
  if (!rooms.length) return fallbackRooms;
  return rooms.map((room, index) => ({
    id: index + 1,
    name: room.name,
    nameEn: room.slug,
    image: room.image_url || fallbackRooms[index % fallbackRooms.length]?.image || '',
    bedType: room.bed_type || '',
    capacity: room.capacity,
    hasWashroom: room.has_attached_washroom,
    hasAC: room.has_ac,
    pricePerNight: room.price_per_night,
    size: '',
    features: room.facilities || [],
    available: room.status === 'active',
    badge: index === 0 ? 'Premium' : '',
  }));
}

export function mapPackagesToPublic(packages: TourPackage[]) {
  if (!packages.length) return fallbackPackages;
  return packages.map((pkg, index) => ({
    id: index + 1,
    title: pkg.title,
    titleEn: pkg.slug,
    duration: pkg.duration || '',
    price: pkg.price,
    priceNote: 'প্যাকেজ অনুযায়ী',
    maxGuests: pkg.max_guests,
    meals: pkg.meal_info || '',
    popular: index === 0,
    color: ['sky', 'teal', 'amber', 'emerald', 'orange', 'slate'][index % 6],
    includes: pkg.included_services || [],
    spots: pkg.route_spots || [],
    badge: index === 0 ? 'Featured' : '',
  }));
}

export function mapGalleryToPublic(gallery: GalleryImage[]) {
  if (!gallery.length) return galleryImages;
  return gallery.map((image, index) => ({
    id: index + 1,
    src: image.image_url,
    alt: image.title || 'Houseboat gallery image',
    category: image.category || 'Gallery',
  }));
}
