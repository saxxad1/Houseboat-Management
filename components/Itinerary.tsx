'use client';

import { useState } from 'react';
import {
  MapPin, Ship, Coffee, Utensils, Waves, Eye,
  Moon, Sun, LogOut, Home, Route, Clock
} from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin, Ship, Coffee, Utensils, Waves, Eye,
  Moon, Sun, LogOut, Home,
};

export default function Itinerary() {
  const { seasonData, activeSeason } = usePublicData();
  const itinerary = seasonData.itinerary.items;
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="itinerary" className="py-10 md:py-16 bg-white relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(197,80%,95%)] rounded-full blur-[100px] pointer-events-none z-0 opacity-50 translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-100 shadow-sm backdrop-blur-md rounded-full px-5 py-2 mb-6">
            <Route className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">{seasonData.itinerary.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-5 tracking-tight">
            {seasonData.itinerary.title}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            {seasonData.itinerary.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Day Tabs — Animated */}
        <div className="flex gap-2 sm:gap-4 mb-10 sm:mb-12 overflow-x-auto pb-4 sm:pb-0 sm:justify-center scrollbar-hide relative">
          {itinerary.map((day, i) => {
            const isActive = activeDay === i;
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`relative px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all duration-300 min-h-[48px] overflow-hidden ${
                  isActive ? 'text-white shadow-xl shadow-[hsl(197,80%,30%)]/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,35%)] z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">
                  {activeSeason === 'padma' && 'tabLabel' in day ? day.tabLabel : `Day ${day.day}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Day Content */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Day Title Card */}
              <div className="relative bg-gradient-to-r from-[hsl(197,80%,28%)] to-[hsl(173,58%,40%)] rounded-3xl p-6 sm:p-8 md:p-10 mb-10 text-white overflow-hidden shadow-2xl shadow-[hsl(197,80%,30%)]/20">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="text-xs sm:text-sm font-black text-white/70 uppercase tracking-widest mb-2">
                    {activeSeason === 'padma' ? 'Event Details' : `Day ${itinerary[activeDay].day} of the Journey`}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight leading-tight w-full" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' }}>
                    {itinerary[activeDay].title.replace(/^Day \d+ - /, '')}
                  </h3>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative ml-5 sm:ml-8">
                {/* Vertical glowing line */}
                <div className="absolute left-[15px] sm:left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-[hsl(197,80%,38%)] via-[hsl(173,58%,45%)] to-[hsl(195,85%,82%)] rounded-full opacity-30" />

                <div className="space-y-6 sm:space-y-8">
                  {itinerary[activeDay].timeline.map((item, i) => {
                    const Icon = iconMap[item.icon] || MapPin;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        key={i} 
                        className="relative flex items-start gap-4 sm:gap-6 group"
                      >
                        {/* Icon Node - Glowing orb */}
                        <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center shadow-lg shadow-[hsl(197,80%,30%)]/40 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 border-2 border-white">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-[hsl(197,80%,85%)] transition-all duration-300 group-hover:-translate-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">{item.event}</h4>
                            <span className="inline-flex items-center justify-center text-[hsl(197,80%,38%)] text-xs sm:text-sm font-black bg-[hsl(195,95%,92%)] px-3 py-1.5 rounded-full whitespace-nowrap self-start flex-shrink-0 tracking-wide">
                              <Clock className="w-3 h-3 mr-1.5 inline-block" />
                              {item.time}
                            </span>
                          </div>
                          {'description' in item && item.description && (
                            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                              {item.description as string}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5 text-center backdrop-blur-sm"
              >
                <p className="text-amber-800 text-sm font-medium">
                  <strong className="font-black tracking-wide uppercase text-xs mr-2 text-amber-600">Note:</strong> 
                  {seasonData.itinerary.note}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
