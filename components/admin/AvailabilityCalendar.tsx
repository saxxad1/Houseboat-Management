'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { normalizeSeason, seasonMeta, type SeasonType } from '@/data/seasonalData';
import { deleteRow, fetchAdminDataset, saveRow, rangesOverlap } from '@/lib/admin/data';
import { statusColors } from '@/lib/admin/constants';
import type { AvailabilityBlock, AvailabilityStatus, Booking, Customer, EventSlot, EventSlotStatus, Room, TripSlot } from '@/types/database';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusLabels: Record<string, { long: string; short: string }> = {
  available: { long: 'Available', short: 'Free' },
  partially_booked: { long: 'Partially booked', short: 'Partial' },
  fully_booked: { long: 'Fully booked', short: 'Full' },
  blocked: { long: 'Blocked', short: 'Block' },
  maintenance: { long: 'Maintenance', short: 'Maint.' },
};

const eventSlots = [
  { value: 'morning', label: 'Morning Slot' },
  { value: 'afternoon', label: 'Afternoon Slot' },
  { value: 'evening', label: 'Evening Slot' },
  { value: 'moonlight', label: 'Moonlight Slot' },
  { value: 'full_day', label: 'Full Day Event' },
  { value: 'custom', label: 'Custom Event' },
];

const slotStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'inquiry_pending', label: 'Inquiry pending' },
  { value: 'booked', label: 'Booked' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'maintenance', label: 'Maintenance' },
];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function activeBooking(booking: Booking) {
  return !['cancelled', 'completed'].includes(booking.booking_status);
}

export default function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([new Date().toISOString().slice(0, 10)]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [tripSlots, setTripSlots] = useState<TripSlot[]>([]);
  const [activeSeason, setActiveSeason] = useState<SeasonType>('haor');
  const [eventSlot, setEventSlot] = useState<EventSlot>('morning');
  const [eventSlotStatus, setEventSlotStatus] = useState<EventSlotStatus>('available');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    const data = await fetchAdminDataset();
    setRooms(data.rooms);
    setBookings(data.bookings);
    setCustomers(data.customers);
    setBlocks(data.availability);
    setTripSlots(data.trip_slots || []);
    const season = normalizeSeason(data.settings[0]?.active_season || window.localStorage.getItem('kuhelika-active-season'));
    setActiveSeason(season);
  };

  useEffect(() => {
    load();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const visibleRooms = rooms.filter((room) => (room.season_type || 'haor') === 'haor');

  const selectedDate = selectedDates[0] || new Date().toISOString().slice(0, 10);

  const selectedBookings = bookings.filter((booking) => {
    if (!activeBooking(booking)) return false;
    if (activeSeason === 'padma') {
      return (booking.season_type || 'haor') === 'padma' && (booking.event_date || booking.check_in_date) === selectedDate;
    }
    return (booking.season_type || 'haor') === 'haor'
      && rangesOverlap(selectedDate, selectedDateNext(selectedDate), booking.check_in_date, booking.check_out_date);
  });
  
  const selectedBlock = blocks.find((block) =>
    block.date === selectedDate && !block.room_id && !block.event_slot && (block.season_type || 'haor') === activeSeason
  );
  const selectedSlotBlock = blocks.find((block) =>
    block.date === selectedDate && block.event_slot === eventSlot && (block.season_type || 'haor') === 'padma'
  );

  const statusForDate = (date: string) => {
    const dayBlocks = blocks.filter((block) => block.date === date && (block.season_type || 'haor') === activeSeason);
    
    if (activeSeason === 'haor') {
      const activeTrip = tripSlots.find(slot => date >= slot.start_date && date <= slot.end_date);
      if (activeTrip && activeTrip.status !== 'available') return activeTrip.status;
    } else {
      if (dayBlocks.some((block) => block.status === 'maintenance')) return 'maintenance';
      if (dayBlocks.some((block) => block.status === 'blocked' && !block.room_id && !block.event_slot)) return 'blocked';
      if (dayBlocks.some((block) => block.status === 'fully_booked' && !block.room_id && !block.event_slot)) return 'fully_booked';
    }

    if (activeSeason === 'padma') {
      const dayBookings = bookings.filter((booking) =>
        activeBooking(booking) && (booking.season_type || 'haor') === 'padma' && (booking.event_date || booking.check_in_date) === date
      );
      const unavailableSlots = new Set<string>();
      dayBookings.forEach((booking) => booking.event_slot && unavailableSlots.add(booking.event_slot));
      dayBlocks.forEach((block) => {
        const slotStatus = block.slot_status || block.status;
        if (block.event_slot && ['booked', 'blocked', 'maintenance'].includes(slotStatus)) {
          unavailableSlots.add(block.event_slot);
        }
      });
      if (unavailableSlots.has('full_day')) return 'fully_booked';
      if (unavailableSlots.size >= 5) return 'fully_booked';
      if (unavailableSlots.size || dayBlocks.some((block) => block.slot_status === 'inquiry_pending')) return 'partially_booked';
      return 'available';
    }

    const dayBookings = bookings.filter((booking) =>
      activeBooking(booking)
      && (booking.season_type || 'haor') === 'haor'
      && rangesOverlap(date, selectedDateNext(date), booking.check_in_date, booking.check_out_date)
    );
    if (dayBookings.some((booking) => booking.booking_type === 'full_boat')) return 'fully_booked';
    if (visibleRooms.length && dayBookings.length >= visibleRooms.length) return 'fully_booked';
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

  const blockDate = async (status: 'blocked' | 'maintenance' | 'fully_booked' | 'available') => {
    if (activeSeason === 'haor') {
      const startDate = selectedDates[0];
      const endDate = selectedDates[selectedDates.length - 1];
      const existing = tripSlots.find(slot => slot.start_date === startDate);
      
      await saveRow<TripSlot>('trip_slots', {
        id: existing?.id,
        start_date: startDate,
        end_date: endDate,
        duration_label: `${selectedDates.length} Days ${Math.max(selectedDates.length - 1, 1)} Night`,
        status,
        reason,
        note,
      });
    } else {
      for (const date of selectedDates) {
        const existing = blocks.find((block) =>
          block.date === date && !block.room_id && !block.event_slot && (block.season_type || 'haor') === activeSeason
        );
        await saveRow<AvailabilityBlock>('availability_blocks', {
          id: existing?.id,
          date,
          room_id: null,
          status: status === 'available' ? 'available' : status,
          season_type: activeSeason,
          reason,
          note,
        });
      }
    }
    await load();
  };

  const saveSlot = async () => {
    const availabilityStatus: AvailabilityStatus =
      eventSlotStatus === 'booked'
        ? 'fully_booked'
        : eventSlotStatus === 'inquiry_pending'
          ? 'partially_booked'
          : eventSlotStatus;
    
    for (const date of selectedDates) {
      const existing = blocks.find((block) =>
        block.date === date && block.event_slot === eventSlot && (block.season_type || 'haor') === 'padma'
      );
      await saveRow<AvailabilityBlock>('availability_blocks', {
        id: existing?.id,
        date,
        room_id: null,
        status: availabilityStatus,
        season_type: 'padma',
        event_slot: eventSlot,
        slot_status: eventSlotStatus,
        reason,
        note,
      });
    }
    await load();
  };

  const releaseSlot = async () => {
    for (const date of selectedDates) {
      const existing = blocks.find((block) =>
        block.date === date && block.event_slot === eventSlot && (block.season_type || 'haor') === 'padma'
      );
      if (existing) {
        await deleteRow('availability_blocks', existing.id);
      }
    }
    await load();
  };

  const releaseDate = async () => {
    if (activeSeason === 'haor') {
      const startDate = selectedDates[0];
      const existing = tripSlots.find(slot => slot.start_date === startDate || (startDate >= slot.start_date && startDate <= slot.end_date));
      if (existing) {
        await deleteRow('trip_slots', existing.id);
      }
    } else {
      for (const date of selectedDates) {
        const existing = blocks.find((block) =>
          block.date === date && !block.room_id && !block.event_slot && (block.season_type || 'haor') === activeSeason
        );
        if (existing) {
          await deleteRow('availability_blocks', existing.id);
        }
      }
    }
    setReason('');
    setNote('');
    await load();
  };

  const toggleDate = (key: string) => {
    if (activeSeason === 'haor') {
      const existingTrip = tripSlots.find(slot => key >= slot.start_date && key <= slot.end_date);
      if (existingTrip) {
        const datesInTrip: string[] = [];
        let curr = new Date(existingTrip.start_date);
        const end = new Date(existingTrip.end_date);
        while (curr <= end) {
          datesInTrip.push(curr.toISOString().slice(0, 10));
          curr.setDate(curr.getDate() + 1);
        }
        setSelectedDates(datesInTrip);
        return;
      }

      setSelectedDates((prev) => {
        const prevTrip = prev.length > 0 ? tripSlots.find(slot => prev[0] >= slot.start_date && prev[0] <= slot.end_date) : null;
        if (prevTrip) {
          return [key];
        }
        if (prev.includes(key)) {
          return prev.filter((d) => d !== key);
        }
        return [...prev, key].sort();
      });
      return;
    }

    setSelectedDates((prev) => {
      if (prev.includes(key)) {
        return prev.filter((d) => d !== key);
      }
      return [...prev, key].sort();
    });
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
              
              const tripSlot = activeSeason === 'haor' ? tripSlots.find(slot => key >= slot.start_date && key <= slot.end_date) : null;
              const isTripStart = tripSlot && tripSlot.start_date === key;
              const isTripEnd = tripSlot && tripSlot.end_date === key;
              
              const prevKey = dateKey(year, month, day - 1);
              const nextKey = dateKey(year, month, day + 1);
              const isJoinedWithPrev = tripSlot && prevKey >= tripSlot.start_date;
              const isJoinedWithNext = tripSlot && nextKey <= tripSlot.end_date;

              let label = statusLabels[status] || { long: status.replace('_', ' '), short: status };
              if (tripSlot && status !== 'available') {
                if (status === 'blocked' || status === 'maintenance') {
                  label = statusLabels[status] || { long: 'Maintenance', short: 'Maint' };
                } else if (status === 'fully_booked') {
                  label = statusLabels['fully_booked'] || { long: 'Booked', short: 'Bkd' };
                } else {
                  label = { long: isTripStart ? 'Check-in' : isTripEnd ? 'Check-out' : 'Booked', short: isTripStart ? 'In' : isTripEnd ? 'Out' : 'Bkd' };
                }
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDate(key)}
                  className={`relative min-w-0 overflow-hidden min-h-[58px] rounded-lg border p-1 text-left transition-all hover:shadow-sm sm:min-h-[86px] sm:p-2 
                    ${selectedDates.includes(key) ? 'border-[hsl(197,80%,30%)] ring-2 ring-[hsl(197,80%,30%)]/20 z-10' : tripSlot ? 'border-indigo-300' : 'border-slate-200'} 
                    ${isJoinedWithPrev ? '!rounded-tl-none !rounded-bl-none border-l-0' : ''} 
                    ${isJoinedWithNext ? '!rounded-tr-none !rounded-br-none border-r-0' : ''}
                    ${tripSlot ? 'bg-indigo-50/60' : 'bg-white'}
                  `}
                >
                  {isJoinedWithNext && !selectedDates.includes(key) && tripSlot && (
                    <div className="absolute top-[-1px] -right-[5px] sm:-right-[9px] w-[10px] sm:w-[18px] h-[calc(100%+2px)] bg-indigo-50 border-y border-indigo-300 z-[-1] pointer-events-none" />
                  )}
                  {isJoinedWithNext && selectedDates.includes(key) && selectedDates.includes(nextKey) && tripSlot && (
                    <div className="absolute top-[-1px] -right-[5px] sm:-right-[9px] w-[10px] sm:w-[18px] h-[calc(100%+2px)] bg-indigo-50 border-y-2 border-[hsl(197,80%,30%)] z-[-1] pointer-events-none" />
                  )}
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
          <CardTitle className="flex items-center justify-between gap-3 text-lg">
            <span>{selectedDates.length > 1 ? `${selectedDates[0]} to ${selectedDates[selectedDates.length - 1]}` : selectedDate}</span>
            <Badge className={statusColors[activeSeason]}>{seasonMeta[activeSeason].adminName}</Badge>
          </CardTitle>
          <p className="text-sm text-slate-500">
            {activeSeason === 'padma' ? 'Event slot availability and manual controls.' : 'Room-wise availability and manual block controls.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSeason === 'padma' ? (
            <div className="space-y-2">
              {eventSlots.map((slot) => {
                const booking = selectedBookings.find((item) => item.event_slot === slot.value || item.event_slot === 'full_day');
                const block = blocks.find((item) =>
                  item.date === selectedDate && item.event_slot === slot.value && (item.season_type || 'haor') === 'padma'
                );
                const status = booking ? 'booked' : (block?.slot_status || 'available');
                return (
                  <div key={slot.value} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{slot.label}</div>
                      <div className="text-xs text-slate-500">Padma Event Season · slot based</div>
                    </div>
                    <Badge className={`shrink-0 ${statusColors[status]}`}>{status.replace('_', ' ')}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="space-y-2">
            {visibleRooms.map((room) => {
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
          )}

          <div className="space-y-2">
            {activeSeason === 'padma' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Select value={eventSlot} onValueChange={(value) => setEventSlot(value as EventSlot)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventSlots.map((slot) => <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={eventSlotStatus} onValueChange={(value) => setEventSlotStatus(value as EventSlotStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {slotStatusOptions.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" />
            {activeSeason === 'padma' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={saveSlot}>Save slot status</Button>
                <Button variant="secondary" disabled={!selectedSlotBlock} onClick={releaseSlot}>Release slot</Button>
              </div>
            )}
            <div className={`grid gap-2 ${activeSeason === 'haor' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
              {activeSeason === 'haor' && (
                <Button variant="default" onClick={() => blockDate('available')} className="bg-[hsl(197,80%,35%)] hover:bg-[hsl(197,80%,30%)]">Create Trip</Button>
              )}
              <Button variant="outline" onClick={() => blockDate('blocked')}>Block date</Button>
              <Button variant="outline" onClick={() => blockDate('maintenance')}>Maintenance</Button>
              <Button variant="outline" onClick={() => blockDate('fully_booked')}>Fully Booked</Button>
            </div>
            <Button variant="secondary" className="w-full" disabled={activeSeason === 'haor' ? !tripSlots.some(t => t.start_date === selectedDates[0] || (selectedDates[0] >= t.start_date && selectedDates[0] <= t.end_date)) : !selectedBlock} onClick={releaseDate}>
              {activeSeason === 'haor' ? 'Delete Trip Slot' : 'Release blocked date'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Bookings</h3>
            {selectedBookings.length ? selectedBookings.map((booking) => {
              const customer = customers.find((item) => item.id === booking.customer_id);
              return (
                <div key={booking.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">{booking.booking_code}</div>
                  <div className="text-slate-500">
                    {customer?.full_name || 'Customer'} · {activeSeason === 'padma' ? `${booking.event_type || 'Event'} · ${booking.event_slot || 'slot'}` : booking.booking_type}
                  </div>
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
