'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { deleteRow, fetchAdminDataset, saveRow, rangesOverlap } from '@/lib/admin/data';
import { statusColors } from '@/lib/admin/constants';
import type { AvailabilityBlock, Booking, Customer, Room } from '@/types/database';

const weekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const statusLabels: Record<string, { long: string; short: string }> = {
  available: { long: 'Available', short: 'Free' },
  partially_booked: { long: 'Partially booked', short: 'Partial' },
  fully_booked: { long: 'Fully booked', short: 'Full' },
  blocked: { long: 'Blocked', short: 'Block' },
  maintenance: { long: 'Maintenance', short: 'Maint.' },
};

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function activeBooking(booking: Booking) {
  return !['cancelled', 'completed'].includes(booking.booking_status);
}

export default function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    const data = await fetchAdminDataset();
    setRooms(data.rooms);
    setBookings(data.bookings);
    setCustomers(data.customers);
    setBlocks(data.availability);
  };

  useEffect(() => {
    load();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedBookings = bookings.filter((booking) =>
    activeBooking(booking) && rangesOverlap(selectedDate, selectedDateNext(selectedDate), booking.check_in_date, booking.check_out_date)
  );

  const selectedBlock = blocks.find((block) => block.date === selectedDate && !block.room_id);

  const statusForDate = (date: string) => {
    const dayBlocks = blocks.filter((block) => block.date === date);
    if (dayBlocks.some((block) => block.status === 'maintenance')) return 'maintenance';
    if (dayBlocks.some((block) => block.status === 'blocked' && !block.room_id)) return 'blocked';
    const dayBookings = bookings.filter((booking) => activeBooking(booking) && rangesOverlap(date, selectedDateNext(date), booking.check_in_date, booking.check_out_date));
    if (dayBookings.some((booking) => booking.booking_type === 'full_boat')) return 'fully_booked';
    if (rooms.length && dayBookings.length >= rooms.length) return 'fully_booked';
    if (dayBookings.length > 0) return 'partially_booked';
    return 'available';
  };

  const roomStatus = (room: Room) => {
    if (selectedBlock) return selectedBlock.status;
    const roomBlock = blocks.find((block) => block.date === selectedDate && block.room_id === room.id);
    if (roomBlock) return roomBlock.status;
    const booked = selectedBookings.some((booking) => booking.booking_type === 'full_boat' || booking.room_id === room.id);
    return booked ? 'fully_booked' : 'available';
  };

  const blockDate = async (status: 'blocked' | 'maintenance') => {
    await saveRow<AvailabilityBlock>('availability_blocks', {
      id: selectedBlock?.id,
      date: selectedDate,
      room_id: null,
      status,
      reason,
      note,
    });
    await load();
  };

  const releaseDate = async () => {
    if (!selectedBlock) return;
    await deleteRow('availability_blocks', selectedBlock.id);
    setReason('');
    setNote('');
    await load();
  };

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-xl">{months[month]} {year}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekdays.map((day) => <div key={day} className="text-center text-xs font-semibold text-slate-500">{day}</div>)}
            {Array.from({ length: firstDay }).map((_, index) => <div key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const key = dateKey(year, month, day);
              const status = statusForDate(key);
              const label = statusLabels[status] || { long: status.replace('_', ' '), short: status };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-[58px] rounded-lg border p-1 text-left transition-all hover:shadow-sm sm:min-h-[86px] sm:p-2 ${
                    selectedDate === key ? 'border-[hsl(197,80%,30%)] ring-2 ring-[hsl(197,80%,30%)]/20' : 'border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-base">{day}</div>
                  <Badge className={`mt-2 max-w-full truncate px-1.5 text-[9px] sm:mt-3 sm:px-2.5 sm:text-xs ${statusColors[status]}`}>
                    <span className="sm:hidden">{label.short}</span>
                    <span className="hidden sm:inline">{label.long}</span>
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{selectedDate}</CardTitle>
          <p className="text-sm text-slate-500">Room-wise availability and manual block controls.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {rooms.map((room) => {
              const status = roomStatus(room);
              return (
                <div key={room.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{room.name}</div>
                    <div className="text-xs text-slate-500">{room.capacity} guest · ৳{room.price_per_night.toLocaleString()}</div>
                  </div>
                  <Badge className={`shrink-0 ${statusColors[status]}`}>{statusLabels[status]?.short || status.replace('_', ' ')}</Badge>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => blockDate('blocked')}>Block date</Button>
              <Button variant="outline" onClick={() => blockDate('maintenance')}>Maintenance</Button>
            </div>
            <Button variant="secondary" className="w-full" disabled={!selectedBlock} onClick={releaseDate}>Release blocked date</Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Bookings</h3>
            {selectedBookings.length ? selectedBookings.map((booking) => {
              const customer = customers.find((item) => item.id === booking.customer_id);
              return (
                <div key={booking.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">{booking.booking_code}</div>
                  <div className="text-slate-500">{customer?.full_name || 'Customer'} · {booking.booking_type}</div>
                </div>
              );
            }) : <p className="text-sm text-slate-500">No booking for this date.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function selectedDateNext(date: string) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}
