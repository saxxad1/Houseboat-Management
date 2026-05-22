'use client';

import { isSupabaseConfigured } from '@/lib/supabase/client';
import { cabins as fallbackRooms, siteConfig } from '@/data/houseboatData';
import type { SeasonType, SeasonalContent } from '@/data/seasonalData';
import type { AvailabilityBlock, GalleryImage, HouseboatSettings, Room, TourPackage, WebsiteContent } from '@/types/database';

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

function textOr<T extends string | null | undefined>(value: T, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function contentFor(content: WebsiteContent[], season: SeasonType, key: string) {
  const keys = new Set([key, `${season}_${key}`, `${key}_${season}`, `${season}:${key}`, `${key}:${season}`]);
  return content.find((row) => row.is_active && keys.has(row.section_key));
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
  const packagesSection = contentFor(content, season, season === 'padma' ? 'event_packages' : 'packages') || contentFor(content, season, 'packages');
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
        }
      : seasonData.about,
    cabinsSection: cabinsSection
      ? {
          ...seasonData.cabinsSection,
          title: textOr(cabinsSection.title, seasonData.cabinsSection.title),
          subtitle: textOr(cabinsSection.subtitle, seasonData.cabinsSection.subtitle),
          fullBoatDescription: textOr(cabinsSection.content, seasonData.cabinsSection.fullBoatDescription),
          fullBoatButton: textOr(cabinsSection.button_text, seasonData.cabinsSection.fullBoatButton),
        }
      : seasonData.cabinsSection,
    packagesSection: packagesSection
      ? {
          ...seasonData.packagesSection,
          title: textOr(packagesSection.title, seasonData.packagesSection.title),
          subtitle: textOr(packagesSection.subtitle, seasonData.packagesSection.subtitle),
          note: textOr(packagesSection.content, seasonData.packagesSection.note),
        }
      : seasonData.packagesSection,
    availability: availability
      ? {
          ...seasonData.availability,
          title: textOr(availability.title, seasonData.availability.title),
          subtitle: textOr(availability.subtitle, seasonData.availability.subtitle),
        }
      : seasonData.availability,
    itinerary: itinerary
      ? {
          ...seasonData.itinerary,
          title: textOr(itinerary.title, seasonData.itinerary.title),
          subtitle: textOr(itinerary.subtitle, seasonData.itinerary.subtitle),
          note: textOr(itinerary.content, seasonData.itinerary.note),
        }
      : seasonData.itinerary,
    facilitiesSection: facilities
      ? {
          ...seasonData.facilitiesSection,
          title: textOr(facilities.title, seasonData.facilitiesSection.title),
          subtitle: textOr(facilities.subtitle, seasonData.facilitiesSection.subtitle),
          bannerDescription: textOr(facilities.content, seasonData.facilitiesSection.bannerDescription),
          bannerImage: textOr(facilities.image_url, seasonData.facilitiesSection.bannerImage),
        }
      : seasonData.facilitiesSection,
    gallery: gallery
      ? {
          ...seasonData.gallery,
          title: textOr(gallery.title, seasonData.gallery.title),
          subtitle: textOr(gallery.subtitle, seasonData.gallery.subtitle),
        }
      : seasonData.gallery,
    testimonials: testimonials
      ? {
          ...seasonData.testimonials,
          title: textOr(testimonials.title, seasonData.testimonials.title),
          subtitle: textOr(testimonials.subtitle, seasonData.testimonials.subtitle),
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
