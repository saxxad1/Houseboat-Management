'use client';

import Image from 'next/image';
import { BedDouble, Users, Bath, Wind, CircleCheck as CheckCircle, Circle as XCircle, Banknote, Anchor } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { StaggerReveal } from '@/components/ScrollReveal';

interface CabinsProps {
  onBookNow: () => void;
}

const badgeStyles: Record<string, string> = {
  Premium: 'bg-[hsl(38,90%,55%)] text-white',
  Popular: 'bg-[hsl(197,80%,30%)] text-white',
  Deluxe: 'bg-emerald-600 text-white',
  Family: 'bg-rose-500 text-white',
};

type CabinDisplayFields = {
  priceLabel?: string;
  capacityLabel?: string;
  buttonLabel?: string;
};

export default function Cabins({ onBookNow }: CabinsProps) {
  const { cabins, activeSeason, seasonData } = usePublicData();
  const section = seasonData.cabinsSection;
  const isPadma = activeSeason === 'padma';

  return (
    <section id="cabins" className="py-16 md:py-28 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <Anchor className="w-4 h-4 text-[hsl(197,80%,30%)]" />
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

        {/* Booking Type Info */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-3 bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[hsl(195,95%,92%)] flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(197,80%,30%)]" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{section.bookingCards[0].title}</div>
              <div className="text-slate-500 text-xs">{section.bookingCards[0].desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm border border-slate-100">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[hsl(38,90%,90%)] flex items-center justify-center flex-shrink-0">
              <Anchor className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(35,90%,48%)]" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{section.bookingCards[1].title}</div>
              <div className="text-slate-500 text-xs">{section.bookingCards[1].desc}</div>
            </div>
          </div>
        </div>

        {/* Cabin Grid */}
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" itemClassName="h-full">
          {cabins.map((cabin) => {
            const display = cabin as typeof cabin & CabinDisplayFields;
            return (
            <div
              key={display.id}
              className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-52 overflow-hidden">
                <Image
                  src={display.image}
                  alt={display.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap max-w-[70%]">
                  {display.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeStyles[display.badge] || 'bg-slate-700 text-white'}`}>
                      {display.badge}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${display.available ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {display.available ? 'Available' : 'Booked'}
                  </span>
                </div>

                {/* Price badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-1">
                  <span className="text-[hsl(197,80%,28%)] font-bold text-xs sm:text-sm">
                    {display.priceLabel || `৳${display.pricePerNight.toLocaleString()}`}
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-xs">
                    {isPadma ? '' : '/রাত'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-0.5">{display.name}</h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-3">{display.nameEn} · {display.size}</p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                    <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(197,80%,38%)] flex-shrink-0" />
                    <span className="truncate">{display.bedType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(197,80%,38%)] flex-shrink-0" />
                    <span>{display.capacityLabel || `${display.capacity} জন`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                    {display.hasWashroom ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-600">{isPadma ? 'Washroom support' : 'প্রাইভেট বাথরুম'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 flex-shrink-0" />
                        <span className="text-slate-400">{isPadma ? 'Custom setup' : 'শেয়ার্ড বাথরুম'}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                    {display.hasAC ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-600">{isPadma ? 'AC support' : 'এসি'}</span>
                      </>
                    ) : (
                      <>
                        <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500">{isPadma ? 'Open-air' : 'নন-এসি'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4">
                  {display.features.map((f) => (
                    <span
                      key={f}
                      className="bg-[hsl(195,95%,92%)] text-[hsl(197,80%,28%)] text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={onBookNow}
                  disabled={!display.available}
                  className={`mt-auto w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm transition-all duration-200 min-h-[44px] ${
                    display.available
                      ? 'bg-[hsl(197,80%,30%)] text-white hover:bg-[hsl(197,80%,22%)] hover:shadow-md transform hover:-translate-y-0.5'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {display.available ? (display.buttonLabel || 'এই কেবিন বুক করুন') : 'Booked Out'}
                </button>
              </div>
            </div>
          );
          })}
        </StaggerReveal>

        {/* Full Boat CTA */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-[hsl(197,80%,28%)] to-[hsl(173,58%,38%)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center text-white">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">{section.fullBoatTitle}</h3>
          <p className="text-white/80 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 max-w-xl mx-auto">
            {section.fullBoatDescription}
          </p>
          <button
            onClick={onBookNow}
            className="inline-flex items-center gap-2 bg-[hsl(38,90%,55%)] hover:bg-[hsl(35,90%,48%)] text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 min-h-[48px]"
          >
            <Anchor className="w-5 h-5 flex-shrink-0" />
            {section.fullBoatButton}
          </button>
        </div>
      </div>
    </section>
  );
}
