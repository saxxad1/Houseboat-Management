'use client';

import { Star, Quote, MessageSquare } from 'lucide-react';
import { StaggerReveal } from '@/components/ScrollReveal';
import { usePublicData } from '@/components/PublicDataProvider';

export default function Testimonials() {
  const { seasonData } = usePublicData();
  const testimonials = seasonData.testimonials.items;
  const stats = seasonData.testimonials.stats;

  return (
    <section id="reviews" className="py-16 md:py-28 bg-[hsl(195,100%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,82%)] rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {seasonData.testimonials.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {seasonData.testimonials.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        {/* Rating Summary */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-100 px-5 sm:px-8 py-4 sm:py-6 flex items-center gap-5 sm:gap-10 flex-wrap justify-center w-full sm:w-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-[hsl(197,80%,28%)] leading-none">{stats.rating}</div>
              <div className="flex gap-0.5 justify-center mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-slate-500 text-xs mt-1">গড় রেটিং</div>
            </div>
            <div className="hidden sm:block w-px h-12 sm:h-16 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-[hsl(197,80%,28%)] leading-none">{stats.count}</div>
              <div className="text-slate-500 text-xs mt-1.5">{stats.label}</div>
            </div>
            <div className="hidden sm:block w-px h-12 sm:h-16 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-[hsl(197,80%,28%)] leading-none">{stats.happiness}</div>
              <div className="text-slate-500 text-xs mt-1.5">{stats.happinessLabel}</div>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" itemClassName="h-full">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="h-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[hsl(195,95%,92%)] flex items-center justify-center mb-3 sm:mb-4">
                <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(197,80%,38%)]" />
              </div>

              <div className="flex gap-0.5 mb-2 sm:mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1 mb-4">
                &ldquo;{review.review}&rdquo;
              </p>

              <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-bold">{review.avatar}</span>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">{review.name}</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">{review.location} · {review.date}</div>
                </div>
              </div>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
