'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cabins as fallbackCabins,
  galleryImages as fallbackGalleryImages,
  packages as fallbackPackages,
  siteConfig as fallbackSiteConfig,
} from '@/data/houseboatData';
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
  siteConfig: PublicSiteConfig;
  cabins: PublicCabin[];
  packages: PublicPackage[];
  galleryImages: PublicGalleryImage[];
  availability: AvailabilityBlock[];
  content: WebsiteContent[];
  loading: boolean;
}

const fallbackValue: PublicDataContextValue = {
  siteConfig: { ...fallbackSiteConfig, logoUrl: '/logo-kuhelika-clean.png' },
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

    async function load() {
      const data = await loadPublicHouseboatData();
      if (!mounted || !data) return;

      setValue({
        siteConfig: mapSettingsToSiteConfig(data.settings),
        cabins: mapRoomsToCabins(data.rooms),
        packages: mapPackagesToPublic(data.packages),
        galleryImages: mapGalleryToPublic(data.gallery),
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
