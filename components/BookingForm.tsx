'use client';

import { useState, useEffect } from 'react';
import { X, CircleCheck as CheckCircle2, Send, MessageCircle, Phone, User, CalendarCheck, Users, Anchor, BedDouble, Package, CreditCard, FileText } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { calculateBookingDiscount } from '@/lib/discounts';


interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialCabin?: string;
  initialBookingType?: 'cabin' | 'full';
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
}

const initialForm = {
  name: '',
  phone: '',
  email: '',
  checkin: '',
  checkout: '',
  guests: '16',
  bookingType: 'cabin' as 'cabin' | 'full',
  acPreference: 'AC',
  package: '',
  request: '',
  payment: 'bkash',
  transactionId: '',
  eventDate: '',
  eventType: 'Birthday',
  eventSlot: 'morning',
  guestRange: '20-30',
  foodPackage: 'Snacks Only',
  decorationRequired: 'Discuss Later',
  soundSystemRequired: 'Yes',
  paymentMode: 'advance' as 'advance' | 'full',
};

type PackageDisplayFields = {
  priceDisplay?: string;
};

type SelectedRoomDetail = {
  roomId: string;
  roomName: string;
  pax: number;
  subtotal: number;
};

const eventSlotValues: Record<string, string> = {
  'Morning Slot': 'morning',
  'Afternoon Slot': 'afternoon',
  'Evening Slot': 'evening',
  'Moonlight Slot': 'moonlight',
  'Full Day Event': 'full_day',
  'Custom Slot': 'custom',
};

function normalizeEventSlot(value: string) {
  return eventSlotValues[value] || value;
}

function getEventSlotLabel(value: string) {
  return Object.entries(eventSlotValues).find(([, slot]) => slot === value)?.[0] || value;
}

export default function BookingForm({ isOpen, onClose, initialCabin, initialBookingType = 'cabin', initialCheckInDate, initialCheckOutDate }: BookingFormProps) {
  const { siteConfig, cabins, packages, activeSeason, seasonData, tripSlots, specialDates } = usePublicData();
  const [form, setForm] = useState({ ...initialForm, bookingType: initialBookingType });
  const [roomDetails, setRoomDetails] = useState<{cabin: string, pax: number}[]>([{cabin: '', pax: 2}]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [botField, setBotField] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({ 
        ...prev, 
        bookingType: initialBookingType as 'cabin' | 'full',
        checkin: initialCheckInDate || prev.checkin,
        checkout: initialCheckOutDate || prev.checkout
      }));
      if (initialCabin) {
        setRoomDetails([{ cabin: initialCabin, pax: 2 }]);
      } else {
        setRoomDetails([{ cabin: '', pax: 2 }]);
      }
    }
  }, [isOpen, initialCabin, initialBookingType, initialCheckInDate, initialCheckOutDate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Enter name';
    if (!form.phone.trim()) newErrors.phone = 'Enter phone number';
    if (activeSeason === 'padma') {
      if (!form.eventDate) newErrors.eventDate = 'Enter event date';
      if (!form.eventType) newErrors.eventType = 'Select event type';
      if (!form.eventSlot) newErrors.eventSlot = 'Select slot';
    } else {
      if (!form.checkin) newErrors.checkin = 'Enter check-in date';
      if (!form.checkout) newErrors.checkout = 'Enter check-out date';
      if (form.checkin && form.checkout && form.checkout <= form.checkin) {
        newErrors.checkout = 'Check-out date must be after check-in';
      }
      if (form.bookingType === 'cabin') {
        const hasValidRoom = roomDetails.some(r => r.cabin.trim() !== '');
        if (!hasValidRoom) newErrors.rooms = 'Select at least one cabin';
      }
    }
    return newErrors;
  };

  const getCabinPrice = (selectedCabin: any, pax: number) => {
    let pricePerPerson = selectedCabin.rawPricePerNight || 0;
    if (pax === 2 && selectedCabin.rawPrice2Pax) pricePerPerson = selectedCabin.rawPrice2Pax;
    if (pax === 3 && selectedCabin.rawPrice3Pax) pricePerPerson = selectedCabin.rawPrice3Pax;
    return Number(pricePerPerson || 0);
  };

  const getSelectedRoomDetails = (): SelectedRoomDetail[] => {
    return roomDetails
      .filter((room) => room.cabin.trim() !== '')
      .map((room) => {
        const selectedCabin = cabins.find((c: any) => c.name === room.cabin);
        const roomId = String((selectedCabin as any)?.dbId || (selectedCabin as any)?.id || '');
        const roomName = String((selectedCabin as any)?.name || room.cabin);
        const pricePerPerson = selectedCabin ? getCabinPrice(selectedCabin, room.pax) : 0;

        return {
          roomId,
          roomName,
          pax: room.pax,
          subtotal: pricePerPerson * room.pax,
        };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (botField) {
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const selectedRoomDetails = getSelectedRoomDetails();
      const guestCount = form.bookingType === 'cabin'
        ? selectedRoomDetails.reduce((sum, room) => sum + room.pax, 0)
        : Number(form.guests || 1);
      const roomsString = form.bookingType === 'cabin' 
        ? selectedRoomDetails.map(r => `${r.roomName} (${r.pax} persons)`).join(', ')
        : `Full Boat - ${form.guests} Guests, ${form.acPreference}`;

      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          guests: String(guestCount || 1),
          rooms: roomsString,
          roomDetails: selectedRoomDetails,
          subtotalEstimatedPrice: priceSummary.subtotalAmount,
          discountAmount: priceSummary.discountAmount,
          discountReason: priceSummary.discountReason,
          totalEstimatedPrice: priceSummary.totalAmount,
          season_type: activeSeason,
          paymentMode: form.paymentMode,
          payableAmount: form.paymentMode === 'advance' ? Math.ceil(priceSummary.totalAmount / 2) : priceSummary.totalAmount,
          botField,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save booking in DB');
      }

      setSubmitted(true);
    } catch {
      setSubmitError('Failed to send booking request. Please try again or contact via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimatedPrice = () => {
    if (activeSeason === 'padma') return null;
    
    if (form.bookingType === 'full') {
      const isAC = form.acPreference === 'AC';
      const g = parseInt(form.guests, 10);
      if (g === 16) return isAC ? 180000 : 150000;
      if (g === 18) return isAC ? 200000 : 165000;
      if (g === 20) return isAC ? 215000 : 180000;
      if (g === 22) return isAC ? 230000 : 195000;
      if (g === 25) return isAC ? 250000 : 210000;
      return null;
    }
    
    let total = 0;
    for (const r of roomDetails) {
      if (!r.cabin) continue;
      const selectedCabin = cabins.find((c: any) => c.name === r.cabin);
      if (!selectedCabin) continue;

      const pricePerPerson = getCabinPrice(selectedCabin, r.pax);
      total += pricePerPerson * r.pax;
    }
    
    return total > 0 ? total : null;
  };

  const estimatedSubtotal = getEstimatedPrice();
  const bookingDate = activeSeason === 'padma' ? form.eventDate : form.checkin;
  const priceSummary = calculateBookingDiscount(estimatedSubtotal || 0, bookingDate, specialDates);
  const payableAmount = form.paymentMode === 'advance' ? Math.ceil(priceSummary.totalAmount / 2) : priceSummary.totalAmount;

  const buildWhatsappMessage = () => {
    if (activeSeason === 'padma') {
      const msg = `Hello, I want to book a Padma River event cruise.

Name: ${form.name}
Phone: ${form.phone}
Event Date: ${form.eventDate}
Event Type: ${form.eventType}
Preferred Slot: ${getEventSlotLabel(form.eventSlot)}
Guests: ${form.guestRange}
Package: ${form.package || 'Not selected'}
Food Package: ${form.foodPackage}
Decoration Required: ${form.decorationRequired}
Sound System Required: ${form.soundSystemRequired}
Special Request: ${form.request || 'None'}

Please confirm availability and package details.`;
      return encodeURIComponent(msg);
    }

    const estimatedTotal = priceSummary.totalAmount;
    const selectedRoomDetails = getSelectedRoomDetails();
    const msg = `Hello,
I would like to book at *${siteConfig.name}*.

*Name:* ${form.name}
*Phone:* ${form.phone}
*Check-in:* ${form.checkin}
*Check-out:* ${form.checkout}
*Booking Type:* ${form.bookingType === 'full' ? 'Full Boat' : 'Cabin Wise'}
${form.bookingType === 'cabin' ? `*Rooms:* ${selectedRoomDetails.map(r => `${r.roomName} (${r.pax} persons)`).join(', ')}` : ''}
*Total Guests:* ${form.guests}
*Estimated Price:* ${estimatedTotal ? `৳${estimatedTotal.toLocaleString()}` : 'TBD'}
${priceSummary.discountAmount ? `*Discount:* ৳${priceSummary.discountAmount.toLocaleString()} (${priceSummary.discountReason})` : ''}
*Payment Mode:* ${form.paymentMode === 'advance' ? '50% Advance' : '100% Full Payment'}
*Payable Now:* ${payableAmount ? `৳${payableAmount.toLocaleString()}` : 'TBD'}
*Special Request:* ${form.request || 'None'}

Thank you.`;
    return encodeURIComponent(msg);
  };

  const handleWhatsapp = () => {
    const url = `https://wa.me/${siteConfig.whatsapp}?text=${buildWhatsappMessage()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setSubmitError('');
    setBotField('');
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl max-h-[95vh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="z-20 shrink-0 bg-gradient-to-r from-[hsl(197,80%,28%)] to-[hsl(173,58%,40%)] p-3 sm:p-4 rounded-t-3xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{seasonData.bookingForm.title}</h2>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5">{seasonData.bookingForm.subtitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors min-w-[36px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
        {/* Success State */}
        {submitted ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">{seasonData.bookingForm.success}</h3>
            <p className="text-slate-500 text-sm sm:text-base mb-5 sm:mb-6">
              {seasonData.bookingForm.successDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleWhatsapp}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 sm:px-6 py-2 rounded-2xl transition-colors min-h-[42px]"
              >
                <MessageCircle className="w-5 h-5" />
                Contact via WhatsApp
              </button>
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 sm:px-6 py-2 rounded-2xl transition-colors min-h-[42px]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form
            name="booking-request"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 space-y-3"
          >
            <input type="hidden" name="form-name" value="booking-request" />
            <p className="hidden">
              <label>
                Do not fill this out:
                <input
                  name="bot-field"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </p>

            {activeSeason === 'haor' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bookingType: 'cabin' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.bookingType === 'cabin' ? 'bg-white shadow-sm text-[hsl(197,80%,30%)]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Room Booking
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bookingType: 'full' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.bookingType === 'full' ? 'bg-white shadow-sm text-[hsl(197,80%,30%)]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Full Boat Booking
                </button>
              </div>
            )}

            {/* Row: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Full Name *</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  placeholder="Enter your name"
                  className={`w-full px-3.5 sm:px-4 py-2 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px] ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone Number *</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-3.5 sm:px-4 py-2 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px] ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {activeSeason === 'padma' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />Event Date *</span>
                    </label>
                    <input
                      name="eventDate"
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => { setForm({ ...form, eventDate: e.target.value }); setErrors({ ...errors, eventDate: '' }); }}
                      className={`w-full px-3.5 sm:px-4 py-2 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px] ${errors.eventDate ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Event Type *</label>
                    <select
                      name="eventType"
                      value={form.eventType}
                      onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    >
                      {seasonData.bookingForm.mode === 'padma' && seasonData.bookingForm.eventTypes.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Preferred Slot *</label>
                    <select
                      name="eventSlot"
                      value={form.eventSlot}
                      onChange={(e) => setForm({ ...form, eventSlot: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    >
                      {seasonData.bookingForm.mode === 'padma' && seasonData.bookingForm.slots.map((item) => (
                        <option key={item} value={normalizeEventSlot(item)}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Number of Guests *</span>
                    </label>
                    <select
                      name="guestRange"
                      value={form.guestRange}
                      onChange={(e) => setForm({ ...form, guestRange: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    >
                      {seasonData.bookingForm.mode === 'padma' && seasonData.bookingForm.guestRanges.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Row: Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />Check-in *</span>
                    </label>
                    <Popover open={isCheckinOpen} onOpenChange={setIsCheckinOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full text-left px-3.5 sm:px-4 py-2 rounded-xl border text-slate-800 text-sm bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px] ${!form.checkin ? 'text-slate-500' : ''} ${errors.checkin ? 'border-red-400' : 'border-slate-200'}`}
                        >
                          {form.checkin ? new Date(form.checkin + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/yyyy'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <AvailabilityCalendar 
                          inline 
                          selectedDate={form.checkin} 
                          onSelectDate={(newCheckin) => {
                            const nextDay = new Date(newCheckin);
                            nextDay.setDate(nextDay.getDate() + 1);
                            let newCheckout = nextDay.toISOString().split('T')[0];
                            
                            if (activeSeason === 'haor') {
                              const slot = tripSlots.find(t => t.start_date === newCheckin);
                              if (slot) newCheckout = slot.end_date;
                            }
                            setForm({ ...form, checkin: newCheckin, checkout: newCheckout }); 
                            setErrors({ ...errors, checkin: '' }); 
                            setIsCheckinOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.checkin && <p className="text-red-500 text-xs mt-1">{errors.checkin}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />Check-out *</span>
                    </label>
                    <Popover open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={activeSeason === 'haor'}
                          className={`w-full text-left px-3.5 sm:px-4 py-2 rounded-xl border text-slate-800 text-sm ${activeSeason === 'haor' ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)]'} transition-all min-h-[42px] ${!form.checkout ? 'text-slate-500' : ''} ${errors.checkout ? 'border-red-400' : 'border-slate-200'}`}
                        >
                          {form.checkout ? new Date(form.checkout + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/yyyy'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <AvailabilityCalendar 
                          inline 
                          selectedDate={form.checkout} 
                          onSelectDate={(newCheckout) => {
                            setForm({ ...form, checkout: newCheckout }); 
                            setErrors({ ...errors, checkout: '' });
                            setIsCheckoutOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.checkout && <p className="text-red-500 text-xs mt-1">{errors.checkout}</p>}
                  </div>
                </div>


              </>
            )}

            {/* Cabin Select & Sharing */}
            {activeSeason === 'haor' && form.bookingType === 'cabin' && (
              <div className="space-y-3 sm:space-y-4">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" />Rooms & Guests</span>
                </label>
                {roomDetails.map((detail, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 items-center">
                    <select
                      value={detail.cabin}
                      onChange={(e) => {
                        const newDetails = [...roomDetails];
                        newDetails[index].cabin = e.target.value;
                        setRoomDetails(newDetails);
                      }}
                      className="flex-1 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    >
                      <option value="">-- Select Cabin --</option>
                      {cabins.filter((c: any) => c.available).map((c: any) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={detail.pax}
                      onChange={(e) => {
                        const newDetails = [...roomDetails];
                        newDetails[index].pax = Number(e.target.value);
                        setRoomDetails(newDetails);
                      }}
                      className="w-24 sm:w-32 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    >
                      <option value={2}>2 Persons</option>
                      <option value={3}>3 Persons</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setRoomDetails(roomDetails.filter((_, i) => i !== index))}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setRoomDetails([...roomDetails, { cabin: '', pax: 2 }])}
                  className="w-full py-2.5 sm:py-3 mt-1 rounded-xl border-2 border-dashed border-[hsl(197,80%,38%)] text-[hsl(197,80%,38%)] text-sm font-bold flex items-center justify-center gap-1 hover:bg-[hsl(195,95%,95%)] transition-colors shadow-sm"
                >
                  + Add Another Room
                </button>
                {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
              </div>
            )}

            {/* Full Boat Setup */}
            {activeSeason === 'haor' && form.bookingType === 'full' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Number of Guests *</span>
                  </label>
                  <select
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                  >
                    <option value="16">16 Persons</option>
                    <option value="18">18 Persons</option>
                    <option value="20">20 Persons</option>
                    <option value="22">22 Persons</option>
                    <option value="25">25 Persons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">AC Preference *</span>
                  </label>
                  <select
                    value={form.acPreference}
                    onChange={(e) => setForm({ ...form, acPreference: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                  >
                    <option value="AC">With AC</option>
                    <option value="Non AC">Without AC (Non AC)</option>
                  </select>
                </div>
              </div>
            )}



            {activeSeason === 'padma' && seasonData.bookingForm.mode === 'padma' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Food Package</label>
                  <select
                    name="foodPackage"
                    value={form.foodPackage}
                    onChange={(e) => setForm({ ...form, foodPackage: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                  >
                    {seasonData.bookingForm.foodPackages.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Decoration Required?</label>
                  <select
                    name="decorationRequired"
                    value={form.decorationRequired}
                    onChange={(e) => setForm({ ...form, decorationRequired: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                  >
                    {seasonData.bookingForm.decorationOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Sound System Required?</label>
                  <select
                    name="soundSystemRequired"
                    value={form.soundSystemRequired}
                    onChange={(e) => setForm({ ...form, soundSystemRequired: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* Estimated Total Price */}
            {activeSeason === 'haor' && priceSummary.subtotalAmount > 0 && (
              <div className="bg-[hsl(195,95%,95%)] border border-[hsl(195,85%,85%)] rounded-xl p-3 sm:p-4 my-2">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[hsl(197,80%,30%)]">Estimated Package Total:</div>
                  <div className="text-xs text-slate-500 mt-0.5">Final price and availability will be confirmed by Kuhelika team.</div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-4 text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">৳{priceSummary.subtotalAmount.toLocaleString()}</span>
                  </div>
                  {priceSummary.discountAmount > 0 ? (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                      <span>{priceSummary.discountReason}</span>
                      <span className="font-bold">-৳{priceSummary.discountAmount.toLocaleString()}</span>
                    </div>
                  ) : priceSummary.discountReason ? (
                    <div className="text-xs font-medium text-amber-700">{priceSummary.discountReason}</div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4 border-t border-[hsl(195,85%,85%)] pt-2 mt-2">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-[hsl(197,80%,30%)]">Payment Option</span>
                      <div className="flex items-center gap-4 mt-2 mb-1 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="advance" 
                            checked={form.paymentMode === 'advance'}
                            onChange={() => setForm(p => ({ ...p, paymentMode: 'advance' }))}
                            className="accent-[hsl(197,80%,30%)] w-4 h-4"
                          />
                          <span className="font-medium text-slate-700">50% Advance</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="full" 
                            checked={form.paymentMode === 'full'}
                            onChange={() => setForm(p => ({ ...p, paymentMode: 'full' }))}
                            className="accent-[hsl(197,80%,30%)] w-4 h-4"
                          />
                          <span className="font-medium text-slate-700">Full Payment</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[hsl(195,85%,85%)] pt-3 mt-1">
                    <span className="font-bold text-[hsl(197,80%,30%)] flex flex-col">
                      Payable total
                      <span className="text-[11px] font-medium text-slate-500">
                        {form.paymentMode === 'advance' ? '(50% Advance)' : '(Full Payment)'}
                      </span>
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[hsl(197,80%,30%)]">
                      ৳{payableAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Payment Method</span>
              </label>
              <input type="hidden" name="payment" value={form.payment} />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'bkash', label: 'bKash' },
                  { value: 'nagad', label: 'Nagad' },
                  { value: 'bank', label: 'Bank Transfer' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setForm({ ...form, payment: p.value })}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all min-h-[40px] ${
                      form.payment === p.value
                        ? 'border-[hsl(197,80%,38%)] bg-[hsl(195,95%,92%)] text-[hsl(197,80%,28%)]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              
              {/* Payment Info Display */}
              {form.payment && (
                <div className="mt-3 p-3 sm:p-4 rounded-xl bg-[hsl(197,80%,98%)] border border-[hsl(197,80%,90%)] text-sm text-slate-700">
                  {form.payment === 'bkash' && (
                    <div>
                      <p className="font-semibold mb-1">bKash Details</p>
                      <p className="whitespace-pre-wrap">{siteConfig.bkashNumber || 'Please contact for bKash details.'}</p>
                    </div>
                  )}
                  {form.payment === 'nagad' && (
                    <div>
                      <p className="font-semibold mb-1">Nagad Details</p>
                      <p className="whitespace-pre-wrap">{siteConfig.nagadNumber || 'Please contact for Nagad details.'}</p>
                    </div>
                  )}
                  {form.payment === 'bank' && (
                    <div>
                      <p className="font-semibold mb-1">Bank Transfer Details</p>
                      <p className="whitespace-pre-wrap">{siteConfig.bankInfo || 'Please contact for bank details.'}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[hsl(197,80%,90%)]">
                    <label className="block text-xs sm:text-sm font-semibold text-[hsl(197,80%,30%)] mb-1">Please provide the transaction ID here after making the payment</label>
                    <input
                      name="transactionId"
                      type="text"
                      value={form.transactionId}
                      onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                      placeholder="Transaction ID"
                      className="w-full px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[42px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              {submitError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,22%)] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl min-h-[46px]"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Book Now'}
              </button>

            </div>
            <p className="text-center text-xs text-slate-400 pb-1">
              We will confirm within 24 hours after your booking request.
            </p>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
