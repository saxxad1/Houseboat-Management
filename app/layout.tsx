import type { Metadata } from 'next';
import { Outfit, Hind_Siliguri, Playfair_Display } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kuhelika.com'),
  title: 'Kuhelika - An Aesthetic Water Villa',
  description:
    'Welcome to the luxury houseboat in Tanguar Haor. Tanguar Haor houseboat booking Bangladesh. Ideal travel packages for family, friends, and corporate teams.',
  keywords: [
    'Tanguar Haor houseboat',
    'Sunamganj houseboat booking',
    'Tanguar Haor Houseboat',
    'Tanguar Haor tour package',
    'Houseboat booking Bangladesh',
    'kuhelika',
    'Kuhelika',
    'sunamganj tour',
    'tanguar haor travel',
  ],
  openGraph: {
    title: 'Kuhelika - An Aesthetic Water Villa',
    description:
      'An unforgettable experience on a luxury houseboat floating in the blue waters of Tanguar Haor.',
    type: 'website',
    locale: 'en_US',
    images: ['/hero-kuhelika-houseboat.jpg'],
  },
};

import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Kuhelika Houseboat',
    image: 'https://kuhelika.com/hero-kuhelika-houseboat.jpg',
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

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className={`${outfit.variable} ${hindSiliguri.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
