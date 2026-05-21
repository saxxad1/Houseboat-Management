'use client';

import Image from 'next/image';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

interface BookingCTAProps {
  onBookNow: () => void;
}

export default function BookingCTA({ onBookNow }: BookingCTAProps) {
  const { siteConfig } = usePublicData();

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Tanguar Haor night"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(197,80%,10%)]/88 to-[hsl(173,58%,15%)]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="h-px w-8 sm:w-16 bg-[hsl(38,90%,65%)]" />
          <span className="text-[hsl(38,90%,65%)] text-xs sm:text-sm font-semibold uppercase tracking-widest">আজই বুক করুন</span>
          <div className="h-px w-8 sm:w-16 bg-[hsl(38,90%,65%)]" />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight">
          আপনার টাঙ্গুয়ার হাওর ভ্রমণ{' '}
          <span className="text-[hsl(38,90%,65%)]">আজই বুক করুন</span>
        </h2>
        <p className="text-white/75 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
          সীমিত সিট বাকি। প্রিয়জনদের সাথে একটি অবিস্মরণীয় হাওর ভ্রমণের পরিকল্পনা করুন।
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <button
            onClick={onBookNow}
            className="flex items-center justify-center gap-2 bg-[hsl(38,90%,55%)] hover:bg-[hsl(35,90%,48%)] text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-2xl hover:shadow-amber-500/30 transition-all duration-200 transform hover:-translate-y-0.5 text-base sm:text-lg min-h-[52px]"
          >
            <CalendarCheck className="w-5 h-5 flex-shrink-0" />
            এখনই বুকিং করুন
          </button>
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/30 hover:border-white/50 transition-all duration-200 text-base sm:text-lg min-h-[52px]"
          >
            <Phone className="w-5 h-5 flex-shrink-0" />
            ফোন করুন
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 text-base sm:text-lg min-h-[52px]"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            WhatsApp
          </a>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-6 mt-8 sm:mt-12 text-white/60 text-xs sm:text-sm">
          <span>✓ তাৎক্ষণিক কনফার্মেশন</span>
          <span>✓ ৩০% অগ্রিম পেমেন্ট</span>
          <span>✓ ফ্রি ক্যান্সেলেশন</span>
          <span>✓ ২৪/৭ সাপোর্ট</span>
        </div>
      </div>
    </section>
  );
}
