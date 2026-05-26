'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { isVideoUrl } from '@/lib/videoUtils';

const defaultCategories = ['All', 'Exterior', 'Interior', 'Landscape', 'Food', 'Rooftop', 'Night', 'Group'];

export default function Gallery() {
  const { galleryImages, seasonData } = usePublicData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const photoImages = galleryImages.filter((img) => !isVideoUrl(img.src));

  const categories = ['All', ...Array.from(new Set(photoImages.map((image) => image.category).filter(Boolean)))];
  const visibleCategories = categories.length > 1 ? categories : seasonData.gallery.categories || defaultCategories;

  const filtered = activeCategory === 'All'
    ? photoImages
    : photoImages.filter((img) => img.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  };
  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  };

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
  }, [filtered]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const distance = Math.min(carousel.clientWidth * 0.8, 600);
    carousel.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxIndex]);

  return (
    <section id="gallery" className="py-10 md:py-16 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[hsl(197,80%,90%)] rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-[hsl(38,90%,90%)] rounded-full blur-[100px] pointer-events-none opacity-60" />

      <div className="max-w-[90rem] mx-auto relative z-10">
        {/* Header (Centered) */}
        <div className="text-center mb-8 md:mb-12 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-100 shadow-sm backdrop-blur-md rounded-full px-5 py-2 mb-6">
            <ImageIcon className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-bold tracking-wide uppercase">Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            {seasonData.gallery.title}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            {seasonData.gallery.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 sm:gap-3 mb-10 overflow-x-auto pb-4 sm:pb-0 px-4 sm:flex-wrap sm:justify-center scrollbar-hide w-full max-w-7xl mx-auto">
          {visibleCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); if(carouselRef.current) carouselRef.current.scrollTo({left:0, behavior:'smooth'}); }}
                className={`relative px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 overflow-hidden ${
                  isActive ? 'text-white shadow-lg shadow-[hsl(197,80%,30%)]/20 border-transparent' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="galleryTabCarousel"
                    className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,35%)] z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

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
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2 lg:px-4 scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((img, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  key={img.id}
                  onClick={() => setLightboxIndex(i)}
                  className="snap-center sm:snap-start shrink-0 relative overflow-hidden rounded-[2rem] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-slate-200 group/card w-[85vw] sm:w-[320px] md:w-[400px] lg:w-[480px] h-[50vh] min-h-[400px] max-h-[600px]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt || 'Gallery image'}
                    fill
                    quality={80}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  {/* Premium Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                    <motion.div 
                      initial={false}
                      className="translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500"
                    >
                      <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white mb-3 border border-white/30 shadow-sm">
                        {img.category}
                      </span>
                      <h3 className="text-white font-black text-xl sm:text-2xl lg:text-3xl leading-tight drop-shadow-md">
                        {img.alt}
                      </h3>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Lightbox - Glassmorphism */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6"
              onClick={closeLightbox}
            >
              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300 z-10 border border-white/20 backdrop-blur-md"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {/* Prev */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10 border border-white/20 backdrop-blur-md hover:-translate-x-1"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 -ml-1" />
              </button>
              
              {/* Next */}
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10 border border-white/20 backdrop-blur-md hover:translate-x-1"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 -mr-1" />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-h-[85vh] max-w-6xl w-full mx-12 sm:mx-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-black flex items-center justify-center h-[70vh] sm:h-[80vh]">
                  <Image
                    src={filtered[lightboxIndex].src}
                    alt={filtered[lightboxIndex].alt}
                    fill
                    quality={90}
                    className="object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 sm:p-8">
                    <p className="text-white font-black text-xl sm:text-3xl drop-shadow-md mb-2">{filtered[lightboxIndex].alt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(197,80%,60%)] font-bold text-xs sm:text-sm uppercase tracking-widest">{filtered[lightboxIndex].category}</span>
                      <span className="text-white/80 font-bold text-xs sm:text-sm bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                        {lightboxIndex + 1} / {filtered.length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
