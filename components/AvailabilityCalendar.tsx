'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, BedDouble, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicData } from '@/components/PublicDataProvider';
import type { AvailabilityStatus } from '@/types/database';

type Status = 'available' | 'partial' | 'full' | 'blocked';

interface DayStatus {
  status: Status;
  availableCabins?: number;
  availableSlots?: string[];
  bookedSlots?: string[];
  price?: number;
  tripInfo?: {
    isStart: boolean;
    isEnd: boolean;
    duration: string;
    start_date: string;
    end_date: string;
  };
}

const mockCalendarData: Record<string, DayStatus> = {
  '2026-05-01': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-02': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-03': { status: 'partial', availableCabins: 3, price: 3500 },
  '2026-05-04': { status: 'partial', availableCabins: 2, price: 3500 },
  '2026-05-05': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-06': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-07': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-08': { status: 'available', availableCabins: 5, price: 3500 },
  '2026-05-09': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-10': { status: 'partial', availableCabins: 4, price: 3500 },
  '2026-05-11': { status: 'blocked', availableCabins: 0, price: 0 },
  '2026-05-12': { status: 'blocked', availableCabins: 0, price: 0 },
  '2026-05-13': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-14': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-15': { status: 'partial', availableCabins: 1, price: 3500 },
  '2026-05-16': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-17': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-18': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-19': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-20': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-21': { status: 'partial', availableCabins: 3, price: 3500 },
  '2026-05-22': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-23': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-24': { status: 'partial', availableCabins: 2, price: 3500 },
  '2026-05-25': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-26': { status: 'full', availableCabins: 0, price: 0 },
  '2026-05-27': { status: 'available', availableCabins: 5, price: 3500 },
  '2026-05-28': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-29': { status: 'available', availableCabins: 6, price: 3500 },
  '2026-05-30': { status: 'partial', availableCabins: 4, price: 3500 },
  '2026-05-31': { status: 'available', availableCabins: 6, price: 3500 },
};

const statusConfig = {
  available: { label: 'Available', bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', hover: 'hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5' },
  partial: { label: 'Partial', bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', hover: 'hover:bg-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5' },
  full: { label: 'Full', bg: 'bg-rose-50 border border-rose-100 opacity-80', text: 'text-rose-700', dot: 'bg-rose-500', hover: '' },
  blocked: { label: 'Blocked', bg: 'bg-slate-50 border border-slate-100 opacity-60', text: 'text-slate-400', dot: 'bg-slate-300', hover: '' },
};

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
  const { availability, tripSlots, cabins, activeSeason, seasonData } = usePublicData();
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
  const eventSlots = isPadma && 'slots' in seasonData.availability
    ? [...seasonData.availability.slots]
    : [];

  const getDayData = (date: string): DayStatus => {
    const blocks = availability.filter((block) => block.date === date && (block.season_type || 'haor') === activeSeason);
    if (isPadma) {
      const blocked = blocks.some((block) => block.status === 'blocked' || block.status === 'maintenance' || block.slot_status === 'blocked' || block.slot_status === 'maintenance');
      const bookedSlotKeys = blocks
        .filter((block) => block.slot_status === 'booked' || block.status === 'fully_booked')
        .map((block) => block.event_slot || 'custom');
      const hasFullDay = bookedSlotKeys.includes('full_day') || blocks.some((block) => block.event_slot === 'full_day');
      const pending = blocks.some((block) => block.slot_status === 'inquiry_pending' || block.status === 'partially_booked');
      const status: Status = blocked ? 'blocked' : hasFullDay || bookedSlotKeys.length >= 4 ? 'full' : pending || bookedSlotKeys.length > 0 ? 'partial' : 'available';
      return {
        status,
        availableCabins: Math.max(eventSlots.length - (hasFullDay ? eventSlots.length : bookedSlotKeys.length), 0),
        availableSlots: status === 'blocked' || hasFullDay ? [] : eventSlots,
        bookedSlots: hasFullDay ? ['Full Day Event'] : bookedSlotKeys,
        price: status === 'full' || status === 'blocked' ? 0 : 30000,
      };
    }

    const trip = tripSlots.find((slot) => date >= slot.start_date && date <= slot.end_date);
    if (trip) {
      const isStart = date === trip.start_date;
      const isEnd = date === trip.end_date;
      const status = publicStatusMap[trip.status];
      // Note: In real app, booked cabins would be checked from bookings table for this trip slot.
      // For now we assume if it's partially booked, some cabins are taken.
      return {
        status,
        availableCabins: status === 'available' ? availableCabinCount : status === 'partial' ? Math.max(availableCabinCount - 1, 1) : 0,
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
      status: 'available',
      availableCabins: availableCabinCount,
      price: startingPrice,
    };
  };

  const selectedData = selectedDate ? getDayData(selectedDate) : null;


          {/* Calendar */}
  const calendarGrid = (
    <div className={`bg-white/80 backdrop-blur-xl rounded-[2rem] ${inline ? 'p-3 sm:p-4' : 'shadow-xl shadow-slate-200/50 border border-white p-5 sm:p-8'} relative`}>
      {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <button
                onClick={prevMonth}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
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
                  className="font-bold text-slate-800 text-lg sm:text-xl"
                >
                  {months[month]} {year}
                </motion.h3>
              </AnimatePresence>
              <button
                onClick={nextMonth}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all text-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-3">
              {weekdays.map((d, i) => (
                <div key={d} className="text-center py-2">
                  <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</span>
                  <span className="sm:hidden text-xs font-bold text-slate-400 uppercase">{weekdaysMobile[i]}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="relative overflow-hidden min-h-[300px] sm:min-h-[380px]">
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.div 
                  key={month}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="grid grid-cols-7 gap-1.5 sm:gap-2 absolute w-full top-0 left-0"
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
                        bg: 'bg-indigo-50 border-indigo-300',
                        text: 'text-indigo-800',
                        hover: 'hover:bg-indigo-100 hover:border-indigo-400',
                        dot: 'bg-indigo-500'
                      };
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

                    return (
                      <motion.button
                        key={day}
                        onClick={() => !isDisabled && setSelectedDate(isSelected ? null : key)}
                        disabled={isDisabled}
                        whileHover={!isDisabled && !isSelected ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`
                          relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-w-0 overflow-hidden
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
                        <span className="text-[13px] sm:text-base font-medium z-10">{day}</span>
                        {cfg && !data?.tripInfo && data?.status !== 'available' && (
                          <span className={`text-[9px] sm:text-[10px] font-semibold tracking-tighter leading-none mt-0.5 z-10 ${isSelected ? 'text-white/90' : ''}`}>
                            ✕
                          </span>
                        )}
                        {data?.tripInfo?.isStart && (
                          <span className="text-[8px] sm:text-[9px] font-bold tracking-tighter leading-none mt-0.5 z-10 text-indigo-600 whitespace-nowrap overflow-hidden max-w-[95%]">
                            {inline ? 'IN' : <><span className="sm:hidden">IN</span><span className="hidden sm:inline">Check-in</span></>}
                          </span>
                        )}
                        {data?.tripInfo?.isEnd && (
                          <span className="text-[8px] sm:text-[9px] font-bold tracking-tighter leading-none mt-0.5 z-10 text-indigo-600 whitespace-nowrap overflow-hidden max-w-[95%]">
                            {inline ? 'OUT' : <><span className="sm:hidden">OUT</span><span className="hidden sm:inline">Checkout</span></>}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
      {/* Legend */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-5 mt-4 sm:mt-2 pt-5 border-t border-slate-100">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-sm ${cfg.dot}`} />
            <span className="text-xs font-medium text-slate-500">{cfg.label}</span>
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

        <div className="max-w-4xl mx-auto">
          {calendarGrid}
        </div>
      </div>
    </section>
  );
}
