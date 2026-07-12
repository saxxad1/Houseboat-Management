'use client';

import { isSupabaseConfigured } from '@/lib/supabase/client';
import { FLOATBASE_BRAND, normalizeBrandLogoUrl, normalizeBrandName, replaceLegacyBrandText } from '@/lib/branding';
import { cabins as fallbackRooms, siteConfig } from '@/data/houseboatData';
import type { SeasonType, SeasonalContent } from '@/data/seasonalData';
import type { AvailabilityBlock, Booking, GalleryImage, HouseboatSettings, Review, Room, SpecialDate, TripSlot, WebsiteContent } from '@/types/database';

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
    packages: [],
    gallery: (result.gallery || []) as GalleryImage[],
    content: (result.content || []) as WebsiteContent[],
    availability: (result.availability || []) as AvailabilityBlock[],
    trip_slots: (result.trip_slots || []) as TripSlot[],
    special_dates: (result.special_dates || []) as SpecialDate[],
    reviews: (result.reviews || []) as Review[],
    bookings: (result.bookings || []) as Booking[],
  };
}

export function mapSettingsToSiteConfig(settings?: HouseboatSettings | null, seasonData?: SeasonalContent) {
  const baseSite = seasonData?.site || siteConfig;
  if (!settings) return {
    ...baseSite,
    name: normalizeBrandName(baseSite.name),
    nameEn: normalizeBrandName(baseSite.nameEn),
    email: replaceLegacyBrandText(baseSite.email),
    facebook: replaceLegacyBrandText(baseSite.facebook),
    logoUrl: FLOATBASE_BRAND.logoUrl,
  };
  return {
    ...baseSite,
    name: normalizeBrandName(settings.houseboat_name || baseSite.name),
    nameEn: normalizeBrandName(settings.houseboat_name || baseSite.nameEn),
    tagline: replaceLegacyBrandText(baseSite.tagline),
    description: replaceLegacyBrandText(baseSite.description),
    phone: settings.phone || baseSite.phone,
    whatsapp: settings.whatsapp || baseSite.whatsapp,
    email: replaceLegacyBrandText(settings.email || baseSite.email),
    facebook: replaceLegacyBrandText(settings.facebook_url || baseSite.facebook),
    location: replaceLegacyBrandText(baseSite.location),
    locationEn: replaceLegacyBrandText(baseSite.locationEn),
    logoUrl: normalizeBrandLogoUrl(settings.logo_url),
    bkashNumber: settings.bkash_number || undefined,
    nagadNumber: settings.nagad_number || undefined,
    bankInfo: settings.bank_info || undefined,
    padmaPricePerPerson: Number(settings.padma_price_per_person || 0),
    promoDiscountPercent: Number(settings.promo_discount_percent || 0),
    promoDiscountStartDate: settings.promo_discount_start_date || undefined,
    promoDiscountEndDate: settings.promo_discount_end_date || undefined,
    promoDiscountTitle: settings.promo_discount_title || undefined,
  };
}

function textOr<T extends string | null | undefined>(value: T, fallback: string) {
  return replaceLegacyBrandText(typeof value === 'string' && value.trim() ? value : fallback);
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
          is_active: about.is_active ?? true,
        }
      : seasonData.about,
    cabinsSection: cabinsSection
      ? {
          ...seasonData.cabinsSection,
          title: textOr(cabinsSection.title, seasonData.cabinsSection.title),
          subtitle: textOr(cabinsSection.subtitle, seasonData.cabinsSection.subtitle),
          fullBoatDescription: textOr(cabinsSection.content, seasonData.cabinsSection.fullBoatDescription),
          fullBoatButton: textOr(cabinsSection.button_text, seasonData.cabinsSection.fullBoatButton),
          is_active: cabinsSection.is_active ?? true,
        }
      : seasonData.cabinsSection,
    availability: availability
      ? {
          ...seasonData.availability,
          title: textOr(availability.title, seasonData.availability.title),
          subtitle: textOr(availability.subtitle, seasonData.availability.subtitle),
          is_active: availability.is_active ?? true,
        }
      : seasonData.availability,
    itinerary: itinerary
      ? {
          ...seasonData.itinerary,
          title: textOr(itinerary.title, seasonData.itinerary.title),
          subtitle: textOr(itinerary.subtitle, seasonData.itinerary.subtitle),
          note: textOr(itinerary.content, seasonData.itinerary.note),
          is_active: itinerary.is_active ?? true,
        }
      : seasonData.itinerary,
    facilitiesSection: facilities
      ? {
          ...seasonData.facilitiesSection,
          title: textOr(facilities.title, seasonData.facilitiesSection.title),
          subtitle: textOr(facilities.subtitle, seasonData.facilitiesSection.subtitle),
          bannerDescription: textOr(facilities.content, seasonData.facilitiesSection.bannerDescription),
          bannerImage: textOr(facilities.image_url, seasonData.facilitiesSection.bannerImage),
          is_active: facilities.is_active ?? true,
        }
      : seasonData.facilitiesSection,
    gallery: gallery
      ? {
          ...seasonData.gallery,
          title: textOr(gallery.title, seasonData.gallery.title),
          subtitle: textOr(gallery.subtitle, seasonData.gallery.subtitle),
          is_active: gallery.is_active ?? true,
        }
      : seasonData.gallery,
    testimonials: testimonials
      ? {
          ...seasonData.testimonials,
          title: textOr(testimonials.title, seasonData.testimonials.title),
          subtitle: textOr(testimonials.subtitle, seasonData.testimonials.subtitle),
          is_active: testimonials.is_active ?? true,
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
    if (!roomSeason || (roomSeason as string) === '') return season === 'haor';
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
      id: room.id || room.slug || `room-${index}`,
      dbId: room.id,
      slug: room.slug,
      name: replaceLegacyBrandText(room.name),
      nameEn: room.slug,
      desc: replaceLegacyBrandText(room.description || ''),
      image: replaceLegacyBrandText(room.image_url || fallbackRooms[index % fallbackRooms.length]?.image || ''),
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
      features: Array.isArray(room.facilities)
        ? room.facilities.map((feature) => replaceLegacyBrandText(String(feature)))
        : (room.facilities ? String(room.facilities).split(',').map((s: string) => replaceLegacyBrandText(s.trim())).filter(Boolean) : []),
      available: room.status === 'active',
      badge: index === 0 ? 'Premium' : '',
      buttonLabel: season === 'padma' ? 'Book this event space' : undefined,
    };
  });
}

export function mapGalleryToPublic(gallery: GalleryImage[], season: SeasonType = 'haor') {
  if (!gallery || !gallery.length) return [];
  return gallery
    .filter((image) => Boolean(String(image.image_url || '').trim()))
    .map((image, index) => ({
      id: index + 1,
      src: replaceLegacyBrandText(image.image_url),
      alt: replaceLegacyBrandText(image.title || 'Houseboat gallery image'),
      category: replaceLegacyBrandText(image.category || 'Gallery'),
      isFeatured: image.is_featured || false,
    }));
}
