'use client';

import { useState } from 'react';
import { Search, Calendar, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { PublicDataProvider } from '@/components/PublicDataProvider';
import { ScrollReveal } from '@/components/ScrollReveal';

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

function MyBookingsContent() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [error, setError] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
    <main className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header onBookNow={() => setIsBookingOpen(true)} />

      {/* Hero Section for My Bookings to blend with the site */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(197,80%,10%)] to-[hsl(197,80%,20%)] z-0" />
        <div className="absolute inset-0 bg-[url('/hero-kuhelika-houseboat.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-playfair tracking-tight">
              My Bookings
            </h1>
            <p className="text-[hsl(195,95%,92%)] text-base md:text-xl max-w-2xl mx-auto font-medium">
              Check your booking status, details, and payment information easily using your registered mobile number.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:py-16 -mt-10 relative z-20">
        {/* Search Box */}
        <ScrollReveal delay={0.1}>
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-8 mb-8 sm:mb-12">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter mobile number (e.g. 01XXXXXXXXX)"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] focus:bg-white transition-all text-slate-800 text-base"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="px-8 py-3.5 bg-[hsl(38,90%,55%)] hover:bg-[hsl(35,90%,48%)] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Check Status'
                )}
              </button>
            </form>
            {error && <p className="text-rose-500 text-sm mt-3 px-2">{error}</p>}
          </div>
        </ScrollReveal>

        {/* Results */}
        {hasSearched && (
          <ScrollReveal delay={0.2}>
            <div className="space-y-5">
              {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 font-playfair">No bookings found</h3>
                  <p className="text-slate-500 text-base max-w-sm mx-auto">
                    We couldn't find any bookings associated with this phone number. Please check the number and try again.
                  </p>
                </div>
              ) : (
                bookings.map((booking) => {
                  const statusCfg = getStatusConfig(booking.booking_status);
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div key={booking.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold tracking-wider text-[hsl(197,80%,40%)] uppercase mb-1">Booking Code</div>
                          <div className="text-xl font-bold text-slate-800 font-mono tracking-tight">{booking.booking_code}</div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border w-fit ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusCfg.label}
                        </div>
                      </div>
                      
                      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-slate-50/50">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 text-[hsl(197,80%,40%)] flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-500 mb-1">Date & Guests</div>
                            <div className="font-bold text-slate-800 text-base">
                              {new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                            </div>
                            <div className="text-sm font-medium text-slate-600 mt-1">
                              {booking.number_of_guests} Guests • {booking.booking_type === 'full_boat' ? 'Full Boat' : 'Cabin Wise'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-500 mb-1">Payment Info</div>
                            <div className="font-bold text-slate-800 text-base flex justify-between">
                              <span>Total:</span>
                              <span>৳ {booking.total_amount?.toLocaleString()}</span>
                            </div>
                            {booking.advance_amount > 0 && (
                              <div className="text-sm font-medium text-emerald-600 flex justify-between mt-1">
                                <span>Paid:</span>
                                <span>৳ {booking.advance_amount.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.due_amount > 0 && (
                              <div className="text-sm font-medium text-rose-600 flex justify-between mt-1 pt-1 border-t border-slate-200/50">
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
          </ScrollReveal>
        )}
      </section>

      <Footer />
      <BookingForm 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
      <FloatingWhatsApp />
    </main>
  );
}

export default function MyBookingsPage() {
  return (
    <PublicDataProvider>
      <MyBookingsContent />
    </PublicDataProvider>
  );
}
