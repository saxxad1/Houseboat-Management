'use client';

import Image from 'next/image';
import { MapPin, BedDouble, Users, Banknote, ChevronDown, CalendarCheck } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';
import { motion, useScroll, useTransform, useReducedMotion, type Variants, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface HeroProps {
  onBookNow: () => void;
}

export default function Hero({ onBookNow }: HeroProps) {
  const { siteConfig, cabins, seasonData, galleryImages, loading } = usePublicData();
  const ref = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  let validGalleryImages = (galleryImages || []).filter(img => 
    !img.src.includes('facebook.com') && 
    !img.src.includes('youtube.com') && 
    !img.src.includes('tiktok.com') &&
    !img.src.includes('instagram.com')
  );

  const featuredImages = validGalleryImages.filter((img: any) => img.isFeatured);
  if (featuredImages.length > 0) {
    validGalleryImages = featuredImages;
  } else if (loading) {
    // Prevent flashing fallback images while loading
    validGalleryImages = [];
  }

  useEffect(() => {
    if (validGalleryImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validGalleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [validGalleryImages]);

  const currentImage = validGalleryImages.length > 0 
    ? validGalleryImages[currentImageIndex]?.src 
    : (loading ? null : "/hero-kuhelika-houseboat.jpg");
    
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const reduceMotion = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0]);

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const startingPrice = siteConfig.startingPrice || '৳10,000';

  const defaultStats = [
    { icon: BedDouble, value: '8', label: 'Total Rooms' },
    { icon: Users, value: '24 Persons', label: 'Maximum Capacity' },
    { icon: CalendarCheck, value: '1 Night 2 Days', label: 'Trip Duration' },
    { icon: MapPin, value: 'Tanguar Haor', label: 'Sunamganj' },
  ];
  const stats = (seasonData.hero.stats || defaultStats).map((stat, index) => ({
    icon: defaultStats[index]?.icon || MapPin,
    ...stat,
  }));

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section ref={ref} id="home" className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      {/* Background with Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {currentImage && (
              <Image
                src={currentImage}
                alt="Houseboat Hero"
                fill
                priority
                className="object-cover"
                sizes="100vw"
                quality={90}
              />
            )}
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
          </motion.div>
        </AnimatePresence>
        {/* Improved aesthetic gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[hsl(197,80%,10%)]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(197,80%,15%)]/80 via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex w-full max-w-7xl flex-col justify-center overflow-x-hidden px-4 pb-16 pt-32 sm:mx-auto sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full min-w-0"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-white/50 text-white bg-transparent">
            <MapPin className="w-4 h-4 text-[hsl(38,90%,60%)] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">{seasonData.hero.locationBadge}</span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={itemVariants} className="flex w-[calc(100vw-2rem)] max-w-full min-w-0 flex-col gap-2 text-shadow-strong sm:w-full sm:flex-row sm:items-baseline sm:gap-4 mb-4">
            <span className="min-w-0 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-serif italic text-white leading-[1.1] tracking-tight break-words">{seasonData.hero.title}</span>
            <span className="min-w-0 text-2xl sm:text-3xl md:text-4xl text-white/90 italic font-serif font-medium tracking-wide break-words">- An Aesthetic Water Villa</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="w-[calc(100vw-2rem)] max-w-full text-xl sm:text-3xl md:text-4xl text-[hsl(38,95%,65%)] font-bold mb-6 leading-snug text-shadow-strong drop-shadow-lg break-words [overflow-wrap:anywhere] sm:w-full sm:max-w-3xl">
            {seasonData.hero.subtitle}
          </motion.p>
          
          <motion.p variants={itemVariants} className="w-[calc(100vw-2rem)] max-w-full text-white/90 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10 text-shadow-soft break-words sm:w-full sm:max-w-2xl">
            {seasonData.hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex w-[calc(100vw-2rem)] max-w-md flex-col gap-4 mb-16 sm:w-full sm:max-w-none sm:flex-row">
            <button
              onClick={onBookNow}
              className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-[hsl(38,90%,55%)] to-[hsl(35,90%,45%)] hover:from-[hsl(38,90%,60%)] hover:to-[hsl(35,90%,50%)] text-white font-bold text-lg rounded-full shadow-xl shadow-[hsl(35,90%,48%)]/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-5 h-5 flex-shrink-0" />
              {seasonData.hero.primaryCta}
            </button>
            <button
              onClick={() => scrollToSection(seasonData.hero.secondaryTarget)}
              className="flex-1 sm:flex-none px-8 py-4 glass hover:bg-white/20 text-white font-bold text-lg rounded-full transition-all duration-300 flex items-center justify-center gap-2 group border-white/30"
            >
              {seasonData.hero.secondaryCta}
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>

          {/* Stats Glassmorphism Grid */}
          <motion.div variants={itemVariants} className="grid w-[calc(100vw-2rem)] max-w-4xl grid-cols-2 gap-3 sm:w-full sm:gap-5 md:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="glass-card !bg-white/5 !border-white/10 hover:!bg-white/10 hover:!border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center sm:items-start text-center sm:text-left group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[hsl(197,80%,40%)]/80 to-[hsl(197,80%,20%)]/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-black text-xl sm:text-2xl leading-none mb-1 text-shadow-strong">{stat.value}</div>
                  <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1.5 h-2 bg-white rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
