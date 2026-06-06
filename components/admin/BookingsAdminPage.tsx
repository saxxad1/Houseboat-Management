'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import BookingForm from '@/components/admin/BookingForm';
import BookingTable from '@/components/admin/BookingTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deleteRow, fetchAdminDataset, saveRow } from '@/lib/admin/data';
import { isReadOnlyAdminForTable } from '@/lib/admin/permissions';
import type { Booking, Customer, Room } from '@/types/database';

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState('');
  const [readOnly, setReadOnly] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const data = await fetchAdminDataset();
    setBookings(data.bookings);
    setCustomers(data.customers);
    setRooms(data.rooms);
    setIsLoading(false);
  };

  useEffect(() => {
    setReadOnly(isReadOnlyAdminForTable('bookings'));
    load();
  }, []);

  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return bookings.filter((booking) => {
      const customer = booking.customer_id ? customerMap.get(booking.customer_id) : null;
      const text = `${booking.booking_code} ${customer?.full_name || ''} ${customer?.phone || ''}`.toLowerCase();
      if (lower && !text.includes(lower)) return false;
      if (seasonFilter !== 'all' && (booking.season_type || 'haor') !== seasonFilter) return false;
      if (bookingStatus !== 'all' && booking.booking_status !== bookingStatus) return false;
      if (paymentStatus !== 'all' && booking.payment_status !== paymentStatus) return false;
      if (fromDate && booking.check_in_date < fromDate) return false;
      if (toDate && booking.check_in_date > toDate) return false;
      return true;
    });
  }, [bookingStatus, bookings, customerMap, fromDate, paymentStatus, search, seasonFilter, toDate]);

  const add = () => {
    if (readOnly) return;
    setSelected(null);
    setOpen(true);
  };

  const cancel = async (booking: Booking) => {
    if (readOnly) return;
    if (!window.confirm('Cancel this booking?')) return;
    await saveRow<Booking>('bookings', { ...booking, booking_status: 'cancelled' });
    setMessage('Booking cancelled');
    await load();
  };

  const remove = async (booking: Booking) => {
    if (readOnly) return;
    if (!window.confirm('Delete this booking permanently?')) return;
    await deleteRow('bookings', booking.id);
    setMessage('Booking deleted');
    await load();
  };

  return (
    <div className="min-w-0 space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">All Bookings</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Search, filter, add, edit, cancel and payment status update.</p>
          </div>
          {!readOnly && (
            <Button onClick={add} className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-w-0">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex w-full gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Customer, phone, booking code" className="pl-9" />
              </div>
              <Button variant={showFilters ? "secondary" : "outline"} className="gap-2 shrink-0" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 bg-slate-50/50 p-3 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All seasons</SelectItem>
                    <SelectItem value="haor">Haor</SelectItem>
                    <SelectItem value="padma">Padma</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bookingStatus} onValueChange={setBookingStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All booking status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">Checked-in</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payment status</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
              </div>
            )}
          </div>

          {message && <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</div>}

          {isLoading ? (
            <div className="animate-pulse space-y-4 py-4">
              <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-16 bg-slate-50 rounded-xl w-full"></div>
              <div className="h-16 bg-slate-50 rounded-xl w-full"></div>
              <div className="h-16 bg-slate-50 rounded-xl w-full"></div>
            </div>
          ) : (
            <BookingTable
              bookings={filtered}
              customers={customers}
              rooms={rooms}
              onEdit={(booking) => {
                if (readOnly) return;
                setSelected(booking);
                setOpen(true);
              }}
              onCancel={cancel}
              onDelete={remove}
              readOnly={readOnly}
            />
          )}
        </CardContent>
      </Card>

      <BookingForm
        open={open}
        onOpenChange={setOpen}
        booking={selected}
        bookings={bookings}
        customers={customers}
        rooms={rooms}
        onSaved={load}
      />
    </div>
  );
}
