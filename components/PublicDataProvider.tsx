'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cabins as fallbackCabins,
  galleryImages as fallbackGalleryImages,
  packages as fallbackPackages,
  siteConfig as fallbackSiteConfig,
} from '@/data/houseboatData';
import { getSeasonalData, normalizeSeason, type SeasonType, type SeasonalContent } from '@/data/seasonalData';
import {
  loadPublicHouseboatData,
  mapGalleryToPublic,
  mapPackagesToPublic,
  mapRoomsToCabins,
  mapSettingsToSiteConfig,
} from '@/lib/admin/publicData';
import type { AvailabilityBlock, WebsiteContent } from '@/types/database';

type PublicSiteConfig = typeof fallbackSiteConfig & {
  logoUrl?: string;
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
  content: [],
  loading: false,
};

const PublicDataContext = createContext<PublicDataContextValue>(fallbackValue);

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
        cabins: season === 'padma' ? [...seasonData.eventSpaces] as PublicCabin[] : [...seasonData.cabins] as PublicCabin[],
        packages: [...seasonData.packages] as PublicPackage[],
        galleryImages: [...seasonData.gallery.images] as PublicGalleryImage[],
      }));
    };

    async function load() {
      const data = await loadPublicHouseboatData();
      const localSeason = typeof window !== 'undefined'
        ? normalizeSeason(window.localStorage.getItem('kuhelika-active-season'))
        : 'haor';
      if (!mounted || !data) {
        applySeasonFallback(localSeason);
        return;
      }

      const activeSeason = normalizeSeason(data.settings?.active_season || localSeason);
      const seasonData = getSeasonalData(activeSeason);
      const mappedRooms = mapRoomsToCabins(data.rooms, activeSeason);
      const mappedPackages = mapPackagesToPublic(data.packages, activeSeason);
      const mappedGallery = mapGalleryToPublic(data.gallery, activeSeason);
      const mappedSettings = mapSettingsToSiteConfig(data.settings, seasonData);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kuhelika-active-season', activeSeason);
      }

      setValue({
        activeSeason,
        seasonData,
        siteConfig: mappedSettings,
        cabins: mappedRooms.length
          ? mappedRooms as PublicCabin[]
          : (activeSeason === 'padma' ? [...seasonData.eventSpaces] : [...seasonData.cabins]) as PublicCabin[],
        packages: mappedPackages.length ? mappedPackages as PublicPackage[] : [...seasonData.packages] as PublicPackage[],
        galleryImages: mappedGallery.length ? mappedGallery as PublicGalleryImage[] : [...seasonData.gallery.images] as PublicGalleryImage[],
        availability: data.availability,
        content: data.content,
        loading: false,
      });
    }

    setValue((current) => ({ ...current, loading: true }));
    load().finally(() => {
      if (mounted) setValue((current) => ({ ...current, loading: false }));
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleSeasonChange = () => {
      const season = normalizeSeason(window.localStorage.getItem('kuhelika-active-season'));
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
        cabins: season === 'padma' ? [...seasonData.eventSpaces] as PublicCabin[] : [...seasonData.cabins] as PublicCabin[],
        packages: [...seasonData.packages] as PublicPackage[],
        galleryImages: [...seasonData.gallery.images] as PublicGalleryImage[],
      }));
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
