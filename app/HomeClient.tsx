'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Cabins from '@/components/Cabins';
import Destinations from '@/components/Destinations';
import FoodMenu from '@/components/FoodMenu';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import Itinerary from '@/components/Itinerary';
import Facilities from '@/components/Facilities';
import GuestGuidelines from '@/components/GuestGuidelines';
import Gallery from '@/components/Gallery';
import VideoGallery from '@/components/VideoGallery';
import Testimonials from '@/components/Testimonials';
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
  const [selectedCabin, setSelectedCabin] = useState<string>('');

  const [initialBookingType, setInitialBookingType] = useState<'cabin' | 'full'>('cabin');
  const [initialCheckInDate, setInitialCheckInDate] = useState<string>('');
  const [initialCheckOutDate, setInitialCheckOutDate] = useState<string>('');

  const handleCalendarSelect = (date: string) => {
    const checkin = new Date(date);
    const checkout = new Date(date);
    checkout.setDate(checkout.getDate() + 1);
    
    setInitialCheckInDate(checkin.toISOString().split('T')[0]);
    setInitialCheckOutDate(checkout.toISOString().split('T')[0]);
    setSelectedCabin('');
    setInitialBookingType('cabin');
    setIsBookingOpen(true);
  };

  const handleBookNow = (cabinName?: string | React.MouseEvent, type: 'cabin' | 'full' = 'cabin') => {
    if (typeof cabinName === 'string') {
      setSelectedCabin(cabinName);
    } else {
      setSelectedCabin('');
    }
    setInitialBookingType(type);
    setIsBookingOpen(true);
  };

  return (
    <main className="min-h-screen">
      <Header onBookNow={() => handleBookNow()} />
      <Hero onBookNow={() => handleBookNow()} />

      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal>
        <Cabins onBookNow={handleBookNow} />
      </ScrollReveal>
      <ScrollReveal>
        <AvailabilityCalendar onSelectDate={handleCalendarSelect} />
      </ScrollReveal>
      <ScrollReveal>
        <Itinerary />
      </ScrollReveal>
      <ScrollReveal>
        <FoodMenu onBookNow={() => handleBookNow()} />
      </ScrollReveal>
      <ScrollReveal>
        <Destinations />
      </ScrollReveal>
      <ScrollReveal>
        <Facilities />
      </ScrollReveal>
      <ScrollReveal>
        <Gallery />
      </ScrollReveal>
      <ScrollReveal>
        <VideoGallery />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal>
        <FAQ />
      </ScrollReveal>
      <ScrollReveal>
        <GuestGuidelines onBookNow={() => handleBookNow()} />
      </ScrollReveal>
      <ScrollReveal>
        <Contact />
      </ScrollReveal>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
      <NetlifyForms />

      <BookingForm 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedCabin('');
        }} 
        initialCabin={selectedCabin}
        initialBookingType={initialBookingType}
        initialCheckInDate={initialCheckInDate}
        initialCheckOutDate={initialCheckOutDate}
      />

      <FloatingWhatsApp />
    </main>
  );
}
