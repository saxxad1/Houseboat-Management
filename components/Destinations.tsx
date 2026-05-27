'use client';

import { usePublicData } from '@/components/PublicDataProvider';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Destinations() {
  const { seasonData } = usePublicData();

  if (!seasonData.destinations) return null;

  const { badge, title, subtitle, places } = seasonData.destinations;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <section id="destinations" className="py-20 sm:py-32 bg-slate-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[hsl(197,80%,40%)]/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[hsl(197,80%,40%)] animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
              {badge}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {places.map((place: any, idx: number) => (
            <motion.div
              key={place.id}
              variants={item}
              className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-white text-xs font-bold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                    0{idx + 1}
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex flex-col flex-1 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-[hsl(197,80%,40%)] transition-colors duration-300">
                  {place.name}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed flex-1 text-justify">
                  {place.description}
                </p>

              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
 
