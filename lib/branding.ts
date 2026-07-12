export const FLOATBASE_BRAND = {
  name: 'Floatbase',
  domain: 'floatbase.com',
  siteUrl: 'https://floatbase.com',
  email: 'info@floatbase.com',
  logoUrl: '/logo-floatbase.svg',
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
    .replace(/floatboat\.com/gi, FLOATBASE_BRAND.domain)
    .replace(/fb\.com\/floatboat/gi, 'fb.com/floatbase')
    .replace(/logo-floatboat\.svg/gi, 'logo-floatbase.svg')
    .replace(/FloatBoat/g, FLOATBASE_BRAND.name)
    .replace(/kuhelika\.com/gi, FLOATBASE_BRAND.domain)
    .replace(/fb\.com\/kuhelika/gi, 'fb.com/floatbase')
    .replace(/logo-kuhelika(?:-clean)?\.png/gi, 'logo-floatbase.svg')
    .replace(/hero-kuhelika-houseboat\.jpg/gi, 'hero-floatboat-houseboat.jpg')
    .replace(/\/images\/kuhelika\//gi, '/images/floatboat/')
    .replace(/kuhelika-/gi, 'floatboat-')
    .replace(/kuhelika_/gi, 'floatboat_')
    .replace(/কুহেলিকার|কোহেলিকার/g, 'Floatbase এর')
    .replace(/কুহেলিকা|কোহেলিকা/g, FLOATBASE_BRAND.name)
    .replace(/kuhelika/gi, FLOATBASE_BRAND.name);
}

export function normalizeBrandName(value?: string | null) {
  const normalized = replaceLegacyBrandText(String(value || '').trim());
  return normalized || FLOATBASE_BRAND.name;
}

export function normalizeBrandLogoUrl(value?: string | null) {
  const normalized = replaceLegacyBrandText(String(value || '').trim());
  if (!normalized || /logo-(?:kuhelika|floatboat)/i.test(normalized)) {
    return FLOATBASE_BRAND.logoUrl;
  }
  return normalized;
}
