'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star, Quote, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const { seasonData, content, reviews } = usePublicData();
  
  const isHidden = content?.find(c => c.section_key === 'reviews_section_hidden')?.is_active;

  const fallbackTestimonials = seasonData.testimonials.items;
  const stats = seasonData.testimonials.stats;
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayReviews = useMemo(() => (
    reviews.length > 0
      ? reviews
      : fallbackTestimonials.map((t, i) => ({
        id: String(i),
        name: t.name,
        location: t.location,
        rating: t.rating,
        review: t.review,
        avatar: t.avatar,
        is_published: true,
        created_at: '',
        updated_at: ''
      }))
  ), [fallbackTestimonials, reviews]);

  const checkScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, displayReviews]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const distance = Math.min(carousel.clientWidth * 0.8, 600);
    carousel.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  if (isHidden) return null;

  return (
    <section id="reviews" className="py-10 md:py-16 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -left-[10%] w-[40%] max-w-[400px] aspect-square rounded-full bg-[hsl(197,80%,95%)]/70 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[50%] max-w-[500px] aspect-square rounded-full bg-[hsl(38,90%,95%)]/60 blur-[120px]" />
      </div>

      <div className="max-w-[90rem] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-100 shadow-sm backdrop-blur-md rounded-full px-5 py-2 mb-6">
            <MessageSquare className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 tracking-tight">
            {seasonData.testimonials.title}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {seasonData.testimonials.subtitle}
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Rating Summary - Glass Card */}
        <div className="flex justify-center mb-12 sm:mb-16 relative px-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 px-6 sm:px-12 py-6 sm:py-8 flex items-center gap-6 sm:gap-14 flex-wrap justify-center w-full sm:w-auto relative z-10">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-[hsl(197,80%,28%)] tracking-tighter leading-none">{stats.rating}</div>
              <div className="flex gap-1 justify-center mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-6 sm:h-6 fill-[hsl(38,90%,55%)] text-[hsl(38,90%,55%)] drop-shadow-sm" />
                ))}
              </div>
              <div className="text-slate-500 font-bold text-xs sm:text-sm mt-2 uppercase tracking-widest">Average Rating</div>
            </div>
            <div className="hidden sm:block w-px h-20 sm:h-24 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-[hsl(197,80%,28%)] tracking-tighter leading-none">{stats.count}</div>
              <div className="text-slate-500 font-bold text-xs sm:text-sm mt-3 uppercase tracking-widest">{stats.label}</div>
            </div>
            <div className="hidden sm:block w-px h-20 sm:h-24 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-[hsl(197,80%,28%)] tracking-tighter leading-none">{stats.happiness}</div>
              <div className="text-slate-500 font-bold text-xs sm:text-sm mt-3 uppercase tracking-widest">{stats.happinessLabel}</div>
            </div>
          </div>
        </div>

        {/* Review Cards - Horizontal Carousel */}
        <div className="relative group px-12 sm:px-16 md:px-24 lg:px-32 max-w-[100vw]">
            {/* Navigation Arrows (PC) */}
            <button
              onClick={() => scrollCarousel('left')}
              className={`absolute left-0 sm:left-2 md:left-6 lg:left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 text-slate-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-[hsl(197,80%,30%)] hidden md:flex ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 -ml-0.5" />
            </button>
            
            <button
              onClick={() => scrollCarousel('right')}
              className={`absolute right-0 sm:right-2 md:right-6 lg:right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 text-slate-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-[hsl(197,80%,30%)] hidden md:flex ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 -mr-0.5" />
            </button>

            {/* Carousel Track */}
            <div
              ref={carouselRef}
              onScroll={checkScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-8 px-2 scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <AnimatePresence mode="popLayout">
                {displayReviews.map((review, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    key={review.id || idx}
                    className="snap-center sm:snap-start shrink-0 relative w-[85vw] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl border border-white transition-all duration-300 group flex flex-col overflow-hidden"
                  >
                    {/* Quote Watermark */}
                    <Quote className="absolute -top-4 -right-4 w-24 h-24 text-slate-100 opacity-50 rotate-12 pointer-events-none" />

                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(197,80%,90%)] to-[hsl(173,58%,90%)] flex items-center justify-center mb-5 sm:mb-6 shadow-inner relative z-10">
                      <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(197,80%,38%)]" />
                    </div>

                    <div className="flex gap-1 mb-4 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm ${
                            i < review.rating ? 'fill-[hsl(38,90%,55%)] text-[hsl(38,90%,55%)]' : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed flex-1 mb-6 font-medium relative z-10 italic">
                      &ldquo;{review.review}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-slate-100 relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-xs sm:text-sm font-black tracking-wider uppercase">{review.avatar}</span>
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm sm:text-base">{review.name}</div>
                        <div className="text-slate-500 font-semibold text-[10px] sm:text-xs mt-0.5">{review.location}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        </div>
      </div>
    </section>
  );
}
