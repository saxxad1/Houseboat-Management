import type { Metadata } from 'next';
import SalesPage from './SalesPage';

export const metadata: Metadata = {
  title: { absolute: 'Floatbase Systems | হাউসবোট ম্যানেজমেন্ট সফটওয়্যার' },
  description:
    'হাউসবোটের জন্য নিজস্ব বুকিং ওয়েবসাইট, শক্তিশালী অ্যাডমিন প্যানেল, হিসাব-রিপোর্ট ও সিজন ম্যানেজমেন্ট—এককালীন মূল্যে সম্পূর্ণ ডিজিটাল সিস্টেম।',
};

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Floatbase Systems',
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
