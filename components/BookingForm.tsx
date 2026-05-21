'use client';

import { useState } from 'react';
import { X, CircleCheck as CheckCircle2, Send, MessageCircle, Phone, User, CalendarCheck, Users, Anchor, BedDouble, Package, CreditCard, FileText } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { submitNetlifyForm } from '@/lib/netlifyForms';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialForm = {
  name: '',
  phone: '',
  email: '',
  checkin: '',
  checkout: '',
  guests: '2',
  bookingType: 'cabin',
  cabin: '',
  package: '',
  request: '',
  payment: 'bkash',
};

export default function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const { siteConfig, cabins, packages } = usePublicData();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [botField, setBotField] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'নাম দিন';
    if (!form.phone.trim()) newErrors.phone = 'ফোন নম্বর দিন';
    if (!form.checkin) newErrors.checkin = 'Check-in তারিখ দিন';
    if (!form.checkout) newErrors.checkout = 'Check-out তারিখ দিন';
    if (form.checkin && form.checkout && form.checkout <= form.checkin) {
      newErrors.checkout = 'Check-out তারিখ Check-in এর পরে দিন';
    }
    return newErrors;
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
      await submitNetlifyForm('booking-request', {
        ...form,
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('বুকিং রিকোয়েস্ট পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildWhatsappMessage = () => {
    const msg = `আসসালামু আলাইকুম,
আমি *${siteConfig.name}* এ বুকিং করতে চাই।

*নাম:* ${form.name}
*ফোন:* ${form.phone}
*Check-in:* ${form.checkin}
*Check-out:* ${form.checkout}
*অতিথি সংখ্যা:* ${form.guests} জন
*বুকিং ধরন:* ${form.bookingType === 'full' ? 'Full Boat' : 'Cabin Wise'}
${form.cabin ? `*কেবিন:* ${form.cabin}` : ''}
${form.package ? `*প্যাকেজ:* ${form.package}` : ''}
*পেমেন্ট:* ${form.payment}
${form.request ? `*বিশেষ অনুরোধ:* ${form.request}` : ''}

ধন্যবাদ।`;
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
        className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[hsl(197,80%,28%)] to-[hsl(173,58%,40%)] p-4 sm:p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">বুকিং রিকোয়েস্ট</h2>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5">{siteConfig.name} · {siteConfig.locationEn}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors min-w-[36px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">বুকিং রিকোয়েস্ট পাঠানো হয়েছে!</h3>
            <p className="text-slate-500 text-sm sm:text-base mb-5 sm:mb-6">
              আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। WhatsApp-এ সরাসরি কথা বলতে পারেন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleWhatsapp}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 sm:px-6 py-3 rounded-2xl transition-colors min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp-এ যোগাযোগ করুন
              </button>
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 sm:px-6 py-3 rounded-2xl transition-colors min-h-[48px]"
              >
                বন্ধ করুন
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
            className="p-4 sm:p-6 space-y-4"
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
            {/* Row: Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />পুরো নাম *</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  placeholder="আপনার নাম লিখুন"
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px] ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />ফোন নম্বর *</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px] ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">ইমেইল (ঐচ্ছিক)</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
              />
            </div>

            {/* Row: Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />Check-in *</span>
                </label>
                <input
                  name="checkin"
                  type="date"
                  value={form.checkin}
                  onChange={(e) => { setForm({ ...form, checkin: e.target.value }); setErrors({ ...errors, checkin: '' }); }}
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px] ${errors.checkin ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.checkin && <p className="text-red-500 text-xs mt-1">{errors.checkin}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />Check-out *</span>
                </label>
                <input
                  name="checkout"
                  type="date"
                  value={form.checkout}
                  onChange={(e) => { setForm({ ...form, checkout: e.target.value }); setErrors({ ...errors, checkout: '' }); }}
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px] ${errors.checkout ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.checkout && <p className="text-red-500 text-xs mt-1">{errors.checkout}</p>}
              </div>
            </div>

            {/* Row: Guests & Booking Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />অতিথির সংখ্যা</span>
                </label>
                <select
                  name="guests"
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
                >
                  {[1,2,3,4,5,6,8,10,12,15,20,24].map((n) => (
                    <option key={n} value={n}>{n} জন</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Anchor className="w-3.5 h-3.5" />বুকিং ধরন</span>
                </label>
                <select
                  name="bookingType"
                  value={form.bookingType}
                  onChange={(e) => setForm({ ...form, bookingType: e.target.value })}
                  className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
                >
                  <option value="cabin">কেবিন বুকিং</option>
                  <option value="full">পুরো বোট (Full Boat)</option>
                </select>
              </div>
            </div>

            {/* Cabin Select */}
            {form.bookingType === 'cabin' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" />কেবিন বেছে নিন</span>
                </label>
                <select
                  name="cabin"
                  value={form.cabin}
                  onChange={(e) => setForm({ ...form, cabin: e.target.value })}
                  className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
                >
                  <option value="">-- কেবিন সিলেক্ট করুন --</option>
                  {cabins.filter((c) => c.available).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} – ৳{c.pricePerNight.toLocaleString()}/রাত
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Package Select */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />প্যাকেজ (ঐচ্ছিক)</span>
              </label>
              <select
                name="package"
                value={form.package}
                onChange={(e) => setForm({ ...form, package: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
              >
                <option value="">-- প্যাকেজ সিলেক্ট করুন --</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title} – ৳{p.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />পেমেন্ট পদ্ধতি</span>
              </label>
              <input type="hidden" name="payment" value={form.payment} />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'bkash', label: 'bKash' },
                  { value: 'nagad', label: 'Nagad' },
                  { value: 'bank', label: 'Bank Transfer' },
                  { value: 'cash', label: 'Cash' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setForm({ ...form, payment: p.value })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all min-h-[44px] ${
                      form.payment === p.value
                        ? 'border-[hsl(197,80%,38%)] bg-[hsl(195,95%,92%)] text-[hsl(197,80%,28%)]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Request */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />বিশেষ অনুরোধ (ঐচ্ছিক)</span>
              </label>
              <textarea
                name="request"
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
                placeholder="বার্থডে ডেকোরেশন, হালাল খাবার..."
                rows={3}
                className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all resize-none"
              />
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
                className="w-full flex items-center justify-center gap-2 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,22%)] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl min-h-[52px]"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'বুকিং রিকোয়েস্ট পাঠান'}
              </button>
              <button
                type="button"
                onClick={handleWhatsapp}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 sm:py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl min-h-[52px]"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp-এ বুক করুন
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 pb-1">
              বুকিং রিকোয়েস্টের পর আমরা ২৪ ঘণ্টার মধ্যে কনফার্ম করব।
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
