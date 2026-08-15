import type { Metadata } from 'next';
import SalesPage from './SalesPage';

export const metadata: Metadata = {
  title: { absolute: 'Floatbase | হাউসবোট ম্যানেজমেন্ট সিস্টেম' },
  description:
    'বুকিং, কেবিন, অতিথি, আয়–ব্যয়, রিপোর্ট ও সিজন ম্যানেজমেন্ট—হাউসবোট ব্যবসার জন্য একটি সম্পূর্ণ ডিজিটাল সিস্টেম।',
};

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Floatbase',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'বাংলাদেশের হাউসবোট ব্যবসার জন্য বুকিং ও ম্যানেজমেন্ট সফটওয়্যার।',
  offers: {
    '@type': 'Offer',
    price: '40000',
    priceCurrency: 'BDT',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <SalesPage />
    </>
  );
}
