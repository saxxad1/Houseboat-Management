'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BedDouble,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Clock3,
  CreditCard,
  ExternalLink,
  FileBarChart,
  Globe2,
  Images,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircle,
  Moon,
  PackageCheck,
  PhoneCall,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Waves,
  X,
  Zap,
} from 'lucide-react';

const whatsappUrl = `https://wa.me/8801343411792?text=${encodeURIComponent(
  'আমি Floatbase হাউজবোট ম্যানেজমেন্ট সিস্টেম সম্পর্কে বিস্তারিত জানতে চাই।'
)}`;

const navItems = [
  { label: 'ড্যাশবোর্ড', href: '#system' },
  { label: 'সিজন সুইচ', href: '#season-switch' },
  { label: 'সুবিধাসমূহ', href: '#core-features' },
  { label: 'কেন ওয়েবসাইট?', href: '#why-website' },
  { label: 'ফিচার তালিকা', href: '#all-features' },
  { label: 'মূল্য', href: '#pricing' },
  { label: 'জিজ্ঞাসা', href: '#faq' },
];

const painPoints = [
  {
    icon: ShieldAlert,
    before: 'খাতা বা নোটে বুকিং',
    after: 'একই কেবিনের ডাবল বুকিং বা তারিখ মিস হওয়ার ঝুঁকি শূন্য।',
  },
  {
    icon: Wallet,
    before: 'কার কত বকেয়া অজানা',
    after: 'অগ্রিম এসেছে কত, বকেয়া কত—সব ট্রানজ্যাকশন আইডি সহ স্পষ্ট।',
  },
  {
    icon: RefreshCw,
    before: 'সিজন শেষে সাইট বেকার',
    after: 'বর্ষায় হাওর আর শীতে পদ্মা—১ ক্লিকে পুরো সাইট অটো রিব্র্যান্ড।',
  },
  {
    icon: FileBarChart,
    before: 'ট্রিপ শেষে নিট লাভ অজানা',
    after: 'তেল, বাজার ও স্টাফ বাদ দিয়ে ট্রিপের এক্সাক্ট নিট প্রফিট বের হয়।',
  },
];

const allFeaturesList = [
  {
    icon: LayoutDashboard,
    title: 'সেন্ট্রাল ড্যাশবোর্ড',
    desc: 'আজকের ট্রিপ, বুকড কেবিন, মাসের মোট আয়, মোট খরচ ও নিট লাভ এক স্ক্রিনে।',
    tag: 'কন্ট্রোল',
  },
  {
    icon: CalendarCheck2,
    title: 'স্মার্ট বুকিং ও ক্যালেন্ডার',
    desc: 'তারিখভিত্তিক ফাঁকা বা বুকড কেবিনের রঙ-বেরঙের ক্যালেন্ডার। ওভারবুকিং বন্ধ।',
    tag: 'অপারেশন',
  },
  {
    icon: Waves,
    title: 'হাওর ও পদ্মা সিজন সুইচ',
    desc: 'বর্ষা ও শীতের জন্য আলাদা কনটেন্ট, রুট, খাবার ও বুকিং ফরম্যাট ১ ক্লিকে চেঞ্জ।',
    tag: 'ইউনিক',
  },
  {
    icon: BedDouble,
    title: 'কেবিন ও বোট ম্যানেজমেন্ট',
    desc: 'প্যানোরামা, কাপল, ফ্যামিলি কেবিন বা পুরো বোট চার্টারের আলাদা রেট ও ক্যাপাসিটি।',
    tag: 'কেবিন',
  },
  {
    icon: ReceiptText,
    title: 'ট্রিপ-ভিত্তিক খরচের খাতা',
    desc: 'ডিজেল/ফুয়েল, বাজার, বাবুর্চি-ক্রু বেতন, ঘাট খরচ—প্রতিটি খরচের নির্ভুল হিসাব।',
    tag: 'হিসাব',
  },
  {
    icon: TrendingUp,
    title: 'স্বয়ংক্রিয় নিট লাভ রিপোর্ট',
    desc: 'আয় থেকে সব খরচ বিয়োগ করে প্রতিটি ট্রিপ ও মাসের সঠিক নিট লাভ তৈরি।',
    tag: 'অ্যানালিটিক্স',
  },
  {
    icon: CreditCard,
    title: 'পেমেন্ট ও ভাউচার রসিদ',
    desc: 'বিকাশ, নগদ বা ব্যাংকের ট্রানজ্যাকশন আইডি ও অতিথির বুকিং ভাউচার তৈরি।',
    tag: 'পেমেন্ট',
  },
  {
    icon: Users,
    title: 'কাস্টমার CRM ডাটাবেজ',
    desc: 'অতিথির নাম, মোবাইল, পূর্বের ভ্রমণের ইতিহাস ও পছন্দ সংরক্ষিত থাকে।',
    tag: 'কাস্টমার',
  },
  {
    icon: CircleDollarSign,
    title: 'উইকডে ডিসকাউন্ট ও অফার',
    desc: 'অফ-পিক দিনে (রবি-বুধ) বুকিং বাড়াতে স্বয়ংক্রিয় ছাড় ও প্রমো কোড সুবিধা।',
    tag: 'মার্কেটিং',
  },
  {
    icon: PackageCheck,
    title: 'প্যাকেজ ও ফুড মেনু আপডেট',
    desc: 'হাঁসের মাংস, হাওরের মাছ, পদ্মার ইলিশ বা লাইভ বারবিকিউ মেনু ১ মিনিটে আপডেট।',
    tag: 'কন্টেন্ট',
  },
  {
    icon: Images,
    title: 'গ্যালারি ও রিভিউ কন্ট্রোল',
    desc: 'নৌকার প্রিমিয়াম ছবি ও হ্যাপি গেস্টদের রিয়েল রিভিউ সহজেই যুক্ত করুন।',
    tag: 'ব্র্যান্ডিং',
  },
  {
    icon: Settings2,
    title: 'ব্র্যান্ড ও সেটিংস কন্ট্রোল',
    desc: 'হাউজবোটের নাম, লোগো, ব্র্যান্ড কালার, হোয়াটসঅ্যাপ ও পেমেন্ট নম্বর পরিবর্তন।',
    tag: 'সেটিংস',
  },
];

const comparisonData = [
  {
    feature: 'বুকিং নেওয়ার মাধ্যম',
    traditional: 'খাতা, ডায়েরি বা মেসেঞ্জারের এলোমেলো চ্যাট',
    floatbase: 'অত্যাধুনিক বুকিং ওয়েবসাইট ও সেন্ট্রাল অ্যাডমিন ডেস্ক',
  },
  {
    feature: 'কেবিন ডাবল বুকিং ঝুঁকি',
    traditional: 'উচ্চ ঝুঁকি—একই তারিখ দুজন স্টাফ আলাদা বুক করতে পারে',
    floatbase: 'শূন্য ঝুঁকি—লাইভ ক্যালেন্ডার রিয়েল-টাইমে লক হয়ে যায়',
  },
  {
    feature: 'সিজনাল ট্রানজিশন (হাওর ↔ পদ্মা)',
    traditional: 'নতুন সাইট বানাতে হয় বা ডেভেলপারকে বারবার টাকা দিতে হয়',
    floatbase: '১ ক্লিকে পুরো সাইট ও বুকিং লজিক অটোমেটিক বদলে যায়',
  },
  {
    feature: 'ট্রিপের সঠিক লাভ-ক্ষতি',
    traditional: 'মাস শেষে তেল-বাজারের খাতা হারিয়ে লাভ আন্দাজে হিসাব',
    floatbase: 'ট্রিপ প্রতি তেল, বাজার, স্টাফ বাদ দিয়ে নিট প্রফিট এক ক্লিকে',
  },
  {
    feature: 'বকেয়া টাকা কালেকশন',
    traditional: 'মনে রাখা কঠিন, অনেক টাকা বকেয়া পড়ে থাকে',
    floatbase: 'প্রতিটি বুকিংয়ের পাশে লাল বকেয়া অ্যালার্ট ও পেমেন্ট হিস্ট্রি',
  },
  {
    feature: 'অতিথির কাছে বিশ্বাসযোগ্যতা',
    traditional: 'সাধারণ মেসেঞ্জার টেক্সট ও ছবি পাঠিয়ে বোঝানো কঠিন',
    floatbase: 'প্রিমিয়াম ব্র্যান্ডেড ওয়েবসাইট, লাইভ ফটো, মেনু ও ভাউচার',
  },
];

const faqs = [
  {
    question: '৳৪০,০০০ কি এককালীন মূল্য, নাকি কোনো মাসিক চার্জ আছে?',
    answer:
      'সম্পূর্ণ এককালীন মূল্য ৳৪০,০০০। এটি নেওয়ার পর সফটওয়্যার ব্যবহারের জন্য কোনো মাসিক বা বার্ষিক লাইসেন্স ফি নেই। আপনি আজীবন নিশ্চিন্তে এই সিস্টেমটি আপনার হাউজবোটের জন্য ব্যবহার করতে পারবেন।',
  },
  {
    question: 'টাংগুয়ার হাওর এবং পদ্মা নদীর ট্রিপ কি একই সিস্টেমে চালানো সম্ভব?',
    answer:
      'হ্যাঁ, এটাই Floatbase-এর সবচেয়ে বড় ইউএসপি (USP)! অ্যাডমিন প্যানেলে সিজন সেটিংস থেকে মাত্র ১ ক্লিকে "হাওর মোড" অথবা "পদ্মা মোড" সিলেক্ট করলেই গেস্ট বুকিং সাইটের সব রুট, ছবি, খাবারের মেনু, প্যাকেজ এবং বুকিং ফর্মের ধরন অটোমেটিক পরিবর্তিত হয়ে যাবে। কোনো ডেভেলপার ডাকতে হবে না।',
  },
  {
    question: 'ওয়েবসাইট ও অ্যাডমিনে কি আমার নিজস্ব হাউজবোটের নাম ও লোগো থাকবে?',
    answer:
      'অবশ্যই! আপনার হাউজবোটের নিজস্ব নাম, লোগো, ব্র্যান্ড কালার, কেবিনের আসল ছবি, প্যাকেজ, যোগাযোগের ফোন ও হোয়াটসঅ্যাপ নম্বর—সবকিছু আপনার ব্যবসা অনুযায়ী কাস্টমাইজ করে সম্পূর্ণ লাইভ করে দেওয়া হবে।',
  },
  {
    question: 'মোবাইল ফোন থেকেই কি সব হিসাব ও বুকিং পরিচালনা করা যাবে?',
    answer:
      'হ্যাঁ। অ্যাডমিন প্যানেলটি ১০০% মোবাইল-রেসপনসিভ। আপনি বা আপনার ম্যানেজার লঞ্চে/বোটে থাকা অবস্থায়ও মোবাইল দিয়ে নতুন বুকিং যোগ করতে পারবেন, খরচের ভাউচার এন্ট্রি দিতে পারবেন এবং আয়-ব্যয়ের লাভ দেখতে পারবেন।',
  },
  {
    question: 'কেনার আগে কি লাইভ ডেমো দেখে পরখ করা যাবে?',
    answer:
      'অবশ্যই! উপরের "লাইভ ডেমো" বাটনে ক্লিক করে গেস্টদের বুকিং ওয়েবসাইট এবং অ্যাডমিন প্যানেল দুটোই আপনি নিজ চোখে সম্পূর্ণ দেখতে ও টেস্ট করতে পারবেন।',
  },
  {
    question: 'অর্ডারের পর কত দিনে সিস্টেমটি আমার নামে সম্পূর্ণ রেডি হবে?',
    answer:
      'আপনার হাউজবোটের নাম, লোগো, কেবিনের ছবি এবং মূল্য পাওয়ার পর সাধারণত ৭ থেকে ১০ দিনের মধ্যে আপনার ডোমেইনে সম্পূর্ণ সিস্টেম লাইভ ও ব্যবহারের জন্য প্রস্তুত করে দেওয়া হয়।',
  },
];

function SalesLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex flex-col justify-center">
      <Image
        src="/logo-floatbase-system.svg"
        alt="Floatbase"
        width={930}
        height={235}
        priority
        className="h-auto w-[150px] sm:w-[185px]"
      />
      <span
        className={`whitespace-nowrap pl-[56px] -mt-1 text-[8px] font-extrabold tracking-[0.06em] sm:pl-[70px] sm:text-[9px] ${
          light ? 'text-[#f8e4b1]' : 'text-[#315f5a]'
        }`}
      >
        হাউজবোট ম্যানেজমেন্ট সিস্টেম
      </span>
    </span>
  );
}

export default function SalesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeSeasonDemo, setActiveSeasonDemo] = useState<'haor' | 'padma'>('haor');

  return (
    <main className="sales-shell min-h-screen overflow-hidden bg-[#063b38] text-[#fffaf0]">
      {/* 1. Header Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#f5c65f]/15 bg-[#063b38]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#top" aria-label="Floatbase হোম" className="shrink-0">
            <SalesLogo light />
          </Link>

          <nav className="hidden items-center gap-1 md:flex lg:gap-2.5 xl:gap-4" aria-label="প্রধান মেনু">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold text-white/75 transition hover:bg-white/[0.06] hover:text-[#f6c453] lg:text-[13px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
            <Link
              href="/demo"
              className="flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#f5c65f]/30 bg-white/[0.06] px-3.5 py-2 text-xs font-extrabold text-[#f9e4b1] transition hover:bg-white/[0.12] lg:px-4 lg:py-2.5 lg:text-sm"
            >
              লাইভ ডেমো <ExternalLink className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex whitespace-nowrap items-center gap-1.5 rounded-full bg-[#f3b52f] px-4 py-2 text-xs font-black text-[#073f3c] shadow-lg shadow-black/15 transition hover:bg-[#ffd067] lg:px-5 lg:py-2.5 lg:text-sm"
            >
              <MessageCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> কথা বলুন
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#f5c65f]/20 bg-white/5 text-white md:hidden"
            aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#f5c65f]/15 bg-[#063b38] px-5 pb-6 pt-3 md:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1" aria-label="মোবাইল মেনু">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-bold text-white/75 hover:bg-white/[0.08]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/demo"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-[#f5c65f]/30 bg-white/5 px-3 py-3 text-center text-sm font-black text-[#f8dda0]"
                >
                  লাইভ ডেমো
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#f3b52f] px-3 py-3 text-center text-sm font-black text-[#073f3c]"
                >
                  কথা বলুন
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="top" className="sales-hero relative overflow-hidden bg-[#032f2d] pt-[74px]">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/og.png"
            alt="Floatbase Houseboat Management"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[67%_center] opacity-45 lg:object-center"
          />
          <div className="sales-hero-photo-overlay absolute inset-0" />
        </div>

        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-5 py-16 sm:py-20 lg:min-h-[760px] lg:px-8 lg:py-24">
          <div className="max-w-[760px]">
            {/* Top Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f4c65e]/35 bg-[#073f3c]/85 px-4 py-2 text-xs font-extrabold text-[#f9dea0] backdrop-blur-md shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[#f3b52f]" />
              বাংলাদেশের হাউজবোট ব্যবসার জন্য ১ নম্বর ডিজিটাল অপারেটিং সিস্টেম
            </div>

            {/* Headline */}
            <h1 className="text-balance text-[38px] font-black leading-[1.12] tracking-[-0.04em] text-white sm:text-6xl lg:text-[66px]">
              হাউজবোট ব্যবসার হিসাব, বুকিং ও সিজন পরিচালনার{' '}
              <span className="sales-gold-text">সম্পূর্ণ ডিজিটাল সিস্টেম।</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-[680px] text-base font-medium leading-8 text-white/80 sm:text-lg">
              খাতার এলোমেলো হিসাব, ডাবল বুকিংয়ের ভয় আর সিজনাল গ্যাপকে বিদায় দিন। বর্ষায়{' '}
              <strong className="text-[#43d1df]">টাংগুয়ার হাওর</strong> আর শীতে{' '}
              <strong className="text-[#f3b52f]">পদ্মা নদী</strong>—এক প্ল্যাটফর্মেই নিয়ন্ত্রণ
              করুন বুকিং, কেবিন, খরচ, অগ্রিম-বকেয়া এবং প্রতিটি ট্রিপের নিট লাভ।
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/demo"
                className="group flex items-center justify-center gap-2.5 rounded-full bg-[#f3b52f] px-7 py-4 text-sm font-black text-[#073f3c] shadow-[0_16px_45px_rgba(243,181,47,0.25)] transition hover:bg-[#ffd067]"
              >
                সম্পূর্ণ লাইভ ডেমো দেখুন{' '}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-[#073f3c]/70 px-7 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-[#0b5550]"
              >
                <MessageCircle className="h-4 w-4 text-[#51d4dd]" /> হোয়াটসঅ্যাপে সরাসরি কথা বলুন
              </a>
            </div>

            {/* 3 Core Highlights */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: 'ডুয়াল-সিজন সুইচ',
                  label: 'বর্ষায় হাওর ↔ শীতে পদ্মা',
                  icon: RefreshCw,
                },
                {
                  title: 'ট্রিপের নিট লাভ খাতা',
                  label: 'তেল, বাজার ও স্টাফ বাদ দিয়ে',
                  icon: TrendingUp,
                },
                {
                  title: 'স্মার্ট বুকিং ডেস্ক',
                  label: 'কেবিন ব্লক ও লাইভ ক্যালেন্ডার',
                  icon: CalendarCheck2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.14] bg-[#032f2d]/65 px-4 py-3.5 backdrop-blur-md"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f3b52f] text-[#073f3c]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs font-black text-white">{item.title}</div>
                      <div className="mt-0.5 text-[10px] font-bold text-white/55">{item.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pain Points vs Solutions Banner */}
      <section className="border-y border-[#f4c65e]/[0.18] bg-[#043431] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="text-xs font-extrabold tracking-[0.14em] text-[#f3bd45]">
              বাস্তব সমস্যা ও আধুনিক সমাধান
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              হাউজবোট ব্যবসার চিরচেনা ৪টি বড় জটিলতার নিশ্চিত সমাধান
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-[#073f3c]/60 p-5 transition hover:border-[#f3b52f]/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#f3bd45]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-extrabold text-[#e8705b] line-through decoration-1">
                      {item.before}
                    </span>
                  </div>
                  <p className="mt-3.5 text-xs font-semibold leading-6 text-white/80">
                    <strong className="text-[#47d1dd]">Floatbase সমাধান: </strong>
                    {item.after}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Live Dashboard Preview Section */}
      <section id="system" className="relative overflow-hidden bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="sales-cream-lines pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="sales-kicker-dark">ডিজিটাল নিয়ন্ত্রণকক্ষ</div>
              <h2 className="sales-title-dark mt-4">
                সম্পূর্ণ ব্যবসার রিয়েল-টাইম তথ্য, এক সেন্ট্রাল ড্যাশবোর্ডে
              </h2>
            </div>
            <p className="text-base font-medium leading-8 text-[#58716c] lg:text-right">
              আজকের বুকিং, কেবিন ফাঁকা আছে কিনা, কে কত টাকা অগ্রিম দিলো, শেষ ট্রিপে মোট খরচ ও লাভ কত হলো—সবকিছু চোখের পলকে চোখের সামনে।
            </p>
          </div>

          {/* Interactive Simulation Container */}
          <div className="mt-14 overflow-hidden rounded-[32px] border border-[#123f3c]/15 bg-[#fffdf8] shadow-[0_36px_100px_rgba(0,22,20,0.18)]">
            {/* Browser chrome */}
            <div className="flex h-11 items-center justify-between border-b border-[#123f3c]/10 bg-[#f7f3e9] px-5">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#e86f57]" />
                <span className="h-3 w-3 rounded-full bg-[#efb53e]" />
                <span className="h-3 w-3 rounded-full bg-[#55b883]" />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#123f3c]/10 bg-white px-5 py-1 text-[10px] font-bold text-[#556d68]">
                <Lock className="h-3 w-3 text-[#0b6f66]" /> admin.yourhouseboat.com/dashboard
              </div>
              <span className="rounded-full bg-[#0b4b47] px-2.5 py-0.5 text-[9px] font-bold text-white">
                ম্যানেজার প্যানেল
              </span>
            </div>

            {/* Dashboard Content */}
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[240px_1fr]">
              {/* Left Sidebar Mock */}
              <div className="hidden flex-col gap-1 rounded-2xl bg-[#073f3c] p-4 text-white lg:flex">
                <div className="mb-5 flex items-center gap-2.5 px-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f3b52f] text-[#073f3c]">
                    <Ship className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black">Floatbase OS</div>
                    <div className="text-[9px] text-white/50">আপনার হাউজবোট</div>
                  </div>
                </div>
                {[
                  ['ড্যাশবোর্ড', LayoutDashboard, true],
                  ['বুকিং ডেস্ক', CalendarCheck2, false],
                  ['ট্রিপ স্লট', Ship, false],
                  ['হিসাব ও খাতা', Wallet, false],
                  ['সিজন সেটিংস', Waves, false],
                  ['রিপোর্ট ও লাভ', BarChart3, false],
                  ['কাস্টমার CRM', Users, false],
                ].map(([label, Icon, active]) => {
                  const NavIcon = Icon as typeof LayoutDashboard;
                  return (
                    <div
                      key={label as string}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                        active
                          ? 'bg-[#f3b52f] text-[#073f3c]'
                          : 'text-white/65 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <NavIcon className="h-3.5 w-3.5" />
                      {label as string}
                    </div>
                  );
                })}
                <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-[10px]">
                  <div className="text-white/40">অ্যাক্টিভ মোড</div>
                  <div className="mt-0.5 font-bold text-[#47d1dd]">🌊 টাংগুয়ার হাওর সিজন</div>
                </div>
              </div>

              {/* Main Dashboard Stats */}
              <div className="space-y-6">
                {/* Header Stats Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#718883]">রবিবার, আগস্ট ২০২৬</div>
                    <h3 className="text-xl font-black text-[#123f3c]">চলতি মাসের পারফর্মেন্স সামারি</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-[#0b6f66]/20 bg-[#eaf4f1] px-3 py-1.5 text-xs font-black text-[#0b6f66]">
                      সিজন: বর্ষা পিক-মৌসুম
                    </span>
                  </div>
                </div>

                {/* 4 Core Stat Cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: 'মোট কনফার্মড ট্রিপ',
                      val: '২৮ টি',
                      sub: 'এই মাসে ৯৩% অকুপেন্সি',
                      icon: Ship,
                      tone: 'bg-[#e8f4f0] text-[#0b6b62]',
                    },
                    {
                      label: 'মোট অতিথি',
                      val: '৬১২ জন',
                      sub: 'গড় ২২ জন/ট্রিপ',
                      icon: Users,
                      tone: 'bg-[#fff2d2] text-[#9b6a12]',
                    },
                    {
                      label: 'মোট বুকিং আয়',
                      val: '৳১০,৮০,০০০',
                      sub: 'অগ্রিম ৳৩.৮ লাখ গৃহীত',
                      icon: TrendingUp,
                      tone: 'bg-[#e8f7f0] text-[#09774d]',
                    },
                    {
                      label: 'নিট লাভ (P&L)',
                      val: '৳৪,২৫,০০০',
                      sub: 'তেল ও বাজার বাদে',
                      icon: Wallet,
                      tone: 'bg-[#0b4b47] text-[#f7cc69]',
                      highlight: true,
                    },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className={`rounded-2xl p-4 transition ${
                          stat.highlight
                            ? 'bg-[#073f3c] text-white shadow-xl'
                            : 'border border-[#123f3c]/[0.08] bg-[#fffdf8]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold ${
                              stat.highlight ? 'bg-[#f3b52f] text-[#073f3c]' : stat.tone
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              stat.highlight ? 'text-[#47d1dd]' : 'text-[#718883]'
                            }`}
                          >
                            লাইভ
                          </span>
                        </div>
                        <div
                          className={`mt-3 text-xs font-bold ${
                            stat.highlight ? 'text-white/60' : 'text-[#718883]'
                          }`}
                        >
                          {stat.label}
                        </div>
                        <div
                          className={`mt-1 text-xl font-black ${
                            stat.highlight ? 'text-[#f4c65e]' : 'text-[#123f3c]'
                          }`}
                        >
                          {stat.val}
                        </div>
                        <div
                          className={`mt-1.5 text-[10px] font-semibold ${
                            stat.highlight ? 'text-white/70' : 'text-[#879b97]'
                          }`}
                        >
                          {stat.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Split View: Live Trip Card & Recent Bookings Table */}
                <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                  {/* Trip Details & P&L Mock */}
                  <div className="rounded-2xl border border-[#123f3c]/[0.09] bg-[#fffdf8] p-5">
                    <div className="flex items-center justify-between border-b border-[#123f3c]/[0.08] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#829692]">পরবর্তী রানিং ট্রিপ</span>
                        <div className="text-sm font-black text-[#123f3c]">
                          টাংগুয়ার হাওর ২ দিন ১ রাত · ২৩ আগস্ট
                        </div>
                      </div>
                      <span className="rounded-full bg-[#0c746a] px-2.5 py-1 text-[10px] font-bold text-white">
                        ফুল বোট কনফার্মড
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                      <div className="rounded-xl bg-[#f7f3e9] p-3">
                        <div className="text-[10px] text-[#718883]">ট্রিপ থেকে আয়</div>
                        <div className="mt-1 text-sm font-black text-[#0b6f66]">৳১,৫০,০০০</div>
                      </div>
                      <div className="rounded-xl bg-[#f7f3e9] p-3">
                        <div className="text-[10px] text-[#718883]">তেল ও বাজার খরচ</div>
                        <div className="mt-1 text-sm font-black text-[#cf3d28]">৳৫৮,৫০০</div>
                      </div>
                      <div className="rounded-xl bg-[#e7f4f0] p-3">
                        <div className="text-[10px] font-bold text-[#0b6f66]">নিট লাভ</div>
                        <div className="mt-1 text-sm font-black text-[#073f3c]">৳৯১,৫০০</div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#5c726e]">
                        <span>ফুয়েল / ডিজেল বিল (১৮০ লিটার)</span>
                        <b className="text-[#123f3c]">৳১৯,৮০০</b>
                      </div>
                      <div className="flex items-center justify-between text-[#5c726e]">
                        <span>খাবার বাজার ও দেশি হাঁস</span>
                        <b className="text-[#123f3c]">৳২৬,৭০০</b>
                      </div>
                      <div className="flex items-center justify-between text-[#5c726e]">
                        <span>বাবুর্চি, ক্রু ও হেল্পার মজুরি</span>
                        <b className="text-[#123f3c]">৳১২,০০০</b>
                      </div>
                    </div>
                  </div>

                  {/* Booking Slots & Status Mock */}
                  <div className="rounded-2xl border border-[#123f3c]/[0.09] bg-[#fffdf8] p-5">
                    <div className="flex items-center justify-between border-b border-[#123f3c]/[0.08] pb-3">
                      <span className="text-xs font-black text-[#123f3c]">আজকের নতুন বুকিং</span>
                      <span className="text-[10px] font-bold text-[#0c746a]">৩টি অপেক্ষমাণ</span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {[
                        {
                          id: 'FB-260823-01',
                          guest: 'তানভীর আহমেদ (৮ জন)',
                          cabin: 'প্যানোরামা + কাপল কেবিন',
                          due: 'বকেয়া: ৳১৪,০০০',
                          status: 'অগ্রিম প্রাপ্ত',
                        },
                        {
                          id: 'FB-260825-02',
                          guest: 'ফারহান চৌধুরী (কর্পোরেট)',
                          cabin: 'সম্পূর্ণ বোট চার্টার',
                          due: 'বকেয়া: ৳৫০,০০০',
                          status: 'অপেক্ষমাণ',
                        },
                        {
                          id: 'FB-260828-03',
                          guest: 'ডা. সায়মা করিম (২ জন)',
                          cabin: 'প্রিমিয়াম এসি কাপল',
                          due: 'পরিশোধিত',
                          status: 'কনফার্মড',
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-[#123f3c]/[0.06] bg-[#fdfaf3] p-2.5 text-xs"
                        >
                          <div>
                            <div className="font-black text-[#123f3c]">{item.guest}</div>
                            <div className="text-[10px] text-[#718883]">{item.cabin}</div>
                          </div>
                          <div className="text-right">
                            <span className="rounded-md bg-[#e7f1ed] px-2 py-0.5 text-[9px] font-extrabold text-[#0b6f66]">
                              {item.status}
                            </span>
                            <div className="mt-0.5 text-[9px] font-bold text-[#9b6a12]">
                              {item.due}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Season Switcher Showcase (USP Spotlight) */}
      <section
        id="season-switch"
        className="relative overflow-hidden bg-[#073f3c] px-5 py-20 sm:py-28 lg:px-8"
      >
        <div className="sales-water-lines pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-light">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#f3b52f]" /> গেম-চেঞ্জার ফিচার
            </div>
            <h2 className="sales-title-light mt-4">
              বর্ষায় টাংগুয়ার হাওর, শীতে পদ্মা নদী—১ ক্লিকে সম্পূর্ণ ওয়েবসাইট রূপান্তর
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-white/75">
              সিজন পরিবর্তনের পর কোনো ওয়েব ডিজাইনার বা ডেভেলপার ডাকতে হবে না। অ্যাডমিন প্যানেল থেকে সিজন সিলেক্ট করলেই গেস্টদের ওয়েবসাইট, বুকিং ফর্ম, রুট ও খাবারের তালিকা স্বয়ংক্রিয়ভাবে বদলে যায়।
            </p>

            {/* Interactive Toggle Switcher */}
            <div className="mt-10 inline-flex rounded-full border border-[#f4c65e]/30 bg-[#042d2a] p-1.5 shadow-2xl">
              <button
                type="button"
                onClick={() => setActiveSeasonDemo('haor')}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black transition-all ${
                  activeSeasonDemo === 'haor'
                    ? 'bg-[#f3b52f] text-[#073f3c] shadow-lg shadow-black/25'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Waves className="h-4 w-4" /> 🌊 টাংগুয়ার হাওর মোড (জুন – অক্টোবর)
              </button>
              <button
                type="button"
                onClick={() => setActiveSeasonDemo('padma')}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black transition-all ${
                  activeSeasonDemo === 'padma'
                    ? 'bg-[#43d1df] text-[#073f3c] shadow-lg shadow-black/25'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Ship className="h-4 w-4" /> ⛵ পদ্মা নদী মোড (নভেম্বর – মে)
              </button>
            </div>
          </div>

          {/* Dynamic Preview Card based on selected season */}
          <div className="mt-14 overflow-hidden rounded-[32px] border border-[#f4c65e]/25 bg-[#052f2d] shadow-2xl">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left Image & High-Contrast Tag */}
              <div className="relative min-h-[340px] overflow-hidden lg:min-h-[460px]">
                <Image
                  key={activeSeasonDemo}
                  src={
                    activeSeasonDemo === 'haor'
                      ? '/hero-floatboat-houseboat.jpg'
                      : '/images/padma/padma-bridge.jpg'
                  }
                  alt={activeSeasonDemo === 'haor' ? 'টাংগুয়ার হাওর হাউজবোট' : 'পদ্মা নদী ডে-লং ক্রুজ'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052f2d] via-transparent to-transparent" />
                
                {/* High Contrast Badges */}
                <div className="absolute left-6 top-6 flex flex-wrap gap-2.5">
                  <span className="flex items-center gap-2 rounded-full border border-[#f3bd45]/60 bg-[#021f1d]/95 px-4 py-2 text-xs font-black text-white shadow-2xl backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[#f3bd45] animate-pulse" />
                    <span>{activeSeasonDemo === 'haor' ? 'মৌসুম: জুন – অক্টোবর' : 'মৌসুম: নভেম্বর – মে'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-[#47d1dd]/40 bg-[#073f3c]/95 px-4 py-2 text-xs font-black text-[#47d1dd] shadow-2xl backdrop-blur-md">
                    <Ship className="h-3.5 w-3.5" />
                    <span>{activeSeasonDemo === 'haor' ? '২ দিন ১ রাত নাইটস্টে' : 'সকাল থেকে সন্ধ্যা ডে-লং ক্রুজ'}</span>
                  </span>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <div className="text-xs font-black tracking-[0.14em] text-[#47d1dd]">
                  {activeSeasonDemo === 'haor'
                    ? 'TANGUAR HAOR OVERNIGHT CRUISE'
                    : 'PADMA RIVER DAY-LONG EVENT'}
                </div>
                <h3 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
                  {activeSeasonDemo === 'haor'
                    ? 'টাংগুয়ার হাওরের নীল জল ও মেঘালয় পাহাড়ের কোলে রাতযাপন'
                    : 'পদ্মা সেতু ভিউ, সাদা চরে খেলাধুলা ও লাইভ বারবিকিউ উৎসব'}
                </h3>
                <p className="mt-4 text-sm font-medium leading-7 text-white/75 sm:text-base">
                  {activeSeasonDemo === 'haor'
                    ? 'গেস্টরা কেবিনভিত্তিক বা পুরো বোট বুকিং দিয়ে নীলাদ্রি লেক, যাদুকাটা নদী, শিমুল বাগান ও ওয়াচ টাওয়ার ভ্রমণ করবে। মেনুতে থাকবে ঐতিহ্যবাহী হাঁসের মাংস ও হাওরের তাজা মাছ।'
                    : 'পরিবার, বন্ধু বা অফিসের কর্পোরেট ডে-আউটের জন্য পদ্মা নদীতে সকাল থেকে সন্ধ্যা ডে-লং ক্রুজ। মেনুতে থাকবে পদ্মার খাঁটি ইলিশ, ফ্রেশ উপ রুম শেয়ারিং ও সন্ধ্যায় লাইভ BBQ।'}
                </p>

                {/* Key specs for this season */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <span className="block text-[10px] text-white/45">বুকিং মডেল</span>
                    <b className="mt-1 block text-sm font-black text-[#f3bd45]">
                      {activeSeasonDemo === 'haor' ? 'কেবিন ও ফুল বোট' : 'গ্রুপ / পার-পারসন ডে-লং'}
                    </b>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <span className="block text-[10px] text-white/45">প্রধান আকর্ষণ</span>
                    <b className="mt-1 block text-sm font-black text-[#47d1dd]">
                      {activeSeasonDemo === 'haor' ? 'নীলাদ্রি + যাদুকাটা' : 'পদ্মা ব্রিজ + সাদা চর'}
                    </b>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <Link
                    href="/demo"
                    className="flex items-center gap-2 rounded-full bg-[#f3b52f] px-6 py-3.5 text-xs font-black text-[#073f3c] transition hover:bg-[#ffd067] shadow-lg"
                  >
                    ডেমো সাইটে এই মোডটি দেখুন <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2.5 rounded-2xl border border-[#f4c65e]/20 bg-[#042d2a] px-5 py-3.5 text-center text-xs font-bold text-[#f8dfa6]">
            <Check className="h-4 w-4 text-[#47d1dd]" /> সিজন সুইচ করার সাথে সাথে বুকিং ফর্মের অপশনগুলোও হাওর থেকে পদ্মায় স্বয়ংক্রিয়ভাবে রূপান্তর হয়ে যায়।
          </div>
        </div>
      </section>

      {/* 6. Core Pillars Deep Dive */}
      <section id="core-features" className="bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-dark">মূল স্তম্ভসমূহ</div>
            <h2 className="sales-title-dark mt-4">
              হাউজবোট ব্যবসায়িক সাফল্যের ৬টি প্রধান ডিজিটাল শক্তি
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[#58716c]">
              সাধারণ কোনো রেডিমেড হোটেল সফটওয়্যার নয়—বাংলাদেশের হাউজবোট ব্যবসার বাস্তব সমস্যা ও চ্যালেঞ্জ বিবেচনা করে তৈরি।
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CalendarCheck2,
                title: 'স্মার্ট বুকিং ডেস্ক ও স্লট',
                text: 'কেবিন ফাঁকা বা বুকড অবস্থা ক্যালেন্ডারে লাইভ দেখা যায়। এক ক্লিকে বুকিং পেন্ডিং থেকে কনফার্ম করা যায়।',
                points: ['ডাবল বুকিং প্রতিরোধ', 'ফুল বোট ও কেবিন আলাদা চয়েস', 'স্বয়ংক্রিয় বুকিং কোড'],
                color: 'bg-[#e8f4f0] text-[#0b6b62]',
              },
              {
                icon: ReceiptText,
                title: 'ট্রিপ অনুযায়ী নিট লাভ খাতা',
                text: 'প্রতিটি ট্রিপের খাবার বাজার, ডিজেল, স্টাফ ও ঘাট খরচ এন্ট্রি করলেই ঐ ট্রিপের প্রকৃত নিট লাভ চোখের সামনে আসবে।',
                points: ['খাতভিত্তিক খরচের হিসাব', 'আয়-ব্যয় স্বয়ংক্রিয় রিকনসিল', 'মাসিক আর্থিক রিপোর্ট'],
                color: 'bg-[#fff1cd] text-[#9a6811]',
              },
              {
                icon: Waves,
                title: 'হাওর ↔ পদ্মা সিজন রিব্র্যান্ডিং',
                text: 'বর্ষা শেষ হতেই পদ্মা নদীর ডে-লং ও কর্পোরেট ইভেন্ট মোড অ্যাক্টিভ করে ১২ মাসই ব্যবসা চালু রাখার সুযোগ।',
                points: ['১ ক্লিকে সাইট রূপান্তর', 'পদ্মা ব্রিজের ডে-লং প্যাকেজ', 'সম্পূর্ণ আলাদা খাবারের মেনু'],
                color: 'bg-[#e0f4f7] text-[#08718a]',
              },
              {
                icon: CreditCard,
                title: 'অগ্রিম ও বকেয়া ট্র্যাকিং',
                text: 'বিকাশ, নগদ বা ব্যাংকে কে কত টাকা অগ্রিম দিলো আর ভ্রমণের দিন কার কাছে কত টাকা বকেয়া তা নিখুঁতভাবে সংরক্ষণ।',
                points: ['ট্রানজ্যাকশন আইডি সেভ', 'বকেয়া টাকার অ্যালার্ট', 'ভাউচার রসিদ জেনারেশন'],
                color: 'bg-[#e7f4ea] text-[#1e7e34]',
              },
              {
                icon: Globe2,
                title: 'গেস্ট বুকিং ওয়েবসাইট',
                text: 'আপনার হাউজবোটের ছবি, ভিডিও, কেবিনের বিবরণ, ভ্রমণসূচি ও খাবার মেনু সম্বলিত আল্ট্রা-ফাস্ট প্রিমিয়াম ওয়েবসাইট।',
                points: ['মোবাইল ও ট্যাব ফ্রেন্ডলি', 'ওয়েবসাইট থেকেই বুকিং রিকোয়েস্ট', 'আপনার নিজস্ব ডোমেইন'],
                color: 'bg-[#f4ebf8] text-[#6f338c]',
              },
              {
                icon: CircleDollarSign,
                title: 'উইকডে ছাড় ও অফার ইঞ্জিন',
                text: 'রবিবার থেকে বুধবারের অফ-পিক দিনগুলোতে খালি কেবিন বিক্রি বাড়াতে স্বয়ংক্রিয় ডিসকাউন্ট ব্যানার ও প্রোমো কোড।',
                points: ['উইকডে অটো ডিসকাউন্ট', 'বিশেষ দিনের রেট কন্ট্রোল', 'প্রোমোশনাল ব্যানার অন/অফ'],
                color: 'bg-[#fff5e8] text-[#c05621]',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-[28px] border border-[#123f3c]/[0.08] bg-[#fffdf8] p-7 shadow-[0_12px_40px_rgba(7,63,60,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(7,63,60,0.12)]"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${pillar.color} transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-black text-[#123f3c]">{pillar.title}</h3>
                  <p className="mt-3 text-xs font-medium leading-6 text-[#627773]">{pillar.text}</p>
                  <ul className="mt-5 space-y-2 border-t border-[#123f3c]/[0.08] pt-4">
                    {pillar.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2 text-xs font-bold text-[#325a54]">
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#0b6f66]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. STORYTELLING SECTION: Why Own a Website? (Midnight 1:00 AM Viral Reels & 100% Anti-Scam Trust) */}
      <section id="why-website" className="relative overflow-hidden bg-[#043431] px-5 py-20 text-white sm:py-28 lg:px-8">
        <div className="sales-water-lines pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-light">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#f3b52f]" /> বাস্তব সংকট ও শতভাগ ডিজিটাল সুরক্ষা
            </div>
            <h2 className="sales-title-light mt-4">
              রাত ১টায় রিলস দেখে বুকিং করতে চাইলে? আপনার ওয়েবসাইট একাই নিবে বুকিং
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-white/75">
              মেসেঞ্জারে উত্তরের অপেক্ষায় আগ্রহী অতিথিদের আর হারাতে হবে না। সাথে থাকবে ফেসবুক স্ক্যামারদের ভুয়া পেজ ও নকল বুকিং থেকে আপনার হাউজবোটের ১০০% অফিশিয়াল সুরক্ষা।
            </p>
          </div>

          {/* 2 Big Graphic Story Cards */}
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Story Card 1: Midnight Guest Conversion */}
            <div className="relative overflow-hidden rounded-[32px] border border-[#f4c65e]/25 bg-[#073f3c] p-7 shadow-2xl sm:p-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f3b52f]/20 text-[#f3bd45]">
                    <Moon className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#47d1dd]">
                      দৃশ্যপট ০১ · রাত ০১:০০ টা
                    </span>
                    <h3 className="text-lg font-black text-white sm:text-xl">
                      মধ্যরাতের আগ্রহী অতিথি ও ২৪/৭ অটোমেটিক বুকিং
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#042d2a] px-3 py-1 text-[10px] font-black text-[#f3bd45]">
                  অটোমেটেড সেলস
                </span>
              </div>

              {/* Smartphone Mock Visual */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#032927] p-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1.5 font-mono text-[#f3bd45]">
                    <Clock className="h-3.5 w-3.5" /> ০১:১৪ AM · বিছানায় শুয়ে রিলস দেখছে
                  </span>
                  <span className="rounded bg-[#e8705b]/20 px-2 py-0.5 text-[9px] font-bold text-[#e8705b]">
                    কল দেওয়া সম্ভব নয়
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-white/5 p-3.5 text-xs text-white/80">
                  <p className="leading-6">
                    গেস্ট ফেসবুকে আপনার হাউজবোটের রোমাঞ্চকর রিলস দেখে ভ্রমণের জন্য দারুণ উৎসাহিত ও প্রস্তুত। কিন্তু এই গভীর রাতে কাউকে কল বা মেসেঞ্জারে পাওয়া সম্ভব নয়।
                  </p>
                </div>

                {/* Instant Solution Steps */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-3 rounded-xl border border-[#47d1dd]/20 bg-[#073f3c] p-2.5 text-xs text-[#9be4d8]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#47d1dd]" />
                    <span>বায়োর লিংকে ক্লিক করে <b>লাইভ ক্যালেন্ডারে</b> ফাঁকা তারিখ দেখলো</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[#47d1dd]/20 bg-[#073f3c] p-2.5 text-xs text-[#9be4d8]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#47d1dd]" />
                    <span>কেবিনের আসল ছবি, সুবিধা ও <b>প্যাকেজের মূল্য</b> দেখে নিশ্চিত হলো</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[#47d1dd]/20 bg-[#073f3c] p-2.5 text-xs text-[#9be4d8]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#47d1dd]" />
                    <span>২ মিনিটে <b>বুকিং রিকোয়েস্ট</b> পাঠিয়ে নিশ্চিন্তে ঘুমিয়ে পড়লো!</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#0b4b47] p-3 text-center text-xs font-black text-[#f3bd45]">
                  ✨ সকালে ঘুম থেকে উঠে আপনি দেখতে পেলেন আপনার ড্যাশবোর্ডে নতুন বুকিং কনফার্ম!
                </div>
              </div>
            </div>

            {/* Story Card 2: 100% Anti-Scam Protection & Official Verification */}
            <div className="relative overflow-hidden rounded-[32px] border border-[#f4c65e]/25 bg-[#073f3c] p-7 shadow-2xl sm:p-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b6f66] text-[#47d1dd]">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#f3bd45]">
                      দৃশ্যপট ০২ · স্ক্যামার সুরক্ষা
                    </span>
                    <h3 className="text-lg font-black text-white sm:text-xl">
                      ভুয়া পেইজ ও স্ক্যামারদের হাত থেকে স্থায়ী মুক্তি
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#0b6f66]/30 px-3 py-1 text-[10px] font-black text-[#47d1dd]">
                  ১০০% ভেরিফাইড
                </span>
              </div>

              {/* Anti-Scam Visual Breakdown */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#032927] p-5">
                {/* The Danger */}
                <div className="rounded-xl border border-[#e8705b]/30 bg-[#e8705b]/10 p-3.5 text-xs text-[#f8a89b]">
                  <div className="flex items-center gap-2 font-black text-[#e8705b]">
                    <AlertTriangle className="h-4 w-4" /> টাংগুয়ার হাওরে স্ক্যামারদের মারাত্মক উপদ্রব:
                  </div>
                  <p className="mt-1.5 leading-5 text-white/80">
                    স্ক্যামাররা আসল বোটের ছবি ও ভিডিও চুরি করে ভুয়া পেজ খুলে কম টাকায় ফেক বুকিং নিয়ে টাকা মেরে দেয়। ঘাটে গিয়ে গেস্ট দেখে সে প্রতারিত হয়েছে!
                  </p>
                </div>

                {/* The Floatbase Protection */}
                <div className="mt-4 space-y-2.5">
                  <div className="rounded-xl border border-white/10 bg-[#073f3c] p-3 text-xs">
                    <div className="font-bold text-[#f3bd45]">🌐 আপনার অফিশিয়াল ডোমেইন:</div>
                    <div className="mt-1 font-mono text-[11px] text-[#47d1dd]">
                      https://www.yourhouseboat.com
                    </div>
                    <div className="mt-1 text-[10px] text-white/60">
                      ফেসবুক বায়ো ও রিলসে ডোমেইন লিংক থাকবে—গেস্ট জানবে এটাই একমাত্র আসল সাইট।
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#073f3c] p-3 text-xs">
                    <div className="font-bold text-[#f3bd45]">🎫 ইউনিক ভাউচার ও বুকিং কোড:</div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-white">কোড: FB-260823-018</span>
                      <span className="rounded bg-[#0b6f66] px-2 py-0.5 text-[9px] font-bold text-white">
                        অফিশিয়াল ভেরিফাইড
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-white/60">
                      ভুয়া রসিদ দিয়ে প্রতারণার কোনো সুযোগ নেই। সরাসরি সিস্টেম ভেরিফিকেশন।
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#0b4b47] p-3 text-center text-xs font-black text-[#47d1dd]">
                  🛡️ অতিথি পায় শতভাগ নিশ্চিন্ত আস্থা, আর আপনার হাউজবোট পায় প্রিমিয়াম ব্র্যান্ড ইমেজ!
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Trust Pillars */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: '২৪/৭ অটোমেটেড সেলস',
                desc: 'আপনি ঘুমালেও আপনার ওয়েবসাইট গেস্টকে তথ্য দেয় ও বুকিং সংগ্রহ করে।',
              },
              {
                icon: ShieldCheck,
                title: '১০০% স্ক্যামার মুক্ত ট্রাস্ট',
                desc: 'অফিশিয়াল ডোমেইন ও বুকিং কোড থাকায় ফেক পেজের প্রতারণা শূন্য।',
              },
              {
                icon: Smartphone,
                title: 'মুহূর্তেই বন্ধুদের গ্রুপে শেয়ার',
                desc: 'গেস্ট ওয়েবসাইটের লিংক কপি করে বন্ধুদের মেসেঞ্জার গ্রুপে শেয়ার করে সিদ্ধান্ত নেয়।',
              },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#052f2d] p-5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3b52f] text-[#073f3c]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-black text-white">{p.title}</div>
                    <p className="mt-1 text-xs font-medium leading-5 text-white/65">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. 12 Feature Suite Grid */}
      <section id="all-features" className="bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="sales-kicker-dark">সম্পূর্ণ ফিচার তালিকা</div>
              <h2 className="sales-title-dark mt-4">
                দৈনন্দিন অপারেশনের প্রতিটি অংশের জন্য ডেডিকেটেড ফিচার
              </h2>
            </div>
            <p className="text-base font-medium leading-8 text-[#58716c] lg:text-right">
              অপ্রয়োজনীয় জটিলতা ছাড়া হাউজবোট ব্যবসাকে পুরোপুরি স্বয়ংক্রিয় করতে যা যা সত্যিই প্রয়োজন।
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allFeaturesList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-[#123f3c]/[0.08] bg-[#fffdf8] p-5 shadow-sm transition hover:bg-[#f7f2e6] hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f1ed] text-[#0b6f66] transition group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-[#f4ebd9] px-2 py-0.5 text-[9px] font-black text-[#8e6012]">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#123f3c]">{feat.title}</h3>
                  <p className="mt-2 text-xs font-medium leading-5 text-[#657a75]">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Comparison Section (Traditional vs Floatbase) */}
      <section className="border-y border-[#f4c65e]/20 bg-[#073f3c] px-5 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-light">কেন Floatbase বেছে নেবেন?</div>
            <h2 className="sales-title-light mt-4">
              প্রচলিত খাতা-কলম বনাম Floatbase ক্লাউড সিস্টেম
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-white/70">
              আধুনিক প্রযুক্তির সাহায্যে আপনার ব্যবসার প্রতিদিনের সময় ও লক্ষাধিক টাকার অপচয় বাঁচান।
            </p>
          </div>

          <div className="mt-14 overflow-hidden rounded-[28px] border border-[#f4c65e]/25 bg-[#052f2d] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f4c65e]/20 bg-[#032422] text-sm">
                    <th className="p-4 font-black text-white sm:p-5">বিষয় / ফিচার</th>
                    <th className="p-4 font-black text-[#e8705b] sm:p-5">প্রচলিত খাতা বা মেসেঞ্জার বুকিং</th>
                    <th className="bg-[#0b4b47] p-4 font-black text-[#f3bd45] sm:p-5">Floatbase আধুনিক সিস্টেম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="transition hover:bg-white/[0.02]">
                      <td className="p-4 font-black text-white sm:p-5">{row.feature}</td>
                      <td className="p-4 text-white/60 sm:p-5">{row.traditional}</td>
                      <td className="bg-[#0b4b47]/50 p-4 font-bold text-[#9be4d8] sm:p-5">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0 text-[#f3bd45]" />
                          {row.floatbase}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Simple 3-Step Setup Process */}
      <section className="bg-[#043431] px-5 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-light">সহজ অনবোর্ডিং</div>
            <h2 className="sales-title-light mt-4">
              মাত্র ৩টি পদক্ষেপে আপনার হাউজবোটের জন্য প্রস্তুত
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-white/65">
              কোনো টেকনিক্যাল জ্ঞান বা জটিল কোডিং শেখার দরকার নেই। সম্পূর্ণ সেটআপ আমাদের টিম করে দিবে।
            </p>
          </div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '০১',
                title: 'তথ্য ও ছবি দিন',
                desc: 'আপনার হাউজবোটের নাম, লোগো, কেবিনের ছবি, প্যাকেজ রেট এবং খাবারের মেনু আমাদের শেয়ার করুন।',
              },
              {
                step: '০২',
                title: 'নিজস্ব ডোমেইনে ফুল সেটআপ',
                desc: 'আমরা আপনার ব্র্যান্ডে ওয়েবসাইট, ক্লাউড ডাটাবেজ এবং অ্যাডমিন ড্যাশবোর্ড ৭ থেকে ১০ দিনে রেডি করব।',
              },
              {
                step: '০৩',
                title: 'টিম ট্রেনিং ও কাজ শুরু',
                desc: 'ভিডিও কলে আপনি ও আপনার টিমকে সম্পূর্ণ কাজ বুঝিয়ে দেওয়া হবে, যাতে প্রথম দিন থেকেই আত্মবিশ্বাসের সাথে চালাতে পারেন।',
              },
            ].map((stepItem, idx) => (
              <div
                key={idx}
                className="relative rounded-[28px] border border-[#f4c65e]/20 bg-[#073f3c] p-8 text-center"
              >
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#f4c65e]/40 bg-[#042d2a] text-2xl font-black text-[#f3bd45] shadow-lg">
                  {stepItem.step}
                </span>
                <h3 className="mt-6 text-xl font-black text-white">{stepItem.title}</h3>
                <p className="mt-3 text-xs font-medium leading-6 text-white/70">{stepItem.desc}</p>
                {idx < 2 && (
                  <ChevronRight className="absolute -right-3.5 top-14 z-20 hidden h-7 w-7 rounded-full bg-[#f3b52f] p-1 text-[#073f3c] md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Transparent Pricing Section */}
      <section id="pricing" className="relative overflow-hidden bg-[#f5f0e4] px-5 py-20 text-[#123f3c] sm:py-28 lg:px-8">
        <div className="sales-cream-lines pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sales-kicker-dark">এককালীন লাইসেন্স মূল্য</div>
            <h2 className="sales-title-dark mt-4">
              কোনো মাসিক ফি নেই—নিজের ব্যবসার জন্য নিজের আজীবন সিস্টেম
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-[#58716c]">
              কোনো হিডেন চার্জ বা সাবস্ক্রিপশন ট্র্যাপ নেই। একবার পেমেন্ট করে আজীবন সম্পূর্ণ নিয়ন্ত্রণ উপভোগ করুন।
            </p>
          </div>

          <div className="mx-auto mt-14 grid overflow-hidden rounded-[34px] border border-[#123f3c]/15 bg-[#fffdf8] shadow-[0_30px_90px_rgba(7,63,60,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left Price Box */}
            <div className="relative overflow-hidden bg-[#073f3c] p-8 text-white sm:p-12">
              <div className="sales-water-lines absolute inset-0 opacity-20" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3b52f] px-3.5 py-1.5 text-xs font-black text-[#073f3c]">
                  <Star className="h-3.5 w-3.5 fill-current" /> সম্পূর্ণ সেটআপ ও লাইসেন্স
                </span>

                <div className="mt-8 text-xs font-bold text-white/55">এককালীন সর্বমোট মূল্য</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#f4c65e]">৳</span>
                  <span className="text-6xl font-black tracking-tight sm:text-7xl">৪০,০০০</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#9ee0d6]">
                  <BadgeCheck className="h-4 w-4" /> একবার পেমেন্ট · আজীবন ব্যবহার · নো মাসিক ফি
                </div>

                <div className="my-8 h-px bg-[#f4c65e]/20" />

                <p className="text-xs font-medium leading-6 text-white/70">
                  ভবিষ্যতে সফটওয়্যার ব্যবহারের জন্য কোনো মাসিক বা বার্ষিক সাবস্ক্রিপশন চার্জ প্রযোজ্য নয়।
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#f3b52f] px-6 py-4 text-sm font-black text-[#073f3c] transition hover:bg-[#ffd067]"
                >
                  আমার হাউজবোটের জন্য চাই{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Right Inclusions List */}
            <div className="p-8 sm:p-12">
              <div className="text-xs font-black tracking-[0.14em] text-[#9a6b16]">
                এই মূল্যের মধ্যে যা যা অন্তর্ভুক্ত থাকছে
              </div>
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {[
                  'আপনার নিজস্ব ডোমেইনে বুকিং ওয়েবসাইট',
                  'মোবাইল ও কম্পিউটারের জন্য অ্যাডমিন প্যানেল',
                  'টাংগুয়ার হাওর ও পদ্মা নদী ডুয়াল সিজন মোড',
                  'কেবিন ও ফুল বোট রিয়েল-টাইম বুকিং ক্যালেন্ডার',
                  'ট্রিপ অনুযায়ী তেল, বাজার ও নিট লাভ খাতা',
                  'অগ্রিম ও বকেয়া পেমেন্ট ট্র্যাকিং (bKash/Bank)',
                  'প্যাকেজ, গ্যালারি, রিভিউ ও ফুড মেনু কন্ট্রোল',
                  'উইকডে ডিসকাউন্ট ও কুপন কোড সিস্টেম',
                  'আপনার নিজস্ব নাম, লোগো ও ব্র্যান্ড কালার',
                  'টিমের জন্য সম্পূর্ণ ভিডিও ও লাইভ প্রশিক্ষণ',
                  'আজকের পর থেকে আজীবন সফটওয়্যার লাইসেন্স',
                  'ডেডিকেটেড ক্লাউড ডাটাবেজ ব্যাকআপ',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-bold text-[#325b55]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#e5f1ed] text-[#0b6f66]">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e9bd55]/35 bg-[#fff7df] p-4 text-xs font-semibold leading-6 text-[#755b27]">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6b16]" />
                <span>
                  <strong className="text-[#513d13]">সম্পূর্ণ আপনার ব্র্যান্ডে: </strong>
                  ওয়েবসাইটে অতিথি কেবল আপনার হাউজবোটের নামই দেখবে। Floatbase থাকবে আপনার বিশ্বস্ত প্রযুক্তি সহযোগী হিসেবে।
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="bg-[#073f3c] px-5 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <div className="sales-kicker-light">সাধারণ জিজ্ঞাসা</div>
            <h2 className="sales-title-light mt-4">সিদ্ধান্ত নেওয়ার আগে পরিষ্কার উত্তর</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-white/70">
              আপনার মনে কোনো নির্দিষ্ট প্রশ্ন থাকলে সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন বা কথা বলুন।
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#f4c65e]/30 bg-white/5 px-5 py-3 text-xs font-black text-[#f7d98e] transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" /> সরাসরি প্রশ্ন করুন
            </a>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#f4c65e]/20 bg-[#052f2d]">
            {faqs.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={index} className="border-b border-[#f4c65e]/15 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
                    aria-expanded={expanded}
                  >
                    <span className="text-sm font-black text-white sm:text-base">{faq.question}</span>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                        expanded ? 'rotate-180 bg-[#f3b52f] text-[#073f3c]' : 'bg-white/10 text-[#f6d381]'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-5 pb-6 text-xs font-medium leading-7 text-white/75 sm:px-7 sm:text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. High-Impact Final Call to Action */}
      <section className="bg-[#073f3c] px-5 pb-12 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#f3b52f] px-7 py-12 text-[#073f3c] sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
          <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[55px] border-white/20" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[#6b4b0b]">
              <Clock3 className="h-4 w-4" /> সময় এসেছে হিসাব গুছিয়ে নেওয়ার
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              হাউজবোট চালান নিখুঁত তথ্য দেখে,<br className="hidden sm:block" /> আন্দাজে বা অনুমানে নয়।
            </h2>
            <p className="mt-4 max-w-2xl text-xs font-bold leading-6 text-[#684f1e] sm:text-base">
              আপনার বর্তমান কাজের পদ্ধতি অনুযায়ী সিস্টেমটি কীভাবে কাজ করবে তা লাইভ ডেমোতে দেখে নিন।
            </p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#073f3c] px-7 py-4 text-sm font-black text-white shadow-xl transition hover:bg-[#0b5550]"
            >
              <MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপে কথা বলুন
            </a>
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 rounded-full border border-[#073f3c]/20 bg-white/30 px-7 py-4 text-sm font-black transition hover:bg-white/50"
            >
              লাইভ ডেমো দেখুন <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="bg-[#032c2a] px-5 pb-28 pt-14 sm:pb-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-[#f4c65e]/15 pb-10 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
            <div className="max-w-sm">
              <SalesLogo light />
              <p className="mt-5 text-xs font-medium leading-6 text-white/60">
                বাংলাদেশের হাউজবোট ব্যবসার বুকিং, হিসাব খাতা, সিজনাল রূপান্তর ও দৈনন্দিন পরিচালনা সহজ করার জন্য তৈরি সম্পূর্ণ ডিজিটাল সিস্টেম।
              </p>
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-[#f3bd45]">দ্রুত লিংক</div>
              <div className="mt-4 grid gap-2.5 text-xs font-bold text-white/70">
                <Link href="#system" className="hover:text-[#f3bd45]">
                  ড্যাশবোর্ড
                </Link>
                <Link href="#season-switch" className="hover:text-[#f3bd45]">
                  সিজন সুইচ
                </Link>
                <Link href="#why-website" className="hover:text-[#f3bd45]">
                  কেন ওয়েবসাইট?
                </Link>
                <Link href="#pricing" className="hover:text-[#f3bd45]">
                  মূল্য ও লাইসেন্স
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-[#f3bd45]">সরাসরি ডেমো</div>
              <div className="mt-4 grid gap-2.5 text-xs font-bold text-white/70">
                <Link href="/demo" className="flex items-center gap-1.5 hover:text-[#f3bd45]">
                  গেস্ট বুকিং ওয়েবসাইট <ExternalLink className="h-3 w-3" />
                </Link>
                <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-[#f3bd45]">
                  অ্যাডমিন ড্যাশবোর্ড <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-[#f3bd45]">যোগাযোগ</div>
              <div className="mt-4 grid gap-2.5 text-xs font-bold text-white/70">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#f3bd45]">
                  <MessageCircle className="h-3 w-3 text-[#25D366]" /> 01343-411792
                </a>
                <a href="tel:01343411792" className="flex items-center gap-1.5 hover:text-[#f3bd45]">
                  <PhoneCall className="h-3 w-3 text-[#f3bd45]" /> কল করুন
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-[11px] font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <div>© ২০২৬ Floatbase. সর্বস্বত্ব সংরক্ষিত।</div>
            <div>বাংলাদেশের হাউজবোট ব্যবসার জন্য নিবেদিত।</div>
          </div>
        </div>
      </footer>

      {/* 15. Mobile Sticky Bottom Quick Action Bar */}
      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-[#e9bd55]/30 bg-[#fffaf0]/95 p-2 shadow-[0_16px_50px_rgba(0,25,23,0.35)] backdrop-blur-xl sm:hidden">
        <Link
          href="/demo"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e7f1ed] px-3 py-3 text-xs font-black text-[#073f3c]"
        >
          <ExternalLink className="h-3.5 w-3.5" /> লাইভ ডেমো
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#073f3c] px-3 py-3 text-xs font-black text-white shadow-md"
        >
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> কথা বলুন
        </a>
      </div>
    </main>
  );
}
