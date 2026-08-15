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
    default: 'Floatbase | হাউসবোট ম্যানেজমেন্ট সিস্টেম',
    template: '%s | Floatbase',
  },
  description:
    'হাউসবোটের জন্য নিজস্ব বুকিং ওয়েবসাইট, শক্তিশালী অ্যাডমিন প্যানেল, হিসাব-রিপোর্ট ও সিজন ম্যানেজমেন্ট।',
  keywords: [
    'হাউসবোট ম্যানেজমেন্ট সফটওয়্যার',
    'হাউসবোট বুকিং সিস্টেম',
    'Houseboat management software Bangladesh',
    'Houseboat booking website',
    'Floatbase',
  ],
  openGraph: {
    title: 'Floatbase | হাউসবোট ম্যানেজমেন্ট সিস্টেম',
    description: 'বুকিং কোথায়, বকেয়া কত, লাভ হলো কি না—এক জায়গায় জানুন।',
    type: 'website',
    locale: 'bn_BD',
    images: [
      {
        url: 'https://floatbase.com/og.png',
        width: 1200,
        height: 630,
        alt: 'জলের বুকে আধুনিক হাউসবোট',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Floatbase | হাউসবোট ম্যানেজমেন্ট সিস্টেম',
    description: 'বুকিং কোথায়, বকেয়া কত, লাভ হলো কি না—এক জায়গায় জানুন।',
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
