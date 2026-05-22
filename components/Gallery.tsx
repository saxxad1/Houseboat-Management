'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { StaggerReveal } from '@/components/ScrollReveal';

const defaultCategories = ['সব', 'Exterior', 'Interior', 'Landscape', 'Food', 'Rooftop', 'Night', 'Group'];

export default function Gallery() {
  const { galleryImages, seasonData } = usePublicData();
  const [activeCategory, setActiveCategory] = useState('সব');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const categories = ['সব', ...Array.from(new Set(galleryImages.map((image) => image.category).filter(Boolean)))];
  const visibleCategories = categories.length > 1 ? categories : seasonData.gallery.categories || defaultCategories;

  const filtered = activeCategory === 'সব'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  };
  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  };

  return (
    <section id="gallery" className="py-16 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[hsl(195,95%,92%)] rounded-full px-4 py-1.5 mb-4">
            <ImageIcon className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {seasonData.gallery.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            {seasonData.gallery.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        {/* Category Filter — horizontally scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 scrollbar-hide">
          {visibleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                activeCategory === cat
                  ? 'bg-[hsl(197,80%,30%)] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <StaggerReveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4" stagger={0.045}>
          {filtered.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              className="relative block aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <p className="text-white text-xs font-medium truncate">{img.alt}</p>
              </div>
            </button>
          ))}
        </StaggerReveal>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10 min-w-[40px]"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10 min-w-[40px]"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10 min-w-[40px]"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              className="relative mx-10 max-h-[82vh] max-w-4xl sm:mx-14"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                width={1200}
                height={800}
                sizes="90vw"
                className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl sm:rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4 rounded-b-xl sm:rounded-b-2xl">
                <p className="text-white font-medium text-sm sm:text-base">{filtered[lightboxIndex].alt}</p>
                <p className="text-white/60 text-xs sm:text-sm">{lightboxIndex + 1} / {filtered.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
