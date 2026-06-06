import { NextResponse } from 'next/server';
import { fetchPublicHouseboatData } from '@/lib/server/publicDataFetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchPublicHouseboatData();
  if (!data) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  return NextResponse.json(data);
}
