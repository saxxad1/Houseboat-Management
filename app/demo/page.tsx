import type { Metadata } from 'next';
import { fetchPublicHouseboatData } from '@/lib/server/publicDataFetcher';
import { PublicDataProvider } from '@/components/PublicDataProvider';
import HomeClient from '../HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: { absolute: 'Floatbase - An Aesthetic Water Villa' },
  description:
    'Welcome to the luxury houseboat in Tanguar Haor. Tanguar Haor houseboat booking Bangladesh. Ideal for family, friends, and corporate teams.',
  openGraph: {
    title: 'Floatbase - An Aesthetic Water Villa',
    description: 'An unforgettable experience on a luxury houseboat floating in the blue waters of Tanguar Haor.',
    type: 'website',
    locale: 'en_US',
    images: ['/hero-floatboat-houseboat.jpg'],
  },
};

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'Floatbase Houseboat',
  image: 'https://floatbase.com/hero-floatboat-houseboat.jpg',
  description: 'An unforgettable experience on a luxury houseboat floating in the blue waters of Tanguar Haor.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sunamganj',
    addressRegion: 'Sylhet',
    addressCountry: 'BD',
  },
  telephone: '+8801736625982',
  priceRange: '$$$',
};

export default async function DemoPage() {
  const data = await fetchPublicHouseboatData();

  return (
    <div lang="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <PublicDataProvider initialData={data}>
        <HomeClient />
      </PublicDataProvider>
    </div>
  );
}
