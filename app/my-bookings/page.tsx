'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, CreditCard, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Logo from '@/components/Logo';

interface BookingResult {
  id: string;
  booking_code: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  advance_amount: number;
  due_amount: number;
  booking_type: string;
  created_at: string;
}

export default function MyBookingsPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(false);

    try {
      const res = await fetch(`/api/public/my-bookings?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings || []);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, label: 'Confirmed' };
      case 'pending':
        return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Pending' };
      case 'cancelled':
        return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle, label: 'Cancelled' };
      case 'checked_in':
        return { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: CheckCircle2, label: 'Checked In' };
      case 'checked_out':
      case 'completed':
        return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: CheckCircle2, label: 'Completed' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex justify-center flex-1">
            <Logo className="w-24 sm:w-28" />
          </div>
          <div className="w-[88px]" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 font-playfair">My Bookings</h1>
          <p className="text-slate-500 text-sm sm:text-base">Enter your phone number to check your booking status.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter mobile number (e.g. 01XXXXXXXXX)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] focus:bg-white transition-all text-slate-800"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,25%)] text-white font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Check Status'
              )}
            </button>
          </form>
          {error && <p className="text-rose-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">No bookings found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  We couldn't find any bookings associated with this phone number. Please check the number and try again.
                </p>
              </div>
            ) : (
              bookings.map((booking) => {
                const statusCfg = getStatusConfig(booking.booking_status);
                const StatusIcon = statusCfg.icon;

                return (
                  <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">Booking Code</div>
                        <div className="text-lg font-bold text-slate-800 font-mono">{booking.booking_code}</div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border w-fit ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusCfg.label}
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(197,80%,95%)] text-[hsl(197,80%,30%)] flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-0.5">Date & Guests</div>
                          <div className="font-medium text-slate-800">
                            {new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5">
                            {booking.number_of_guests} Guests • {booking.booking_type === 'full_boat' ? 'Full Boat' : 'Cabin Wise'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-500 mb-0.5">Payment</div>
                          <div className="font-medium text-slate-800 flex justify-between">
                            <span>Total:</span>
                            <span>৳ {booking.total_amount?.toLocaleString()}</span>
                          </div>
                          {booking.advance_amount > 0 && (
                            <div className="text-sm text-emerald-600 flex justify-between mt-0.5">
                              <span>Paid:</span>
                              <span>৳ {booking.advance_amount.toLocaleString()}</span>
                            </div>
                          )}
                          {booking.due_amount > 0 && (
                            <div className="text-sm text-rose-600 flex justify-between mt-0.5">
                              <span>Due:</span>
                              <span>৳ {booking.due_amount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
