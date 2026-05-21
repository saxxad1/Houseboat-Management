'use client';

import { Phone, MessageCircle, Mail, MapPin, Facebook, Heart } from 'lucide-react';
import Logo from '@/components/Logo';
import { usePublicData } from '@/components/PublicDataProvider';
import { navLinks } from '@/data/houseboatData';

export default function Footer() {
  const { siteConfig } = usePublicData();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(197,80%,10%)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-3 w-[142px] sm:mb-4 sm:w-[164px]" imageClassName="drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]" />
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              টাঙ্গুয়ার হাওরের নীল জলের বুকে ভাসমান বিলাসবহুল হাউসবোটে আপনাকে স্বাগতম।
            </p>
            <div className="flex gap-2.5 sm:gap-3">
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${siteConfig.phone}`}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(197,80%,38%)] transition-colors"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-3 sm:mb-5">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors text-left leading-relaxed"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-3 sm:mb-5">সেবাসমূহ</h3>
            <ul className="space-y-2 text-white/70 text-xs sm:text-sm">
              <li>কেবিন বুকিং</li>
              <li>Full Boat বুকিং</li>
              <li>ফ্যামিলি প্যাকেজ</li>
              <li>গ্রুপ ট্যুর</li>
              <li>কর্পোরেট প্যাকেজ</li>
              <li>কাস্টম ট্যুর</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-3 sm:mb-5">যোগাযোগ</h3>
            <ul className="space-y-2.5">
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm">
                  <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[hsl(197,80%,55%)]" />
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm">
                  <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-2 text-white/70 hover:text-white transition-colors text-xs sm:text-sm">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[hsl(38,90%,65%)]" />
                  <span className="break-all">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/70 text-xs sm:text-sm">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-400" />
                <span>{siteConfig.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-5 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-white/40 text-xs sm:text-sm text-center sm:text-left">
            &copy; {currentYear} {siteConfig.name}. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 fill-rose-500" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
