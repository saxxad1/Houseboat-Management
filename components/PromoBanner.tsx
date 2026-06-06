'use client';

import { motion } from 'framer-motion';

interface PromoBannerProps {
  onBookNow: () => void;
}

export default function PromoBanner({ onBookNow }: PromoBannerProps) {
  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl cursor-pointer group"
        onClick={onBookNow}
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-3xl group-hover:-translate-y-2 border border-gray-100">
          <img 
            src="/promo-banner.jpg" 
            alt="Kuhelika Houseboat 30% Discount Promo" 
            className="w-full h-auto object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
