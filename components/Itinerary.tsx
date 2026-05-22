'use client';

import { useState } from 'react';
import {
  MapPin, Ship, Coffee, Utensils, Waves, Eye, Sunset,
  Music, Moon, Sun, Bird, Fish, LogOut, Chrome as Home, Route
} from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin, Ship, Coffee, Utensils, Waves, Eye, Sunset,
  Music, Moon, Sun, Bird, Fish, LogOut, Home,
};

export default function Itinerary() {
  const { seasonData, activeSeason } = usePublicData();
  const itinerary = seasonData.itinerary.items;
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="itinerary" className="py-16 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(195,95%,92%)] rounded-full px-4 py-1.5 mb-4">
            <Route className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{seasonData.itinerary.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {seasonData.itinerary.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {seasonData.itinerary.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        {/* Day Tabs — scrollable on mobile */}
        <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-2 sm:pb-0 sm:justify-center scrollbar-hide">
          {itinerary.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 min-h-[44px] ${
                activeDay === i
                  ? 'bg-[hsl(197,80%,30%)] text-white shadow-lg shadow-[hsl(197,80%,30%)]/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {activeSeason === 'padma' && 'tabLabel' in day ? day.tabLabel : `Day ${day.day}`}
            </button>
          ))}
        </div>

        {/* Active Day Content */}
        {itinerary.map((day, di) => (
          <div
            key={di}
            className={`transition-all duration-300 ${activeDay === di ? 'block' : 'hidden'}`}
          >
            {/* Day Title */}
            <div className="bg-gradient-to-r from-[hsl(197,80%,28%)] to-[hsl(173,58%,40%)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white">
              <div className="text-3xl sm:text-5xl font-black opacity-20 mb-1">{activeSeason === 'padma' ? 'Event' : `Day ${day.day}`}</div>
              <h3 className="text-base sm:text-xl md:text-2xl font-bold -mt-5 sm:-mt-6">{day.title}</h3>
            </div>

            {/* Timeline */}
            <div className="relative ml-4 sm:ml-0">
              {/* Vertical line — positioned relative to icon column */}
              <div className="absolute left-4 sm:left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[hsl(197,80%,38%)] via-[hsl(173,58%,45%)] to-[hsl(195,85%,82%)]" />

              <div className="space-y-3 sm:space-y-4">
                {day.timeline.map((item, i) => {
                  const Icon = iconMap[item.icon] || MapPin;
                  return (
                    <div key={i} className="relative flex items-start gap-3 sm:gap-5">
                      {/* Icon Node */}
                      <div className="relative z-10 w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center shadow-md flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 bg-[hsl(195,100%,97%)] border border-[hsl(195,85%,88%)] rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1.5 xs:gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">{item.event}</h4>
                          <span className="text-[hsl(197,80%,38%)] text-xs sm:text-sm font-bold bg-[hsl(195,95%,92%)] px-2.5 py-1 rounded-full whitespace-nowrap self-start flex-shrink-0">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="mt-8 sm:mt-10 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
          <p className="text-amber-800 text-xs sm:text-sm">
            <strong>নোট:</strong> {seasonData.itinerary.note}
          </p>
        </div>
      </div>
    </section>
  );
}
