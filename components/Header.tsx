'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { usePublicData } from '@/components/PublicDataProvider';

interface HeaderProps {
  onBookNow: () => void;
}

export default function Header({ onBookNow }: HeaderProps) {
  const { siteConfig, seasonData } = usePublicData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const packagesSection = seasonData.packagesSection as typeof seasonData.packagesSection & { is_active?: boolean };
  
  // Filter out the packages link if the section is hidden via admin
  const navLinks = seasonData.nav.links.filter(link => 
    link.href !== '#packages' || packagesSection?.is_active !== false
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-[rgba(6,20,24,0.12)] backdrop-blur-[2px] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#home')}
            className="group flex items-center"
            aria-label="Go to home"
          >
            <Logo
              priority
              className="w-[102px] transition-all sm:w-[122px]"
              imageClassName="drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-white/20 ${
                  isScrolled
                    ? 'text-slate-700 hover:text-[hsl(197,80%,30%)] hover:bg-[hsl(195,95%,92%)]'
                    : 'text-white hover:text-white text-shadow-soft'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${siteConfig.phone}`}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-[hsl(197,80%,30%)]' : 'text-white hover:text-white text-shadow-soft'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{siteConfig.phone}</span>
            </a>
            <button
              onClick={onBookNow}
              className="px-5 py-2.5 rounded-full bg-[hsl(38,90%,55%)] text-white text-sm font-bold shadow-md hover:bg-[hsl(35,90%,48%)] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {seasonData.nav.ctaLabel}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/20 text-shadow-soft'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/98 backdrop-blur-lg border-t border-slate-100 shadow-xl px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-[hsl(195,95%,92%)] hover:text-[hsl(197,80%,30%)] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
              >
                <Phone className="w-4 h-4" />
                {siteConfig.phone}
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBookNow();
                }}
                className="px-4 py-3 rounded-xl bg-[hsl(38,90%,55%)] text-white font-bold text-center hover:bg-[hsl(35,90%,48%)] transition-colors"
              >
                {seasonData.nav.ctaLabel}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
