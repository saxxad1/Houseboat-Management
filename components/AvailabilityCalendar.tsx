'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicData } from '@/components/PublicDataProvider';
import { getBookedRoomIdsForRange, getManualBookingRoomIds, hasFullBoatBookingForRange, parseManualTripData } from '@/lib/bookingAvailability';
import type { AvailabilityStatus } from '@/types/database';

type Status = 'available' | 'partial' | 'full' | 'blocked';

interface DayStatus {
  status: Status;
  availableCabins?: number;
  totalCabins?: number;
  price?: number;
  tripInfo?: {
    isStart: boolean;
    isEnd: boolean;
    duration: string;
    start_date: string;
    end_date: string;
  };
}

const statusConfig = {
  available: { label: 'Available', bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', hover: 'hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5' },
  partial: { label: 'Partial', bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', hover: 'hover:bg-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5' },
  full: { label: 'Booked', bg: 'bg-rose-50 border border-rose-100 opacity-80', text: 'text-rose-700', dot: 'bg-rose-500', hover: '' },
  blocked: { label: 'Blocked', bg: 'bg-slate-50 border border-slate-100 opacity-60', text: 'text-slate-400', dot: 'bg-slate-300', hover: '' },
};

type StatusConfig = (typeof statusConfig)[Status];

const publicStatusMap: Record<AvailabilityStatus, Status> = {
  available: 'available',
  partially_booked: 'partial',
  fully_booked: 'full',
  blocked: 'blocked',
  maintenance: 'blocked',
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdaysMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface AvailabilityCalendarProps {
  inline?: boolean;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
}

export default function AvailabilityCalendar({ inline, selectedDate: propSelectedDate, onSelectDate }: AvailabilityCalendarProps = {}) {
  const { availability, bookings, tripSlots, cabins, activeSeason, seasonData } = usePublicData();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [localSelectedDate, setLocalSelectedDate] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : localSelectedDate;
  const setSelectedDate = (date: string | null) => {
    if (onSelectDate && date) onSelectDate(date);
    if (propSelectedDate === undefined) setLocalSelectedDate(date);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0
    })
  };

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const availableCabinCount = cabins.filter((cabin) => cabin.available).length || cabins.length;
  const startingPrice = 10000;
  const isPadma = activeSeason === 'padma';
  const getTripManualRoomIds = (date: string) => {
    const roomIds = new Set<string>();
    tripSlots
      .filter((slot) => date === slot.start_date)
      .forEach((slot) => {
        const manualData = parseManualTripData(slot.note);
        manualData.manualBookings.forEach((booking) => {
          getManualBookingRoomIds(booking).forEach((roomId) => roomIds.add(roomId));
        });
      });
    return roomIds;
  };

  const getDayData = (date: string): DayStatus => {
    const blocks = availability.filter((block) => block.date === date && (block.season_type || 'haor') === activeSeason);
    const nextDate = selectedDateNext(date);
    if (isPadma) {
      const dayBookings = bookings.filter((booking) =>
        (booking.season_type || 'haor') === 'padma'
        && ['pending', 'confirmed', 'checked_in'].includes(booking.booking_status)
        && (booking.event_date || booking.check_in_date) === date
      );
      const blocked = blocks.some((block) => block.status === 'blocked' || block.status === 'maintenance' || block.slot_status === 'blocked' || block.slot_status === 'maintenance');
      const bookedSlotKeys = blocks
        .filter((block) => block.slot_status === 'booked' || block.status === 'fully_booked')
        .map((block) => block.event_slot || 'custom');
      dayBookings.forEach((booking) => {
        if (booking.event_slot) bookedSlotKeys.push(booking.event_slot);
      });
      const hasFullDay = bookedSlotKeys.includes('full_day') || blocks.some((block) => block.event_slot === 'full_day');
      const status: Status = blocked ? 'blocked' : hasFullDay || bookedSlotKeys.length > 0 ? 'full' : 'available';
      return {
        status,
        price: status === 'full' || status === 'blocked' ? 0 : 30000,
      };
    }

    const trip = tripSlots.find((slot) => date >= slot.start_date && date <= slot.end_date);
    const fullBoatBooked = hasFullBoatBookingForRange(bookings, date, nextDate);
    const bookedRoomIds = getBookedRoomIdsForRange(bookings, tripSlots, date, nextDate);
    getTripManualRoomIds(date).forEach((roomId) => bookedRoomIds.add(roomId));
    const availableRooms = fullBoatBooked ? 0 : Math.max(availableCabinCount - bookedRoomIds.size, 0);
    const liveStatus: Status = fullBoatBooked
      ? 'full'
      : bookedRoomIds.size >= availableCabinCount
        ? 'full'
        : bookedRoomIds.size > 0
          ? 'partial'
          : 'available';

    if (trip) {
      const isStart = date === trip.start_date;
      const isEnd = date === trip.end_date;
      const tripStatus = publicStatusMap[trip.status];
      const status = tripStatus === 'full' || tripStatus === 'blocked'
        ? tripStatus
        : liveStatus !== 'available'
          ? liveStatus
          : tripStatus;
      return {
        status,
        availableCabins: status === 'blocked' || status === 'full' ? 0 : availableRooms,
        totalCabins: availableCabinCount,
        price: status === 'full' || status === 'blocked' ? 0 : startingPrice,
        tripInfo: {
          isStart,
          isEnd,
          duration: trip.duration_label || '2 Days 1 Night',
          start_date: trip.start_date,
          end_date: trip.end_date,
        },
      };
    }

    return {
      status: liveStatus,
      availableCabins: availableRooms,
      totalCabins: availableCabinCount,
      price: liveStatus === 'full' ? 0 : startingPrice,
    };
  };

          {/* Calendar */}
  const calendarGrid = (
    <div className={`bg-white/80 backdrop-blur-xl ${inline ? 'rounded-xl p-2.5 sm:p-3' : 'rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-5 sm:p-8'} relative`}>
      {/* Month Navigation */}
            <div className={`flex items-center justify-between ${inline ? 'mb-3' : 'mb-6 sm:mb-8'}`}>
              <button
                onClick={prevMonth}
                className={`${inline ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all text-slate-600`}
              >
                <ChevronLeft className={`${inline ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </button>
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.h3 
                  key={month}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`font-bold text-slate-800 ${inline ? 'text-base' : 'text-lg sm:text-xl'}`}
                >
                  {months[month]} {year}
                </motion.h3>
              </AnimatePresence>
              <button
                onClick={nextMonth}
                className={`${inline ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all text-slate-600`}
              >
                <ChevronRight className={`${inline ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className={`grid grid-cols-7 ${inline ? 'mb-1.5' : 'mb-3'}`}>
              {weekdays.map((d, i) => (
                <div key={d} className={`text-center ${inline ? 'py-1' : 'py-2'}`}>
                  <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-wider">{inline ? weekdaysMobile[i] : d}</span>
                  <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">{weekdaysMobile[i]}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="relative overflow-hidden">
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.div 
                  key={month}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`grid grid-cols-7 ${inline ? 'gap-1' : 'gap-1.5 sm:gap-2'} w-full`}
                >
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const key = getDateKey(day);
                    const data = getDayData(key);
                    
                    const isToday = key === today.toISOString().split('T')[0];
                    const isSelected = key === selectedDate;
                    const isDisabled = data?.status === 'full' || data?.status === 'blocked' || data?.tripInfo?.isEnd;
                    let cfg = data ? statusConfig[data.status] : null;

                    // If it's a trip slot, override the color to make it distinct, 
                    // unless it's full/blocked in which case keep the red/gray color.
                    if (data?.tripInfo && data.status !== 'full' && data.status !== 'blocked') {
                      cfg = {
                        label: 'Trip',
                        bg: 'bg-indigo-50 border-indigo-300',
                        text: 'text-indigo-800',
                        hover: 'hover:bg-indigo-100 hover:border-indigo-400',
                        dot: 'bg-indigo-500'
                      } satisfies StatusConfig;
                    }

                    // Join logic for adjacent fully booked/blocked dates, and TripSlots
                    const prevKey = getDateKey(day - 1);
                    const nextKey = getDateKey(day + 1);
                    const prevData = day > 1 ? getDayData(prevKey) : null;
                    const nextData = day < daysInMonth ? getDayData(nextKey) : null;
                    
                    const isSameTripAsPrev = data?.tripInfo && prevData?.tripInfo && data.tripInfo.start_date === prevData.tripInfo.start_date;
                    const isSameTripAsNext = data?.tripInfo && nextData?.tripInfo && data.tripInfo.start_date === nextData.tripInfo.start_date;

                    const isJoinedWithPrev = isSameTripAsPrev || (isDisabled && !data?.tripInfo && prevData?.status === data?.status && !prevData?.tripInfo);
                    const isJoinedWithNext = isSameTripAsNext || (isDisabled && !data?.tripInfo && nextData?.status === data?.status && !nextData?.tripInfo);
                    const showRoomCount = !isPadma
                      && !data?.tripInfo?.isEnd
                      && typeof data?.availableCabins === 'number'
                      && typeof data?.totalCabins === 'number';
                    const roomCountLabel = showRoomCount ? `${data.availableCabins}/${data.totalCabins}${inline ? '' : ' rooms'}` : '';
                    const roomCountClass = isSelected
                      ? 'bg-white/20 text-white'
                      : data?.status === 'full'
                        ? 'bg-rose-100 text-rose-700'
                        : data?.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : data?.status === 'blocked'
                            ? 'bg-slate-200 text-slate-500'
                            : 'bg-emerald-100 text-emerald-700';

                    return (
                      <motion.button
                        key={day}
                        onClick={() => !isDisabled && setSelectedDate(isSelected ? null : key)}
                        disabled={isDisabled}
                        whileHover={!isDisabled && !isSelected ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`
                          relative aspect-square ${inline ? 'rounded-xl' : 'rounded-2xl'} flex flex-col items-center justify-center transition-all duration-200 min-w-0 overflow-hidden
                          ${isSelected ? 'bg-gradient-to-br from-[hsl(197,80%,40%)] to-[hsl(197,80%,30%)] text-white shadow-lg shadow-[hsl(197,80%,30%)]/30 scale-105 z-20' : 'z-10'}
                          ${!isSelected && cfg ? `${cfg.bg} ${cfg.text} ${cfg.hover}` : ''}
                          ${!cfg && !isSelected ? 'text-slate-300' : ''}
                          ${isToday && !isSelected ? 'ring-2 ring-offset-2 ring-[hsl(197,80%,38%)]/50 font-bold' : ''}
                          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                          ${isJoinedWithPrev ? '!rounded-tl-none !rounded-bl-none border-l-0' : ''}
                          ${isJoinedWithNext ? '!rounded-tr-none !rounded-br-none border-r-0' : ''}
                        `}
                      >
                        {/* Bridge gap for next adjacent date */}
                        {isJoinedWithNext && !isSelected && cfg && (
                          <div className={`absolute top-[-1px] -right-[6px] sm:-right-[8px] w-[12px] sm:w-[16px] h-[calc(100%+2px)] ${cfg.bg.split(' ')[0]} border-y border-y-inherit ${cfg.bg.split(' ')[1] || ''} z-[-1] pointer-events-none`} />
                        )}
                        <span className={`${inline ? 'text-[12px] sm:text-sm' : 'text-[13px] sm:text-base'} font-medium z-10`}>{day}</span>
                        {cfg && !data?.tripInfo && data?.status !== 'available' && (
                          <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tighter leading-none mt-0.5 z-10 ${isSelected ? 'text-white/90' : ''}`}>
                            ✕
                          </span>
                        )}
                        {showRoomCount && (
                          <span className={`absolute ${inline ? 'bottom-0.5 px-1 py-0 text-[7px] sm:text-[8px]' : 'bottom-1 px-1.5 py-0.5 text-[7px] sm:text-[9px]'} rounded-full font-bold leading-none z-10 whitespace-nowrap ${roomCountClass}`}>
                            {roomCountLabel}
                          </span>
                        )}
                        {data?.tripInfo?.isStart && data?.status !== 'blocked' && data?.status !== 'full' && (
                          <span className={`absolute ${inline ? 'bottom-3.5 text-[7px]' : 'bottom-[18px] sm:bottom-5 text-[8px] sm:text-[9px]'} font-bold tracking-tighter leading-none z-10 text-indigo-600 whitespace-nowrap overflow-hidden max-w-[95%]`}>
                            {inline ? 'IN' : <><span className="sm:hidden">IN</span><span className="hidden sm:inline">Check-in</span></>}
                          </span>
                        )}
                        {data?.tripInfo?.isEnd && data?.status !== 'blocked' && data?.status !== 'full' && (
                          <span className={`absolute ${inline ? 'bottom-1 text-[7px]' : 'bottom-[18px] sm:bottom-5 text-[8px] sm:text-[9px]'} font-bold tracking-tighter leading-none z-10 text-indigo-600 whitespace-nowrap overflow-hidden max-w-[95%]`}>
                            {inline ? 'OUT' : <><span className="sm:hidden">OUT</span><span className="hidden sm:inline">Checkout</span></>}
                          </span>
                        )}
                        {(data?.status === 'blocked' || data?.status === 'full') && !inline && !showRoomCount && (
                          <span className={`absolute bottom-1 text-[8px] sm:text-[9px] font-bold tracking-tighter leading-none z-10 whitespace-nowrap overflow-hidden max-w-[95%] ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                            {data.status === 'full' ? 'Booked' : 'Maintenance'}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
      {/* Legend */}
      <div className={`flex flex-wrap justify-center sm:justify-start ${inline ? 'gap-2 mt-2 pt-2' : 'gap-3 sm:gap-5 mt-4 sm:mt-2 pt-5'} border-t border-slate-100`}>
        {Object.entries(statusConfig).filter(([key]) => !isPadma || key !== 'partial').map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`${inline ? 'h-2.5 w-2.5' : 'w-3 h-3'} rounded-full shadow-sm ${cfg.dot}`} />
            <span className={`${inline ? 'text-[10px]' : 'text-xs'} font-medium text-slate-500`}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (inline) {
    return calendarGrid;
  }

  return (
    <section id="availability" className="py-10 md:py-16 bg-gradient-to-b from-white to-[hsl(195,100%,97%)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] max-w-[600px] aspect-square rounded-full bg-emerald-50/50 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] max-w-[500px] aspect-square rounded-full bg-[hsl(197,80%,90%)]/30 blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-full px-4 py-1.5 mb-4"
          >
            <Calendar className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{seasonData.availability.badge}</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight"
          >
            {seasonData.availability.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto"
          >
            {seasonData.availability.subtitle}
          </motion.p>
        </div>

        <div className="max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
          {calendarGrid}
        </div>
      </div>
    </section>
  );
}

function selectedDateNext(date: string) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}
