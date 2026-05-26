'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { isVideoUrl, getEmbedUrl, isVerticalVideo } from '@/lib/videoUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoGallery() {
  const { galleryImages } = usePublicData();
  const [activeCategory, setActiveCategory] = useState('All');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const videoImages = galleryImages.filter((img) => isVideoUrl(img.src));

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [videoImages, activeCategory]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const distance = Math.min(carousel.clientWidth * 0.8, 600);
    carousel.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  if (videoImages.length === 0) {
    return null;
  }

  const categories = ['All', ...Array.from(new Set(videoImages.map((image) => image.category).filter(Boolean)))];

  const filtered = activeCategory === 'All'
    ? videoImages
    : videoImages.filter((img) => img.category === activeCategory);

  return (
    <section id="videos" className="py-10 md:py-16 bg-white relative overflow-hidden border-t border-slate-100">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[hsl(38,90%,90%)] rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[hsl(197,80%,90%)] rounded-full blur-[100px] pointer-events-none opacity-40" />

      <div className="max-w-[90rem] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 shadow-sm backdrop-blur-md rounded-full px-5 py-2 mb-4">
            <Video className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">Videos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            Video Gallery
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Watch beautiful moments and experiences from Kuhelika.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <div className="flex gap-2 sm:gap-3 mb-10 overflow-x-auto pb-4 sm:pb-0 px-4 sm:flex-wrap sm:justify-center scrollbar-hide w-full max-w-7xl mx-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); if(carouselRef.current) carouselRef.current.scrollTo({left:0, behavior:'smooth'}); }}
                  className={`relative px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 overflow-hidden ${
                    isActive ? 'bg-[hsl(197,80%,30%)] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Ultra-Modern Carousel */}
        <div className="relative group px-2 sm:px-4 lg:px-8">
          {/* Navigation Arrows (PC) */}
          <button
            onClick={() => scrollCarousel('left')}
            className={`absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 text-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 hover:text-[hsl(197,80%,30%)] hidden md:flex ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>
          
          <button
            onClick={() => scrollCarousel('right')}
            className={`absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 text-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 hover:text-[hsl(197,80%,30%)] hidden md:flex ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
          >
            <ChevronRight className="w-6 h-6 -mr-0.5" />
          </button>

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex items-start gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2 lg:px-4 scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((video) => {
                const isVertical = isVerticalVideo(video.src);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    key={video.id}
                    className="snap-center sm:snap-start shrink-0 relative flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 w-[85vw] sm:w-[320px] md:w-[400px] lg:w-[480px]"
                  >
                    <div className={`relative w-full ${isVertical ? 'pt-[177.77%]' : 'pt-[56.25%]'} bg-black`}>
                      <iframe
                        src={getEmbedUrl(video.src)}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={video.alt || "Video"}
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1 justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-[hsl(197,80%,50%)] uppercase tracking-widest mb-1.5 block">
                        {video.category}
                      </span>
                      <h3 className="text-slate-800 font-bold text-base sm:text-lg leading-snug line-clamp-2">
                        {video.alt || "Untitled Video"}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
