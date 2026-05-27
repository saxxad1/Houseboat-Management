'use client';

import Image from 'next/image';
import {
  Bath, BedDouble, ShieldCheck, Utensils, Wind, Zap,
  Flame, Music, Droplets, Phone, Baby, Map, Star, Coffee, Camera, Users
} from 'lucide-react';
import { StaggerReveal } from '@/components/ScrollReveal';
import { usePublicData } from '@/components/PublicDataProvider';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bath, BedDouble, ShieldCheck, Utensils, Wind, Zap,
  Flame, Music, Droplets, Phone, Baby, Map, Star, Coffee, Camera, Users,
};

export default function Facilities() {
  const { seasonData } = usePublicData();
  const facilities = seasonData.facilities;
  const section = seasonData.facilitiesSection;

  return (
    <section id="facilities" className="py-10 md:py-16 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <ShieldCheck className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{section.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {section.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {section.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        <StaggerReveal className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4" stagger={0.045} itemClassName="h-full">
          {facilities.map((facility, i) => {
            const Icon = iconMap[facility.icon] || ShieldCheck;
            return (
              <div
                key={i}
                className="h-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group flex flex-col items-center justify-start"
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

      </div>
    </section>
  );
}
