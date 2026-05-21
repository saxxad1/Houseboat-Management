'use client';

import { useEffect, useMemo, useState } from 'react';
import ReportTable from '@/components/admin/ReportTable';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchAdminDataset } from '@/lib/admin/data';
import type { Booking, Expense, Income, Room, TourPackage } from '@/types/database';

export default function ReportsAdminPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    fetchAdminDataset().then((data) => {
      setBookings(data.bookings);
      setIncome(data.income);
      setExpenses(data.expenses);
      setRooms(data.rooms);
      setPackages(data.packages);
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
    () => bookings.filter((item) => (!fromDate || item.check_in_date >= fromDate) && (!toDate || item.check_in_date <= toDate)),
    [bookings, fromDate, toDate]
  );

  const totalIncome = rangeIncome.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = rangeExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const due = rangeBookings.reduce((sum, item) => sum + Number(item.due_amount), 0);

  const mostBooked = useMemo(() => {
    const roomCounts = rooms.map((room) => ({
      room: room.name,
      bookings: rangeBookings.filter((booking) => booking.room_id === room.id).length,
    })).sort((a, b) => b.bookings - a.bookings);
    const packageCounts = packages.map((pkg) => ({
      package: pkg.title,
      bookings: rangeBookings.filter((booking) => booking.package_id === pkg.id).length,
    })).sort((a, b) => b.bookings - a.bookings);
    return { roomCounts, packageCounts };
  }, [packages, rangeBookings, rooms]);

  const dailyRows = Array.from(new Set([...rangeIncome.map((item) => item.income_date), ...rangeExpenses.map((item) => item.expense_date)])).sort().map((date) => {
    const dayIncome = rangeIncome.filter((item) => item.income_date === date).reduce((sum, item) => sum + Number(item.amount), 0);
    const dayExpense = rangeExpenses.filter((item) => item.expense_date === date).reduce((sum, item) => sum + Number(item.amount), 0);
    return { date, income: dayIncome, expense: dayExpense, profit: dayIncome - dayExpense };
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-5">
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Income: ৳{totalIncome.toLocaleString()}</div>
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Expense: ৳{totalExpense.toLocaleString()}</div>
          <div className="rounded-lg bg-sky-50 p-3 text-sm text-sky-700">Profit: ৳{(totalIncome - totalExpense).toLocaleString()}</div>
        </CardContent>
      </Card>

      <ReportTable title="Daily income expense profit" rows={dailyRows} />
      <ReportTable title="Booking report" rows={rangeBookings.map((booking) => ({
        code: booking.booking_code,
        check_in: booking.check_in_date,
        check_out: booking.check_out_date,
        guests: booking.number_of_guests,
        total: booking.total_amount,
        due: booking.due_amount,
        status: booking.booking_status,
      }))} />
      <ReportTable title="Due payment report" rows={rangeBookings.filter((booking) => Number(booking.due_amount) > 0).map((booking) => ({
        code: booking.booking_code,
        due: booking.due_amount,
        payment_status: booking.payment_status,
        booking_status: booking.booking_status,
      }))} />
      <ReportTable title="Most booked room" rows={mostBooked.roomCounts} />
      <ReportTable title="Most booked package" rows={mostBooked.packageCounts} />
      <ReportTable title="Cancelled bookings" rows={rangeBookings.filter((booking) => booking.booking_status === 'cancelled').map((booking) => ({
        code: booking.booking_code,
        date: booking.check_in_date,
        amount: booking.total_amount,
      }))} />
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 print:block">
        Print/export layout: browser print থেকে PDF বানানো যাবে। CSV export প্রতিটি table থেকে করা যাবে।
        Total due in range: ৳{due.toLocaleString()}.
      </div>
    </div>
  );
}
