'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chartColors } from '@/lib/admin/constants';

type TrendDatum = { date: string; income: number; expense: number; profit: number };
type CategoryDatum = { category: string; amount: number };
type CountDatum = { name: string; value: number };
type TopRoomDatum = { room: string; bookings: number };

interface ReportsChartsProps {
  roomData: TopRoomDatum[];
  incomeByCategory: CategoryDatum[];
  expenseByCategory: CategoryDatum[];
  seasonData?: CountDatum[];
}

const PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#ef4444', '#64748b'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#0ea5e9',
  checked_in: '#8b5cf6',
  checked_out: '#6366f1',
  completed: '#10b981',
  cancelled: '#ef4444',
  unpaid: '#ef4444',
  partially_paid: '#f59e0b',
  paid: '#10b981',
  refunded: '#64748b',
  haor: '#0ea5e9',
  padma: '#14b8a6',
};

function formatMoney(value: number) {
  return `৳${Math.round(Number(value) || 0).toLocaleString('en-US')}`;
}

function formatNumber(value: number) {
  return Math.round(Number(value) || 0).toLocaleString('en-US');
}

function formatAxisMoney(value: number) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 100000) return `৳${Math.round(amount / 100000)}L`;
  if (Math.abs(amount) >= 1000) return `৳${Math.round(amount / 1000)}k`;
  return `৳${Math.round(amount)}`;
}

function formatDateTick(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function prettyLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function truncateLabel(value: string, max = 18) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function EmptyChart({ label, className = 'h-[220px]' }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-400 ${className}`}>
      {label}
    </div>
  );
}

function DonutChartCard({
  title,
  subtitle,
  data,
  valueFormatter = formatMoney,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  data: CountDatum[];
  valueFormatter?: (value: number) => string;
  emptyLabel: string;
}) {
  const chartData = data.filter((item) => Number(item.value) > 0);
  const total = chartData.reduce((sum, item) => sum + Number(item.value), 0);

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden">
      <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-4">
        <CardTitle className="text-lg font-black text-slate-800 tracking-tight">{title}</CardTitle>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {chartData.length === 0 ? (
          <EmptyChart label={emptyLabel} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={98}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [valueFormatter(Number(value)), 'Total']}
                    labelFormatter={(label) => prettyLabel(String(label))}
                    contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</div>
                  <div className="text-lg font-black text-slate-800">{valueFormatter(total)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {chartData.map((entry, index) => {
                const percent = total > 0 ? (Number(entry.value) / total) * 100 : 0;
                const color = STATUS_COLORS[entry.name] || PALETTE[index % PALETTE.length];
                return (
                  <div key={entry.name} className="rounded-2xl border border-slate-100 bg-white/70 p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate text-sm font-bold text-slate-700" title={prettyLabel(entry.name)}>
                          {prettyLabel(entry.name)}
                        </span>
                      </div>
                      <span className="shrink-0 text-sm font-black text-slate-900">{valueFormatter(Number(entry.value))}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
                    </div>
                    <div className="mt-1 text-right text-[11px] font-bold text-slate-400">{percent.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HorizontalBarChartCard({
  title,
  subtitle,
  data,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  data: CountDatum[];
  emptyLabel: string;
}) {
  const chartData = data.filter((item) => Number(item.value) > 0).map((item, index) => ({
    ...item,
    color: PALETTE[index % PALETTE.length],
  }));
  const height = Math.max(230, chartData.length * 58 + 70);

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden">
      <CardHeader className="bg-white/50 border-b border-slate-100/50 pb-4">
        <CardTitle className="text-lg font-black text-slate-800 tracking-tight">{title}</CardTitle>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {chartData.length === 0 ? (
          <EmptyChart label={emptyLabel} />
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 22, bottom: 8, left: 4 }}>
                <CartesianGrid horizontal={false} stroke="#edf2f7" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={132}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(value) => truncateLabel(String(value))}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(14, 165, 233, 0.06)' }}
                  formatter={(value) => [formatNumber(Number(value)), 'Bookings']}
                  labelFormatter={(label) => prettyLabel(String(label))}
                  contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)' }}
                />
                <Bar dataKey="value" barSize={22} radius={[0, 12, 12, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsCharts({
  roomData,
  incomeByCategory,
  expenseByCategory,
  seasonData = [],
}: ReportsChartsProps) {
  const roomChartData = roomData.map((item) => ({ name: item.room, value: item.bookings }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">

      <div className="md:col-span-1 lg:col-span-2">
        <DonutChartCard
          title="Income by Source"
          subtitle="Category share"
          data={incomeByCategory.map((item) => ({ name: item.category, value: item.amount }))}
          emptyLabel="No income recorded"
        />
      </div>

      <div className="md:col-span-1 lg:col-span-2">
        <DonutChartCard
          title="Expenses by Category"
          subtitle="Cost distribution"
          data={expenseByCategory.map((item) => ({ name: item.category, value: item.amount }))}
          emptyLabel="No expenses recorded"
        />
      </div>

      {seasonData.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4">
          <DonutChartCard
            title="Season Split"
            subtitle="Haor bookings vs Padma events"
            data={seasonData}
            valueFormatter={formatNumber}
            emptyLabel="No season data"
          />
        </div>
      )}

      <div className="md:col-span-2 lg:col-span-4">
        <HorizontalBarChartCard
          title="Top Booked Rooms"
          subtitle="Most selected cabins"
          data={roomChartData}
          emptyLabel="No rooms booked"
        />
      </div>

    </div>
  );
}
