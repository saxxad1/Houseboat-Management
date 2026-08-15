'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BedDouble,
  CalendarCheck2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  FileBarChart,
  Globe2,
  Images,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PackageCheck,
  Palette,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Ship,
  Star,
  ToggleLeft,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';

const whatsappUrl = `https://wa.me/8801343411792?text=${encodeURIComponent(
  'আমি Floatbase হাউসবোট ম্যানেজমেন্ট সিস্টেম সম্পর্কে বিস্তারিত জানতে চাই।'
)}`;

const navItems = [
  { label: 'সিস্টেমটি দেখুন', href: '#system' },
  { label: 'সুবিধাসমূহ', href: '#features' },
  { label: 'সিজন ম্যানেজমেন্ট', href: '#seasons' },
  { label: 'মূল্য', href: '#pricing' },
  { label: 'জিজ্ঞাসা', href: '#faq' },
];

const dailyQuestions = [
  { number: '০১', question: 'আগামী শুক্রবার কোন কেবিনটি খালি?', answer: 'ক্যালেন্ডার খুললেই উত্তর পাবেন।' },
  { number: '০২', question: 'আজ কত টাকা অগ্রিম এসেছে, বকেয়া কত?', answer: 'প্রতিটি বুকিংয়ের পাশে হিসাব থাকবে।' },
  { number: '০৩', question: 'শেষ ট্রিপে আসলে লাভ হলো কত?', answer: 'আয় থেকে সব খরচ বাদ দিয়ে রিপোর্ট তৈরি হবে।' },
];

const featureGroups = [
  {
    icon: CalendarCheck2,
    kicker: 'বুকিং ডেস্ক',
    title: 'ফোনে বুকিং এলো? দুই মিনিটে নথিভুক্ত করুন।',
    text: 'অতিথির নাম, ফোন, তারিখ, কেবিন, অতিথির সংখ্যা, মোট বিল, অগ্রিম ও বকেয়া—একবার লিখলেই পুরো টিম একই তথ্য দেখবে।',
    items: ['কেবিন ও ফুল-বোট বুকিং', 'Pending থেকে Completed স্ট্যাটাস', 'তারিখ ও পেমেন্ট অনুযায়ী ফিল্টার'],
  },
  {
    icon: Wallet,
    kicker: 'হিসাব বিভাগ',
    title: 'টাকা কোথায় যাচ্ছে, মাস শেষে আর খুঁজতে হবে না।',
    text: 'খাবার, জ্বালানি, স্টাফ, পরিবহন বা মেইনটেন্যান্স—খরচের খাত ঠিক করে লিখুন। ড্যাশবোর্ড নিজেই আয়, ব্যয় ও নিট লাভ মিলিয়ে দেখাবে।',
    items: ['অগ্রিম ও বকেয়ার হিসাব', 'খাতভিত্তিক আয়–ব্যয়', 'ট্রিপ ও সময়ভিত্তিক লাভের রিপোর্ট'],
  },
  {
    icon: Globe2,
    kicker: 'অতিথির ওয়েবসাইট',
    title: 'যে ওয়েবসাইট দেখে অতিথি নিশ্চিন্তে বুকিং দিতে পারে।',
    text: 'কেবিনের ছবি থেকে ভ্রমণসূচি, খাবার, সুবিধা, গ্যালারি ও খালি তারিখ—সিদ্ধান্ত নেওয়ার সব তথ্য আপনার নিজস্ব ডোমেইনেই থাকবে।',
    items: ['মোবাইল–বান্ধব বুকিং অভিজ্ঞতা', 'আপনার নাম, লোগো ও রঙ', 'ওয়েবসাইট থেকেই বুকিং অনুরোধ'],
  },
];

const compactFeatures = [
  { icon: LayoutDashboard, title: 'ব্যবসার সারসংক্ষেপ', text: 'ট্রিপ, অতিথি, আয়, ব্যয় ও লাভ এক স্ক্রিনে।' },
  { icon: CalendarCheck2, title: 'বুকিং ক্যালেন্ডার', text: 'কোন তারিখে কোন কেবিন ফাঁকা বা বুকড দেখুন।' },
  { icon: BedDouble, title: 'কেবিন নিয়ন্ত্রণ', text: 'ছবি, ধারণক্ষমতা, মূল্য ও সুবিধা হালনাগাদ করুন।' },
  { icon: PackageCheck, title: 'ট্রিপ ও প্যাকেজ', text: 'রুট, সময়সূচি, খাবার ও প্যাকেজ সাজিয়ে প্রকাশ করুন।' },
  { icon: Users, title: 'অতিথির তথ্য', text: 'যোগাযোগ, বিশেষ অনুরোধ ও আগের বুকিং সংরক্ষণ করুন।' },
  { icon: CreditCard, title: 'পেমেন্ট হিসাব', text: 'অগ্রিম, বকেয়া, মাধ্যম ও ট্রানজ্যাকশন নম্বর রাখুন।' },
  { icon: ReceiptText, title: 'খরচের খাতা', text: 'খাবার থেকে জ্বালানি—প্রতিটি খরচ আলাদা খাতে লিখুন।' },
  { icon: FileBarChart, title: 'ব্যবসার রিপোর্ট', text: 'তারিখ বা ট্রিপ ধরে আয়–ব্যয় ও লাভ বুঝুন।' },
  { icon: CircleDollarSign, title: 'অফার নিয়ন্ত্রণ', text: 'উইকডে ছাড় ও বিশেষ দিনের ব্যতিক্রম ঠিক করুন।' },
  { icon: Images, title: 'গ্যালারি ও রিভিউ', text: 'ছবি সাজান, অতিথির মতামত প্রকাশ করুন।' },
  { icon: Palette, title: 'নিজস্ব ব্র্যান্ড', text: 'নাম, লোগো, রঙ, ফোন ও হোয়াটসঅ্যাপ বদলান।' },
  { icon: Settings2, title: 'সব সেটিংস এক জায়গায়', text: 'যোগাযোগ, পেমেন্ট ও সিজনের তথ্য নিয়ন্ত্রণ করুন।' },
];

const setupSteps = [
  { step: '০১', title: 'আপনার তথ্য বুঝে নিই', text: 'কেবিন, প্যাকেজ, ছবি, রুট, মূল্য ও বুকিংয়ের নিয়মগুলো সংগ্রহ করি।' },
  { step: '০২', title: 'আপনার নামে সাজিয়ে দিই', text: 'নিজস্ব ডোমেইনে ওয়েবসাইট, ডাটাবেজ ও অ্যাডমিন প্যানেল প্রস্তুত করি।' },
  { step: '০৩', title: 'ব্যবহার বুঝিয়ে দিই', text: 'আপনি ও আপনার টিম যেন প্রথম দিন থেকেই আত্মবিশ্বাসের সঙ্গে চালাতে পারেন।' },
];

const includedItems = [
  'আপনার ডোমেইনে পূর্ণাঙ্গ বুকিং ওয়েবসাইট',
  'মোবাইল ও কম্পিউটারের জন্য অ্যাডমিন প্যানেল',
  'হাওর ও পদ্মার আলাদা সিজন ব্যবস্থা',
  'বুকিং, কাস্টমার ও কেবিন ম্যানেজমেন্ট',
  'পেমেন্ট, অগ্রিম ও বকেয়ার হিসাব',
  'আয়, ব্যয় ও নিট লাভের রিপোর্ট',
  'প্যাকেজ, গ্যালারি, রিভিউ ও অফার নিয়ন্ত্রণ',
  'নিজস্ব লোগো, রঙ ও যোগাযোগের তথ্য',
  'সফটওয়্যার ব্যবহারের প্রাথমিক প্রশিক্ষণ',
  'এককালীন পেমেন্টে আজীবন সফটওয়্যার লাইসেন্স',
];

const faqs = [
  {
    question: '৳৪০,০০০ কি এককালীন মূল্য?',
    answer: 'হ্যাঁ। সফটওয়্যার লাইসেন্সের মূল্য এককালীন ৳৪০,০০০। এটি নেওয়ার পর সফটওয়্যার ব্যবহারের জন্য আলাদা মাসিক বা বার্ষিক লাইসেন্স ফি দিতে হবে না।',
  },
  {
    question: 'ওয়েবসাইটে কি আমার হাউসবোটের নাম ও লোগো থাকবে?',
    answer: 'অবশ্যই। নাম, লোগো, ব্র্যান্ডের রঙ, কেবিনের ছবি, প্যাকেজ, ফোন, হোয়াটসঅ্যাপ ও ঠিকানা—সবকিছু আপনার ব্যবসা অনুযায়ী সাজানো হবে।',
  },
  {
    question: 'তাঙ্গুয়ার হাওর ও পদ্মা নদীর ট্রিপ কি একই সিস্টেমে চালাতে পারব?',
    answer: 'পারবেন। অ্যাডমিন প্যানেল থেকে সিজন বদলালে ওয়েবসাইটের গন্তব্য, বার্তা, বুকিংয়ের ধরন ও প্রাসঙ্গিক তথ্য নির্বাচিত সিজন অনুযায়ী বদলে যাবে।',
  },
  {
    question: 'মোবাইল থেকেই কি দৈনন্দিন কাজ করা যাবে?',
    answer: 'হ্যাঁ। বুকিং দেখা, কাস্টমারের তথ্য খোঁজা, পেমেন্ট হালনাগাদ বা আয়–ব্যয় দেখা—এসব কাজ মোবাইল, ট্যাব ও কম্পিউটার থেকে করা যাবে।',
  },
  {
    question: 'কেনার আগে সম্পূর্ণ ডেমো দেখা যাবে?',
    answer: 'হ্যাঁ। “লাইভ ডেমো” বাটনে ক্লিক করে অতিথির বুকিং ওয়েবসাইট দেখা যাবে। নিচের ডেমো লিংক থেকে অ্যাডমিন প্যানেলও দেখা যাবে।',
  },
];

function SalesLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex flex-col">
      <Image
        src="/logo-floatbase-system.svg"
        alt="Floatbase"
        width={930}
        height={235}
        priority
        className="h-auto w-[174px] sm:w-[210px]"
      />
      <span className={`ml-[72px] mt-[-5px] text-[8px] font-extrabold tracking-[0.12em] sm:ml-[87px] sm:text-[9px] ${light ? 'text-[#f8e4b1]' : 'text-[#315f5a]'}`}>
        হাউসবোট ম্যানেজমেন্ট সিস্টেম
      </span>
    </span>
  );
}

function DashboardPreview() {
  const nav = [
    ['ড্যাশবোর্ড', LayoutDashboard],
    ['বুকিং', CalendarCheck2],
    ['ট্রিপ', Ship],
    ['কাস্টমার', Users],
    ['আয়–ব্যয়', Wallet],
    ['রিপোর্ট', BarChart3],
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[670px]">
      <div className="sales-float-slow absolute -left-6 top-24 z-20 hidden rounded-2xl border border-[#f6c453]/20 bg-[#0b4b47]/90 px-4 py-3 text-[#fff5d9] shadow-2xl backdrop-blur-xl lg:block">
        <div className="flex items-center gap-2 text-xs font-bold"><BadgeCheck className="h-4 w-4 text-[#f6c453]" /> আজকের হিসাব মিলেছে</div>
      </div>
      <div className="sales-float absolute -right-5 bottom-20 z-20 hidden rounded-2xl border border-[#eed18a] bg-[#fffaf0] px-4 py-3 text-[#123f3c] shadow-2xl lg:block">
        <div className="text-[10px] font-bold text-[#6c827e]">পরবর্তী ট্রিপ</div>
        <div className="mt-1 text-sm font-black">২৩ আগস্ট · নিশ্চিত</div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-[#f4c75e]/35 bg-[#f7f2e7] p-2 shadow-[0_36px_100px_rgba(0,22,20,0.48)]">
        <div className="overflow-hidden rounded-[23px] border border-[#123f3c]/10 bg-[#f7f3e9]">
          <div className="flex h-10 items-center justify-between border-b border-[#123f3c]/10 bg-[#fffdf8] px-4">
            <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e86f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#efb53e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#55b883]" /></div>
            <div className="rounded-full bg-[#e9eee8] px-8 py-1 text-[8px] font-bold text-[#6d807c] sm:px-14">admin.floatbase.com</div>
            <span className="h-4 w-4 rounded-full bg-[#0b4b47]" />
          </div>

          <div className="flex min-h-[415px] sm:min-h-[470px]">
            <aside className="hidden w-[145px] shrink-0 bg-[#073f3c] p-4 text-white sm:block">
              <div className="mb-7 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f3b52f] text-[#073f3c]"><Ship className="h-3.5 w-3.5" /></span><span className="text-[10px] font-black">Floatbase</span></div>
              {nav.map(([label, Icon], index) => (
                <div key={label} className={`mb-1.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9px] font-semibold ${index === 0 ? 'bg-[#f4b72f] text-[#073f3c]' : 'text-white/55'}`}><Icon className="h-3 w-3" />{label}</div>
              ))}
            </aside>

            <div className="min-w-0 flex-1 p-3.5 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div><div className="text-[9px] font-bold text-[#7b8f8a]">রবিবার, ১৬ আগস্ট</div><h3 className="mt-1 text-base font-black text-[#123f3c] sm:text-lg">ব্যবসার সারসংক্ষেপ</h3></div>
                <div className="rounded-lg border border-[#123f3c]/10 bg-[#fffdf8] px-3 py-1.5 text-[8px] font-bold text-[#0b625c]">এই মাস</div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ['ট্রিপ', '২৪', Ship, 'bg-[#e8f4f0] text-[#0b6b62]'],
                  ['অতিথি', '৪৮৬', Users, 'bg-[#fff1cd] text-[#9a6811]'],
                  ['মোট আয়', '৳৮.৪ লাখ', TrendingUp, 'bg-[#e7f3ef] text-[#08715e]'],
                ].map(([label, value, Icon, tone]) => {
                  const StatIcon = Icon as typeof Ship;
                  return (
                    <div key={label as string} className="rounded-xl border border-[#123f3c]/[0.08] bg-[#fffdf8] p-2.5 sm:rounded-2xl sm:p-3.5">
                      <span className={`mb-2 grid h-7 w-7 place-items-center rounded-lg ${tone}`}><StatIcon className="h-3.5 w-3.5" /></span>
                      <div className="text-[8px] font-bold text-[#83928f] sm:text-[9px]">{label as string}</div>
                      <div className="mt-1 whitespace-nowrap text-xs font-black text-[#123f3c] sm:text-base">{value as string}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1.45fr_1fr]">
                <div className="rounded-2xl border border-[#123f3c]/[0.08] bg-[#fffdf8] p-3.5">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black text-[#123f3c]">আয় ও ব্যয়</span><span className="text-[8px] font-bold text-[#82918e]">শেষ ৬ মাস</span></div>
                  <div className="mt-5 flex h-[105px] items-end gap-2 sm:h-[130px] sm:gap-3">
                    {[40, 56, 49, 73, 64, 90].map((height, index) => (
                      <div key={height} className="flex h-full flex-1 items-end justify-center gap-0.5"><span className="w-2 rounded-t-sm bg-[#0c746a] sm:w-3" style={{ height: `${height}%` }} /><span className="w-2 rounded-t-sm bg-[#efb43b] sm:w-3" style={{ height: `${Math.max(height - 23 + (index % 2) * 6, 18)}%` }} /></div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-center gap-4 text-[8px] font-bold text-[#82918e]"><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#0c746a]" /> আয়</span><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#efb43b]" /> ব্যয়</span></div>
                </div>
                <div className="hidden rounded-2xl bg-[#0b4b47] p-4 text-white sm:block">
                  <div className="text-[9px] font-bold text-white/50">নিট লাভ</div><div className="mt-2 text-xl font-black text-[#f7cc69]">৳৩.২ লাখ</div><div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#91ded1]"><TrendingUp className="h-3 w-3" /> ১৮% বৃদ্ধি</div>
                  <div className="mt-6 border-t border-white/10 pt-3 text-[8px]"><div className="flex justify-between"><span className="text-white/45">বকেয়া</span><b>৳৪৮,০০০</b></div><div className="mt-2 flex justify-between"><span className="text-white/45">অগ্রিম</span><b>৳১.৭ লাখ</b></div></div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#0c746a]/15 bg-[#eaf5f1] px-3 py-2.5">
                <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#0c746a]"><CalendarCheck2 className="h-3.5 w-3.5" /></span><div><div className="text-[9px] font-black text-[#123f3c]">আগামী ট্রিপ</div><div className="text-[8px] text-[#6d817d]">তাঙ্গুয়ার হাওর · ২৩ আগস্ট</div></div></div>
                <span className="rounded-full bg-[#0c746a] px-2 py-1 text-[7px] font-bold text-white">নিশ্চিত</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="sales-shell min-h-screen overflow-hidden bg-[#063b38] text-[#fffaf0]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#f5c65f]/15 bg-[#063b38]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="#top" aria-label="Floatbase হোম"><SalesLogo light /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="প্রধান মেনু">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-bold text-white/65 hover:text-[#f6c453]">{item.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
          <Link href="/demo" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold text-[#f9e4b1] hover:bg-white/[0.05]">লাইভ ডেমো <ExternalLink className="h-3.5 w-3.5" /></Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#f3b52f] px-5 py-3 text-sm font-black text-[#073f3c] shadow-lg shadow-black/15 hover:bg-[#ffd067]"><MessageCircle className="h-4 w-4" /> কথা বলুন</a>
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-[#f5c65f]/20 bg-white/5 text-white lg:hidden" aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#f5c65f]/15 bg-[#063b38] px-5 pb-5 pt-3 lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="মোবাইল মেনু">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.05]">{item.label}</Link>)}
            <div className="mt-3 grid grid-cols-2 gap-2"><Link href="/demo" onClick={() => setMenuOpen(false)} className="rounded-xl border border-[#f5c65f]/20 px-3 py-3 text-center text-sm font-black text-[#f8dda0]">লাইভ ডেমো</Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#f3b52f] px-3 py-3 text-center text-sm font-black text-[#073f3c]">কথা বলুন</a></div>
          </nav></div>
        )}
      </header>

      <section id="top" className="sales-hero relative overflow-hidden pb-20 pt-36 sm:pt-40 lg:pb-28 lg:pt-48">
        <div className="sales-water-lines pointer-events-none absolute inset-0 opacity-35" />
        <div className="sales-gold-curve pointer-events-none absolute -left-[12%] top-12 h-52 w-[125%] rounded-[50%] border-b-2 border-[#f4b93e]/70" />
        <div className="pointer-events-none absolute -left-32 top-48 h-[430px] w-[430px] rounded-full bg-[#1aa99b]/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-[420px] w-[420px] rounded-full bg-[#f3b52f]/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f4c65e]/25 bg-[#0d4c48]/75 px-3.5 py-2 text-xs font-extrabold text-[#f9dea0]"><Ship className="h-3.5 w-3.5 text-[#43d1df]" /> হাউসবোট মালিকদের দৈনন্দিন কাজের জন্য তৈরি</div>
            <h1 className="text-balance text-[43px] font-black leading-[1.12] tracking-[-0.045em] text-white sm:text-6xl lg:text-[66px]">
              বুকিং কোথায়, বকেয়া কত, <span className="sales-gold-text">লাভ হলো কি না—</span>এক জায়গায় জানুন।
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/[0.66] sm:text-lg">ফোন, ইনবক্স আর খাতায় ছড়িয়ে থাকা তথ্য গুছিয়ে আনুন একটি সহজ সিস্টেমে। অতিথি বুকিং দেবে আপনার ওয়েবসাইটে; আপনি পুরো ব্যবসা দেখবেন একটি ড্যাশবোর্ডে।</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/demo" className="group flex items-center justify-center gap-2 rounded-full bg-[#f3b52f] px-6 py-4 text-sm font-black text-[#073f3c] shadow-[0_16px_45px_rgba(243,181,47,0.18)] hover:bg-[#ffd067]">লাইভ ওয়েবসাইট দেখুন <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-4 text-sm font-black text-white hover:bg-white/10"><MessageCircle className="h-4 w-4 text-[#51d4dd]" /> বিস্তারিত জানতে কথা বলুন</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/[0.52]"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f3bd45]" /> আপনার নিজস্ব ডোমেইন</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f3bd45]" /> মোবাইল থেকেই নিয়ন্ত্রণ</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#f3bd45]" /> এককালীন মূল্য</span></div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="border-y border-[#f4c65e]/[0.18] bg-[#043431] px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-3 md:divide-x md:divide-[#f4c65e]/15">
          {dailyQuestions.map((item) => <article key={item.number} className="flex gap-4 md:px-7 first:md:pl-0 last:md:pr-0"><span className="text-xs font-black text-[#f3bd45]">{item.number}</span><div><h2 className="text-base font-black leading-6 text-white">{item.question}</h2><p className="mt-1.5 text-sm font-medium text-white/[0.48]">{item.answer}</p></div></article>)}
        </div>
      </section>

      <section id="system" className="bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]">
            <div><div className="sales-kicker-dark">বাস্তব কাজ, সহজ সমাধান</div><h2 className="sales-title-dark mt-5 max-w-3xl">অতিথির সামনে সুন্দর ওয়েবসাইট। ভেতরে শক্তিশালী নিয়ন্ত্রণ।</h2></div>
            <p className="text-base font-medium leading-8 text-[#58716c] lg:text-right">ভালো সফটওয়্যার শুধু ফিচারের তালিকা নয়—ব্যস্ত দিনে দ্রুত সঠিক সিদ্ধান্ত নেওয়ার একটি পরিষ্কার উপায়।</p>
          </div>

          <div className="mt-14 space-y-5">
            {featureGroups.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="grid overflow-hidden rounded-[30px] border border-[#123f3c]/10 bg-[#fffdf8] shadow-[0_18px_60px_rgba(7,63,60,0.07)] lg:grid-cols-[0.8fr_1.2fr]">
                  <div className={`relative min-h-[300px] overflow-hidden ${index === 2 ? 'lg:order-2' : ''}`}>
                    {index === 2 ? (
                      <Image src="/hero-floatboat-houseboat.jpg" alt="হাউসবোটের বুকিং ওয়েবসাইট" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                    ) : (
                      <div className={`absolute inset-0 ${index === 0 ? 'bg-[#073f3c]' : 'bg-[#0b4b47]'}`}>
                        <div className="sales-water-lines absolute inset-0 opacity-20" />
                        <div className="relative flex h-full items-center justify-center p-8">
                          {index === 0 ? (
                            <div className="w-full max-w-sm rounded-[24px] border border-[#f4c65e]/25 bg-[#f7f2e7] p-5 text-[#123f3c] shadow-2xl">
                              <div className="flex items-center justify-between border-b border-[#123f3c]/10 pb-4"><div><div className="text-[9px] font-bold text-[#78908a]">নতুন বুকিং</div><div className="mt-1 font-black">FB-260816-018</div></div><span className="rounded-full bg-[#fff0c9] px-2.5 py-1 text-[9px] font-black text-[#8e5e06]">অপেক্ষমাণ</span></div>
                              <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-white p-3"><span className="block text-[9px] text-[#78908a]">অতিথি</span><b className="mt-1 block">আরিফ হাসান</b></div><div className="rounded-xl bg-white p-3"><span className="block text-[9px] text-[#78908a]">যাত্রার তারিখ</span><b className="mt-1 block">২৩ আগস্ট</b></div><div className="rounded-xl bg-white p-3"><span className="block text-[9px] text-[#78908a]">মোট</span><b className="mt-1 block">৳২৪,০০০</b></div><div className="rounded-xl bg-white p-3"><span className="block text-[9px] text-[#78908a]">বকেয়া</span><b className="mt-1 block text-[#a66a00]">৳১২,০০০</b></div></div>
                            </div>
                          ) : (
                            <div className="grid w-full max-w-sm grid-cols-2 gap-3"><div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] p-5"><span className="text-[10px] font-bold text-white/50">এই ট্রিপের নিট লাভ</span><div className="mt-2 text-3xl font-black text-[#f5c75f]">৳৪৮,৫০০</div></div>{[['মোট আয়','৳১,৪০,০০০'],['মোট খরচ','৳৯১,৫০০']].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><span className="text-[9px] font-bold text-white/45">{label}</span><b className="mt-2 block text-base text-white">{value}</b></div>)}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {index === 2 && <div className="absolute inset-0 bg-gradient-to-t from-[#052f2d]/80 via-transparent to-transparent" />}
                  </div>
                  <div className={`p-7 sm:p-10 lg:p-12 ${index === 2 ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f1ed] text-[#0b6f66]"><Icon className="h-5 w-5" /></span><span className="text-xs font-black tracking-[0.12em] text-[#9a6b16]">{feature.kicker}</span></div>
                    <h3 className="mt-6 text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl">{feature.title}</h3>
                    <p className="mt-4 text-sm font-medium leading-7 text-[#637a75] sm:text-base">{feature.text}</p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{feature.items.map((item) => <li key={item} className="flex items-start gap-2 text-xs font-bold leading-5 text-[#315b55]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e7f1ed] text-[#0b6f66]"><Check className="h-3 w-3" /></span>{item}</li>)}</ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="seasons" className="relative overflow-hidden bg-[#073f3c] px-5 py-20 sm:py-28 lg:px-8">
        <div className="sales-water-lines pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center"><div className="sales-kicker-light">এক সিস্টেম, দুই আয়োজন</div><h2 className="sales-title-light mt-5">তাঙ্গুয়ার হাওর হোক বা পদ্মা নদী—ওয়েবসাইট থাকবে প্রস্তুত</h2><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-white/[0.58]">গন্তব্য বদলালে অতিথির প্রয়োজনও বদলায়। তাই দুই ধরনের ট্রিপকে একই ছাঁচে না ফেলে, আলাদা কনটেন্ট ও বুকিং প্রবাহ রাখা হয়েছে।</p></div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {[
              { image: '/hero-floatboat-houseboat.jpg', label: 'তাঙ্গুয়ার হাওর', title: 'কেবিন অথবা সম্পূর্ণ হাউসবোট', text: 'রাতযাপন, কেবিন নির্বাচন, প্যাকেজ, খাবার ও তারিখভিত্তিক বুকিংয়ের জন্য সাজানো অভিজ্ঞতা।', tag: 'হাওর মোড' },
              { image: '/images/padma/padma-bridge.jpg', label: 'পদ্মা নদী', title: 'ডে-লং, পরিবার ও কর্পোরেট ট্রিপ', text: 'অতিথির সংখ্যা, নির্বাচিত তারিখ এবং গ্রুপভিত্তিক আয়োজনের জন্য আলাদা বুকিং প্রবাহ।', tag: 'পদ্মা মোড' },
            ].map((season) => <article key={season.label} className="overflow-hidden rounded-[30px] border border-[#f4c65e]/[0.18] bg-[#0b4b47]"><div className="relative aspect-[16/10]"><Image src={season.image} alt={season.label} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#042f2d]/90 via-transparent to-transparent" /><span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#063b38]/75 px-3 py-1.5 text-[10px] font-black text-[#f7d98e] backdrop-blur-md">{season.tag}</span></div><div className="p-7 sm:p-8"><div className="text-xs font-black tracking-[0.12em] text-[#47d1dd]">{season.label}</div><h3 className="mt-3 text-2xl font-black text-white">{season.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-white/[0.55]">{season.text}</p></div></article>)}
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-3 rounded-2xl border border-[#f4c65e]/20 bg-[#052f2d] px-5 py-4 text-center text-sm font-bold text-[#f8dfa6]"><ToggleLeft className="h-5 w-5 shrink-0 text-[#47d1dd]" /> অ্যাডমিন প্যানেলে সিজন নির্বাচন করলেই ওয়েবসাইটের প্রাসঙ্গিক তথ্য বদলে যাবে।</div>
        </div>
      </section>

      <section id="features" className="bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]"><div><div className="sales-kicker-dark">যা যা পরিচালনা করতে পারবেন</div><h2 className="sales-title-dark mt-5 max-w-3xl">দৈনন্দিন কাজের প্রতিটি গুরুত্বপূর্ণ জায়গা</h2></div><p className="text-base font-medium leading-8 text-[#5e756f] lg:text-right">অপ্রয়োজনীয় জটিলতা বাদ দিয়ে হাউসবোট চালাতে যে নিয়ন্ত্রণগুলো সত্যিই দরকার।</p></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[30px] border border-[#123f3c]/10 bg-[#123f3c]/10 sm:grid-cols-2 lg:grid-cols-3">
            {compactFeatures.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="group bg-[#fffdf8] p-6 transition-colors hover:bg-[#f9f4e9] sm:p-7"><span className="grid h-11 w-11 place-items-center rounded-xl border border-[#0b6f66]/[0.12] bg-[#e7f1ed] text-[#0b6f66] transition-transform group-hover:-rotate-3 group-hover:scale-105"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-black">{feature.title}</h3><p className="mt-2 text-sm font-medium leading-6 text-[#657b76]">{feature.text}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="bg-[#043431] px-5 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center"><div className="sales-kicker-light">শুরু করার প্রক্রিয়া</div><h2 className="sales-title-light mt-5">তথ্য দিন, সেটআপ বুঝে নিন, কাজ শুরু করুন</h2><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-white/[0.55]">প্রযুক্তিগত কিছু শেখার চাপ নেই। আপনার ব্যবসা কীভাবে চলে, সেটাই হবে সিস্টেম সাজানোর ভিত্তি।</p></div>
          <div className="relative mt-14 grid gap-5 md:grid-cols-3"><div className="absolute left-[16%] right-[16%] top-9 hidden border-t border-dashed border-[#f4c65e]/25 md:block" />{setupSteps.map((item, index) => <article key={item.step} className="relative rounded-[26px] border border-[#f4c65e]/[0.18] bg-[#073f3c] p-7 text-center"><span className="relative z-10 mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-[#f4c65e]/35 bg-[#052f2d] text-xl font-black text-[#f3bd45] shadow-lg">{item.step}</span><h3 className="mt-6 text-xl font-black text-white">{item.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-white/[0.52]">{item.text}</p>{index < 2 && <ArrowRight className="absolute -right-4 top-[30px] z-20 hidden h-8 w-8 rounded-full bg-[#f3b52f] p-2 text-[#073f3c] md:block" />}</article>)}</div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="sales-cream-lines pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center"><div className="sales-kicker-dark">একটি মূল্য, সম্পূর্ণ সিস্টেম</div><h2 className="sales-title-dark mt-5">সাবস্ক্রিপশন নয়—নিজের ব্যবসার জন্য নিজের সিস্টেম</h2><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-[#5f756f]">মূল্য নিয়ে কোনো স্তর বা লুকানো প্যাকেজ নেই। আপনার ব্র্যান্ডে সম্পূর্ণ সেটআপের জন্য একটিই নির্ধারিত মূল্য।</p></div>
          <div className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-[34px] border border-[#123f3c]/10 bg-[#fffdf8] shadow-[0_30px_90px_rgba(7,63,60,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden bg-[#073f3c] p-8 text-white sm:p-11"><div className="sales-water-lines absolute inset-0 opacity-15" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-[#f3b52f] px-3 py-1.5 text-[11px] font-black text-[#073f3c]"><Star className="h-3.5 w-3.5 fill-current" /> এককালীন মূল্য</span><div className="mt-8 text-sm font-bold text-white/50">সম্পূর্ণ সেটআপ ও লাইসেন্স</div><div className="mt-2 flex items-start gap-1"><span className="mt-2 text-2xl font-black text-[#f4c65e]">৳</span><span className="text-6xl font-black tracking-[-0.06em] sm:text-7xl">৪০,০০০</span></div><div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#9ee0d6]"><BadgeCheck className="h-4 w-4" /> একবার পেমেন্ট · আজীবন ব্যবহার</div><div className="my-8 h-px bg-[#f4c65e]/20" /><p className="text-sm font-medium leading-7 text-white/[0.58]">সফটওয়্যার লাইসেন্সের জন্য ভবিষ্যতে কোনো মাসিক বা বার্ষিক সাবস্ক্রিপশন নেই।</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#f3b52f] px-6 py-4 text-sm font-black text-[#073f3c] hover:bg-[#ffd067]">আমার হাউসবোটের জন্য চাই <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a></div></div>
            <div className="p-8 sm:p-11"><div className="text-xs font-black tracking-[0.14em] text-[#9a6b16]">এই মূল্যে যা যা থাকছে</div><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedItems.map((item) => <div key={item} className="flex gap-3 text-sm font-bold leading-6 text-[#365d57]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e5f1ed] text-[#0b6f66]"><Check className="h-3 w-3" /></span>{item}</div>)}</div><div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e9bd55]/35 bg-[#fff7df] p-4 text-xs font-semibold leading-6 text-[#755b27]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6b16]" /><span><b className="text-[#513d13]">আপনার ব্র্যান্ডেই থাকবে:</b> ওয়েবসাইটে অতিথি আপনার হাউসবোটের নামই দেখবে; Floatbase থাকবে সিস্টেমের নির্মাতা হিসেবে।</span></div></div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#073f3c] px-5 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div><div className="sales-kicker-light">সাধারণ জিজ্ঞাসা</div><h2 className="sales-title-light mt-5">সিদ্ধান্ত নেওয়ার আগে পরিষ্কার উত্তর</h2><p className="mt-5 text-base font-medium leading-8 text-white/[0.55]">আরও কিছু জানতে চাইলে হোয়াটসঅ্যাপে সরাসরি কথা বলতে পারেন।</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#f4c65e]/25 px-5 py-3 text-sm font-black text-[#f7d98e] hover:bg-white/[0.05]"><MessageCircle className="h-4 w-4" /> প্রশ্ন করুন</a></div>
          <div className="overflow-hidden rounded-[28px] border border-[#f4c65e]/[0.18] bg-[#052f2d]">{faqs.map((faq, index) => { const expanded = openFaq === index; return <div key={faq.question} className="border-b border-[#f4c65e]/[0.12] last:border-0"><button type="button" onClick={() => setOpenFaq(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 sm:py-6" aria-expanded={expanded}><span className="font-black leading-6 text-white">{faq.question}</span><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${expanded ? 'rotate-180 bg-[#f3b52f] text-[#073f3c]' : 'bg-white/[0.07] text-[#f6d381]'}`}><ChevronDown className="h-4 w-4" /></span></button>{expanded && <div className="px-5 pb-6 pr-14 text-sm font-medium leading-7 text-white/[0.52] sm:px-7 sm:pr-20">{faq.answer}</div>}</div>; })}</div>
        </div>
      </section>

      <section className="bg-[#073f3c] px-5 pb-8 lg:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#f3b52f] px-7 py-12 text-[#073f3c] sm:px-12 sm:py-14 lg:flex lg:items-center lg:justify-between"><div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[55px] border-white/[0.18]" /><div className="relative max-w-3xl"><div className="flex items-center gap-2 text-xs font-black tracking-[0.14em] text-[#6b4b0b]"><Clock3 className="h-4 w-4" /> এখন হিসাব গুছিয়ে নেওয়ার সময়</div><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">হাউসবোট চালান তথ্য দেখে,<br className="hidden sm:block" /> আন্দাজে নয়।</h2><p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#684f1e] sm:text-base">আপনার বর্তমান কাজের ধরন বুঝে কীভাবে সিস্টেমটি সাজানো হবে, সেটি নিয়ে কথা বলুন।</p></div><div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#073f3c] px-7 py-4 text-sm font-black text-white shadow-xl shadow-black/15 hover:bg-[#0b5550]"><MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপে কথা বলুন</a><Link href="/demo" className="flex items-center justify-center gap-2 rounded-full border border-[#073f3c]/[0.18] bg-white/30 px-7 py-4 text-sm font-black hover:bg-white/50">লাইভ ডেমো দেখুন <ExternalLink className="h-4 w-4" /></Link></div></div></section>

      <footer className="bg-[#032c2a] px-5 pb-28 pt-14 sm:pb-8 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-[#f4c65e]/15 pb-10 md:grid-cols-[1.25fr_0.75fr_0.75fr]"><div className="max-w-sm"><SalesLogo light /><p className="mt-6 text-sm font-medium leading-7 text-white/[0.48]">বাংলাদেশের হাউসবোট ব্যবসার বুকিং, হিসাব ও দৈনন্দিন পরিচালনা সহজ করার জন্য তৈরি সম্পূর্ণ ডিজিটাল সিস্টেম।</p></div><div><div className="text-xs font-black tracking-[0.15em] text-[#f3bd45]">দ্রুত লিংক</div><div className="mt-4 grid gap-3 text-sm font-bold text-white/[0.55]"><Link href="#system" className="hover:text-[#f3bd45]">সিস্টেমটি দেখুন</Link><Link href="#features" className="hover:text-[#f3bd45]">সুবিধাসমূহ</Link><Link href="#pricing" className="hover:text-[#f3bd45]">মূল্য</Link></div></div><div><div className="text-xs font-black tracking-[0.15em] text-[#f3bd45]">ডেমো</div><div className="mt-4 grid gap-3 text-sm font-bold text-white/[0.55]"><Link href="/demo" className="flex items-center gap-2 hover:text-[#f3bd45]">বুকিং ওয়েবসাইট <ExternalLink className="h-3.5 w-3.5" /></Link><Link href="/admin/login" className="flex items-center gap-2 hover:text-[#f3bd45]">অ্যাডমিন প্যানেল <ExternalLink className="h-3.5 w-3.5" /></Link></div></div></div><div className="flex flex-col gap-3 pt-6 text-xs font-semibold text-white/30 sm:flex-row sm:items-center sm:justify-between"><div>© ২০২৬ Floatbase. সর্বস্বত্ব সংরক্ষিত।</div><div>বাংলাদেশের হাউসবোট ব্যবসার জন্য তৈরি।</div></div></div></footer>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-[#e9bd55]/25 bg-[#fffaf0]/95 p-2 shadow-[0_16px_50px_rgba(0,25,23,0.28)] backdrop-blur-xl sm:hidden"><Link href="/demo" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e7f1ed] px-3 py-3 text-xs font-black text-[#073f3c]"><ExternalLink className="h-3.5 w-3.5" /> ডেমো দেখুন</Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#073f3c] px-3 py-3 text-xs font-black text-white"><MessageCircle className="h-3.5 w-3.5" /> কথা বলুন</a></div>
    </main>
  );
}
