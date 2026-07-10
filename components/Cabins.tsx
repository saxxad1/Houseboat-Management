'use client';

import Image from 'next/image';
import { BedDouble, Users, Wind, CircleCheck as CheckCircle, Anchor, ChevronLeft, ChevronRight, Utensils, Map, Star } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { padmaTripOverview } from '@/data/seasonalData';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';

interface CabinsProps {
  onBookNow: (cabin?: string, type?: 'cabin' | 'full') => void;
}

const badgeStyles: Record<string, string> = {
  Premium: 'bg-[hsl(38,90%,55%)] text-white shadow-md shadow-[hsl(38,90%,55%)]/30',
  Popular: 'bg-[hsl(197,80%,40%)] text-white shadow-md shadow-[hsl(197,80%,40%)]/30',
  Deluxe: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
  Family: 'bg-rose-500 text-white shadow-md shadow-rose-500/30',
};

type CabinDisplayFields = {
  id: string | number;
  image: string;
  name: string;
  nameEn: string;
  size?: string;
  badge?: string;
  available: boolean;
  mainPrice: string;
  priceLabel?: string;
  price2Pax?: string;
  price3Pax?: string;
  rawPrice2Pax?: number;
  rawPrice3Pax?: number;
  bedType: string;
  capacity: string | number;
  capacityLabel?: string;
  bath: string;
  ac: string;
  features: string[];
  buttonLabel?: string;
};

function CabinCard({
  display,
  isPadma,
  onBookNow,
}: {
  display: CabinDisplayFields;
  isPadma: boolean;
  onBookNow: (cabinName?: string) => void;
}) {
  const imageStr = typeof display.image === 'string' ? display.image : '';
  const rawImages = imageStr.split(',').map((img) => img.trim()).filter(Boolean);
  const showCarousel = rawImages.length > 1;
  
  // Embla needs enough slides to loop seamlessly. If there are only 2 or 3 images, 
  // duplicate them to ensure perfect infinite scrolling without rewinding.
  const images = rawImages.length > 1 && rawImages.length < 4 
    ? [...rawImages, ...rawImages] 
    : rawImages;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 15 });

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (emblaApi) emblaApi.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (emblaApi) emblaApi.scrollNext();
    },
    [emblaApi]
  );

  const { siteConfig } = usePublicData();
  const todayLocalStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  const isPromoActive = Boolean(
    siteConfig.promoDiscountStartDate && 
    siteConfig.promoDiscountEndDate && 
    todayLocalStr >= siteConfig.promoDiscountStartDate && 
    todayLocalStr <= siteConfig.promoDiscountEndDate &&
    siteConfig.promoDiscountPercent && 
    siteConfig.promoDiscountPercent > 0
  );
  const promoText = siteConfig.promoDiscountTitle || `${siteConfig.promoDiscountPercent}% Promotional Discount`;

  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2 border border-white flex flex-col group">
      {/* Image Carousel */}
      <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-[2rem]">
        {showCarousel ? (
          <div className="h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="relative flex-[0_0_100%] h-full min-w-0">
                  <Image
                    src={img || '/images/floatboat/cabins/cabin-01.jpg'}
                    alt={`${display.name} image ${idx + 1}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    unoptimized={img?.includes('supabase.co') || typeof img === 'string' && img.startsWith('http')}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Image
            src={images[0] || display.image || '/images/floatboat/cabins/cabin-01.jpg'}
            alt={display.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized={(images[0] || display.image)?.includes('supabase.co') || typeof (images[0] || display.image) === 'string' && (images[0] || display.image).startsWith('http')}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 pointer-events-none" />

        {/* Carousel Navigation */}
        {showCarousel && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[80%] z-10 pointer-events-none">
          {display.badge && (
            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wide uppercase ${badgeStyles[display.badge] || 'bg-slate-700 text-white'}`}>
              {display.badge}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wide uppercase shadow-md ${display.available ? 'bg-emerald-500/90 backdrop-blur text-white shadow-emerald-500/30' : 'bg-rose-500/90 backdrop-blur text-white shadow-rose-500/30'}`}>
            {display.available ? 'Available' : 'Booked'}
          </span>
        </div>

        {/* Name overlaid on image */}
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow-md">{display.name}</h3>
          {display.size && <p className="text-white/80 text-xs sm:text-sm font-medium">{display.size}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 bg-white/50">
        {/* Price floating badge */}
        <div className="-mt-10 sm:-mt-12 mb-5 mx-auto w-full max-w-[280px] sm:max-w-none sm:w-fit sm:ml-auto sm:mr-0 bg-white shadow-xl shadow-slate-200/50 rounded-2xl px-4 py-3 border border-slate-100 flex flex-col items-center justify-center transform group-hover:-translate-y-1 transition-transform relative z-10">
          <div className="text-[10px] font-extrabold text-[hsl(197,80%,38%)] bg-[hsl(195,95%,92%)] px-2 py-0.5 rounded-full mb-1">
            {isPadma ? 'Day Long Trip' : '2 Days 1 Night'}
          </div>
          {!isPadma && (
            <div className="mb-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
              {isPromoActive ? promoText : '10% off on weekdays'}
            </div>
          )}
          {display.rawPrice2Pax || display.rawPrice3Pax ? (
            <div className="flex flex-col items-end gap-1.5 py-0.5">
              {display.rawPrice2Pax && (
                <div className="flex items-baseline gap-1">
                  {isPromoActive && siteConfig.promoDiscountPercent ? (
                    <>
                      <span className="text-slate-400 font-semibold text-xs sm:text-sm leading-none line-through mr-1">
                        ৳{display.rawPrice2Pax.toLocaleString()}
                      </span>
                      <span className="text-[hsl(197,80%,30%)] font-black text-sm sm:text-base leading-none">
                        ৳{Math.round(display.rawPrice2Pax * (1 - siteConfig.promoDiscountPercent / 100)).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-[hsl(197,80%,30%)] font-black text-sm sm:text-base leading-none">
                      ৳{display.rawPrice2Pax.toLocaleString()}
                    </span>
                  )}
                  <span className="text-slate-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                    / person (2 persons)
                  </span>
                </div>
              )}
              {display.rawPrice3Pax && (
                <div className="flex items-baseline gap-1">
                  {isPromoActive && siteConfig.promoDiscountPercent ? (
                    <>
                      <span className="text-slate-400 font-semibold text-xs sm:text-sm leading-none line-through mr-1">
                        ৳{display.rawPrice3Pax.toLocaleString()}
                      </span>
                      <span className="text-[hsl(197,80%,30%)] font-black text-sm sm:text-base leading-none">
                        ৳{Math.round(display.rawPrice3Pax * (1 - siteConfig.promoDiscountPercent / 100)).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-[hsl(197,80%,30%)] font-black text-sm sm:text-base leading-none">
                      ৳{display.rawPrice3Pax.toLocaleString()}
                    </span>
                  )}
                  <span className="text-slate-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                    / person (3 persons)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              {isPromoActive && siteConfig.promoDiscountPercent && display.mainPrice.includes('৳') ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold text-sm line-through">
                    {display.mainPrice}
                  </span>
                  <span className="text-[hsl(197,80%,30%)] font-black text-lg sm:text-xl leading-none">
                    ৳{Math.round(parseInt(display.mainPrice.replace(/\D/g, '')) * (1 - siteConfig.promoDiscountPercent / 100)).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-[hsl(197,80%,30%)] font-black text-lg sm:text-xl leading-none">
                  {display.mainPrice}
                </span>
              )}
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                {display.priceLabel || '/Night'}
              </span>
            </>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 mt-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
            <BedDouble className="w-4 h-4 text-[hsl(197,80%,38%)] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{display.bedType}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
            <Users className="w-4 h-4 text-[hsl(197,80%,38%)] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{display.capacityLabel || display.capacity}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{display.bath}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100/50">
            {typeof display.ac === 'string' && display.ac.includes('Non-AC') ? (
              <Wind className="w-4 h-4 text-slate-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-xs sm:text-sm font-semibold text-slate-700">{display.ac || 'N/A'}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mt-auto mb-6">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm px-4 py-1.5 rounded-full font-extrabold shadow-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Food Included
          </span>
        </div>

        <button
          onClick={() => onBookNow(display.name)}
          disabled={!display.available}
          className={`mt-auto w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 min-h-[48px] shadow-lg ${
            display.available
              ? 'bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,35%)] text-white hover:shadow-[hsl(197,80%,30%)]/40 hover:-translate-y-1'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
          }`}
        >
          {display.available ? (display.buttonLabel || 'Book This Cabin') : 'Booked Out'}
        </button>
      </div>
    </div>
  );
}

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

export default function Cabins({ onBookNow }: CabinsProps) {
  return (
    <ErrorBoundary fallback={(error) => (
      <div className="p-10 bg-red-50 text-red-600 rounded-xl m-10 border border-red-200 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cabin Section Crashed!</h2>
        <p className="font-mono text-sm break-all">{error.toString()}</p>
        <p className="font-mono text-sm mt-4 break-all">{error.stack}</p>
      </div>
    )}>
      <CabinsContent onBookNow={onBookNow} />
    </ErrorBoundary>
  );
}

function CabinsContent({ onBookNow }: CabinsProps) {
  const { cabins, activeSeason, seasonData } = usePublicData();
  const section = seasonData.cabinsSection;
  const isPadma = activeSeason === 'padma';
  const padmaRoomInfo = [
    { icon: BedDouble, title: '8 Attached Rooms', desc: 'Rooms are available as shared fresh-up, changing, and rest facilities during the Day Long trip.' },
    { icon: Users, title: '4-6 Person Sharing', desc: 'Rooms are allocated on sharing basis according to group size and operational flow.' },
    { icon: CheckCircle, title: 'Separate Room Allocation', desc: 'Male and female guests are kept in separate rooms. Mixed male/female sharing in the same room is not allowed.' },
  ];
  const padmaOverviewIcons = { Utensils, Map, Star };

  return (
    <section id="cabins" className="py-10 md:py-16 bg-gradient-to-b from-[hsl(195,100%,97%)] to-white relative overflow-hidden">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -left-[10%] w-[40%] max-w-[500px] aspect-square rounded-full bg-[hsl(173,58%,95%)]/60 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] max-w-[600px] aspect-square rounded-full bg-[hsl(38,90%,95%)]/60 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-full px-4 py-1.5 mb-4">
            <Anchor className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{section.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            {section.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {section.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-5" />
        </div>

        {isPadma ? (
          <>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-5 sm:mb-6">
              {padmaRoomInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white/90 border border-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${
                      index === 0 ? 'bg-gradient-to-br from-sky-600 to-cyan-500' : index === 1 ? 'bg-gradient-to-br from-teal-600 to-emerald-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-10 md:mb-12">
              {padmaTripOverview.map((item) => {
                const Icon = padmaOverviewIcons[item.icon as keyof typeof padmaOverviewIcons] || Star;
                return (
                  <div key={item.title} className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-100 p-5 sm:p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-[hsl(195,95%,92%)] flex items-center justify-center text-[hsl(197,80%,30%)]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-slate-800 text-base sm:text-lg">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-[hsl(197,80%,24%)] via-[hsl(190,80%,34%)] to-[hsl(173,58%,35%)] rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-10 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-[hsl(197,80%,30%)]/30">
              <div className="absolute inset-x-8 top-0 h-px bg-white/25" />
              <div className="absolute right-6 top-6 rounded-full border border-white/15 px-4 py-1 text-xs font-bold text-white/80">Day Long Cruise</div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight drop-shadow-md">{section.fullBoatTitle}</h3>
                <p className="text-white/82 text-sm sm:text-base md:text-lg font-medium mb-7 drop-shadow-sm">
                  {section.fullBoatDescription}
                </p>
                <button
                  onClick={() => onBookNow(undefined, 'full')}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[hsl(38,90%,55%)] to-[hsl(35,90%,48%)] hover:from-[hsl(38,90%,60%)] hover:to-[hsl(35,90%,50%)] text-white font-bold px-7 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-xl shadow-[hsl(35,90%,48%)]/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-h-[52px] text-base sm:text-lg"
                >
                  <Anchor className="w-5 h-5 flex-shrink-0" />
                  {section.fullBoatButton}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
        {/* Booking Type Info - Glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 md:mb-16">
          <div className="glass-panel rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(195,95%,92%)] to-[hsl(195,85%,85%)] flex items-center justify-center flex-shrink-0 shadow-inner">
              <BedDouble className="w-5 h-5 text-[hsl(197,80%,30%)]" />
            </div>
            <div>
              <div className="font-extrabold text-slate-800 text-base">{section.bookingCards[0].title}</div>
              <div className="text-slate-500 text-sm">{section.bookingCards[0].desc}</div>
            </div>
          </div>
          <div className="glass-panel rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(38,90%,90%)] to-[hsl(35,90%,80%)] flex items-center justify-center flex-shrink-0 shadow-inner">
              <Anchor className="w-5 h-5 text-[hsl(35,90%,45%)]" />
            </div>
            <div>
              <div className="font-extrabold text-slate-800 text-base">{section.bookingCards[1].title}</div>
              <div className="text-slate-500 text-sm">{section.bookingCards[1].desc}</div>
            </div>
          </div>
        </div>

        {/* Cabin Grid - Modern Card Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cabins.map((cabin) => {
            const display = cabin as any;
            return (
              <div key={display.id} className="min-w-0 h-full">
                <CabinCard display={display} isPadma={isPadma} onBookNow={onBookNow} />
              </div>
            );
          })}
        </div>

        {/* Full Boat CTA - Aesthetic Gradient Card */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-[hsl(197,80%,25%)] via-[hsl(197,80%,32%)] to-[hsl(173,58%,35%)] rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-[hsl(197,80%,30%)]/30">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[hsl(38,90%,55%)]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">{section.fullBoatTitle}</h3>
            <p className="text-white/80 text-base sm:text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto drop-shadow-sm">
              {section.fullBoatDescription}
            </p>
            <button
              onClick={() => onBookNow(undefined, 'full')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[hsl(38,90%,55%)] to-[hsl(35,90%,48%)] hover:from-[hsl(38,90%,60%)] hover:to-[hsl(35,90%,50%)] text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-full shadow-xl shadow-[hsl(35,90%,48%)]/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 min-h-[56px] text-lg"
            >
              <Anchor className="w-5 h-5 flex-shrink-0" />
              {section.fullBoatButton}
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  );
}
