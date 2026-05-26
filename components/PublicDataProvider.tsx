'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cabins as fallbackCabins,
  galleryImages as fallbackGalleryImages,
  packages as fallbackPackages,
  siteConfig as fallbackSiteConfig,
} from '@/data/houseboatData';
import { getSeasonalData, normalizeSeason, padmaEventSpaces, type SeasonType, type SeasonalContent } from '@/data/seasonalData';
import {
  getEffectiveSeasonalData,
  loadPublicHouseboatData,
  mapGalleryToPublic,
  mapPackagesToPublic,
  mapRoomsToCabins,
  mapSettingsToSiteConfig,
} from '@/lib/admin/publicData';
import type { AvailabilityBlock, WebsiteContent, TripSlot } from '@/types/database';

type PublicSiteConfig = typeof fallbackSiteConfig & {
  logoUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  bankInfo?: string;
};
type PublicCabin = (typeof fallbackCabins)[number];
type PublicPackage = (typeof fallbackPackages)[number];
type PublicGalleryImage = (typeof fallbackGalleryImages)[number];

interface PublicDataContextValue {
  activeSeason: SeasonType;
  seasonData: SeasonalContent;
  siteConfig: PublicSiteConfig;
  cabins: PublicCabin[];
  packages: PublicPackage[];
  galleryImages: PublicGalleryImage[];
  availability: AvailabilityBlock[];
  tripSlots: TripSlot[];
  content: WebsiteContent[];
  loading: boolean;
}

const initialSeason = getSeasonalData('haor');

const fallbackValue: PublicDataContextValue = {
  activeSeason: 'haor',
  seasonData: initialSeason,
  siteConfig: { ...fallbackSiteConfig, ...initialSeason.site, logoUrl: '/logo-kuhelika-clean.png' },
  cabins: fallbackCabins,
  packages: fallbackPackages,
  galleryImages: fallbackGalleryImages,
  availability: [],
  tripSlots: [],
  content: [],
  loading: false,
};

const PublicDataContext = createContext<PublicDataContextValue>(fallbackValue);

function getLocalSeason(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('kuhelika-active-season');
  } catch (e) {
    return null;
  }
}

function setLocalSeason(season: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('kuhelika-active-season', season);
  } catch (e) {
    // ignore
  }
}

export function PublicDataProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<PublicDataContextValue>(fallbackValue);

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
          logoUrl: current.siteConfig.logoUrl || '/logo-kuhelika-clean.png',
        },
        cabins: season === 'padma' ? [...seasonData.eventSpaces] as PublicCabin[] : [...fallbackCabins] as PublicCabin[],
        packages: seasonData.packages.length ? [...seasonData.packages] as PublicPackage[] : [...fallbackPackages] as PublicPackage[],
        galleryImages: seasonData.gallery.images.length ? [...seasonData.gallery.images] as PublicGalleryImage[] : [...fallbackGalleryImages] as PublicGalleryImage[],
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
      const mappedPackages = mapPackagesToPublic(data.packages, activeSeason);
      const mappedGallery = mapGalleryToPublic(data.gallery, activeSeason);
      const mappedSettings = mapSettingsToSiteConfig(data.settings, seasonData);
      
      setLocalSeason(activeSeason);

      setValue({
        activeSeason,
        seasonData,
        siteConfig: mappedSettings,
        cabins: mappedRooms.length
          ? mappedRooms as PublicCabin[]
          : (activeSeason === 'padma' ? [...seasonData.eventSpaces] : fallbackCabins) as PublicCabin[],
        packages: mappedPackages.length ? mappedPackages as PublicPackage[] : (seasonData.packages.length ? [...seasonData.packages] : [...fallbackPackages]) as PublicPackage[],
        galleryImages: mappedGallery.length ? mappedGallery as PublicGalleryImage[] : [...seasonData.gallery.images] as PublicGalleryImage[],
        availability: data.availability,
        tripSlots: data.trip_slots || [],
        content: data.content,
        loading: false,
      });
    }

    setValue((current) => ({ ...current, loading: true }));
    load().finally(() => {
      if (mounted) setValue((current) => ({ ...current, loading: false }));
    });
    window.addEventListener('kuhelika-public-data-change', load);

    return () => {
      mounted = false;
      window.removeEventListener('kuhelika-public-data-change', load);
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
            logoUrl: current.siteConfig.logoUrl || '/logo-kuhelika-clean.png',
          },
          galleryImages: current.galleryImages,
          cabins: current.cabins.length > 0 && current.cabins !== fallbackCabins && current.cabins !== padmaEventSpaces
            ? current.cabins 
            : (season === 'padma' ? [...seasonData.eventSpaces] as PublicCabin[] : [...fallbackCabins] as PublicCabin[]),
          packages: current.packages.length > 0 && current.packages !== fallbackPackages 
            ? current.packages 
            : (seasonData.packages.length ? [...seasonData.packages] : [...fallbackPackages]) as PublicPackage[],
        };
      });
    };

    window.addEventListener('kuhelika-season-change', handleSeasonChange);
    window.addEventListener('storage', handleSeasonChange);
    return () => {
      window.removeEventListener('kuhelika-season-change', handleSeasonChange);
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
