'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { YearProjection } from '@/lib/simulator';

const compact = (n: number) => n.toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

// 5-year yield chart: cumulative total (green) and each year's harvest (amber), with a legend.
export default function ProjectionChart({ data }: Readonly<{ data: YearProjection[] }>) {
  return (
    <div>
      {/* Legend: which line is which. */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs text-slate-300">
        <li className="inline-flex items-center gap-2">
          <span className="w-5 h-0.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span>
            <span className="font-medium text-white">Cumulative total</span>: all biomass harvested so far
          </span>
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="w-5 h-0.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span>
            <span className="font-medium text-white">Harvested that year</span>: biomass from that year alone
          </span>
        </li>
      </ul>
      <div
        className="h-64 w-full"
        role="img"
        aria-label="Five-year projected biomass yield chart: cumulative total and biomass harvested each year"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yearlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={compact} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => [`${Number(value).toLocaleString('en-IN')} t`, name]}
            />
            <Area type="monotone" dataKey="cumulative" name="Cumulative total" stroke="#10b981" strokeWidth={2} fill="url(#cumulativeFill)" />
            <Area type="monotone" dataKey="tons" name="Harvested that year" stroke="#f59e0b" strokeWidth={2} fill="url(#yearlyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
