'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Facebook, Send, CircleCheck as CheckCircle2 } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { submitNetlifyForm } from '@/lib/netlifyForms';

interface ContactProps {
  onBookNow: () => void;
}

export default function Contact({ onBookNow }: ContactProps) {
  const { siteConfig, activeSeason, seasonData } = usePublicData();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [botField, setBotField] = useState('');
  const whatsappMessage = encodeURIComponent(
    activeSeason === 'padma'
      ? `Hello, I want to book a Padma River event cruise for ${siteConfig.name}. Please confirm availability and package details.`
      : `আসসালামু আলাইকুম! আমি ${siteConfig.name} এর হাওর/হাউসবোট বুকিং সম্পর্কে জানতে চাই।`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (botField) {
      setSent(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitNetlifyForm('contact-message', {
        ...form,
        submittedAt: new Date().toISOString(),
      });
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setForm({ name: '', phone: '', message: '' });
      setBotField('');
    } catch {
      setSubmitError('মেসেজ পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি ফোন/WhatsApp করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-28 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <Phone className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">Contact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            যোগাযোগ করুন
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            {seasonData.contact.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-5 gap-5 sm:gap-8">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[hsl(197,80%,30%)] flex items-center justify-center group-hover:shadow-md transition-shadow flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">ফোন করুন</div>
                <div className="font-bold text-slate-800 text-sm sm:text-base truncate">{siteConfig.phone}</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center group-hover:shadow-md transition-shadow flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">WhatsApp</div>
                <div className="font-bold text-slate-800 text-sm sm:text-base">WhatsApp-এ চ্যাট</div>
              </div>
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[hsl(38,90%,55%)] flex items-center justify-center group-hover:shadow-md transition-shadow flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">ইমেইল</div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{siteConfig.email}</div>
              </div>
            </a>

            <a
              href={siteConfig.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center group-hover:shadow-md transition-shadow flex-shrink-0">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Facebook</div>
                <div className="font-bold text-slate-800 text-sm sm:text-base">fb.com/kuhelika</div>
              </div>
            </a>

            <div className="flex items-start gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-100 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">অবস্থান</div>
                <div className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{seasonData.contact.location}</div>
                <div className="text-slate-500 text-xs mt-0.5">{seasonData.contact.pickup}</div>
              </div>
            </div>
          </div>

          {/* Right: Map + Form */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-5">
            {/* Map */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-slate-100 h-44 sm:h-52">
              <iframe
                src={seasonData.contact.mapEmbedUrl || siteConfig.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${seasonData.contact.location} location map`}
              />
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 p-4 sm:p-6">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-3 sm:mb-4">মেসেজ পাঠান</h3>

              {sent ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-700 font-medium text-sm sm:text-base">আপনার মেসেজ পাঠানো হয়েছে। ধন্যবাদ!</p>
                </div>
              ) : (
                <form
                  name="contact-message"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-3 sm:space-y-4"
                >
                  <input type="hidden" name="form-name" value="contact-message" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="আপনার নাম"
                      required
                      className="px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
                    />
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="ফোন নম্বর"
                      required
                      className="px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all min-h-[48px]"
                    />
                  </div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="আপনার মেসেজ বা প্রশ্ন লিখুন..."
                    required
                    rows={3}
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(197,80%,38%)] transition-all resize-none"
                  />
                  {submitError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {submitError}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,22%)] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg min-h-[48px]"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'পাঠানো হচ্ছে...' : 'মেসেজ পাঠান'}
                    </button>
                    <button
                      type="button"
                      onClick={onBookNow}
                      disabled={isSubmitting}
                      className="sm:flex-none flex items-center justify-center gap-2 bg-[hsl(38,90%,55%)] hover:bg-[hsl(35,90%,48%)] text-white font-bold px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-lg min-h-[48px]"
                    >
                      Book Now
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
