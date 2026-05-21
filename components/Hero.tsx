'use client';

import Image from 'next/image';
import { MapPin, BedDouble, Users, Banknote, ChevronDown, CalendarCheck } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

interface HeroProps {
  onBookNow: () => void;
}

export default function Hero({ onBookNow }: HeroProps) {
  const { siteConfig, cabins } = usePublicData();

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const startingPrice = cabins.length
    ? `৳${Math.min(...cabins.map((cabin) => cabin.pricePerNight)).toLocaleString()}`
    : siteConfig.startingPrice;

  const stats = [
    { icon: BedDouble, value: `${cabins.length || siteConfig.totalCabins} টি`, label: 'Premium Cabin' },
    { icon: Users, value: `${cabins.reduce((sum, cabin) => sum + cabin.capacity, 0) || siteConfig.totalCapacity} জন`, label: 'ক্যাপাসিটি' },
    { icon: Banknote, value: startingPrice, label: 'থেকে শুরু' },
    { icon: MapPin, value: 'Tanguar Haor', label: 'Sunamganj' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-kuhelika-houseboat.jpg"
          alt="কুহেলিকা হাউসবোট টাঙ্গুয়ার হাওরে"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/27 to-black/56" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,8%)]/60 via-[hsl(197,70%,12%)]/24 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-black/14" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 pt-28 pb-10 max-w-7xl mx-auto w-full">
        <div
          className="transition-all duration-1000 opacity-100 translate-y-0"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/35 rounded-full px-3 py-1.5 mb-5">
            <MapPin className="w-3.5 h-3.5 text-[hsl(38,90%,65%)] flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-semibold truncate text-shadow-soft">{siteConfig.locationEn}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-3 max-w-4xl text-shadow-strong">
            {siteConfig.name}
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl text-[hsl(38,95%,72%)] font-bold mb-4 max-w-3xl leading-snug text-shadow-strong">
            {siteConfig.tagline}
          </p>
          <p className="text-white/95 text-sm sm:text-base md:text-lg font-medium max-w-2xl leading-relaxed mb-8 text-shadow-soft">
            {siteConfig.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 mb-10 max-w-sm xs:max-w-none">
            <button
              onClick={onBookNow}
              className="flex-1 xs:flex-none px-6 py-3.5 sm:px-8 sm:py-4 bg-[hsl(38,90%,55%)] hover:bg-[hsl(35,90%,48%)] text-white font-bold text-base sm:text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <CalendarCheck className="w-5 h-5 flex-shrink-0" />
              এখনই বুক করুন
            </button>
            <button
              onClick={() => scrollToSection('#cabins')}
              className="flex-1 xs:flex-none px-6 py-3.5 sm:px-8 sm:py-4 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-bold text-base sm:text-lg rounded-full border border-white/40 hover:border-white/60 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] text-shadow-soft"
            >
              কেবিন দেখুন
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xs sm:max-w-none">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-[rgba(5,24,30,0.42)] backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl p-3 text-center hover:bg-[rgba(5,24,30,0.52)] transition-all duration-200"
                >
                  <div className="flex justify-center mb-1.5">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[hsl(197,80%,30%)]/80 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-white font-bold text-sm sm:text-base leading-none mb-1 text-shadow-soft">{stat.value}</div>
                  <div className="text-white/90 text-[10px] sm:text-xs font-medium leading-tight text-shadow-soft">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-6">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors text-shadow-soft"
        >
          <span className="text-[11px] sm:text-xs">নিচে স্ক্রোল করুন</span>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
