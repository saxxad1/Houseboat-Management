'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { paymentMethods } from '@/lib/admin/constants';
import { recordPayment } from '@/lib/admin/data';
import type { Booking, Payment } from '@/types/database';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  payment?: Payment | null;
  onSaved: () => void;
}

export default function PaymentForm({ open, onOpenChange, bookings, payment, onSaved }: PaymentFormProps) {
  const [form, setForm] = useState({
    booking_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
    payment_date: new Date().toISOString().slice(0, 10),
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(payment ? {
      booking_id: payment.booking_id,
      amount: String(payment.amount),
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id || '',
      payment_date: payment.payment_date,
      note: payment.note || '',
    } : {
      booking_id: '',
      amount: '',
      payment_method: 'cash',
      transaction_id: '',
      payment_date: new Date().toISOString().slice(0, 10),
      note: '',
    });
  }, [payment, open]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (!form.booking_id) throw new Error('Select booking');
      if (Number(form.amount) <= 0) throw new Error('Payment amount must be positive');
      await recordPayment({
        id: payment?.id,
        booking_id: form.booking_id,
        amount: Number(form.amount),
        payment_method: form.payment_method as Payment['payment_method'],
        transaction_id: form.transaction_id,
        payment_date: form.payment_date,
        note: form.note,
      });
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit payment' : 'New Payment'}</DialogTitle>
          <DialogDescription>Adding payment will auto update booking advance/due/payment status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Booking</Label>
            <Select value={form.booking_id} onValueChange={(value) => setForm((current) => ({ ...current, booking_id: value }))}>
              <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>{booking.booking_code} · Due ৳{booking.due_amount.toLocaleString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={form.payment_method} onValueChange={(value) => setForm((current) => ({ ...current, payment_method: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Transaction ID</Label>
            <Input value={form.transaction_id} onChange={(event) => setForm((current) => ({ ...current, transaction_id: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Payment date</Label>
            <Input type="date" value={form.payment_date} onChange={(event) => setForm((current) => ({ ...current, payment_date: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
          </div>
        </div>
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save payment'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
