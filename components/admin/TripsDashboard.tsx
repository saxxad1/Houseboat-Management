'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminDataset, deleteRow } from '@/lib/admin/data';
import { toast } from 'sonner';
import type { Booking, Expense, Income, TripSlot } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Wallet, ReceiptText, ArrowRight, Trash2 } from 'lucide-react';
import { currencyFormatter } from '@/lib/admin/constants';
import { isReadOnlyAdminForTable } from '@/lib/admin/permissions';

interface TripStat {
  trip: TripSlot;
  totalGuests: number;
  totalBookings: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  tripIndex: number;
}

export function TripsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TripStat[]>([]);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    setReadOnly(isReadOnlyAdminForTable('trip_slots'));
    const load = async () => {
      const data = await fetchAdminDataset();
      const { trip_slots, bookings, income, expenses } = data;

      // Calculate sequential trip index based on chronological order
      const sortedTrips = [...trip_slots].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      const tripIndexMap = new Map();
      sortedTrips.forEach((trip, index) => tripIndexMap.set(trip.id, index + 1));

      const computedStats = trip_slots.map((trip) => {
        const tripBookings = bookings.filter((b) => b.trip_slot_id === trip.id);
        const tripIncome = income.filter((i) => i.trip_slot_id === trip.id);
        const tripExpenses = expenses.filter((e) => e.trip_slot_id === trip.id);

        let manualBookings: any[] = [];
        let manualExpenses: any[] = [];
        if (trip.note) {
          try {
            const parsed = JSON.parse(trip.note);
            manualBookings = parsed.manualBookings || [];
            manualExpenses = parsed.manualExpenses || [];
          } catch (e) {}
        }

        const totalGuests = tripBookings.reduce((sum, b) => sum + (b.number_of_guests || 0), 0) + manualBookings.reduce((sum, b) => sum + (Number(b.number_of_guests) || 0), 0);
        
        // Income includes booking payments AND additional incomes mapped to this trip
        const bookingIncome = tripBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) + manualBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
        // Add only non-booking incomes since booking income is usually added automatically on payment
        const otherIncome = tripIncome.filter(i => !i.booking_id).reduce((sum, i) => sum + Number(i.amount || 0), 0);
        
        const totalIncome = bookingIncome + otherIncome;
        const totalExpense = tripExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) + manualExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        
        return {
          trip,
          totalGuests,
          totalBookings: tripBookings.length + manualBookings.length,
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          tripIndex: tripIndexMap.get(trip.id) || 0,
        };
      });

      // Sort by start_date descending
      computedStats.sort((a, b) => new Date(b.trip.start_date).getTime() - new Date(a.trip.start_date).getTime());
      
      setStats(computedStats);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (tripId: string) => {
    if (readOnly) return;
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteRow('trip_slots', tripId);
      setStats(current => current.filter(s => s.trip.id !== tripId));
      toast.success('Trip deleted successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading trips data...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trips Management</h2>
          <p className="text-sm text-slate-500">Track bookings, income, expenses, and profit per trip.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ trip, totalGuests, totalBookings, totalIncome, totalExpense, netProfit, tripIndex }) => {
          const isOngoing = new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date();
          const isCompleted = new Date(trip.end_date) < new Date();
          const statusLabel = isOngoing ? 'Ongoing' : isCompleted ? 'Completed' : 'Upcoming';
          const statusColor = isOngoing ? 'bg-sky-100 text-sky-800' : isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

          return (
            <Card key={trip.id} className="relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                {trip.duration_label === 'Padma Day Trip' && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[hsl(197,80%,90%)] text-[hsl(197,80%,30%)] border border-[hsl(197,80%,80%)]">
                    Padma Season
                  </span>
                )}
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-[hsl(197,80%,30%)]" />
                  Trip {tripIndex}
                </CardTitle>
                <div className="text-sm text-slate-500">
                  {new Date(trip.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(trip.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" /> Guests</p>
                    <p className="text-sm font-semibold">{totalGuests} ({totalBookings} Bookings)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Wallet className="h-3 w-3" /> Income</p>
                    <p className="text-sm font-semibold text-emerald-600">{currencyFormatter.format(totalIncome)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><ReceiptText className="h-3 w-3" /> Expense</p>
                    <p className="text-sm font-semibold text-red-600">{currencyFormatter.format(totalExpense)}</p>
                  </div>
                  <div className="space-y-1 rounded-md bg-slate-50 p-2 border border-slate-100">
                    <p className="text-xs text-slate-500">Net Profit</p>
                    <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {currencyFormatter.format(netProfit)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button asChild className="flex-1" variant="outline">
                    <Link href={`/admin/trips/${trip.id}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {!readOnly && (
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3" onClick={() => handleDelete(trip.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {stats.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            No trips found. Create trip slots in the Booking Calendar.
          </div>
        )}
      </div>
    </div>
  );
}
