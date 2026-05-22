'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, BedDouble, Users } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import type { AvailabilityStatus } from '@/types/database';

type Status = 'available' | 'partial' | 'full' | 'blocked';

interface DayStatus {
  status: Status;
  availableCabins?: number;
  availableSlots?: string[];
  bookedSlots?: string[];
  price?: number;
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
  available: { label: 'Available', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', hover: 'hover:bg-emerald-200' },
  partial: { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', hover: 'hover:bg-amber-200' },
  full: { label: 'Full', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', hover: '' },
  blocked: { label: 'Blocked', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', hover: '' },
};

const publicStatusMap: Record<AvailabilityStatus, Status> = {
  available: 'available',
  partially_booked: 'partial',
  fully_booked: 'full',
  blocked: 'blocked',
  maintenance: 'blocked',
};

const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const weekdays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const weekdaysMobile = ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'];

export default function AvailabilityCalendar() {
  const { availability, cabins, activeSeason, seasonData } = usePublicData();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const availableCabinCount = cabins.filter((cabin) => cabin.available).length || cabins.length;
  const startingPrice = cabins.length ? Math.min(...cabins.map((cabin) => cabin.pricePerNight)) : 3500;
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
    if (blocks.length) {
      const status = blocks.some((block) => block.status === 'maintenance' || block.status === 'blocked')
        ? 'blocked'
        : publicStatusMap[blocks[0].status];
      return {
        status,
        availableCabins: status === 'available' ? availableCabinCount : status === 'partial' ? Math.max(availableCabinCount - blocks.length, 1) : 0,
        price: status === 'full' || status === 'blocked' ? 0 : startingPrice,
      };
    }

    return mockCalendarData[date] || {
      status: 'available',
      availableCabins: availableCabinCount,
      price: startingPrice,
    };
  };

  const selectedData = selectedDate ? getDayData(selectedDate) : null;

  return (
    <section id="availability" className="py-16 md:py-28 bg-[hsl(195,100%,97%)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <Calendar className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{seasonData.availability.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {seasonData.availability.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            {seasonData.availability.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 p-4 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors min-w-[36px]"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {months[month]} {year}
              </h3>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors min-w-[36px]"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekdays.map((d, i) => (
                <div key={d} className="text-center py-2">
                  <span className="hidden sm:inline text-xs font-semibold text-slate-400">{d}</span>
                  <span className="sm:hidden text-xs font-semibold text-slate-400">{weekdaysMobile[i]}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const key = getDateKey(day);
                const data = getDayData(key);
                const isToday = key === today.toISOString().split('T')[0];
                const isSelected = key === selectedDate;
                const isDisabled = data?.status === 'full' || data?.status === 'blocked';
                const cfg = data ? statusConfig[data.status] : null;

                return (
                  <button
                    key={day}
                    onClick={() => !isDisabled && setSelectedDate(isSelected ? null : key)}
                    disabled={isDisabled}
                    className={`
                      aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-150
                      ${isSelected ? 'bg-[hsl(197,80%,30%)] text-white shadow-md' : ''}
                      ${!isSelected && cfg ? `${cfg.bg} ${cfg.text} ${cfg.hover}` : ''}
                      ${!cfg && !isSelected ? 'text-slate-300' : ''}
                      ${isToday && !isSelected ? 'ring-2 ring-[hsl(197,80%,38%)]' : ''}
                      ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-xs sm:text-sm font-medium">{day}</span>
                    {cfg && (
                      <span className={`text-[7px] sm:text-[9px] leading-none mt-0.5 ${isSelected ? 'text-white/80' : ''}`}>
                        {data?.availableCabins !== undefined && data.availableCabins > 0 ? data.availableCabins : data?.status === 'available' ? '' : '✕'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className="text-[10px] sm:text-xs text-slate-500">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-3 sm:space-y-4">
            {selectedDate && selectedData ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 p-4 sm:p-6">
                <h4 className="font-bold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('bn-BD', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </h4>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[selectedData.status].dot}`} />
                      <span className="text-xs sm:text-sm text-slate-600">অবস্থা</span>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${statusConfig[selectedData.status].text}`}>
                      {statusConfig[selectedData.status].label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(197,80%,38%)]" />
                      <span className="text-xs sm:text-sm text-slate-600">{isPadma ? 'Available Slots' : 'উপলব্ধ কেবিন'}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{selectedData.availableCabins} / {isPadma ? eventSlots.length : cabins.length || 6}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(197,80%,38%)]" />
                      <span className="text-xs sm:text-sm text-slate-600">{isPadma ? 'Booked Slots' : 'বুকড কেবিন'}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{(isPadma ? eventSlots.length : cabins.length || 6) - (selectedData.availableCabins || 0)} / {isPadma ? eventSlots.length : cabins.length || 6}</span>
                  </div>

                  {isPadma && (
                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Active Season</div>
                      <div className="text-sm font-bold text-[hsl(197,80%,30%)]">Padma Event Season</div>
                    </div>
                  )}

                  {selectedData.price && selectedData.price > 0 && (
                    <div className="p-3 bg-[hsl(195,95%,92%)] rounded-xl">
                      <div className="text-xs text-[hsl(197,80%,38%)] font-medium mb-1">{isPadma ? 'Starting Event Price' : 'শুরুর মূল্য (প্রতি রাত)'}</div>
                      <div className="text-xl sm:text-2xl font-black text-[hsl(197,80%,28%)]">
                        ৳{selectedData.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 p-5 sm:p-6 text-center">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">একটি তারিখ সিলেক্ট করুন বিস্তারিত দেখতে</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
                <strong>নোট:</strong> এই ক্যালেন্ডারটি আনুমানিক। নিশ্চিত তারিখের জন্য সরাসরি আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
