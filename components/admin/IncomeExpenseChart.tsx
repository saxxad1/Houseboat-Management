'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chartColors } from '@/lib/admin/constants';

interface IncomeExpenseChartProps {
  data: { month: string; income: number; expense: number }[];
  statusData: { name: string; value: number; color: string }[];
}

export default function IncomeExpenseChart({ data, statusData }: IncomeExpenseChartProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2 border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-4">
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Financial Overview</CardTitle>
          <p className="text-sm text-slate-500 font-medium">Monthly Income vs Expense analysis</p>
        </CardHeader>
        <CardContent className="h-80 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.income} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColors.income} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.expense} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColors.expense} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `৳${(val/1000)}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', fontWeight: 600 }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }} />
              <Area type="monotone" dataKey="income" name="Income" stroke={chartColors.income} strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke={chartColors.expense} strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden flex flex-col">
        <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-4">
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Booking Status</CardTitle>
          <p className="text-sm text-slate-500 font-medium">Distribution of all bookings</p>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pt-6 pb-2 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie 
                data={statusData} 
                innerRadius={70} 
                outerRadius={100} 
                dataKey="value" 
                paddingAngle={5}
                stroke="none"
                cornerRadius={8}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
