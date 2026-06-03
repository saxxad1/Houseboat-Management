'use client';

import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, ArrowUpRight, ArrowDownRight, Users, Ship, Wallet } from 'lucide-react';
import { currencyFormatter } from '@/lib/admin/constants';
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
    const validTrips = tripSlots.filter(t => t.start_date >= startDate && t.start_date <= endDate);
    const totalTrips = validTrips.length;
    
    const validBookings = bookings.filter(b => 
      b.booking_status !== 'cancelled' && 
      ((b.event_date || b.check_in_date) >= startDate) && 
      ((b.event_date || b.check_in_date) <= endDate)
    );
    const totalGuests = validBookings.reduce((sum, b) => sum + (Number(b.number_of_guests) || 0), 0);
    
    const totalBookingAmount = validBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const validExpenses = expenses.filter(e => e.expense_date >= startDate && e.expense_date <= endDate);
    const totalExpense = validExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalProfit = totalBookingAmount - totalExpense;
    
    const avgGuests = totalTrips ? Math.round(totalGuests / totalTrips) : 0;
    const avgProfit = totalTrips ? (totalProfit / totalTrips) : 0;
    const profitMargin = totalBookingAmount ? Math.round((totalProfit / totalBookingAmount) * 100) : 0;

    const m = (val: number) => currencyFormatter.format(val).replace('BDT', '৳');

    return {
      trips: totalTrips,
      guests: totalGuests,
      revenue: totalBookingAmount,
      expense: totalExpense,
      profit: totalProfit,
      avgGuests,
      avgProfit,
      profitMargin,
      m
    };
  }, [bookings, expenses, tripSlots, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-lg">Dashboard Overview</div>
            <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <span>{meta.adminName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span>{startDate === endDate ? startDate : `${startDate} to ${endDate}`}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 rounded-xl font-medium">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-[140px] h-10 bg-white border-slate-200 rounded-xl" />
              <span className="text-slate-400 font-medium">to</span>
              <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-[140px] h-10 bg-white border-slate-200 rounded-xl" />
            </div>
          )}
        </div>
      </div>
      
      {/* Top Row: Trips, Guests, Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-indigo-100/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Trips</p>
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">{metrics.trips}</div>
          <p className="text-xs font-semibold text-slate-500 mt-2 bg-white/60 inline-block px-2 py-1 rounded-lg">Based on schedule</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-orange-100/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Guests</p>
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">{metrics.guests}</div>
          <p className="text-xs font-semibold text-slate-500 mt-2 bg-white/60 inline-block px-2 py-1 rounded-lg">{metrics.avgGuests} guests per trip avg</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-teal-100/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <div className="bg-teal-100 text-teal-600 p-2 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">{metrics.m(metrics.revenue)}</div>
          <p className="text-xs font-semibold text-slate-500 mt-2 bg-white/60 inline-block px-2 py-1 rounded-lg">From bookings</p>
        </div>
      </div>

      {/* Bottom Row: Expense and Profit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-rose-500/5 to-red-500/5 border border-red-100/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Expense</p>
            <div className="bg-red-100 text-red-600 p-2.5 rounded-xl">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <div className="text-5xl font-black text-slate-800 tracking-tight">{metrics.m(metrics.expense)}</div>
          <div className="flex gap-2 mt-3">
            <p className="text-xs font-semibold text-slate-500 bg-white/60 px-2.5 py-1.5 rounded-lg">Operational costs</p>
          </div>
        </div>

        <div className={`bg-gradient-to-br border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${metrics.profit >= 0 ? 'from-emerald-500/10 to-teal-500/10 border-teal-200/50' : 'from-slate-500/10 to-gray-500/10 border-slate-200/50'}`}>
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${metrics.profit >= 0 ? 'bg-teal-500/20' : 'bg-slate-500/20'}`} />
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold uppercase tracking-wider ${metrics.profit >= 0 ? 'text-teal-700' : 'text-slate-600'}`}>Net Profit</p>
            <div className={`${metrics.profit >= 0 ? 'bg-teal-500 text-white' : 'bg-slate-500 text-white'} p-2.5 rounded-xl shadow-inner`}>
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className={`text-5xl font-black tracking-tight ${metrics.profit >= 0 ? 'text-teal-900' : 'text-slate-800'}`}>{metrics.m(metrics.profit)}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <p className="text-xs font-bold text-teal-800 bg-white/60 px-2.5 py-1.5 rounded-lg">{metrics.profitMargin}% Profit Margin</p>
            <p className="text-xs font-bold text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg">{metrics.m(metrics.avgProfit)} Avg Profit / Trip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
