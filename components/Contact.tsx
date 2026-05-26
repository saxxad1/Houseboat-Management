'use client';

import { Phone, MessageCircle, Mail, MapPin, Facebook } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

export default function Contact() {
  const { siteConfig, activeSeason, seasonData } = usePublicData();
  const whatsappMessage = encodeURIComponent(
    activeSeason === 'padma'
      ? `Hello, I want to book a Padma River event cruise for ${siteConfig.name}. Please confirm availability and package details.`
      : `Hello! I would like to know about haor/houseboat booking for ${siteConfig.name}.`
  );

  return (
    <section id="contact" className="py-8 md:py-12 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <Phone className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">Contact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Contact Us
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            {seasonData.contact.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Phone */}
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(197,80%,40%)] to-[hsl(197,80%,20%)] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-inner">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Call Us</div>
              <div className="font-extrabold text-slate-800 text-base truncate">{siteConfig.phone}</div>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-inner">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">WhatsApp</div>
              <div className="font-extrabold text-slate-800 text-base">Chat on WhatsApp</div>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${siteConfig.email}`}
            className="flex w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(38,90%,60%)] to-[hsl(35,90%,45%)] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-inner">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email</div>
              <div className="font-extrabold text-slate-800 text-sm sm:text-base truncate">{siteConfig.email}</div>
            </div>
          </a>

          {/* Facebook */}
          <a
            href={siteConfig.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(40%-1rem)] items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-inner">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Facebook</div>
              <div className="font-extrabold text-slate-800 text-base">fb.com/kuhelika</div>
            </div>
          </a>

          {/* Location */}
          <div className="flex w-full lg:w-[calc(60%-1rem)] items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-inner">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Location</div>
              <div className="font-extrabold text-slate-800 text-base leading-snug">{seasonData.contact.location}</div>
              <div className="text-slate-500 text-sm mt-0.5">{seasonData.contact.pickup}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
