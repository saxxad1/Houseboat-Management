'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookingSchema } from '@/lib/validations';
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
import { hasBookingConflict, saveBookingWithCustomer } from '@/lib/admin/data';
import type { Booking, Customer, Room, TourPackage } from '@/types/database';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  bookings: Booking[];
  customers: Customer[];
  rooms: Room[];
  packages: TourPackage[];
  onSaved: () => void;
}

const defaultForm = {
  customer_name: '',
  phone: '',
  email: '',
  booking_type: 'cabin_wise',
  room_id: 'none',
  package_id: 'none',
  check_in_date: '',
  check_out_date: '',
  number_of_guests: '2',
  total_amount: '0',
  advance_amount: '0',
  payment_status: 'unpaid',
  booking_status: 'pending',
  special_request: '',
  admin_note: '',
  season_type: 'haor',
  event_type: 'Birthday',
  event_slot: 'morning',
  event_date: '',
  event_start_time: '',
  event_end_time: '',
  food_package: 'Snacks Only',
  decoration_required: 'false',
  sound_system_required: 'true',
  payment_method: 'bkash',
};

export default function BookingForm({
  open,
  onOpenChange,
  booking,
  bookings,
  customers,
  rooms,
  packages,
  onSaved,
}: BookingFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const customer = booking ? customers.find((item) => item.id === booking.customer_id) : null;
    setError('');
    setForm(
      booking
        ? {
            customer_name: customer?.full_name || '',
            phone: customer?.phone || '',
            email: customer?.email || '',
            booking_type: booking.booking_type,
            room_id: booking.room_id || 'none',
            package_id: booking.package_id || 'none',
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            number_of_guests: String(booking.number_of_guests),
            total_amount: String(booking.total_amount),
            advance_amount: String(booking.advance_amount),
            payment_status: booking.payment_status,
            booking_status: booking.booking_status,
            special_request: booking.special_request || '',
            admin_note: booking.admin_note || '',
            season_type: booking.season_type || 'haor',
            event_type: booking.event_type || 'Birthday',
            event_slot: booking.event_slot || 'morning',
            event_date: booking.event_date || booking.check_in_date,
            event_start_time: booking.event_start_time || '',
            event_end_time: booking.event_end_time || '',
            food_package: booking.food_package || 'Snacks Only',
            decoration_required: String(Boolean(booking.decoration_required)),
            sound_system_required: String(Boolean(booking.sound_system_required ?? true)),
            payment_method: booking.payment_method || 'bkash',
          }
        : defaultForm
    );
  }, [booking, customers, open]);

  const dueAmount = useMemo(
    () => Math.max(Number(form.total_amount || 0) - Number(form.advance_amount || 0), 0),
    [form.advance_amount, form.total_amount]
  );

  const setField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const padmaCheckoutDate = form.event_date
        ? new Date(new Date(form.event_date).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : '';
      const payload = {
        ...form,
        room_id: form.season_type === 'padma' || form.room_id === 'none' ? '' : form.room_id,
        package_id: form.package_id === 'none' ? '' : form.package_id,
        check_in_date: form.season_type === 'padma' ? form.event_date : form.check_in_date,
        check_out_date: form.season_type === 'padma' ? padmaCheckoutDate : form.check_out_date,
        booking_type: form.season_type === 'padma' ? 'full_boat' : form.booking_type,
      };
      const parsed = bookingSchema.parse(payload);
      const conflictCandidate = {
        id: booking?.id,
        booking_type: parsed.booking_type,
        room_id: parsed.room_id || null,
        check_in_date: parsed.check_in_date,
        check_out_date: parsed.check_out_date,
        booking_status: parsed.booking_status,
        season_type: parsed.season_type,
        event_date: parsed.event_date,
        event_slot: parsed.event_slot,
      };
      if (hasBookingConflict(conflictCandidate, bookings)) {
        throw new Error('এই তারিখে selected room/full boat already booked.');
      }
      await saveBookingWithCustomer(
        {
          ...parsed,
          booking_code: booking?.booking_code,
          room_id: parsed.room_id || null,
          package_id: parsed.package_id || null,
          due_amount: dueAmount,
          season_type: parsed.season_type,
          event_type: parsed.event_type,
          event_slot: parsed.event_slot,
          event_date: parsed.event_date,
          event_start_time: parsed.event_start_time,
          event_end_time: parsed.event_end_time,
          food_package: parsed.food_package,
          decoration_required: parsed.decoration_required,
          sound_system_required: parsed.sound_system_required,
          payment_method: parsed.payment_method,
        },
        booking?.id
      );
      onOpenChange(false);
      onSaved();
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const issues = (err as { issues: { message: string }[] }).issues;
        setError(issues[0]?.message || 'Invalid booking data');
      } else {
        setError(err instanceof Error ? err.message : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit booking' : 'নতুন বুকিং'}</DialogTitle>
          <DialogDescription>কাস্টমার, তারিখ, প্যাকেজ, পেমেন্ট ও booking status আপডেট করুন।</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer name *</Label>
            <Input value={form.customer_name} onChange={(event) => setField('customer_name', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={form.season_type} onValueChange={(value) => setField('season_type', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="haor">Haor booking</SelectItem>
                <SelectItem value="padma">Padma event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.season_type === 'haor' && <div className="space-y-2">
            <Label>Booking type</Label>
            <Select value={form.booking_type} onValueChange={(value) => setField('booking_type', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cabin_wise">Cabin wise</SelectItem>
                <SelectItem value="full_boat">Full boat</SelectItem>
              </SelectContent>
            </Select>
          </div>}
          {form.season_type === 'haor' && form.booking_type === 'cabin_wise' && (
            <div className="space-y-2">
              <Label>Room/Cabin</Label>
              <Select value={form.room_id} onValueChange={(value) => setField('room_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select room</SelectItem>
                  {rooms.filter((room) => (room.season_type || 'haor') === 'haor').map((room) => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Package</Label>
            <Select value={form.package_id} onValueChange={(value) => setField('package_id', value)}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No package</SelectItem>
                {packages.filter((pkg) => (pkg.season_type || 'haor') === form.season_type).map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>{pkg.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.season_type === 'haor' ? <div className="space-y-2">
            <Label>Check-in</Label>
            <Input type="date" value={form.check_in_date} onChange={(event) => setField('check_in_date', event.target.value)} />
          </div> : <div className="space-y-2">
            <Label>Event date</Label>
            <Input type="date" value={form.event_date} onChange={(event) => setField('event_date', event.target.value)} />
          </div>}
          {form.season_type === 'haor' && <div className="space-y-2">
            <Label>Check-out</Label>
            <Input type="date" value={form.check_out_date} onChange={(event) => setField('check_out_date', event.target.value)} />
          </div>}
          {form.season_type === 'padma' && (
            <>
              <div className="space-y-2">
                <Label>Event type</Label>
                <Select value={form.event_type} onValueChange={(value) => setField('event_type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Birthday', 'Anniversary', 'Corporate Event', 'Family Day Out', 'Friends Gathering', 'Wedding / Engagement', 'Dinner Cruise', 'Product Launch', 'Other'].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event slot</Label>
                <Select value={form.event_slot} onValueChange={(value) => setField('event_slot', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Slot</SelectItem>
                    <SelectItem value="afternoon">Afternoon Slot</SelectItem>
                    <SelectItem value="evening">Evening Slot</SelectItem>
                    <SelectItem value="moonlight">Moonlight Slot</SelectItem>
                    <SelectItem value="full_day">Full Day Event</SelectItem>
                    <SelectItem value="custom">Custom Slot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Food package</Label>
                <Select value={form.food_package} onValueChange={(value) => setField('food_package', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Snacks Only', 'Lunch Package', 'Dinner Package', 'BBQ Package', 'Buffet Package', 'Custom Food Plan'].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Decoration required?</Label>
                <Select value={form.decoration_required} onValueChange={(value) => setField('decoration_required', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sound system required?</Label>
                <Select value={form.sound_system_required} onValueChange={(value) => setField('sound_system_required', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Guests</Label>
            <Input type="number" min="1" value={form.number_of_guests} onChange={(event) => setField('number_of_guests', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Total amount</Label>
            <Input type="number" min="0" value={form.total_amount} onChange={(event) => setField('total_amount', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Advance amount</Label>
            <Input type="number" min="0" value={form.advance_amount} onChange={(event) => setField('advance_amount', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Due amount</Label>
            <Input value={`৳${dueAmount.toLocaleString()}`} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Payment status</Label>
            <Select value={form.payment_status} onValueChange={(value) => setField('payment_status', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partially paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={form.payment_method} onValueChange={(value) => setField('payment_method', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Booking status</Label>
            <Select value={form.booking_status} onValueChange={(value) => setField('booking_status', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked-in</SelectItem>
                <SelectItem value="checked_out">Checked-out</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Special request</Label>
            <Textarea value={form.special_request} onChange={(event) => setField('special_request', event.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Admin note</Label>
            <Textarea value={form.admin_note} onChange={(event) => setField('admin_note', event.target.value)} />
          </div>
        </div>

        {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
