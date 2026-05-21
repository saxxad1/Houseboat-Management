'use client';

import { useState } from 'react';
import { ChevronDown, CircleHelp as HelpCircle } from 'lucide-react';
import { faqs } from '@/data/houseboatData';
import { StaggerReveal } from '@/components/ScrollReveal';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(195,95%,92%)] rounded-full px-4 py-1.5 mb-4">
            <HelpCircle className="w-4 h-4 text-[hsl(197,80%,30%)]" />
            <span className="text-[hsl(197,80%,30%)] text-sm font-semibold">FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            সাধারণ প্রশ্নোত্তর
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg">
            আপনার মনে যা প্রশ্ন আসছে তার উত্তর এখানে পাবেন।
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] rounded-full mx-auto mt-4" />
        </div>

        {/* FAQ Items */}
        <StaggerReveal className="space-y-2.5 sm:space-y-3" stagger={0.055}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-200 ${
                openIndex === i
                  ? 'border-[hsl(197,80%,50%)] shadow-md shadow-[hsl(197,80%,38%)]/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left bg-white hover:bg-slate-50 transition-colors min-h-[56px]"
              >
                <span className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">{faq.question}</span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openIndex === i
                      ? 'bg-[hsl(197,80%,30%)] text-white rotate-180'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 bg-[hsl(195,100%,97%)] border-t border-slate-100">
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-3 sm:pt-4">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </StaggerReveal>

        {/* Contact CTA */}
        <div className="mt-8 sm:mt-10 text-center p-4 sm:p-6 bg-[hsl(195,95%,92%)] rounded-2xl sm:rounded-3xl border border-[hsl(195,85%,82%)]">
          <p className="text-[hsl(197,80%,28%)] font-medium text-sm sm:text-base">
            আরও প্রশ্ন আছে? সরাসরি আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    </section>
  );
}
