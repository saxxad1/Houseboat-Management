'use client';

import { ArrowDownRight, ArrowUpRight, CalendarCheck, Clock, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { currencyFormatter } from '@/lib/admin/constants';

interface DashboardCard {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'blue' | 'amber' | 'green' | 'red' | 'slate';
}

const toneClasses = {
  blue: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-50 text-slate-700',
};

export function money(value: number) {
  return currencyFormatter.format(value).replace('BDT', '৳');
}

export default function DashboardCards({ cards }: { cards: DashboardCard[] }) {
  const icons = [CalendarCheck, Clock, CalendarCheck, CalendarCheck, CalendarCheck, ArrowUpRight, ArrowDownRight, Wallet, Wallet, CalendarCheck];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = icons[index % icons.length];
        return (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
                  <div className="mt-2 break-words text-2xl font-black text-slate-900">{card.value}</div>
                  {card.helper && <p className="mt-1 text-xs text-slate-500">{card.helper}</p>}
                </div>
                <div className={`rounded-lg p-2 ${toneClasses[card.tone || 'slate']}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
