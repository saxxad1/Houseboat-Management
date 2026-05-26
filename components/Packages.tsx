'use client';

import { Clock, Users, Utensils, MapPin, CircleCheck as CheckCircle, Package, Star } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { StaggerReveal } from '@/components/ScrollReveal';

interface PackagesProps {
  onBookNow: () => void;
}

const colorMap: Record<string, { bg: string; border: string; badge: string; btn: string }> = {
  sky: { bg: 'bg-sky-50/50', border: 'border-sky-200/50', badge: 'bg-sky-100 text-sky-700', btn: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/30' },
  teal: { bg: 'bg-teal-50/50', border: 'border-teal-200/50', badge: 'bg-teal-100 text-teal-700', btn: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-500/30' },
  amber: { bg: 'bg-amber-50/50', border: 'border-amber-200/50', badge: 'bg-amber-100 text-amber-700', btn: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/30' },
  emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-200/50', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30' },
  orange: { bg: 'bg-orange-50/50', border: 'border-orange-200/50', badge: 'bg-orange-100 text-orange-700', btn: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30' },
  slate: { bg: 'bg-slate-50/50', border: 'border-slate-200/50', badge: 'bg-slate-200 text-slate-700', btn: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-slate-700/30' },
};

type PackageDisplayFields = {
  priceDisplay?: string;
};

import React, { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{children: ReactNode, fallback: (error: Error) => ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Caught error:", error, errorInfo); }
  render() { 
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children; 
  }
}

export default function Packages({ onBookNow }: PackagesProps) {
  return (
    <ErrorBoundary fallback={(error) => (
      <div className="p-10 bg-red-50 text-red-600 rounded-xl m-10 border border-red-200 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Packages Section Crashed!</h2>
        <p className="font-mono text-sm break-all">{error.toString()}</p>
        <p className="font-mono text-sm mt-4 break-all">{error.stack}</p>
      </div>
    )}>
      <PackagesContent onBookNow={onBookNow} />
    </ErrorBoundary>
  );
}

function PackagesContent({ onBookNow }: PackagesProps) {
  const { packages, seasonData } = usePublicData();
  const section = seasonData.packagesSection as typeof seasonData.packagesSection & { is_active?: boolean };

  if (section && section.is_active === false) {
    return null;
  }

  return (
    <section id="packages" className="py-10 md:py-16 relative overflow-hidden bg-slate-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -right-[5%] w-[40%] max-w-[400px] aspect-square rounded-full bg-[hsl(197,80%,95%)]/80 blur-[80px]" />
        <div className="absolute bottom-[20%] -left-[10%] w-[50%] max-w-[500px] aspect-square rounded-full bg-[hsl(38,90%,95%)]/60 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full px-5 py-2 mb-6">
            <Package className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">{section.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 tracking-tight">
            {section.title}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {section.subtitle}
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        <StaggerReveal key={packages.map(p => (p as any).id).join('-')} className="grid md:grid-cols-2 gap-6 sm:gap-8" itemClassName="h-full">
          {packages.map((pkg) => {
            const display = pkg as typeof pkg & PackageDisplayFields;
            const c = colorMap[pkg.color] || colorMap.sky;
            return (
              <div
                key={pkg.id}
                className={`relative h-full rounded-[2rem] border overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-white/80 backdrop-blur-xl group ${
                  pkg.popular
                    ? 'border-[hsl(38,90%,55%)] shadow-xl shadow-[hsl(38,90%,55%)]/20'
                    : `${c.border} shadow-lg shadow-slate-200/50`
                }`}
              >
                {/* Popular banner */}
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[hsl(38,90%,55%)] to-[hsl(35,90%,48%)] text-white text-center text-[10px] sm:text-xs font-black py-2 tracking-widest uppercase z-10 shadow-sm">
                    <Star className="w-3 h-3 inline mr-1.5 fill-current mb-0.5" />
                    {pkg.badge}
                  </div>
                )}

                <div className={`p-6 sm:p-8 flex flex-col flex-1 ${pkg.popular ? 'pt-10 sm:pt-12' : ''} ${c.bg}`}>
                  {/* Badge */}
                  {pkg.badge && !pkg.popular && (
                    <span className={`inline-block self-start px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-4 shadow-sm ${c.badge}`}>
                      {pkg.badge}
                    </span>
                  )}

                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-5 tracking-tight">{pkg.title}</h3>

                  {/* Price */}
                  <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white shadow-inner">
                    <div className="text-3xl sm:text-4xl font-black text-[hsl(197,80%,28%)] tracking-tighter">
                      {display.priceDisplay || `৳${(display.price || 0).toLocaleString()}`}
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">{pkg.priceNote}</p>
                  </div>

                  {/* Quick Info Grid - Glass style */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border border-white/50 bg-white/40 shadow-sm backdrop-blur-sm`}>
                      <Clock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{pkg.duration}</span>
                    </div>
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border border-white/50 bg-white/40 shadow-sm backdrop-blur-sm`}>
                      <Users className="w-4 h-4 text-slate-700 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{pkg.maxGuests} Persons</span>
                    </div>
                    <div className={`col-span-2 flex items-center gap-2 rounded-xl px-3 py-2 border border-white/50 bg-white/40 shadow-sm backdrop-blur-sm`}>
                      <Utensils className="w-4 h-4 text-slate-700 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{pkg.meals}</span>
                    </div>
                  </div>

                  {/* Includes */}
                  <div className="mb-6 bg-white/30 rounded-2xl p-4 border border-white/50">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Included Amenities</p>
                    <ul className="space-y-2">
                      {pkg.includes.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5 drop-shadow-sm" />
                          {item}
                        </li>
                      ))}
                      {pkg.includes.length > 5 && (
                        <li className="text-xs font-semibold text-slate-400 pl-6 mt-2">
                          +{pkg.includes.length - 5} More Amenities...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Spots */}
                  <div className="mb-8">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Destinations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.spots.map((spot) => (
                        <span key={spot} className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-600 bg-white shadow-sm border border-slate-100 rounded-full px-2.5 py-1">
                          <MapPin className="w-3 h-3 text-[hsl(197,80%,40%)] flex-shrink-0" />
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={onBookNow}
                    className={`mt-auto w-full py-4 rounded-xl sm:rounded-2xl text-white font-black text-sm sm:text-base transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1 min-h-[52px] ${c.btn}`}
                  >
                    Book This Package
                  </button>
                </div>
              </div>
            );
          })}
        </StaggerReveal>

        <div className="mt-10 sm:mt-12 flex justify-center">
          <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-full px-6 py-3 shadow-sm inline-block">
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              {section.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
