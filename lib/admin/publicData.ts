'use client';

import { isSupabaseConfigured } from '@/lib/supabase/client';
import { cabins as fallbackRooms, siteConfig } from '@/data/houseboatData';
import type { SeasonType, SeasonalContent } from '@/data/seasonalData';
import type { AvailabilityBlock, GalleryImage, HouseboatSettings, Room, TourPackage, TripSlot, WebsiteContent } from '@/types/database';

export async function loadPublicHouseboatData() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch('/api/public/data', { cache: 'no-store' });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    return null;
  }

  return {
    settings: result.settings as HouseboatSettings | null,
    rooms: (result.rooms || []) as Room[],
    packages: (result.packages || []) as TourPackage[],
    gallery: (result.gallery || []) as GalleryImage[],
    content: (result.content || []) as WebsiteContent[],
    availability: (result.availability || []) as AvailabilityBlock[],
    trip_slots: (result.trip_slots || []) as TripSlot[],
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
    bkashNumber: settings.bkash_number || undefined,
    nagadNumber: settings.nagad_number || undefined,
    bankInfo: settings.bank_info || undefined,
  };
}

function textOr<T extends string | null | undefined>(value: T, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function contentFor(content: WebsiteContent[], season: SeasonType, key: string, includeInactive = false) {
  const keys = new Set([key, `${season}_${key}`, `${key}_${season}`, `${season}:${key}`, `${key}:${season}`]);
  return content.find((row) => (row.is_active || includeInactive) && keys.has(row.section_key));
}

export function getEffectiveSeasonalData(
  seasonData: SeasonalContent,
  settings: HouseboatSettings | null | undefined,
  content: WebsiteContent[],
  season: SeasonType
) {
  const settingsHero = {
    ...seasonData.hero,
    title: textOr(settings?.houseboat_name, seasonData.hero.title),
    subtitle: season === 'haor' ? textOr(settings?.tagline, seasonData.hero.subtitle) : seasonData.hero.subtitle,
    description: season === 'haor' ? textOr(settings?.description, seasonData.hero.description) : seasonData.hero.description,
  };
  const settingsContact = {
    ...seasonData.contact,
    location: season === 'haor' ? textOr(settings?.location, seasonData.contact.location) : seasonData.contact.location,
    pickup: season === 'haor' ? textOr(settings?.address, seasonData.contact.pickup) : seasonData.contact.pickup,
  };

  const hero = contentFor(content, season, 'hero');
  const about = contentFor(content, season, 'about');
  const cabinsSection = contentFor(content, season, season === 'padma' ? 'event_spaces' : 'cabins') || contentFor(content, season, 'cabins');
  const packagesSection = contentFor(content, season, season === 'padma' ? 'event_packages' : 'packages', true) || contentFor(content, season, 'packages', true);
  const availability = contentFor(content, season, 'availability');
  const itinerary = contentFor(content, season, 'itinerary');
  const facilities = contentFor(content, season, 'facilities');
  const gallery = contentFor(content, season, 'gallery');
  const testimonials = contentFor(content, season, 'testimonials') || contentFor(content, season, 'reviews');
  const cta = contentFor(content, season, 'cta');
  const faq = contentFor(content, season, 'faq');
  const contact = contentFor(content, season, 'contact');

  return {
    ...seasonData,
    hero: hero
      ? {
          ...settingsHero,
          title: textOr(hero.title, settingsHero.title),
          subtitle: textOr(hero.subtitle, settingsHero.subtitle),
          description: textOr(hero.content, settingsHero.description),
          primaryCta: textOr(hero.button_text, settingsHero.primaryCta),
          secondaryTarget: textOr(hero.button_url, settingsHero.secondaryTarget),
        }
      : settingsHero,
    about: about
      ? {
          ...seasonData.about,
          title: textOr(about.title, seasonData.about.title),
          subtitle: textOr(about.subtitle, seasonData.about.subtitle),
          story: textOr(about.content, seasonData.about.story),
          is_active: about.is_active ?? seasonData.about.is_active,
        }
      : seasonData.about,
    cabinsSection: cabinsSection
      ? {
          ...seasonData.cabinsSection,
          title: textOr(cabinsSection.title, seasonData.cabinsSection.title),
          subtitle: textOr(cabinsSection.subtitle, seasonData.cabinsSection.subtitle),
          fullBoatDescription: textOr(cabinsSection.content, seasonData.cabinsSection.fullBoatDescription),
          fullBoatButton: textOr(cabinsSection.button_text, seasonData.cabinsSection.fullBoatButton),
          is_active: cabinsSection.is_active ?? seasonData.cabinsSection.is_active,
        }
      : seasonData.cabinsSection,
    packagesSection: packagesSection
      ? {
          ...seasonData.packagesSection,
          title: textOr(packagesSection.title, seasonData.packagesSection.title),
          subtitle: textOr(packagesSection.subtitle, seasonData.packagesSection.subtitle),
          note: textOr(packagesSection.content, seasonData.packagesSection.note),
          is_active: packagesSection.is_active ?? seasonData.packagesSection.is_active,
        }
      : seasonData.packagesSection,
    availability: availability
      ? {
          ...seasonData.availability,
          title: textOr(availability.title, seasonData.availability.title),
          subtitle: textOr(availability.subtitle, seasonData.availability.subtitle),
          is_active: availability.is_active ?? seasonData.availability.is_active,
        }
      : seasonData.availability,
    itinerary: itinerary
      ? {
          ...seasonData.itinerary,
          title: textOr(itinerary.title, seasonData.itinerary.title),
          subtitle: textOr(itinerary.subtitle, seasonData.itinerary.subtitle),
          note: textOr(itinerary.content, seasonData.itinerary.note),
          is_active: itinerary.is_active ?? seasonData.itinerary.is_active,
        }
      : seasonData.itinerary,
    facilitiesSection: facilities
      ? {
          ...seasonData.facilitiesSection,
          title: textOr(facilities.title, seasonData.facilitiesSection.title),
          subtitle: textOr(facilities.subtitle, seasonData.facilitiesSection.subtitle),
          bannerDescription: textOr(facilities.content, seasonData.facilitiesSection.bannerDescription),
          bannerImage: textOr(facilities.image_url, seasonData.facilitiesSection.bannerImage),
          is_active: facilities.is_active ?? seasonData.facilitiesSection.is_active,
        }
      : seasonData.facilitiesSection,
    gallery: gallery
      ? {
          ...seasonData.gallery,
          title: textOr(gallery.title, seasonData.gallery.title),
          subtitle: textOr(gallery.subtitle, seasonData.gallery.subtitle),
          is_active: gallery.is_active ?? seasonData.gallery.is_active,
        }
      : seasonData.gallery,
    testimonials: testimonials
      ? {
          ...seasonData.testimonials,
          title: textOr(testimonials.title, seasonData.testimonials.title),
          subtitle: textOr(testimonials.subtitle, seasonData.testimonials.subtitle),
          is_active: testimonials.is_active ?? seasonData.testimonials.is_active,
        }
      : seasonData.testimonials,
    cta: cta
      ? {
          ...seasonData.cta,
          eyebrow: textOr(cta.subtitle, seasonData.cta.eyebrow),
          title: textOr(cta.title, seasonData.cta.title),
          description: textOr(cta.content, seasonData.cta.description),
          primary: textOr(cta.button_text, seasonData.cta.primary),
          image: textOr(cta.image_url, seasonData.cta.image),
        }
      : seasonData.cta,
    faq: faq
      ? {
          ...seasonData.faq,
          title: textOr(faq.title, seasonData.faq.title),
          subtitle: textOr(faq.subtitle, seasonData.faq.subtitle),
        }
      : seasonData.faq,
    contact: contact
      ? {
          ...settingsContact,
          subtitle: textOr(contact.subtitle, settingsContact.subtitle),
          location: textOr(contact.title, settingsContact.location),
          pickup: textOr(contact.content, settingsContact.pickup),
          mapEmbedUrl: textOr(contact.button_url, settingsContact.mapEmbedUrl),
        }
      : settingsContact,
  } as SeasonalContent;
}

export function mapRoomsToCabins(rooms: Room[], season: SeasonType = 'haor') {
  if (!rooms || !rooms.length) return [];

  // First try to filter by exact season match
  let filtered = rooms.filter((room) => {
    const roomSeason = room.season_type;
    // Include rooms with matching season, or null/undefined/empty season_type (treat as haor)
    if (!roomSeason || roomSeason === '') return season === 'haor';
    return roomSeason === season;
  });

  // If no rooms match the season, show ALL rooms as fallback (don't return blank)
  if (!filtered.length) {
    filtered = rooms;
  }
  return filtered.map((room, index) => {
    // Decode capacity hack: if capacity >= 1000, it means e.g. 2003 -> "2-3"
    let rawCap: string | number = room.capacity || 2;
    if (typeof rawCap === 'number' && rawCap >= 1000) {
      rawCap = `${Math.floor(rawCap / 1000)}-${rawCap % 1000}`;
    }

    return {
      id: room.slug || `room-${index}`,
      name: room.name,
      nameEn: room.slug,
      desc: room.description || '',
      image: room.image_url || fallbackRooms[index % fallbackRooms.length]?.image || '',
      bedType: room.bed_type || 'Double Bed',
      capacity: rawCap,
      capacityLabel: String(rawCap).toLowerCase().includes('person') 
        ? String(rawCap) 
        : `${rawCap} Persons`,
      bath: room.has_attached_washroom ? 'Private Bath' : 'Shared Bath',
      ac: room.has_ac ? 'AC Available' : 'Non-AC',
      mainPrice: `৳${(room.price_per_night || 0).toLocaleString()}`,
      price2Pax: room.price_2_pax ? `৳${room.price_2_pax.toLocaleString()} (2 Persons)` : undefined,
      price3Pax: room.price_3_pax ? `৳${room.price_3_pax.toLocaleString()} (3 Persons)` : undefined,
      rawPricePerNight: room.price_per_night || 0,
      rawPrice2Pax: room.price_2_pax || null,
      rawPrice3Pax: room.price_3_pax || null,
      priceLabel: season === 'padma' ? 'Event setup' : '/ person',
      unitLabel: season === 'padma' ? 'Event setup' : undefined,
      size: '',
      features: Array.isArray(room.facilities) ? room.facilities : (room.facilities ? String(room.facilities).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      available: room.status === 'active',
      badge: index === 0 ? 'Premium' : '',
      buttonLabel: season === 'padma' ? 'Book this event space' : undefined,
    };
  });
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
    priceDisplay: season === 'padma' ? (pkg.price > 0 ? `From ৳${pkg.price.toLocaleString()}` : 'Custom Quote') : undefined,
    priceNote: season === 'padma' ? 'Starts from package' : 'According to package',
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
  if (!gallery || !gallery.length) return [];
  return gallery.map((image, index) => ({
    id: index + 1,
    src: image.image_url,
    alt: image.title || 'Houseboat gallery image',
    category: image.category || 'Gallery',
  }));
}
