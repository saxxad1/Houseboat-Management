'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, BadgeCheck, BarChart3, BedDouble, CalendarCheck2, Check,
  ChevronDown, CircleDollarSign, Clock3, CreditCard, ExternalLink,
  FileBarChart, Globe2, Headphones, Images, LayoutDashboard, Menu,
  MessageCircle, MousePointerClick, PackageCheck, Palette, PanelTop,
  ReceiptText, Rocket, Settings2, ShieldCheck, Ship, Sparkles,
  ToggleLeft, TrendingUp, Users, Wallet, X, Zap,
} from 'lucide-react';

const whatsappUrl = `https://wa.me/8801343411792?text=${encodeURIComponent(
  'আমি হাউসবোট ম্যানেজমেন্ট সিস্টেমটি সম্পর্কে বিস্তারিত জানতে চাই।'
)}`;

const navItems = [
  { label: 'সুবিধাসমূহ', href: '#features' },
  { label: 'কীভাবে কাজ করে', href: '#workflow' },
  { label: 'সিজন সিস্টেম', href: '#seasons' },
  { label: 'মূল্য', href: '#pricing' },
  { label: 'প্রশ্নোত্তর', href: '#faq' },
];

const dashboardStats = [
  { label: 'মোট ট্রিপ', value: '২৪', icon: Ship, tone: 'bg-blue-50 text-blue-600' },
  { label: 'মোট অতিথি', value: '৪৮৬', icon: Users, tone: 'bg-amber-50 text-amber-600' },
  { label: 'মোট আয়', value: '৳৮.৪ লাখ', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
];

const primaryFeatures = [
  {
    icon: CalendarCheck2, number: '০১', title: 'বুকিং ম্যানেজমেন্ট',
    description: 'নতুন বুকিং থেকে চেক-আউট—প্রতিটি ধাপ, অতিথির তথ্য ও বুকিং স্ট্যাটাস এক জায়গায় নিয়ন্ত্রণ করুন।',
    points: ['কেবিন ও ফুল-বোট বুকিং', 'তারিখ ও স্ট্যাটাস ফিল্টার', 'অটো বুকিং কোড'],
    className: 'bg-[#eef8f3] text-[#126a4a]',
  },
  {
    icon: Wallet, number: '০২', title: 'আয়–ব্যয় ও লাভের হিসাব',
    description: 'প্রতিটি ট্রিপের আয়, খাবার, জ্বালানি, স্টাফ ও অন্যান্য খরচ লিখে প্রকৃত লাভ দেখুন মুহূর্তেই।',
    points: ['ক্যাটাগরিভিত্তিক হিসাব', 'বকেয়া ও অগ্রিম ট্র্যাকিং', 'লাভের মার্জিন'],
    className: 'bg-[#fff6e6] text-[#a35f00]',
  },
  {
    icon: ToggleLeft, number: '০৩', title: 'দুই সিজন, একটি সিস্টেম',
    description: 'সুনামগঞ্জের হাওর সিজন থেকে পদ্মার ডে-লং ট্রিপ—এক ক্লিকেই ওয়েবসাইট ও বুকিংয়ের ধরন বদলে যাবে।',
    points: ['হাওর ও পদ্মা মোড', 'আলাদা কনটেন্ট ও মূল্য', 'সিজনভিত্তিক রিপোর্ট'],
    className: 'bg-[#f0f0ff] text-[#5552a6]',
  },
];

const allFeatures = [
  { icon: LayoutDashboard, title: 'স্মার্ট ড্যাশবোর্ড', text: 'ট্রিপ, অতিথি, আয়, ব্যয় ও লাভের তাৎক্ষণিক সারসংক্ষেপ।' },
  { icon: CalendarCheck2, title: 'অ্যাভেইলেবিলিটি ক্যালেন্ডার', text: 'কোন তারিখে কোন কেবিন বুকড বা ফাঁকা—এক নজরেই দেখুন।' },
  { icon: BedDouble, title: 'কেবিন ও রুম নিয়ন্ত্রণ', text: 'ছবি, ধারণক্ষমতা, মূল্য, সুবিধা ও বুকিং স্ট্যাটাস আপডেট করুন।' },
  { icon: PackageCheck, title: 'ট্রিপ ও প্যাকেজ', text: 'ট্যুর প্যাকেজ, সময়সূচি, খাবার ও রুটের বিস্তারিত সাজান।' },
  { icon: Users, title: 'কাস্টমার ডাটাবেজ', text: 'অতিথির যোগাযোগ, নোট ও আগের বুকিং ইতিহাস সংরক্ষণ করুন।' },
  { icon: CreditCard, title: 'পেমেন্ট ট্র্যাকিং', text: 'অগ্রিম, বকেয়া, পেমেন্ট মাধ্যম ও ট্রানজ্যাকশন আইডি রাখুন।' },
  { icon: ReceiptText, title: 'খরচের হিসাব', text: 'খাবার, স্টাফ, জ্বালানি, মেইনটেন্যান্সসহ সব খরচ লিখুন।' },
  { icon: FileBarChart, title: 'বিস্তারিত রিপোর্ট', text: 'তারিখ ও ট্রিপ অনুযায়ী আয়–ব্যয়, বকেয়া ও লাভের রিপোর্ট দেখুন।' },
  { icon: CircleDollarSign, title: 'ডিসকাউন্ট কন্ট্রোল', text: 'উইকডে অফার, পূর্ণিমা ও সরকারি ছুটির ব্যতিক্রম নিয়ন্ত্রণ করুন।' },
  { icon: Images, title: 'গ্যালারি ও রিভিউ', text: 'ওয়েবসাইটের ছবি সাজান এবং অতিথির রিভিউ প্রকাশ করুন।' },
  { icon: Palette, title: 'নিজস্ব ব্র্যান্ডিং', text: 'নাম, লোগো, রঙ, ফোন, হোয়াটসঅ্যাপ ও ঠিকানা নিজের মতো করুন।' },
  { icon: Settings2, title: 'পদ্মা ট্রিপ সেটিংস', text: 'অতিথিপ্রতি মূল্য ও ডে-লং ট্রিপের বুকিং আলাদাভাবে চালান।' },
];

const processSteps = [
  { step: '০১', title: 'আপনার তথ্য দিন', text: 'হাউসবোটের নাম, লোগো, কেবিন, প্যাকেজ, ছবি ও যোগাযোগের তথ্য আমাদের দিন।', icon: MessageCircle },
  { step: '০২', title: 'আমরা সেটআপ করি', text: 'আপনার ব্র্যান্ড ও ডোমেইনে বুকিং ওয়েবসাইট, ডাটাবেজ ও অ্যাডমিন প্যানেল প্রস্তুত করি।', icon: Settings2 },
  { step: '০৩', title: 'আপনি ব্যবসা চালান', text: 'ওয়েবসাইট থেকে বুকিং নিন এবং ফোন বা কম্পিউটার থেকে পুরো অপারেশন নিয়ন্ত্রণ করুন।', icon: Rocket },
];

const includedItems = [
  'আপনার নিজস্ব ডোমেইনে পূর্ণাঙ্গ ওয়েবসাইট',
  'মোবাইল–ফ্রেন্ডলি অনলাইন বুকিং সিস্টেম',
  'সম্পূর্ণ হাউসবোট অ্যাডমিন প্যানেল',
  'হাওর ও পদ্মা—দুই সিজনের অটো সুইচ',
  'বুকিং, কাস্টমার ও পেমেন্ট ম্যানেজমেন্ট',
  'আয়, ব্যয়, বকেয়া ও লাভের রিপোর্ট',
  'কেবিন, প্যাকেজ, গ্যালারি ও রিভিউ নিয়ন্ত্রণ',
  'নিজস্ব লোগো, রঙ ও যোগাযোগের তথ্য',
  'একবার পেমেন্টে আজীবন সফটওয়্যার ব্যবহার',
];

const faqs = [
  { question: '৪০,০০০ টাকা কি মাসিক নাকি এককালীন?', answer: 'এটি সম্পূর্ণ এককালীন মূল্য। সফটওয়্যারটি ব্যবহারের জন্য কোনো মাসিক বা বার্ষিক লাইসেন্স ফি নেই—একবার নিলে আজীবন ব্যবহার করতে পারবেন।' },
  { question: 'আমার হাউসবোটের নামে কি ওয়েবসাইট হবে?', answer: 'অবশ্যই। আপনার হাউসবোটের নাম, লোগো, রঙ, ছবি, ফোন, হোয়াটসঅ্যাপ ও নিজস্ব ডোমেইন ব্যবহার করে ওয়েবসাইটটি সম্পূর্ণভাবে সাজিয়ে দেওয়া হবে।' },
  { question: 'সুনামগঞ্জ ও পদ্মা—দুই জায়গার ট্রিপ কি চালানো যাবে?', answer: 'হ্যাঁ। অ্যাডমিন প্যানেল থেকে সিজন বদলালে ওয়েবসাইটের কনটেন্ট, গন্তব্য, বুকিং ধরন ও সংশ্লিষ্ট তথ্য স্বয়ংক্রিয়ভাবে সেই সিজন অনুযায়ী বদলে যাবে।' },
  { question: 'মোবাইল থেকে কি অ্যাডমিন প্যানেল চালানো যাবে?', answer: 'হ্যাঁ। ওয়েবসাইট ও অ্যাডমিন প্যানেল দুটোই মোবাইল, ট্যাব ও কম্পিউটারে সুন্দরভাবে কাজ করার জন্য তৈরি।' },
  { question: 'সিস্টেম কেনার আগে কি ডেমো দেখা যাবে?', answer: 'হ্যাঁ। এই পেজের “লাইভ ডেমো দেখুন” বাটনে ক্লিক করে সম্পূর্ণ বুকিং ওয়েবসাইট ঘুরে দেখতে পারবেন। অ্যাডমিন প্যানেলের ডেমোও আলাদাভাবে দেখা যাবে।' },
];

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl ${inverse ? 'bg-white text-[#092f36]' : 'bg-[#0b3941] text-white'}`}>
        <Ship className="h-5 w-5" />
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-[#e9b949]" />
      </span>
      <span>
        <span className={`block text-[17px] font-black leading-none tracking-[-0.02em] ${inverse ? 'text-white' : 'text-[#0b3037]'}`}>Floatbase Systems</span>
        <span className={`mt-1 block text-[10px] font-bold tracking-[0.1em] ${inverse ? 'text-white/55' : 'text-[#668087]'}`}>হাউসবোট ম্যানেজমেন্ট</span>
      </span>
    </div>
  );
}

function DashboardPreview() {
  const sidebar = [
    ['ড্যাশবোর্ড', LayoutDashboard], ['বুকিং', CalendarCheck2], ['ট্রিপ', Ship],
    ['কাস্টমার', Users], ['হিসাব', Wallet], ['রিপোর্ট', BarChart3], ['সেটিংস', Settings2],
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[670px]">
      <div className="sales-float-slow absolute -left-8 top-24 hidden rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-2xl backdrop-blur-xl lg:block">
        <div className="flex items-center gap-2 text-xs font-bold"><BadgeCheck className="h-4 w-4 text-[#f4c862]" /> সব হিসাব আপডেটেড</div>
      </div>
      <div className="sales-float absolute -right-8 bottom-24 z-20 hidden rounded-2xl border border-white/10 bg-[#fff9eb] px-4 py-3 text-[#173f43] shadow-2xl lg:block">
        <div className="text-[10px] font-bold text-[#71868b]">আজকের বুকিং</div><div className="mt-0.5 text-xl font-black">০৭টি</div>
      </div>
      <div className="overflow-hidden rounded-[26px] border border-white/15 bg-[#f4f8f7] shadow-[0_32px_90px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <div className="flex h-10 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef6a5b]" /><span className="h-2.5 w-2.5 rounded-full bg-[#f0bd4e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#61bf79]" /></div>
          <div className="rounded-md bg-slate-100 px-8 py-1 text-[8px] font-semibold text-slate-400 sm:px-14">admin.yourhouseboat.com</div>
          <div className="h-4 w-4 rounded-full bg-[#0d4149]" />
        </div>
        <div className="flex min-h-[400px] sm:min-h-[460px]">
          <aside className="hidden w-[145px] shrink-0 bg-[#0b3037] p-4 text-white sm:block">
            <div className="mb-7 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9b949] text-[#0b3037]"><Ship className="h-3.5 w-3.5" /></span><span className="text-[10px] font-extrabold">আপনার হাউসবোট</span></div>
            {sidebar.map(([label, Icon], index) => (
              <div key={label} className={`mb-1.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9px] font-semibold ${index === 0 ? 'bg-white text-[#0b3037]' : 'text-white/55'}`}><Icon className="h-3 w-3" />{label}</div>
            ))}
          </aside>
          <div className="min-w-0 flex-1 p-3.5 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><div className="text-[9px] font-bold text-slate-400">রবিবার, ১৬ আগস্ট</div><h3 className="mt-0.5 text-base font-black text-[#163a40] sm:text-lg">ব্যবসার সারসংক্ষেপ</h3></div>
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[8px] font-bold text-[#0b5760]">এই মাস</div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {dashboardStats.map((stat) => { const Icon = stat.icon; return (
                <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3.5">
                  <div className={`mb-2 grid h-6 w-6 place-items-center rounded-lg sm:h-8 sm:w-8 ${stat.tone}`}><Icon className="h-3 w-3 sm:h-4 sm:w-4" /></div>
                  <div className="text-[8px] font-bold text-slate-400 sm:text-[9px]">{stat.label}</div><div className="mt-0.5 whitespace-nowrap text-xs font-black text-[#173f43] sm:text-base">{stat.value}</div>
                </div>
              ); })}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black text-[#173f43]">আয় ও ব্যয়</span><span className="text-[8px] font-bold text-slate-400">শেষ ৬ মাস</span></div>
                <div className="mt-5 flex h-[100px] items-end gap-2 sm:h-[125px] sm:gap-3">
                  {[38, 55, 48, 72, 63, 88].map((height, index) => (
                    <div key={height} className="flex h-full flex-1 items-end justify-center gap-0.5"><div className="w-2 rounded-t bg-[#0d7b70] sm:w-3" style={{ height: `${height}%` }} /><div className="w-2 rounded-t bg-[#efc05a] sm:w-3" style={{ height: `${Math.max(height - 22 + (index % 2) * 7, 18)}%` }} /></div>
                  ))}
                </div>
                <div className="mt-2 flex justify-center gap-4 text-[8px] font-semibold text-slate-400"><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#0d7b70]" /> আয়</span><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#efc05a]" /> ব্যয়</span></div>
              </div>
              <div className="hidden rounded-2xl bg-[#0d4149] p-4 text-white shadow-sm sm:block">
                <div className="text-[9px] font-bold text-white/55">এই মাসের নিট লাভ</div><div className="mt-2 text-xl font-black">৳৩.২ লাখ</div><div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#9ee7d6]"><TrendingUp className="h-3 w-3" /> ১৮% বৃদ্ধি</div>
                <div className="mt-6 border-t border-white/10 pt-3"><div className="flex items-center justify-between text-[8px]"><span className="text-white/50">বকেয়া</span><b>৳৪৮,০০০</b></div><div className="mt-2 flex items-center justify-between text-[8px]"><span className="text-white/50">অগ্রিম</span><b>৳১.৭ লাখ</b></div></div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d7ece5] bg-[#eff9f5] px-3 py-2.5">
              <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#0d746a]"><CalendarCheck2 className="h-3.5 w-3.5" /></span><div><div className="text-[9px] font-black text-[#173f43]">পরবর্তী ট্রিপ</div><div className="text-[8px] text-slate-500">তাঙ্গুয়ার হাওর · ২৩ আগস্ট</div></div></div>
              <span className="rounded-full bg-[#0d746a] px-2 py-1 text-[7px] font-bold text-white">নিশ্চিত</span>
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
    <main className="sales-shell min-h-screen overflow-hidden bg-[#fbfaf6] text-[#17383d]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#183f45]/10 bg-[#fbfaf6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="#top" aria-label="Floatbase Systems হোম"><BrandMark /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="প্রধান মেনু">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-bold text-[#36575c] hover:text-[#0d736a]">{item.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/demo" className="group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold text-[#133e44] hover:bg-[#eef3f0]">ডেমো সাইট <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#0c4b51] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#0c4b51]/15 hover:bg-[#0a6264]"><MessageCircle className="h-4 w-4" /> কথা বলুন</a>
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-[#183f45]/10 bg-white text-[#17383d] lg:hidden" aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#183f45]/10 bg-[#fbfaf6] px-5 pb-5 pt-3 lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="মোবাইল মেনু">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#36575c] hover:bg-white">{item.label}</Link>)}
            <div className="mt-3 grid grid-cols-2 gap-2"><Link href="/demo" onClick={() => setMenuOpen(false)} className="rounded-xl border border-[#173f43]/15 bg-white px-3 py-3 text-center text-sm font-extrabold">ডেমো সাইট</Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#0c4b51] px-3 py-3 text-center text-sm font-extrabold text-white">কথা বলুন</a></div>
          </nav></div>
        )}
      </header>

      <section id="top" className="relative overflow-hidden bg-[#0b3037] pb-20 pt-32 text-white sm:pt-36 lg:pb-28 lg:pt-44">
        <div className="sales-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-40 top-28 h-[420px] w-[420px] rounded-full bg-[#0c8175]/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[#e9b949]/15 blur-[110px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-[#cce7e2] backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5 text-[#f0c35a]" /> বাংলাদেশের হাউসবোট ব্যবসার জন্য সম্পূর্ণ ডিজিটাল সিস্টেম</div>
            <h1 className="text-balance text-[46px] font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-6xl lg:text-[68px]">বুকিং থেকে লাভ—<span className="text-[#f2c55d]">সবকিছু এক জায়গায়।</span></h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/70 sm:text-lg">নিজস্ব ওয়েবসাইটে বুকিং নিন, কেবিন ও ট্রিপ চালান, আয়–ব্যয় হিসাব করুন এবং হাওর থেকে পদ্মা—পুরো ব্যবসা নিয়ন্ত্রণ করুন একটি সহজ অ্যাডমিন প্যানেল থেকে।</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-center gap-2 rounded-full bg-[#e9b949] px-6 py-4 text-sm font-black text-[#17383d] shadow-[0_16px_40px_rgba(233,185,73,0.2)] hover:bg-[#f3c965]">আমার হাউসবোটের জন্য চাই <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
              <Link href="/demo" className="group flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white backdrop-blur-sm hover:bg-white/10"><MousePointerClick className="h-4 w-4 text-[#f2c55d]" /> লাইভ ডেমো দেখুন</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/55"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#81d7c2]" /> এককালীন মূল্য</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#81d7c2]" /> আজীবন ব্যবহার</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#81d7c2]" /> আপনার নিজস্ব ডোমেইন</span></div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="border-b border-[#183f45]/10 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#183f45]/10 px-5 md:grid-cols-4 md:divide-y-0 lg:px-8">
        {[[ '১৫+', 'ম্যানেজমেন্ট মডিউল' ], [ '২টি', 'সিজন, একটি সিস্টেম' ], [ '২৪/৭', 'অনলাইন বুকিং গ্রহণ' ], [ 'আজীবন', 'সফটওয়্যার ব্যবহার' ]].map(([value, label]) => <div key={label} className="px-4 py-7 text-center sm:py-9"><div className="text-2xl font-black text-[#0c4b51] sm:text-3xl">{value}</div><div className="mt-1 text-xs font-bold text-[#6c8185] sm:text-sm">{label}</div></div>)}
      </div></section>

      <section className="px-5 py-20 sm:py-28 lg:px-8" id="features"><div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><div className="sales-eyebrow">ব্যবসার সম্পূর্ণ নিয়ন্ত্রণ</div><h2 className="sales-title mt-4">একটি সফটওয়্যার, আপনার পুরো অপারেশন</h2><p className="sales-subtitle mx-auto mt-5">অসংখ্য খাতা, স্প্রেডশিট বা ছড়িয়ে থাকা মেসেজ নয়। প্রতিদিনের গুরুত্বপূর্ণ কাজগুলো এখন একটি গোছানো সিস্টেমে।</p></div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {primaryFeatures.map((feature) => { const Icon = feature.icon; return (
            <article key={feature.number} className="group relative overflow-hidden rounded-[28px] border border-[#183f45]/10 bg-white p-7 shadow-[0_14px_50px_rgba(21,59,64,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(21,59,64,0.1)] sm:p-8">
              <span className="absolute right-6 top-4 text-6xl font-black text-[#17383d]/[0.035]">{feature.number}</span><div className={`grid h-14 w-14 place-items-center rounded-2xl ${feature.className}`}><Icon className="h-6 w-6" /></div>
              <h3 className="mt-7 text-2xl font-black tracking-[-0.025em] text-[#17383d]">{feature.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#687e82]">{feature.description}</p>
              <ul className="mt-6 space-y-3">{feature.points.map((point) => <li key={point} className="flex items-center gap-2.5 text-sm font-bold text-[#36575c]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#edf6f2] text-[#147263]"><Check className="h-3 w-3" /></span>{point}</li>)}</ul>
            </article>
          ); })}
        </div>
      </div></section>

      <section id="seasons" className="relative overflow-hidden bg-[#f1f0ea] px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative min-h-[530px]">
          <div className="absolute left-0 top-0 w-[84%] overflow-hidden rounded-[30px] border-[7px] border-white bg-white shadow-[0_28px_80px_rgba(24,57,62,0.18)]"><div className="relative aspect-[4/3]"><Image src="/hero-floatboat-houseboat.jpg" alt="তাঙ্গুয়ার হাওরের হাউসবোট বুকিং ওয়েবসাইট" fill sizes="(max-width: 1024px) 76vw, 38vw" className="object-cover" priority /><div className="absolute inset-0 bg-gradient-to-t from-[#092e35]/80 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f4d079]">হাওর সিজন</div><div className="mt-2 text-2xl font-black sm:text-3xl">তাঙ্গুয়ার হাওর বুকিং</div><div className="mt-2 text-xs font-semibold text-white/70">কেবিন অথবা সম্পূর্ণ হাউসবোট</div></div></div></div>
          <div className="absolute bottom-0 right-0 w-[65%] overflow-hidden rounded-[26px] border-[7px] border-white bg-white shadow-[0_24px_70px_rgba(24,57,62,0.2)]"><div className="relative aspect-[4/3]"><Image src="/images/padma/padma-bridge.jpg" alt="পদ্মা নদীর ডে-লং ট্রিপ ওয়েবসাইট" fill sizes="(max-width: 1024px) 58vw, 30vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#5b3710]/85 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ffe09b]">পদ্মা সিজন</div><div className="mt-1.5 text-lg font-black sm:text-xl">ডে-লং ও ইভেন্ট ট্রিপ</div></div></div></div>
          <div className="absolute right-[10%] top-[39%] z-20 flex items-center gap-2 rounded-full border-4 border-white bg-[#0d7169] px-4 py-3 text-xs font-black text-white shadow-xl"><Zap className="h-4 w-4 text-[#f6cf70]" /> এক ক্লিকে পরিবর্তন</div>
        </div>
        <div><div className="sales-eyebrow">স্মার্ট সিজন সুইচ</div><h2 className="sales-title mt-4">নদী বদলাবে,<br />ওয়েবসাইটও বদলে যাবে</h2><p className="sales-subtitle mt-5">সুনামগঞ্জে হাওর সিজন শেষ করে পদ্মায় ট্রিপ চালাবেন? নতুন ওয়েবসাইটের প্রয়োজন নেই। অ্যাডমিন প্যানেলে সিজন নির্বাচন করলেই আপনার পুরো বুকিং ওয়েবসাইট নতুন গন্তব্যের উপযোগী হয়ে যাবে।</p>
          <div className="mt-8 space-y-5">{[[ 'কনটেন্ট ও গন্তব্য', 'হিরো, রুট, স্পট, গ্যালারি ও বার্তা বদলে যাবে।' ], [ 'বুকিংয়ের ধরন', 'কেবিন/ফুল-বোট থেকে ডে-লং গ্রুপ বুকিংয়ে যাবে।' ], [ 'মূল্য ও রিপোর্ট', 'সিজনভিত্তিক মূল্য, বুকিং এবং ব্যবসার রিপোর্ট আলাদা থাকবে।' ]].map(([title, copy], index) => <div key={title} className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-[#0d7169] shadow-sm">০{index + 1}</span><div><h3 className="font-black text-[#17383d]">{title}</h3><p className="mt-1 text-sm font-medium leading-6 text-[#687e82]">{copy}</p></div></div>)}</div>
        </div>
      </div></section>

      <section className="px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_0.75fr]"><div><div className="sales-eyebrow">ফিচার তালিকা</div><h2 className="sales-title mt-4 max-w-2xl">প্রতিদিনের কাজে যা যা দরকার, সবই আছে</h2></div><p className="sales-subtitle md:text-right">মালিক ও টিম—দুজনের কাজ সহজ করতে বাস্তব হাউসবোট অপারেশনের জন্য তৈরি।</p></div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-[#17383d]/10 bg-[#17383d]/10 sm:grid-cols-2 lg:grid-cols-3">
          {allFeatures.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="group bg-white p-6 transition-colors hover:bg-[#f7fbf8] sm:p-7"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef6f2] text-[#0d7169] transition-transform group-hover:-rotate-3 group-hover:scale-105"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-black text-[#17383d]">{feature.title}</h3><p className="mt-2 text-sm font-medium leading-6 text-[#6b8084]">{feature.text}</p></article>; })}
        </div>
      </div></section>

      <section className="px-5 pb-20 sm:pb-28 lg:px-8"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[34px] bg-[#0b3037] text-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="p-8 sm:p-12 lg:p-14"><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#c9e8e2]"><Globe2 className="h-3.5 w-3.5" /> আপনার ব্র্যান্ড, আপনার ওয়েবসাইট</div><h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">শুধু সফটওয়্যার নয়—আপনার অনলাইন সেলস টিম</h2><p className="mt-5 text-sm font-medium leading-7 text-white/65 sm:text-base">অতিথিরা আপনার ডোমেইনে এসে ট্রিপ, কেবিন, খাবার, সুবিধা, গ্যালারি ও খালি তারিখ দেখবে—তারপর সেখান থেকেই বুকিং রিকোয়েস্ট পাঠাবে।</p><Link href="/demo" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#f2c55d] hover:text-[#ffda7f]">সম্পূর্ণ ওয়েবসাইট দেখুন <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="relative min-h-[420px] bg-[#123f46] p-6 sm:p-10"><div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e9b949]/10 blur-3xl" /><div className="sales-tilt relative mx-auto max-w-md overflow-hidden rounded-[24px] bg-white p-2 shadow-2xl"><div className="relative aspect-[4/3] overflow-hidden rounded-[18px]"><Image src="/hero-floatboat-houseboat.jpg" alt="নিজস্ব ডোমেইনে হাউসবোটের বুকিং ওয়েবসাইট" fill sizes="(max-width: 1024px) 80vw, 40vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#082e35]/85 via-[#082e35]/10 to-transparent" /><div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black text-[#0b4e55]">yourhouseboat.com</div><div className="absolute inset-x-0 bottom-0 p-6 text-center text-white"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4d079]">তাঙ্গুয়ার হাওর</div><div className="mt-2 text-2xl font-black">জলের বুকে আপনার স্বপ্নযাত্রা</div><div className="mx-auto mt-4 w-fit rounded-full bg-[#e9b949] px-5 py-2.5 text-[10px] font-black text-[#17383d]">এখনই বুক করুন</div></div></div></div><div className="absolute bottom-7 left-5 rounded-2xl border border-white/10 bg-white/10 p-3.5 shadow-xl backdrop-blur-xl sm:left-8"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#67c8b0] text-[#08343a]"><ShieldCheck className="h-4 w-4" /></span><div><div className="text-[10px] font-black">নিরাপদ বুকিং</div><div className="text-[8px] text-white/55">দিন-রাত ২৪ ঘণ্টা</div></div></div></div></div>
      </div></section>

      <section id="workflow" className="border-y border-[#17383d]/10 bg-white px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><div className="sales-eyebrow">শুরু করা সহজ</div><h2 className="sales-title mt-4">তিন ধাপেই আপনার ডিজিটাল যাত্রা</h2><p className="sales-subtitle mx-auto mt-5">জটিল প্রযুক্তি বোঝার দরকার নেই। প্রয়োজনীয় তথ্য দিন, সম্পূর্ণ সেটআপ আমরা করে দেব।</p></div>
        <div className="relative mt-14 grid gap-5 md:grid-cols-3"><div className="absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-[#1a756c]/20 md:block" />{processSteps.map((item) => { const Icon = item.icon; return <article key={item.step} className="relative rounded-[26px] border border-[#17383d]/10 bg-[#fbfaf6] p-7 text-center"><div className="relative z-10 mx-auto grid h-[72px] w-[72px] place-items-center rounded-2xl bg-[#0c4b51] text-white shadow-lg shadow-[#0c4b51]/15"><Icon className="h-7 w-7" /><span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#e9b949] text-[9px] font-black text-[#17383d]">{item.step}</span></div><h3 className="mt-6 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#6c8185]">{item.text}</p></article>; })}</div>
      </div></section>

      <section id="pricing" className="relative overflow-hidden bg-[#f3efe3] px-5 py-20 sm:py-28 lg:px-8"><div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full border-[60px] border-[#e9b949]/10" /><div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#0d7169]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl"><div className="mx-auto max-w-3xl text-center"><div className="sales-eyebrow">একটাই প্ল্যান, সবকিছুসহ</div><h2 className="sales-title mt-4">বারবার বিল নয়। একবারেই আপনার।</h2><p className="sales-subtitle mx-auto mt-5">হাউসবোট ব্যবসার পূর্ণ ডিজিটাল সেটআপ—কোনো জটিল প্যাকেজ বা মাসিক সাবস্ক্রিপশন ছাড়াই।</p></div>
          <div className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-[34px] border border-[#17383d]/10 bg-white shadow-[0_30px_90px_rgba(24,57,62,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden bg-[#0b3037] p-8 text-white sm:p-11"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0d8c7c]/30 blur-3xl" /><div className="relative"><div className="inline-flex items-center gap-2 rounded-full bg-[#e9b949] px-3 py-1.5 text-[11px] font-black text-[#17383d]"><Sparkles className="h-3.5 w-3.5" /> লাইফটাইম অফার</div><div className="mt-8 text-sm font-bold text-white/55">এককালীন সম্পূর্ণ মূল্য</div><div className="mt-2 flex items-start gap-1"><span className="mt-2 text-2xl font-black text-[#f2c55d]">৳</span><span className="text-6xl font-black tracking-[-0.06em] sm:text-7xl">৪০,০০০</span></div><div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#a9ddd2]"><BadgeCheck className="h-4 w-4" /> একবার পেমেন্ট · আজীবন ব্যবহার</div><div className="my-8 h-px bg-white/10" />
              <div className="space-y-4 text-sm font-semibold text-white/75"><div className="flex gap-3"><Globe2 className="h-5 w-5 shrink-0 text-[#f2c55d]" /> আপনার ডোমেইনে নিজস্ব ওয়েবসাইট</div><div className="flex gap-3"><PanelTop className="h-5 w-5 shrink-0 text-[#f2c55d]" /> পূর্ণ বুকিং ও অ্যাডমিন সিস্টেম</div><div className="flex gap-3"><Headphones className="h-5 w-5 shrink-0 text-[#f2c55d]" /> সেটআপ ও ব্যবহার বুঝিয়ে দেওয়া</div></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="group mt-9 flex w-full items-center justify-center gap-2 rounded-full bg-[#e9b949] px-6 py-4 text-sm font-black text-[#17383d] hover:bg-[#f3c965]">এখনই শুরু করুন <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
            </div></div>
            <div className="p-8 sm:p-11"><div className="text-xs font-black uppercase tracking-[0.15em] text-[#0d7169]">প্যাকেজে যা যা থাকছে</div><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedItems.map((item) => <div key={item} className="flex gap-3 text-sm font-bold leading-6 text-[#36575c]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e8f5ef] text-[#0d7169]"><Check className="h-3 w-3" /></span>{item}</div>)}</div><div className="mt-8 rounded-2xl border border-[#e9b949]/35 bg-[#fff9e9] p-4 text-xs font-semibold leading-6 text-[#725827]"><b className="text-[#513a0e]">সোজা হিসাব:</b> সফটওয়্যার লাইসেন্সের জন্য ভবিষ্যতে কোনো মাসিক বা বার্ষিক সাবস্ক্রিপশন দিতে হবে না।</div></div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-20 sm:py-28 lg:px-8"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div><div className="sales-eyebrow">সাধারণ প্রশ্ন</div><h2 className="sales-title mt-4">সিদ্ধান্ত নেওয়ার আগে যা জানতে চান</h2><p className="sales-subtitle mt-5">আরও কিছু জানতে চাইলে সরাসরি হোয়াটসঅ্যাপে আমাদের সাথে কথা বলুন।</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#17383d]/15 bg-white px-5 py-3 text-sm font-black text-[#0c4b51] hover:border-[#0d7169]/35 hover:bg-[#f3f8f5]"><MessageCircle className="h-4 w-4" /> প্রশ্ন করুন</a></div>
        <div className="overflow-hidden rounded-[26px] border border-[#17383d]/10 bg-white">{faqs.map((faq, index) => { const expanded = openFaq === index; return <div key={faq.question} className="border-b border-[#17383d]/10 last:border-0"><button type="button" onClick={() => setOpenFaq(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 sm:py-6" aria-expanded={expanded}><span className="font-black leading-6 text-[#17383d]">{faq.question}</span><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${expanded ? 'rotate-180 bg-[#0d7169] text-white' : 'bg-[#eff4f1] text-[#36575c]'}`}><ChevronDown className="h-4 w-4" /></span></button>{expanded && <div className="px-5 pb-6 pr-14 text-sm font-medium leading-7 text-[#687e82] sm:px-7 sm:pr-20">{faq.answer}</div>}</div>; })}</div>
      </div></section>

      <section className="px-5 pb-8 lg:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#e9b949] px-7 py-12 sm:px-12 sm:py-14 lg:flex lg:items-center lg:justify-between"><div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[55px] border-white/15" /><div className="relative max-w-3xl"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[#5c4715]"><Clock3 className="h-4 w-4" /> আপনার সময় এখন</div><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em] text-[#17383d] sm:text-5xl">হাউসবোট চালান হিসাব করে,<br className="hidden sm:block" /> অনুমান করে নয়।</h2><p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#5f532f] sm:text-base">আপনার ব্যবসার জন্য একটি নিজস্ব ডিজিটাল সিস্টেম তৈরি করতে আজই আমাদের সাথে কথা বলুন।</p></div><div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#0b3037] px-7 py-4 text-sm font-black text-white shadow-xl shadow-[#17383d]/15 hover:bg-[#0d5258]"><MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপে কথা বলুন</a><Link href="/demo" className="flex items-center justify-center gap-2 rounded-full border border-[#17383d]/15 bg-white/35 px-7 py-4 text-sm font-black text-[#17383d] hover:bg-white/55">ডেমো সাইট দেখুন <ExternalLink className="h-4 w-4" /></Link></div></div></section>

      <footer className="bg-[#0b3037] px-5 pb-28 pt-14 text-white sm:pb-8 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.25fr_0.75fr_0.75fr]"><div className="max-w-sm"><BrandMark inverse /><p className="mt-5 text-sm font-medium leading-7 text-white/55">বাংলাদেশের হাউসবোট ব্যবসাকে সহজ, গোছানো ও লাভজনক করতে তৈরি সম্পূর্ণ বুকিং ও ম্যানেজমেন্ট সিস্টেম।</p></div><div><div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">দ্রুত লিংক</div><div className="mt-4 grid gap-3 text-sm font-bold text-white/65"><Link href="#features" className="hover:text-[#f2c55d]">সুবিধাসমূহ</Link><Link href="#pricing" className="hover:text-[#f2c55d]">মূল্য</Link><Link href="#faq" className="hover:text-[#f2c55d]">প্রশ্নোত্তর</Link></div></div><div><div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">ডেমো</div><div className="mt-4 grid gap-3 text-sm font-bold text-white/65"><Link href="/demo" className="flex items-center gap-2 hover:text-[#f2c55d]">বুকিং ওয়েবসাইট <ExternalLink className="h-3.5 w-3.5" /></Link><Link href="/admin/login" className="flex items-center gap-2 hover:text-[#f2c55d]">অ্যাডমিন প্যানেল <ExternalLink className="h-3.5 w-3.5" /></Link></div></div></div><div className="flex flex-col gap-3 pt-6 text-xs font-semibold text-white/35 sm:flex-row sm:items-center sm:justify-between"><div>© ২০২৬ Floatbase Systems. সর্বস্বত্ব সংরক্ষিত।</div><div>হাউসবোট ব্যবসার জন্য তৈরি, বাংলাদেশে নির্মিত।</div></div></div></footer>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-[#17383d]/10 bg-white/95 p-2 shadow-[0_16px_50px_rgba(12,48,55,0.18)] backdrop-blur-xl sm:hidden"><Link href="/demo" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#eef3f0] px-3 py-3 text-xs font-black text-[#17383d]"><ExternalLink className="h-3.5 w-3.5" /> ডেমো দেখুন</Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0c4b51] px-3 py-3 text-xs font-black text-white"><MessageCircle className="h-3.5 w-3.5" /> কথা বলুন</a></div>
    </main>
  );
}
