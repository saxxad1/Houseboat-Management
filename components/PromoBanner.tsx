'use client';

import { motion } from 'framer-motion';
import { BadgePercent, PhoneCall, Ship } from 'lucide-react';
import Image from 'next/image';
import { usePublicData } from '@/components/PublicDataProvider';
import { FLOATBOAT_BRAND } from '@/lib/branding';

interface PromoBannerProps {
  onBookNow: () => void;
}

export default function PromoBanner({ onBookNow }: PromoBannerProps) {
  const { siteConfig } = usePublicData();

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="group relative mx-auto block min-h-[280px] w-full max-w-7xl overflow-hidden rounded-lg border border-cyan-100 text-left shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(8,51,68,0.18)] focus:outline-none focus:ring-4 focus:ring-cyan-200 sm:min-h-[320px]"
        onClick={onBookNow}
      >
        <Image
          src={FLOATBOAT_BRAND.heroImage}
          alt=""
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(4,31,39,0.92)] via-[rgba(8,75,92,0.72)] to-[rgba(8,75,92,0.12)]" />
        <div className="relative z-10 flex min-h-[280px] flex-col justify-between gap-8 p-6 text-white sm:min-h-[320px] sm:p-8 lg:flex-row lg:items-center lg:p-10">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-extrabold uppercase backdrop-blur-md">
              <Ship className="h-4 w-4" />
              {siteConfig.name} June Offer
            </div>
            <h2 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              30% Discount
            </h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-cyan-50 sm:text-lg">
              Book your FloatBoat houseboat trip and enjoy a premium water villa experience with your family, friends, or team.
            </p>
          </div>

          <div className="grid w-full max-w-sm gap-3 rounded-lg border border-white/20 bg-white/14 p-4 backdrop-blur-md sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400 text-cyan-950">
                <BadgePercent className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm font-bold text-cyan-50">Limited booking offer</div>
                <div className="text-2xl font-black text-white">Save 30%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-cyan-950">
              <PhoneCall className="h-5 w-5 flex-shrink-0" />
              <span className="min-w-0 truncate text-lg font-black">{siteConfig.phone}</span>
            </div>
            <span className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-5 py-3 text-sm font-black uppercase text-cyan-950 transition-colors group-hover:bg-amber-300">
              Book Now
            </span>
          </div>
        </div>
      </motion.button>
    </section>
  );
}
