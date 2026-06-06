'use client';

import { Phone, MessageCircle, Mail, MapPin, Facebook, Heart } from 'lucide-react';
import Logo from '@/components/Logo';
import { usePublicData } from '@/components/PublicDataProvider';

export default function Footer() {
  const { siteConfig, activeSeason, seasonData } = usePublicData();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();
  const whatsappMessage = encodeURIComponent(
    activeSeason === 'padma'
      ? `Hello, I want to book a Padma River event cruise for ${siteConfig.name}. Please confirm availability and booking details.`
      : `Hello! I would like to know about haor/houseboat booking for ${siteConfig.name}.`
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`;
  const services = activeSeason === 'padma'
    ? ['Slot Booking', 'Full Boat Event', 'Birthday Event', 'Corporate Event', 'Dinner Cruise', 'Custom Event']
    : ['Cabin Booking', 'Full Boat Booking', 'Family Tour', 'Group Tour', 'Corporate Tour', 'Custom Tour'];

  return (
    <footer className="bg-[hsl(195,50%,96%)] text-slate-800 border-t border-slate-200 pb-24 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-3 w-[142px] sm:mb-4 sm:w-[164px]" imageClassName="drop-shadow-none" />
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              {siteConfig.description}
            </p>
            <div className="flex gap-2.5 sm:gap-3">
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-slate-500 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${siteConfig.phone}`}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-[hsl(197,80%,95%)] hover:border-[hsl(197,80%,80%)] hover:text-[hsl(197,80%,40%)] text-slate-500 transition-all"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 sm:mb-5">Quick Links</h3>
            <ul className="space-y-2">
              {seasonData.nav.links.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-slate-500 hover:text-[hsl(197,80%,40%)] text-xs sm:text-sm transition-colors text-left leading-relaxed font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 sm:mb-5">Services</h3>
            <ul className="space-y-2 text-slate-500 text-xs sm:text-sm font-medium">
              {services.map((service) => <li key={service}>{service}</li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 sm:mb-5">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-2 text-slate-500 hover:text-[hsl(197,80%,40%)] transition-colors text-xs sm:text-sm font-medium">
                  <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[hsl(197,80%,55%)]" />
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-xs sm:text-sm font-medium">
                  <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-2 text-slate-500 hover:text-[hsl(38,90%,55%)] transition-colors text-xs sm:text-sm font-medium">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[hsl(38,90%,55%)]" />
                  <span className="break-all">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-500 text-xs sm:text-sm font-medium">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-500" />
                <span>{siteConfig.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-5 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-slate-400 text-xs sm:text-sm text-center sm:text-left font-medium">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
            Made with <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 fill-rose-500" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
