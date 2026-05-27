'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { usePublicData } from '@/components/PublicDataProvider';

export default function FloatingWhatsApp() {
  const { siteConfig, activeSeason } = usePublicData();
  const [tooltip, setTooltip] = useState(true);

  const message = encodeURIComponent(
    activeSeason === 'padma'
      ? `Hello, I want to book a Padma Day Long cruise for ${siteConfig.name}. Please confirm availability and package details.`
      : `Hello! I would like to know about Haor/Houseboat booking for ${siteConfig.name}.`
  );
  const url = `https://wa.me/${siteConfig.whatsapp}?text=${message}`;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      {tooltip && (
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 max-w-[160px] sm:max-w-[190px]">
          <button
            onClick={() => setTooltip(false)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-2.5 h-2.5 text-slate-600" />
          </button>
          <p className="text-slate-700 text-xs sm:text-sm font-medium leading-tight">
            {activeSeason === 'padma' ? 'Want to book a Padma day trip? WhatsApp us!' : 'Want to visit Haor? WhatsApp us!'}
          </p>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
        </div>
      )}

      {/* WhatsApp Button */}
      <div className="relative">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba58] rounded-full flex items-center justify-center shadow-2xl hover:shadow-emerald-400/40 transition-all duration-300 transform hover:scale-110 block"
          style={{ width: '52px', height: '52px' }}
          aria-label="Chat on WhatsApp"
          onClick={() => setTooltip(false)}
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
        </a>
        {/* Pulse ring — clipped to not overflow screen */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />
      </div>
    </div>
  );
}
