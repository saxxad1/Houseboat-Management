'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cabins as fallbackCabins,
  galleryImages as fallbackGalleryImages,
  siteConfig as fallbackSiteConfig,
} from '@/data/houseboatData';
import { getSeasonalData, normalizeSeason, type SeasonType, type SeasonalContent } from '@/data/seasonalData';
import {
  getEffectiveSeasonalData,
  loadPublicHouseboatData,
  mapGalleryToPublic,
  mapRoomsToCabins,
  mapSettingsToSiteConfig,
} from '@/lib/admin/publicData';
import type { AvailabilityBlock, Booking, Review, SpecialDate, WebsiteContent, TripSlot } from '@/types/database';

type PublicSiteConfig = typeof fallbackSiteConfig & {
  logoUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  bankInfo?: string;
  padmaPricePerPerson?: number;
  promoDiscountPercent?: number;
  promoDiscountStartDate?: string;
  promoDiscountEndDate?: string;
  promoDiscountTitle?: string;
};
type PublicCabin = (typeof fallbackCabins)[number];
type PublicPackage = SeasonalContent['packages'][number];
type PublicGalleryImage = (typeof fallbackGalleryImages)[number];

interface PublicDataContextValue {
  activeSeason: SeasonType;
  seasonData: SeasonalContent;
  siteConfig: PublicSiteConfig;
  cabins: PublicCabin[];
  packages: PublicPackage[];
  galleryImages: PublicGalleryImage[];
  availability: AvailabilityBlock[];
  bookings: Booking[];
  tripSlots: TripSlot[];
  specialDates: SpecialDate[];
  content: WebsiteContent[];
  reviews: Review[];
  loading: boolean;
}

const initialSeason = getSeasonalData('haor');

const fallbackValue: PublicDataContextValue = {
  activeSeason: 'haor',
  seasonData: initialSeason,
  siteConfig: { ...fallbackSiteConfig, ...initialSeason.site, logoUrl: '/logo-floatboat.svg' },
  cabins: fallbackCabins,
  packages: [],
  galleryImages: fallbackGalleryImages,
  availability: [],
  bookings: [],
  tripSlots: [],
  specialDates: [],
  content: [],
  reviews: [],
  loading: false,
};

const PublicDataContext = createContext<PublicDataContextValue>(fallbackValue);

function getLocalSeason(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('floatboat-active-season');
  } catch (e) {
    return null;
  }
}

function setLocalSeason(season: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('floatboat-active-season', season);
  } catch (e) {
    // ignore
  }
}

export function PublicDataProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
  const [value, setValue] = useState<PublicDataContextValue>(() => {
    if (initialData) {
      const activeSeason = normalizeSeason(initialData.settings?.active_season || getLocalSeason());
      const seasonData = getEffectiveSeasonalData(getSeasonalData(activeSeason), initialData.settings, initialData.content, activeSeason);
      const mappedRooms = mapRoomsToCabins(initialData.rooms, activeSeason);
      const mappedGallery = mapGalleryToPublic(initialData.gallery, activeSeason);
      const mappedSettings = mapSettingsToSiteConfig(initialData.settings, seasonData);
      
      return {
        activeSeason,
        seasonData,
        siteConfig: mappedSettings,
        cabins: mappedRooms.length
          ? mappedRooms as any as PublicCabin[]
          : (activeSeason === 'padma' ? [...seasonData.eventSpaces] : fallbackCabins) as any as PublicCabin[],
        packages: [],
        galleryImages: mappedGallery.length ? mappedGallery as PublicGalleryImage[] : [...seasonData.gallery.images] as PublicGalleryImage[],
        availability: initialData.availability || [],
        bookings: initialData.bookings || [],
        tripSlots: initialData.trip_slots || [],
        specialDates: initialData.special_dates || [],
        content: initialData.content || [],
        reviews: initialData.reviews || [],
        loading: false,
      };
    }
    return fallbackValue;
  });

  useEffect(() => {
    let mounted = true;

    const applySeasonFallback = (season: SeasonType) => {
      const seasonData = getSeasonalData(season);
      setValue((current) => ({
        ...current,
        activeSeason: season,
        seasonData,
        siteConfig: {
          ...current.siteConfig,
          ...seasonData.site,
          phone: current.siteConfig.phone || fallbackSiteConfig.phone,
          whatsapp: current.siteConfig.whatsapp || fallbackSiteConfig.whatsapp,
          email: current.siteConfig.email || fallbackSiteConfig.email,
          facebook: current.siteConfig.facebook || fallbackSiteConfig.facebook,
          logoUrl: current.siteConfig.logoUrl || '/logo-floatboat.svg',
        },
        cabins: season === 'padma' ? [...seasonData.eventSpaces] as any as PublicCabin[] : [...fallbackCabins] as any as PublicCabin[],
        packages: [],
        galleryImages: seasonData.gallery.images.length ? [...seasonData.gallery.images] as PublicGalleryImage[] : [...fallbackGalleryImages] as PublicGalleryImage[],
        reviews: current.reviews,
      }));
    };

    async function load() {
      const data = await loadPublicHouseboatData();
      const localSeason = normalizeSeason(getLocalSeason());
      
      if (!mounted || !data) {
        applySeasonFallback(localSeason);
        return;
      }

      const activeSeason = normalizeSeason(data.settings?.active_season || localSeason);
      const seasonData = getEffectiveSeasonalData(getSeasonalData(activeSeason), data.settings, data.content, activeSeason);
      const mappedRooms = mapRoomsToCabins(data.rooms, activeSeason);
      const mappedGallery = mapGalleryToPublic(data.gallery, activeSeason);
      const mappedSettings = mapSettingsToSiteConfig(data.settings, seasonData);
      
      setLocalSeason(activeSeason);

      setValue({
        activeSeason,
        seasonData,
        siteConfig: mappedSettings,
        cabins: mappedRooms.length
          ? mappedRooms as any as PublicCabin[]
          : (activeSeason === 'padma' ? [...seasonData.eventSpaces] : fallbackCabins) as any as PublicCabin[],
        packages: [],
        galleryImages: mappedGallery.length ? mappedGallery as PublicGalleryImage[] : [...seasonData.gallery.images] as PublicGalleryImage[],
        availability: data.availability,
        bookings: data.bookings || [],
        tripSlots: data.trip_slots || [],
        specialDates: data.special_dates || [],
        content: data.content,
        reviews: data.reviews || [],
        loading: false,
      });
    }

    setValue((current) => ({ ...current, loading: true }));
    load().finally(() => {
      if (mounted) setValue((current) => ({ ...current, loading: false }));
    });
    const handlePublicDataChange = (event: Event) => {
      const booking = (event as CustomEvent<{ booking?: Booking }>).detail?.booking;
      if (booking) {
        setValue((current) => ({
          ...current,
          bookings: [
            ...current.bookings.filter((item) => item.id !== booking.id),
            booking,
          ],
        }));
      }
      load();
    };
    window.addEventListener('floatboat-public-data-change', handlePublicDataChange);

    return () => {
      mounted = false;
      window.removeEventListener('floatboat-public-data-change', handlePublicDataChange);
    };
  }, []);

  useEffect(() => {
    const handleSeasonChange = () => {
      const season = normalizeSeason(getLocalSeason());
      const seasonData = getSeasonalData(season);
      
      setValue((current) => {
        return {
          ...current,
          activeSeason: season,
          seasonData,
          siteConfig: {
            ...current.siteConfig,
            ...seasonData.site,
            phone: current.siteConfig.phone || fallbackSiteConfig.phone,
            whatsapp: current.siteConfig.whatsapp || fallbackSiteConfig.whatsapp,
            email: current.siteConfig.email || fallbackSiteConfig.email,
            facebook: current.siteConfig.facebook || fallbackSiteConfig.facebook,
            logoUrl: current.siteConfig.logoUrl || '/logo-floatboat.svg',
          },
          galleryImages: [...seasonData.gallery.images] as PublicGalleryImage[],
          specialDates: current.specialDates,
          cabins: (season === 'padma' ? [...seasonData.eventSpaces] : [...fallbackCabins]) as any as PublicCabin[],
          packages: [],
          reviews: current.reviews,
        };
      });
    };

    window.addEventListener('floatboat-season-change', handleSeasonChange);
    window.addEventListener('storage', handleSeasonChange);
    return () => {
      window.removeEventListener('floatboat-season-change', handleSeasonChange);
      window.removeEventListener('storage', handleSeasonChange);
    };
  }, []);

  const memoValue = useMemo(() => value, [value]);

  return (
    <PublicDataContext.Provider value={memoValue}>
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  return useContext(PublicDataContext);
}
