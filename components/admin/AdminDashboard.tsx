'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardCards, { money } from '@/components/admin/DashboardCards';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { normalizeSeason, seasonMeta } from '@/data/seasonalData';
import { fetchAdminDataset } from '@/lib/admin/data';
import type { Booking, Expense, HouseboatSettings, TripSlot } from '@/types/database';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tripSlots, setTripSlots] = useState<TripSlot[]>([]);
  const [settings, setSettings] = useState<HouseboatSettings[]>([]);
  
  const [dateFilter, setDateFilter] = useState('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const load = async () => {
    const data = await fetchAdminDataset();
    setBookings(data.bookings || []);
    setExpenses(data.expenses || []);
    setTripSlots(data.trip_slots || []);
    setSettings(data.settings || []);
  };

  useEffect(() => {
    load();
  }, []);

  const activeSeason = normalizeSeason(settings[0]?.active_season);
  const meta = seasonMeta[activeSeason];

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    // Use local time formatting to avoid timezone shifts
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    
    if (dateFilter === 'today') return { startDate: todayStr, endDate: todayStr };
    if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = new Date(yesterday.getTime() - (yesterday.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
      return { startDate: yStr, endDate: yStr };
    }
    if (dateFilter === 'last_7_days') {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 6);
      const l7Str = new Date(last7.getTime() - (last7.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
      return { startDate: l7Str, endDate: todayStr };
    }
    if (dateFilter === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const mStr = new Date(startOfMonth.getTime() - (startOfMonth.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
      return { startDate: mStr, endDate: todayStr };
    }
    if (dateFilter === 'custom') {
      return { startDate: customFrom || '1970-01-01', endDate: customTo || '2100-01-01' };
    }
    return { startDate: '1970-01-01', endDate: '2100-01-01' };
  }, [dateFilter, customFrom, customTo]);

  const metrics = useMemo(() => {
    // 1. Total Trips
    const validTrips = tripSlots.filter(t => t.start_date >= startDate && t.start_date <= endDate);
    const totalTrips = validTrips.length;
    
    // 2. Total Guests
    const validBookings = bookings.filter(b => 
      b.booking_status !== 'cancelled' && 
      ((b.event_date || b.check_in_date) >= startDate) && 
      ((b.event_date || b.check_in_date) <= endDate)
    );
    const totalGuests = validBookings.reduce((sum, b) => sum + (Number(b.number_of_guests) || 0), 0);
    
    // 3. Total Booking Amount
    const totalBookingAmount = validBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    
    // 4. Total Expense
    const validExpenses = expenses.filter(e => e.expense_date >= startDate && e.expense_date <= endDate);
    const totalExpense = validExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    // 5. Total Profit
    const totalProfit = totalBookingAmount - totalExpense;

    return [
      { label: 'Total Trips', value: totalTrips, tone: 'blue' as const },
      { label: 'Total Guests', value: totalGuests, tone: 'amber' as const },
      { label: 'Total Booking Amount', value: money(totalBookingAmount), tone: 'green' as const },
      { label: 'Total Expense', value: money(totalExpense), tone: 'red' as const },
      { label: 'Total Profit', value: money(totalProfit), tone: totalProfit >= 0 ? 'green' as const : 'slate' as const },
    ];
  }, [bookings, expenses, tripSlots, startDate, endDate]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-xl text-sky-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Dashboard Overview</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{meta.adminName}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{startDate === endDate ? startDate : `${startDate} to ${endDate}`}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-[140px] bg-white border-slate-200" />
              <span className="text-slate-400 text-sm">to</span>
              <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-[140px] bg-white border-slate-200" />
            </div>
          )}
        </div>
      </div>
      
      <DashboardCards cards={metrics} />
    </div>
  );
}
