'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PaymentForm from '@/components/admin/PaymentForm';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteRow, fetchAdminDataset } from '@/lib/admin/data';
import { paymentMethods, statusColors } from '@/lib/admin/constants';
import type { Booking, Payment } from '@/types/database';

export default function PaymentsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);

  const load = async () => {
    const data = await fetchAdminDataset();
    setBookings(data.bookings);
    setPayments(data.payments);
  };

  useEffect(() => {
    load();
  }, []);

  const bookingMap = useMemo(() => new Map(bookings.map((booking) => [booking.id, booking])), [bookings]);
  const filtered = useMemo(() => payments.filter((payment) => {
    const booking = bookingMap.get(payment.booking_id);
    const text = `${booking?.booking_code || ''} ${payment.transaction_id || ''} ${payment.note || ''}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (method !== 'all' && payment.payment_method !== method) return false;
    if (fromDate && payment.payment_date < fromDate) return false;
    if (toDate && payment.payment_date > toDate) return false;
    return true;
  }), [bookingMap, fromDate, method, payments, search, toDate]);

  const totalPaid = filtered.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalDue = bookings.reduce((sum, booking) => sum + Number(booking.due_amount || 0), 0);

  const remove = async (payment: Payment) => {
    if (!window.confirm('Delete this payment?')) return;
    await deleteRow('payments', payment.id);
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-5"><div className="text-sm text-slate-500">Total paid</div><div className="mt-2 text-2xl font-black">৳{totalPaid.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-slate-500">Total due</div><div className="mt-2 text-2xl font-black text-amber-600">৳{totalDue.toLocaleString()}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">Payment records</CardTitle>
          <Button onClick={() => { setSelected(null); setOpen(true); }} className="w-full gap-2 sm:w-auto"><Plus className="h-4 w-4" />New Payment</Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Booking code or transaction" className="pl-9" />
            </div>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {paymentMethods.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{bookingMap.get(payment.booking_id)?.booking_code || payment.booking_id}</TableCell>
                    <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[payment.payment_method]}>{payment.payment_method}</Badge></TableCell>
                    <TableCell>{payment.transaction_id || '-'}</TableCell>
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell>{payment.note || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(payment); setOpen(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(payment)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={7} className="py-10 text-center text-slate-500">No payments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PaymentForm open={open} onOpenChange={setOpen} payment={selected} bookings={bookings} onSaved={load} />
    </div>
  );
}
