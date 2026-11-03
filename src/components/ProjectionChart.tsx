'use client';

import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { YearProjection } from '@/lib/simulator';

const compact = (n: number) => n.toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const SHOW_RATIO = 0.35; // how much of the chart must be on screen before it draws

// 5-year yield chart: cumulative total (green) and each year's harvest (amber), with a legend.
// Whenever the figures change, both lines draw again from Year 1 to Year 5 (the "chart-grow" CSS in globals.css), but only
// once the chart is on screen: a change made while it is scrolled away waits and draws when the visitor reaches it.
export default function ProjectionChart({ data }: Readonly<{ data: YearProjection[] }>) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [drawn, setDrawn] = useState<string | null>(null); // the figures the chart last drew from zero
  const figures = data.map((d) => `${d.cumulative}:${d.tons}`).join(',');

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.intersectionRatio >= SHOW_RATIO), {
      threshold: [0, SHOW_RATIO],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // New figures on screen: remount the chart (new key), which restarts the drawing animation.
  if (onScreen && drawn !== figures) setDrawn(figures);

  return (
    <div>
      {/* Legend: which line is which. */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs text-ink">
        <li className="inline-flex items-center gap-2">
          <span className="w-5 h-0.5 rounded-full bg-fern" aria-hidden="true" />
          <span>
            <span className="font-medium text-ink">Cumulative total</span>: all biomass harvested so far
          </span>
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="w-5 h-0.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span>
            <span className="font-medium text-ink">Harvested that year</span>: biomass from that year alone
          </span>
        </li>
      </ul>
      <div
        ref={boxRef}
        className="chart-grow h-64 w-full"
        role="img"
        aria-label="Five-year projected biomass yield chart: cumulative total and biomass harvested each year"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart key={drawn ?? 'waiting'} data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e4d1a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2e4d1a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yearlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#a3bf87" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" stroke="#314424" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#314424" fontSize={12} tickLine={false} axisLine={false} tickFormatter={compact} />
            <Tooltip
              contentStyle={{ background: '#cedfbc', border: '1px solid #a3bf87', color: '#18260f', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#18260f' }}
              formatter={(value, name) => [`${Number(value).toLocaleString('en-IN')} t`, name]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Cumulative total"
              stroke="#2e4d1a"
              strokeWidth={2}
              fill="url(#cumulativeFill)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="tons"
              name="Harvested that year"
              stroke="#b45309"
              strokeWidth={2}
              fill="url(#yearlyFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
