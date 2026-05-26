'use client';

import { useState } from 'react';
import { usePublicData } from '@/components/PublicDataProvider';
import { Coffee, Utensils, Moon, Sun, Cookie, CupSoda, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodMenuProps {
  onBookNow?: () => void;
}

const mealIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Breakfast': Sun,
  'Lunch': Utensils,
  'Dinner': Moon,
  'Morning Snacks': Cookie,
  'Evening Snacks': CupSoda,
  'All-Time Tea Arrangement': Coffee
};

export default function FoodMenu({ onBookNow }: FoodMenuProps) {
  const { seasonData } = usePublicData();
  const foodMenu = seasonData.foodMenu;

  // Find the first available tab based on data presence
  const tabs = [];
  if (foodMenu?.days?.length) foodMenu.days.forEach(d => tabs.push(d.day));
  if (foodMenu?.snacks?.length) tabs.push('Snacks & Tea');

  const [activeTab, setActiveTab] = useState(tabs[0] || 'Day 1');

  if (!foodMenu) return null; // Don't show if no data (e.g. Padma season)

  return (
    <section id="food-menu" className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-3xl" />
      </div>

      <div className="container px-4 sm:px-6 mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-100 shadow-sm backdrop-blur-md rounded-full px-5 py-2 mb-6">
            <Utensils className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">{foodMenu.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-5 tracking-tight">
            {foodMenu.title}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            {foodMenu.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-10 sm:mb-12 overflow-x-auto pb-4 sm:pb-0 sm:justify-center scrollbar-hide relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all duration-300 min-h-[48px] overflow-hidden ${
                  isActive ? 'text-white shadow-xl shadow-[hsl(197,80%,30%)]/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFoodTab"
                    className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,35%)] z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Render Days */}
              {foodMenu.days?.filter(d => d.day === activeTab).map((dayData) => (
                dayData.meals.map((meal, index) => {
                  const Icon = mealIcons[meal.title] || Utensils;
                  return (
                    <div key={index} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative group">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Icon className="w-16 h-16" />
                      </div>
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{meal.title}</h3>
                      </div>
                      <ul className="space-y-3 relative z-10">
                        {meal.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                            <span className="text-slate-600 text-[15px] leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ))}

              {/* Render Snacks */}
              {activeTab === 'Snacks & Tea' && foodMenu.snacks?.map((snack, index) => {
                const Icon = mealIcons[snack.title] || Coffee;
                return (
                  <div key={index} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{snack.title}</h3>
                    </div>
                    <ul className="space-y-3 relative z-10">
                      {snack.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                          <span className="text-slate-600 text-[15px] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Note Card */}
        {foodMenu.note && (
          <div className="mt-10 max-w-3xl mx-auto bg-sky-50/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3 border border-sky-100/50">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-[15px] text-sky-800/80 leading-relaxed font-medium">
              {foodMenu.note}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
