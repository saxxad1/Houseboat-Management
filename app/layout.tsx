import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kuhelika.com'),
  title: 'কুহেলিকা – টাঙ্গুয়ার হাওর বিলাসবহুল হাউসবোট | Sunamganj',
  description:
    'টাঙ্গুয়ার হাওরে বিলাসবহুল হাউসবোটে আপনাকে স্বাগতম। Tanguar Haor houseboat booking Bangladesh. পরিবার, বন্ধু ও কর্পোরেট টিমের জন্য আদর্শ ভ্রমণ প্যাকেজ।',
  keywords: [
    'Tanguar Haor houseboat',
    'Sunamganj houseboat booking',
    'টাঙ্গুয়ার হাওর হাউসবোট',
    'Tanguar Haor tour package',
    'Houseboat booking Bangladesh',
    'kuhelika',
    'কুহেলিকা',
    'sunamganj tour',
    'tanguar haor travel',
  ],
  openGraph: {
    title: 'কুহেলিকা – টাঙ্গুয়ার হাওর বিলাসবহুল হাউসবোট',
    description:
      'টাঙ্গুয়ার হাওরের নীল জলে ভাসমান বিলাসবহুল হাউসবোটে একটি অবিস্মরণীয় অভিজ্ঞতা।',
    type: 'website',
    locale: 'bn_BD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
