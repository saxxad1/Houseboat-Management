'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Expense } from '@/types/database';

const COLORS = ['#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#10b981', '#ec4899', '#14b8a6'];

export default function ExpensesChart({ expenses }: { expenses: Expense[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const expenseByCategory = useMemo(() => {
    const grouped = expenses.reduce((acc, item) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  if (!isMounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-slate-50/50 rounded-3xl animate-pulse">
        <p className="text-slate-400 font-medium">Loading chart...</p>
      </div>
    );
  }

  if (expenseByCategory.length === 0) {
    return null;
  }

  const maxAmount = Math.max(...expenseByCategory.map((e) => e.amount));

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden mb-6">
      <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-4">
        <CardTitle className="text-lg font-black text-slate-800 tracking-tight">Top Expenses Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {expenseByCategory.map((entry, index) => {
            const widthPercent = maxAmount > 0 ? (entry.amount / maxAmount) * 100 : 0;
            return (
              <div key={entry.category} className="flex items-center gap-4">
                <div className="w-24 shrink-0 text-right text-sm font-semibold text-slate-600 capitalize">
                  {entry.category.replace(/_/g, ' ')}
                </div>
                <div className="flex-1 h-6 bg-slate-100 rounded-r-md overflow-hidden flex items-center relative">
                  <div 
                    className="h-full rounded-r-md transition-all duration-1000"
                    style={{ width: `${widthPercent}%`, backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="absolute left-3 text-xs font-bold text-slate-800 mix-blend-hard-light">
                    ৳{entry.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
