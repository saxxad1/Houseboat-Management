export const FLOATBOAT_BRAND = {
  name: 'FloatBoat',
  domain: 'floatboat.com',
  siteUrl: 'https://floatboat.com',
  email: 'info@floatboat.com',
  logoUrl: '/logo-floatboat.svg',
  heroImage: '/hero-floatboat-houseboat.jpg',
  activeSeasonKey: 'floatboat-active-season',
  publicDataEvent: 'floatboat-public-data-change',
  seasonChangeEvent: 'floatboat-season-change',
  adminRoleKey: 'floatboat-admin-role',
  demoAdminKey: 'floatboat-demo-admin',
  adminStoragePrefix: 'floatboat-admin',
} as const;

export function replaceLegacyBrandText(value: string) {
  return value
    .replace(/kuhelika\.com/gi, FLOATBOAT_BRAND.domain)
    .replace(/fb\.com\/kuhelika/gi, 'fb.com/floatboat')
    .replace(/logo-kuhelika(?:-clean)?\.png/gi, 'logo-floatboat.svg')
    .replace(/hero-kuhelika-houseboat\.jpg/gi, 'hero-floatboat-houseboat.jpg')
    .replace(/\/images\/kuhelika\//gi, '/images/floatboat/')
    .replace(/kuhelika-/gi, 'floatboat-')
    .replace(/kuhelika_/gi, 'floatboat_')
    .replace(/কুহেলিকার|কোহেলিকার/g, 'FloatBoat এর')
    .replace(/কুহেলিকা|কোহেলিকা/g, FLOATBOAT_BRAND.name)
    .replace(/kuhelika/gi, FLOATBOAT_BRAND.name);
}

export function normalizeBrandName(value?: string | null) {
  const normalized = replaceLegacyBrandText(String(value || '').trim());
  return normalized || FLOATBOAT_BRAND.name;
}

export function normalizeBrandLogoUrl(value?: string | null) {
  const normalized = replaceLegacyBrandText(String(value || '').trim());
  if (!normalized || /logo-kuhelika/i.test(normalized)) {
    return FLOATBOAT_BRAND.logoUrl;
  }
  return normalized;
}
