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
  metadataBase: new URL('https://floatbase.com'),
  title: {
    default: 'Floatbase Systems | হাউসবোট ম্যানেজমেন্ট সফটওয়্যার',
    template: '%s | Floatbase Systems',
  },
  description:
    'হাউসবোটের জন্য নিজস্ব বুকিং ওয়েবসাইট, শক্তিশালী অ্যাডমিন প্যানেল, হিসাব-রিপোর্ট ও সিজন ম্যানেজমেন্ট।',
  keywords: [
    'হাউসবোট ম্যানেজমেন্ট সফটওয়্যার',
    'হাউসবোট বুকিং সিস্টেম',
    'Houseboat management software Bangladesh',
    'Houseboat booking website',
    'Floatbase Systems',
  ],
  openGraph: {
    title: 'Floatbase Systems | হাউসবোট ম্যানেজমেন্ট সফটওয়্যার',
    description: 'বুকিং থেকে লাভ—আপনার হাউসবোট ব্যবসার সবকিছু এক জায়গায়।',
    type: 'website',
    locale: 'bn_BD',
    images: [
      {
        url: 'https://floatbase.com/og.png',
        width: 1200,
        height: 630,
        alt: 'Floatbase হাউসবোট ম্যানেজমেন্ট সিস্টেম',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Floatbase Systems | হাউসবোট ম্যানেজমেন্ট সফটওয়্যার',
    description: 'বুকিং থেকে লাভ—আপনার হাউসবোট ব্যবসার সবকিছু এক জায়গায়।',
    images: ['https://floatbase.com/og.png'],
  },
};

import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className={`${outfit.variable} ${hindSiliguri.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
