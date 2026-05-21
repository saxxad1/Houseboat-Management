'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Cabins from '@/components/Cabins';
import Packages from '@/components/Packages';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import Itinerary from '@/components/Itinerary';
import Facilities from '@/components/Facilities';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import BookingCTA from '@/components/BookingCTA';
import BookingForm from '@/components/BookingForm';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import NetlifyForms from '@/components/NetlifyForms';
import { PublicDataProvider } from '@/components/PublicDataProvider';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <PublicDataProvider>
      <main className="min-h-screen">
        <Header onBookNow={() => setIsBookingOpen(true)} />
        <Hero onBookNow={() => setIsBookingOpen(true)} />
        <ScrollReveal>
          <About />
        </ScrollReveal>
        <ScrollReveal>
          <Cabins onBookNow={() => setIsBookingOpen(true)} />
        </ScrollReveal>
        <ScrollReveal>
          <Packages onBookNow={() => setIsBookingOpen(true)} />
        </ScrollReveal>
        <ScrollReveal>
          <AvailabilityCalendar />
        </ScrollReveal>
        <ScrollReveal>
          <Itinerary />
        </ScrollReveal>
        <ScrollReveal>
          <Facilities />
        </ScrollReveal>
        <ScrollReveal>
          <Gallery />
        </ScrollReveal>
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
        <ScrollReveal>
          <BookingCTA onBookNow={() => setIsBookingOpen(true)} />
        </ScrollReveal>
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
        <ScrollReveal>
          <Contact onBookNow={() => setIsBookingOpen(true)} />
        </ScrollReveal>
        <ScrollReveal>
          <Footer />
        </ScrollReveal>
        <NetlifyForms />

        <BookingForm
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />

        <FloatingWhatsApp />
      </main>
    </PublicDataProvider>
  );
}
