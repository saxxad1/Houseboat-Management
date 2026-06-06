import { fetchPublicHouseboatData } from '@/lib/server/publicDataFetcher';
import { PublicDataProvider } from '@/components/PublicDataProvider';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const data = await fetchPublicHouseboatData();

  return (
    <PublicDataProvider initialData={data}>
      <HomeClient />
    </PublicDataProvider>
  );
}
