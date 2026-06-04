'use client';

import { useEffect, useMemo, useState } from 'react';
import ReportTable from '@/components/admin/ReportTable';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchAdminDataset } from '@/lib/admin/data';
import type { Booking, Expense, Income, Room, TourPackage, TripSlot } from '@/types/database';
import { parseISO, format } from 'date-fns';

import ReportsCharts from '@/components/admin/ReportsCharts';

function formatTripDate(start: string, end: string) {
  if (!start || !end) return '';
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `(${format(startDate, 'dd')}-${format(endDate, 'dd')}) ${format(startDate, 'MMMM yyyy')}`;
    } else if (startDate.getFullYear() === endDate.getFullYear()) {
      return `(${format(startDate, 'dd MMM')}-${format(endDate, 'dd MMM')}) ${format(startDate, 'yyyy')}`;
    } else {
      return `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`;
    }
  } catch (e) {
    return `${start} to ${end}`;
  }
}

function getReportBookingDate(booking: Booking) {
  return booking.season_type === 'padma' && booking.event_date ? booking.event_date : booking.check_in_date;
}

export default function ReportsAdminPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [tripSlots, setTripSlots] = useState<TripSlot[]>([]);

  useEffect(() => {
    fetchAdminDataset().then((data) => {
      setBookings(data.bookings);
      setIncome(data.income);
      setExpenses(data.expenses);
      setRooms(data.rooms);
      setPackages(data.packages);
      setTripSlots(data.trip_slots || []);
    });
  }, []);

  const rangeIncome = useMemo(
    () => income.filter((item) => (!fromDate || item.income_date >= fromDate) && (!toDate || item.income_date <= toDate)),
    [fromDate, income, toDate]
  );
  const rangeExpenses = useMemo(
    () => expenses.filter((item) => (!fromDate || item.expense_date >= fromDate) && (!toDate || item.expense_date <= toDate)),
    [expenses, fromDate, toDate]
  );
  const rangeBookings = useMemo(
    () => bookings.filter((item) => {
      const bookingDate = getReportBookingDate(item);
      return (!fromDate || bookingDate >= fromDate) && (!toDate || bookingDate <= toDate);
    }),
    [bookings, fromDate, toDate]
  );

  const { virtualIncome, virtualExpenses } = useMemo(() => {
    const vIncomes: { category: string; amount: number; trip_id: string }[] = [];
    const vExpenses: { category: string; amount: number; trip_id: string }[] = [];
    tripSlots.forEach(trip => {
      if (!trip.note) return;
      try {
        const parsed = JSON.parse(trip.note);
        if (parsed.manualBookings) {
          parsed.manualBookings.forEach((mb: any) => vIncomes.push({ category: 'booking', amount: Number(mb.total_amount) || 0, trip_id: trip.id }));
        }
        if (parsed.manualExpenses) {
          parsed.manualExpenses.forEach((me: any) => vExpenses.push({ category: me.category || 'other', amount: Number(me.amount) || 0, trip_id: trip.id }));
        }
      } catch (e) {}
    });
    return { virtualIncome: vIncomes, virtualExpenses: vExpenses };
  }, [tripSlots]);

  const rangeTripSlots = useMemo(() => {
    return tripSlots.filter((trip) => (!fromDate || trip.start_date >= fromDate) && (!toDate || trip.start_date <= toDate));
  }, [tripSlots, fromDate, toDate]);

  const rangeVirtualIncome = useMemo(() => virtualIncome.filter(vi => rangeTripSlots.some(t => t.id === vi.trip_id)), [virtualIncome, rangeTripSlots]);
  const rangeVirtualExpenses = useMemo(() => virtualExpenses.filter(ve => rangeTripSlots.some(t => t.id === ve.trip_id)), [virtualExpenses, rangeTripSlots]);

  const totalIncome = rangeIncome.reduce((sum, item) => sum + Number(item.amount), 0) + rangeVirtualIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = rangeExpenses.reduce((sum, item) => sum + Number(item.amount), 0) + rangeVirtualExpenses.reduce((sum, e) => sum + e.amount, 0);

  const mostBooked = useMemo(() => {
    const roomCounts = rooms.map((room) => ({
      room: room.name,
      bookings: rangeBookings.filter((booking) => booking.room_id === room.id).length,
    })).filter(r => r.bookings > 0).sort((a, b) => b.bookings - a.bookings).slice(0, 5); // top 5
    const packageCounts = packages.map((pkg) => ({
      package: pkg.title,
      bookings: rangeBookings.filter((booking) => booking.package_id === pkg.id).length,
    })).filter(p => p.bookings > 0).sort((a, b) => b.bookings - a.bookings).slice(0, 5); // top 5
    return { roomCounts, packageCounts };
  }, [packages, rangeBookings, rooms]);

  const tripRows = useMemo(() => {
    return [...rangeTripSlots]
      .sort((a, b) => b.start_date.localeCompare(a.start_date)) // descending
      .map((trip) => {
        const dbIncome = income.filter((i) => i.trip_slot_id === trip.id).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        const manualIncome = virtualIncome.filter(vi => vi.trip_id === trip.id).reduce((sum, vi) => sum + vi.amount, 0);
        const tIncome = dbIncome + manualIncome;

        const dbExpense = expenses.filter((e) => e.trip_slot_id === trip.id).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const manualExpense = virtualExpenses.filter(ve => ve.trip_id === trip.id).reduce((sum, ve) => sum + ve.amount, 0);
        const tExpense = dbExpense + manualExpense;

        return {
          trip: formatTripDate(trip.start_date, trip.end_date),
          income: tIncome,
          expense: tExpense,
          profit: tIncome - tExpense
        };
      });
  }, [rangeTripSlots, income, expenses, virtualIncome, virtualExpenses]);

  const incomeByCategory = useMemo(() => {
    const grouped = rangeIncome.reduce((acc, item) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
    rangeVirtualIncome.forEach(vi => grouped[vi.category] = (grouped[vi.category] || 0) + vi.amount);
    return Object.entries(grouped).filter((entry) => entry[1] > 0).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [rangeIncome, rangeVirtualIncome]);

  const expenseByCategory = useMemo(() => {
    const grouped = rangeExpenses.reduce((acc, item) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
    rangeVirtualExpenses.forEach(ve => grouped[ve.category] = (grouped[ve.category] || 0) + ve.amount);
    return Object.entries(grouped).filter((entry) => entry[1] > 0).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [rangeExpenses, rangeVirtualExpenses]);

  const bookingStatusData = useMemo(() => {
    const grouped = rangeBookings.reduce((acc, booking) => {
      const key = booking.booking_status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).filter((entry) => entry[1] > 0).map(([name, value]) => ({ name, value }));
  }, [rangeBookings]);

  const paymentStatusData = useMemo(() => {
    const grouped = rangeBookings.reduce((acc, booking) => {
      const key = booking.payment_status || 'unpaid';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).filter((entry) => entry[1] > 0).map(([name, value]) => ({ name, value }));
  }, [rangeBookings]);

  const seasonData = useMemo(() => {
    const grouped = rangeBookings.reduce((acc, booking) => {
      const key = booking.season_type || 'haor';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).filter((entry) => entry[1] > 0).map(([name, value]) => ({ name, value }));
  }, [rangeBookings]);

  return (
    <div className="min-w-0 space-y-6">
      {/* Filter and Summary Card */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="bg-white/50 border-slate-200 shadow-inner rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="bg-white/50 border-slate-200 shadow-inner rounded-xl" />
            </div>
            
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Total Income</span>
              <span className="text-xl font-black text-emerald-700 tracking-tight">৳{totalIncome.toLocaleString()}</span>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-4 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-wider">Total Expense</span>
              <span className="text-xl font-black text-rose-700 tracking-tight">৳{totalExpense.toLocaleString()}</span>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-4 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-bold text-sky-600/80 uppercase tracking-wider">Net Profit</span>
              <span className="text-xl font-black text-sky-700 tracking-tight">৳{(totalIncome - totalExpense).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics */}
      <ReportsCharts 
        roomData={mostBooked.roomCounts} 
        packageData={mostBooked.packageCounts} 
        incomeByCategory={incomeByCategory}
        expenseByCategory={expenseByCategory}
        seasonData={seasonData}
      />

      <ReportTable title="Trip income expense profit" rows={tripRows} />
      <ReportTable title="Booking report" rows={rangeBookings.map((booking) => ({
        code: booking.booking_code,
        date: getReportBookingDate(booking),
        check_out: booking.season_type === 'padma' ? booking.event_slot || 'custom' : booking.check_out_date,
        guests: booking.number_of_guests,
        total: booking.total_amount,
        due: booking.due_amount,
        status: booking.booking_status,
      }))} />
    </div>
  );
}
