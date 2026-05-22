import { getSeasonalData, normalizeSeason, type SeasonType } from '@/data/seasonalData';

export { getSeasonalData, normalizeSeason };
export type { SeasonType };

export function isHaorSeason(season: unknown) {
  return normalizeSeason(typeof season === 'string' ? season : undefined) === 'haor';
}

export function isPadmaSeason(season: unknown) {
  return normalizeSeason(typeof season === 'string' ? season : undefined) === 'padma';
}

export async function getActiveSeason(value?: unknown) {
  return normalizeSeason(typeof value === 'string' ? value : undefined);
}
