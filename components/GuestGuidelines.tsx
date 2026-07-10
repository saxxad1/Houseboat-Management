'use client';

import React from 'react';
import { 
  LifeBuoy, 
  IdCard, 
  Ban, 
  Leaf, 
  HeartHandshake, 
  ShieldCheck, 
  Briefcase, 
  Wallet, 
  Clock,
  Info,
  MessageCircle,
  CalendarCheck
} from 'lucide-react';
import { guestGuidelinesData } from '@/data/guestGuidelines';
import { usePublicData } from '@/components/PublicDataProvider';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LifeBuoy,
  IdCard,
  Ban,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  Briefcase,
  Wallet,
  Clock,
};

interface GuestGuidelinesProps {
  onBookNow: () => void;
}

export default function GuestGuidelines({ onBookNow }: GuestGuidelinesProps) {
  const { siteConfig } = usePublicData();

  const whatsappMessage = encodeURIComponent(
    `Hello, I want to know more about FloatBoat houseboat guest guidelines and booking policy.`
  );

  return (
    <section id="guest-guidelines" className="py-10 md:py-16 bg-[hsl(195,100%,98%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-[hsl(195,85%,85%)] rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <Info className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold tracking-wide">
              {guestGuidelinesData.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
            {guestGuidelinesData.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {guestGuidelinesData.subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-6" />
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guestGuidelinesData.guidelines.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Info;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                {/* Left Accent Border */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(195,100%,95%)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[hsl(197,80%,30%)] transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-[hsl(197,80%,30%)] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-[hsl(197,80%,30%)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
