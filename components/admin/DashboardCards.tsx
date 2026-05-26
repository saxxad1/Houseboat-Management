'use client';

import { ArrowDownRight, ArrowUpRight, CalendarCheck, Clock, Wallet, CheckCircle, CircleDot, Tent, CalendarDays } from 'lucide-react';
import { currencyFormatter } from '@/lib/admin/constants';
import { motion } from 'framer-motion';

interface DashboardCard {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'blue' | 'amber' | 'green' | 'red' | 'slate';
}

const toneStyles = {
  blue: { bg: 'from-sky-500/10 to-blue-600/10', border: 'border-blue-200/50', iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600', iconText: 'text-white' },
  amber: { bg: 'from-amber-500/10 to-orange-600/10', border: 'border-orange-200/50', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500', iconText: 'text-white' },
  green: { bg: 'from-emerald-500/10 to-teal-600/10', border: 'border-emerald-200/50', iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600', iconText: 'text-white' },
  red: { bg: 'from-rose-500/10 to-red-600/10', border: 'border-red-200/50', iconBg: 'bg-gradient-to-br from-rose-400 to-red-600', iconText: 'text-white' },
  slate: { bg: 'from-slate-500/10 to-gray-600/10', border: 'border-slate-200/50', iconBg: 'bg-gradient-to-br from-slate-400 to-gray-600', iconText: 'text-white' },
};

export function money(value: number) {
  return currencyFormatter.format(value).replace('BDT', '৳');
}

export default function DashboardCards({ cards }: { cards: DashboardCard[] }) {
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('profit')) return ArrowUpRight;
    if (l.includes('expense')) return ArrowDownRight;
    if (l.includes('income')) return Wallet;
    if (l.includes('pending')) return Clock;
    if (l.includes('confirmed')) return CheckCircle;
    if (l.includes('today')) return CircleDot;
    if (l.includes('room')) return Tent;
    return CalendarDays;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = getIcon(card.label);
        const style = toneStyles[card.tone || 'slate'];
        return (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} ${style.border} border p-5 shadow-sm backdrop-blur-md transition-all`}
          >
            {/* Soft Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/40 blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600/80 mb-1">{card.label}</p>
                <div className="break-words text-2xl font-black text-slate-800 tracking-tight">{card.value}</div>
                {card.helper && <p className="mt-2 text-[10px] font-semibold text-slate-500 bg-white/50 inline-block px-2 py-0.5 rounded-full">{card.helper}</p>}
              </div>
              <div className={`rounded-xl p-2.5 shadow-inner flex items-center justify-center ${style.iconBg} ${style.iconText}`}>
                <Icon className="h-5 w-5 drop-shadow-sm" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
