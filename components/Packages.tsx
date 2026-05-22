'use client';

import { Clock, Users, Utensils, MapPin, CircleCheck as CheckCircle, Package, Star } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { StaggerReveal } from '@/components/ScrollReveal';

interface PackagesProps {
  onBookNow: () => void;
}

const colorMap: Record<string, { bg: string; border: string; badge: string; btn: string }> = {
  sky: { bg: 'bg-sky-50', border: 'border-sky-100', badge: 'bg-sky-100 text-sky-700', btn: 'bg-sky-600 hover:bg-sky-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-100', badge: 'bg-teal-100 text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-600 hover:bg-orange-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800' },
};

type PackageDisplayFields = {
  priceDisplay?: string;
};

export default function Packages({ onBookNow }: PackagesProps) {
  const { packages, seasonData } = usePublicData();
  const section = seasonData.packagesSection;

  return (
    <section id="packages" className="py-16 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(195,95%,92%)] rounded-full px-4 py-1.5 mb-4">
            <Package className="w-4 h-4 text-[hsl(197,80%,30%)]" />
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

        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" itemClassName="h-full">
          {packages.map((pkg) => {
            const display = pkg as typeof pkg & PackageDisplayFields;
            const c = colorMap[pkg.color] || colorMap.sky;
            return (
              <div
                key={pkg.id}
                className={`relative h-full rounded-2xl sm:rounded-3xl border-2 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  pkg.popular
                    ? 'border-[hsl(197,80%,38%)] shadow-lg shadow-[hsl(197,80%,38%)]/20'
                    : `${c.border} shadow-md`
                }`}
              >
                {/* Popular banner */}
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[hsl(197,80%,30%)] text-white text-center text-xs font-bold py-1.5 tracking-wide z-10">
                    <Star className="w-3 h-3 inline mr-1 fill-current" />
                    {pkg.badge}
                  </div>
                )}

                <div className={`p-4 sm:p-6 flex flex-col flex-1 ${pkg.popular ? 'pt-9 sm:pt-10' : ''} ${c.bg}`}>
                  {/* Badge */}
                  {pkg.badge && !pkg.popular && (
                    <span className={`inline-block self-start px-2.5 py-1 rounded-full text-xs font-bold mb-2 sm:mb-3 ${c.badge}`}>
                      {pkg.badge}
                    </span>
                  )}

                  <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-1">{pkg.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">{pkg.titleEn}</p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-black text-[hsl(197,80%,28%)]">
                      {display.priceDisplay || `৳${display.price.toLocaleString()}`}
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{pkg.priceNote}</p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4">
                    <div className={`flex items-center gap-1.5 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 ${c.badge}`}>
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs font-medium truncate">{pkg.duration}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 ${c.badge}`}>
                      <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs font-medium">{pkg.maxGuests} জন</span>
                    </div>
                    <div className={`col-span-2 flex items-center gap-1.5 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 ${c.badge}`}>
                      <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs font-medium truncate">{pkg.meals}</span>
                    </div>
                  </div>

                  {/* Includes */}
                  <div className="mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">অন্তর্ভুক্ত সুবিধা</p>
                    <ul className="space-y-1 sm:space-y-1.5">
                      {pkg.includes.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                      {pkg.includes.length > 5 && (
                        <li className="text-xs text-slate-400 pl-5">
                          +{pkg.includes.length - 5} আরও সুবিধা...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Spots */}
                  <div className="mb-4 sm:mb-5">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">ভ্রমণস্থান</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.spots.map((spot) => (
                        <span key={spot} className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-slate-600 bg-white/70 border border-slate-200 rounded-full px-2 py-0.5 sm:py-1">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[hsl(197,80%,38%)] flex-shrink-0" />
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={onBookNow}
                    className={`mt-auto w-full py-3 rounded-xl sm:rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 min-h-[44px] ${c.btn}`}
                  >
                    এই প্যাকেজ বুক করুন
                  </button>
                </div>
              </div>
            );
          })}
        </StaggerReveal>

        <p className="text-center text-slate-400 text-xs sm:text-sm mt-6 sm:mt-8">
          {section.note}
        </p>
      </div>
    </section>
  );
}
