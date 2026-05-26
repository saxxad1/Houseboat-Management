import { TripDetails } from '@/components/admin/TripDetails';

export default async function AdminTripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetails id={id} />;
}
