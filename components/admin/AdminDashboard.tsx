'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardCards, { money } from '@/components/admin/DashboardCards';
import IncomeExpenseChart from '@/components/admin/IncomeExpenseChart';
import BookingTable from '@/components/admin/BookingTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAdminDataset } from '@/lib/admin/data';
import type { Booking, Customer, Expense, Income, Room, TourPackage } from '@/types/database';

function monthKey(date: string) {
  return date.slice(0, 7);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const load = async () => {
    const data = await fetchAdminDataset();
    setBookings(data.bookings);
    setCustomers(data.customers);
    setRooms(data.rooms);
    setPackages(data.packages);
    setIncome(data.income);
    setExpenses(data.expenses);
  };

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const currentMonth = thisMonth();
    const currentDate = today();
    const monthlyIncome = income.filter((item) => monthKey(item.income_date) === currentMonth).reduce((sum, item) => sum + Number(item.amount), 0);
    const monthlyExpense = expenses.filter((item) => monthKey(item.expense_date) === currentMonth).reduce((sum, item) => sum + Number(item.amount), 0);
    const due = bookings.reduce((sum, booking) => sum + Number(booking.due_amount || 0), 0);
    const bookedTodayRoomIds = new Set(
      bookings
        .filter((booking) => booking.booking_status !== 'cancelled' && booking.check_in_date <= currentDate && booking.check_out_date > currentDate)
        .flatMap((booking) => booking.booking_type === 'full_boat' ? rooms.map((room) => room.id) : booking.room_id ? [booking.room_id] : [])
    );

    return [
      { label: 'Total Bookings', value: bookings.length, helper: 'All time', tone: 'blue' as const },
      { label: 'Pending Bookings', value: bookings.filter((booking) => booking.booking_status === 'pending').length, tone: 'amber' as const },
      { label: 'Confirmed Bookings', value: bookings.filter((booking) => booking.booking_status === 'confirmed').length, tone: 'green' as const },
      { label: "Today's Bookings", value: bookings.filter((booking) => booking.check_in_date === currentDate).length, tone: 'blue' as const },
      { label: 'Upcoming Bookings', value: bookings.filter((booking) => booking.check_in_date > currentDate && booking.booking_status !== 'cancelled').length, tone: 'blue' as const },
      { label: 'Monthly Income', value: money(monthlyIncome), tone: 'green' as const },
      { label: 'Monthly Expense', value: money(monthlyExpense), tone: 'red' as const },
      { label: 'Monthly Profit', value: money(monthlyIncome - monthlyExpense), tone: monthlyIncome - monthlyExpense >= 0 ? 'green' as const : 'red' as const },
      { label: 'Due Payments', value: money(due), tone: due > 0 ? 'amber' as const : 'green' as const },
      { label: 'Available Rooms Today', value: Math.max(rooms.length - bookedTodayRoomIds.size, 0), helper: `${rooms.length} total rooms`, tone: 'slate' as const },
    ];
  }, [bookings, expenses, income, rooms]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date.toISOString().slice(0, 7);
    });
    return months.map((month) => ({
      month,
      income: income.filter((item) => monthKey(item.income_date) === month).reduce((sum, item) => sum + Number(item.amount), 0),
      expense: expenses.filter((item) => monthKey(item.expense_date) === month).reduce((sum, item) => sum + Number(item.amount), 0),
    }));
  }, [expenses, income]);

  const statusData = useMemo(() => {
    const statuses = [
      { name: 'Pending', key: 'pending', color: '#f59e0b' },
      { name: 'Confirmed', key: 'confirmed', color: '#0284c7' },
      { name: 'Completed', key: 'completed', color: '#059669' },
      { name: 'Cancelled', key: 'cancelled', color: '#dc2626' },
    ];
    return statuses.map((status) => ({
      name: status.name,
      value: bookings.filter((booking) => booking.booking_status === status.key).length,
      color: status.color,
    }));
  }, [bookings]);

  const upcoming = bookings
    .filter((booking) => booking.check_in_date >= today() && booking.booking_status !== 'cancelled')
    .slice(0, 6);
  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-5">
      <DashboardCards cards={metrics} />
      <IncomeExpenseChart data={chartData} statusData={statusData} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-lg">Recent bookings</CardTitle></CardHeader>
          <CardContent>
            <BookingTable
              bookings={recent}
              customers={customers}
              rooms={rooms}
              packages={packages}
              onEdit={() => undefined}
              onCancel={() => undefined}
              onDelete={() => undefined}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Upcoming bookings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? upcoming.map((booking) => {
              const customer = customers.find((item) => item.id === booking.customer_id);
              return (
                <div key={booking.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="font-semibold text-slate-900">{booking.booking_code}</div>
                  <div className="mt-1 text-sm text-slate-500">{customer?.full_name || 'Customer'} · {booking.number_of_guests} guest</div>
                  <div className="mt-2 text-xs font-medium text-[hsl(197,80%,30%)]">{booking.check_in_date} to {booking.check_out_date}</div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500">No upcoming booking.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
