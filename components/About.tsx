'use client';

import Image from 'next/image';
import { Users, Star, Utensils, Shield, CircleCheck as CheckCircle2 } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Star,
  Utensils,
  Shield,
};

export default function About() {
  const { seasonData, activeSeason } = usePublicData();
  const aboutContent = seasonData.about;
  const aboutImage = activeSeason === 'padma' ? '/images/padma/river-view.jpg' : '/images/floatboat/gallery/img-8749.jpg';
  const aboutAlt = activeSeason === 'padma' ? 'FloatBoat Padma day long cruise' : 'Tanguar Haor houseboat';

  return (
    <section id="about" className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-[hsl(195,95%,92%)] rounded-full px-4 py-1.5 mb-4">
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">{aboutContent.subtitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {aboutContent.title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
          {/* Left: Image */}
          <div className="relative pb-6 lg:pb-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
              <Image
                src={aboutImage}
                alt={aboutAlt}
                width={900}
                height={600}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(197,80%,10%)]/50 to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute bottom-0 right-0 sm:-bottom-4 sm:-right-2 lg:-bottom-6 lg:-right-4 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 border border-slate-100 max-w-[160px] sm:max-w-[200px]">
              <div className="text-2xl sm:text-3xl font-bold text-[hsl(197,80%,30%)] mb-0.5">1000+</div>
              <div className="text-slate-600 text-xs sm:text-sm font-medium">Happy Tourists</div>
              <div className="flex gap-0.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -top-3 -left-3 w-16 h-16 sm:w-24 sm:h-24 bg-[hsl(195,95%,92%)] rounded-2xl -z-10" />
          </div>

          {/* Right: Content */}
          <div className="space-y-5 sm:space-y-6">
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">{aboutContent.story}</p>

            {/* Highlights */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              {aboutContent.highlights.map((h, i) => {
                const Icon = iconMap[h.icon] || Star;
                return (
                  <div
                    key={i}
                    className="bg-[hsl(195,100%,97%)] border border-[hsl(195,85%,82%)] rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[hsl(197,80%,30%)] flex items-center justify-center mb-2 sm:mb-3">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1">{h.title}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{h.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Suitable For */}
            <div>
              <h3 className="font-bold text-slate-700 mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wide">Suitable For</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {aboutContent.suitableFor.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 sm:gap-1.5 bg-[hsl(195,95%,92%)] text-[hsl(197,80%,28%)] rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
