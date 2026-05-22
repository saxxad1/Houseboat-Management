'use client';

import { usePublicData } from '@/components/PublicDataProvider';
import { isHaorSeason, isPadmaSeason } from '@/lib/season';

export function useActiveSeason() {
  const { activeSeason, seasonData } = usePublicData();

  return {
    activeSeason,
    seasonData,
    isHaor: isHaorSeason(activeSeason),
    isPadma: isPadmaSeason(activeSeason),
  };
}
