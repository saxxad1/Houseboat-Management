'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookingSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
import { getBookedRoomIdsForRange, hasFullBoatBookingForRange } from '@/lib/bookingAvailability';
import type { Booking, Customer, Room } from '@/types/database';
import { usePublicData } from '@/components/PublicDataProvider';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  bookings: Booking[];
  customers: Customer[];
  rooms: Room[];
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
  subtotal_amount: '0',
  discount_amount: '0',
  discount_reason: '',
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
  transaction_id: '',
  trip_slot_id: 'none',
};

export default function BookingForm({
  open,
  onOpenChange,
  booking,
  bookings,
  customers,
  rooms,
  onSaved,
}: BookingFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [roomDetails, setRoomDetails] = useState<{roomId: string; pax: number}[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { tripSlots } = usePublicData();

  useEffect(() => {
    const customer = booking ? customers.find((item) => item.id === booking.customer_id) : null;
    setError('');
    
    // Initialize room details
    if (booking?.room_details && Array.isArray(booking.room_details)) {
      setRoomDetails(booking.room_details);
    } else if (booking?.room_id) {
      setRoomDetails([{ roomId: booking.room_id, pax: Number(booking.number_of_guests || 2) }]);
    } else {
      setRoomDetails([]);
    }

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
            subtotal_amount: String(booking.subtotal_amount ?? booking.total_amount),
            discount_amount: String(booking.discount_amount || 0),
            discount_reason: booking.discount_reason || '',
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
            transaction_id: booking.transaction_id || '',
            trip_slot_id: booking.trip_slot_id || 'none',
          }
        : defaultForm
    );
  }, [booking, customers, open]);

  const dueAmount = useMemo(
    () => Math.max(Number(form.total_amount || 0) - Number(form.advance_amount || 0), 0),
    [form.advance_amount, form.total_amount]
  );
  const haorBookingDatesSelected = form.season_type === 'haor' && Boolean(form.check_in_date && form.check_out_date);
  const bookedRoomIdsForSelectedDates = haorBookingDatesSelected
    ? getBookedRoomIdsForRange(bookings, tripSlots, form.check_in_date, form.check_out_date, { excludeBookingId: booking?.id })
    : new Set<string>();
  const isFullBoatBookedForSelectedDates = haorBookingDatesSelected
    ? hasFullBoatBookingForRange(bookings, form.check_in_date, form.check_out_date, booking?.id)
    : false;

  const setField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const selectedRoomDetails = form.season_type === 'haor' && form.booking_type === 'cabin_wise'
        ? roomDetails
            .filter((detail) => detail.roomId && detail.roomId !== 'none')
            .map((detail) => ({
              roomId: detail.roomId,
              pax: Number(detail.pax || 1),
            }))
        : [];
      const primaryRoomId = selectedRoomDetails[0]?.roomId || '';
      const selectedGuestCount = selectedRoomDetails.reduce((sum, detail) => sum + detail.pax, 0);
      const selectedRoomIds = selectedRoomDetails.map((detail) => detail.roomId);
      if (new Set(selectedRoomIds).size !== selectedRoomIds.length) {
        throw new Error('Select each room only once.');
      }
      const padmaCheckoutDate = form.event_date
        ? new Date(new Date(form.event_date).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : '';
      const payload = {
        ...form,
        room_id: form.season_type === 'padma' || form.booking_type === 'full_boat' ? '' : primaryRoomId,
        room_details: form.season_type === 'padma' || form.booking_type === 'full_boat' ? null : selectedRoomDetails,
        number_of_guests: selectedGuestCount ? String(selectedGuestCount) : form.number_of_guests,
        package_id: form.package_id === 'none' ? '' : form.package_id,
        check_in_date: form.season_type === 'padma' ? form.event_date : form.check_in_date,
        check_out_date: form.season_type === 'padma' ? padmaCheckoutDate : form.check_out_date,
        booking_type: form.season_type === 'padma' ? 'full_boat' : form.booking_type,
        trip_slot_id: form.trip_slot_id === 'none' ? null : form.trip_slot_id,
      };
      const parsed = bookingSchema.parse(payload);
      const conflictCandidate = {
        id: booking?.id,
        booking_type: parsed.booking_type,
        room_id: parsed.room_id || null,
        room_details: parsed.room_details || null,
        check_in_date: parsed.check_in_date,
        check_out_date: parsed.check_out_date,
        booking_status: parsed.booking_status,
        season_type: parsed.season_type,
        event_date: parsed.event_date,
        event_slot: parsed.event_slot,
      };
      if (hasBookingConflict(conflictCandidate, bookings, tripSlots)) {
        throw new Error('Selected room/full boat is already booked on this date.');
      }
      await saveBookingWithCustomer(
        {
          ...parsed,
          booking_code: booking?.booking_code,
          room_id: parsed.room_id || null,
          package_id: parsed.package_id || null,
          subtotal_amount: parsed.subtotal_amount,
          discount_amount: parsed.discount_amount,
          discount_reason: parsed.discount_reason,
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
          transaction_id: form.transaction_id || null,
          trip_slot_id: parsed.trip_slot_id || null,
        },
        booking?.id
      );
      onOpenChange(false);
      onSaved();
      toast.success('Booking saved successfully');
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const issues = (err as { issues: { message: string }[] }).issues;
        toast.error(issues[0]?.message || 'Invalid booking data');
      } else {
        toast.error(err instanceof Error ? err.message : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>Update customer, date, rooms, payment, and booking status.</DialogDescription>
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Rooms & Guests</Label>
              <div className="space-y-2">
                {roomDetails.map((detail, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={detail.roomId} onValueChange={(val) => {
                      const newDetails = [...roomDetails];
                      newDetails[index].roomId = val;
                      setRoomDetails(newDetails);
                    }}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select room" /></SelectTrigger>
                      <SelectContent>
                        {rooms.filter((room) => (room.season_type || 'haor') === 'haor').map((room) => {
                          const booked = isFullBoatBookedForSelectedDates || bookedRoomIdsForSelectedDates.has(room.id);
                          const selectedHere = detail.roomId === room.id;
                          return (
                            <SelectItem key={room.id} value={room.id} disabled={booked && !selectedHere}>
                              {room.name}{booked ? ' (Booked)' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select value={String(detail.pax)} onValueChange={(val) => {
                      const newDetails = [...roomDetails];
                      newDetails[index].pax = Number(val);
                      setRoomDetails(newDetails);
                    }}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Persons</SelectItem>
                        <SelectItem value="3">3 Persons</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => setRoomDetails(roomDetails.filter((_, i) => i !== index))}>
                      X
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setRoomDetails([...roomDetails, { roomId: '', pax: 2 }])}>
                  + Add Room
                </Button>
              </div>
            </div>
          )}
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
                <Label>Food plan</Label>
                <Select value={form.food_package} onValueChange={(value) => setField('food_package', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Snacks Only', 'Lunch Plan', 'Dinner Plan', 'BBQ Plan', 'Buffet Plan', 'Custom Food Plan'].map((item) => (
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
            <Label>Subtotal before discount</Label>
            <Input type="number" min="0" value={form.subtotal_amount} onChange={(event) => setField('subtotal_amount', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Discount amount</Label>
            <Input type="number" min="0" value={form.discount_amount} onChange={(event) => setField('discount_amount', event.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Discount reason</Label>
            <Input value={form.discount_reason} onChange={(event) => setField('discount_reason', event.target.value)} />
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
            <Label>Transaction ID</Label>
            <Input value={form.transaction_id} onChange={(event) => setField('transaction_id', event.target.value)} />
          </div>
          {form.season_type === 'haor' && (
            <div className="space-y-2">
              <Label>Trip Slot (Optional)</Label>
              <Select value={form.trip_slot_id} onValueChange={(value) => setField('trip_slot_id', value)}>
                <SelectTrigger><SelectValue placeholder="Select Trip Slot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific trip</SelectItem>
                  {tripSlots.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {new Date(trip.start_date).toLocaleDateString('en-GB')} to {new Date(trip.end_date).toLocaleDateString('en-GB')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
