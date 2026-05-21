'use client';

import Image from 'next/image';
import {
  Bath, BedDouble, ShieldCheck, Utensils, Wind, Zap,
  Flame, Music, Droplets, Phone, Baby, Map
} from 'lucide-react';
import { facilities } from '@/data/houseboatData';
import { StaggerReveal } from '@/components/ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bath, BedDouble, ShieldCheck, Utensils, Wind, Zap,
  Flame, Music, Droplets, Phone, Baby, Map,
};

export default function Facilities() {
  return (
    <section id="facilities" className="py-16 md:py-28 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <ShieldCheck className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">Facilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            আমাদের সুবিধাসমূহ
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            আপনার আরাম ও নিরাপত্তার জন্য আমরা সর্বোচ্চ সুবিধা নিশ্চিত করি।
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        <StaggerReveal className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4" stagger={0.045}>
          {facilities.map((facility, i) => {
            const Icon = iconMap[facility.icon] || ShieldCheck;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:shadow-md transition-shadow">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-0.5 sm:mb-1 leading-tight">{facility.name}</h3>
                <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed hidden sm:block">{facility.desc}</p>
              </div>
            );
          })}
        </StaggerReveal>

        {/* Bottom Banner */}
        <div className="mt-10 sm:mt-14 relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <Image
            src="https://images.pexels.com/photos/1822605/pexels-photo-1822605.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Houseboat rooftop"
            width={1400}
            height={600}
            sizes="100vw"
            className="h-44 w-full object-cover sm:h-56 md:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,10%)]/80 to-[hsl(197,80%,10%)]/40" />
          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-12">
            <h3 className="text-white text-lg sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2 max-w-lg">
              প্রতিটি সুবিধা আপনার জন্যই
            </h3>
            <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-md">
              আমরা বিশ্বাস করি যে একটি আদর্শ ভ্রমণ শুধু গন্তব্য নয়, যাত্রার প্রতিটি মুহূর্ত সুন্দর হওয়া উচিত।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
