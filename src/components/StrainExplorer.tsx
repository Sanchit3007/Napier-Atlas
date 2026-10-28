'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Plus, Search, X } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { NapierStrain } from '@prisma/client';
import { clsx } from 'clsx';
import { methanePerTonDm, publishedMethane } from '@/lib/simulator';

// "Sort by" options for the strain cards.
const SORTS = [
  { key: 'cng', label: 'Bio-CNG potential', value: (s: NapierStrain) => methanePerTonDm(s) },
  { key: 'yield', label: 'Biomass yield', value: (s: NapierStrain) => s.annualYieldTons },
  { key: 'protein', label: 'Protein', value: (s: NapierStrain) => s.crudeProtein },
  { key: 'speed', label: 'Fastest cut', value: (s: NapierStrain) => -s.firstHarvestDays },
];

const COMPARE_COLORS = ['#10b981', '#f59e0b', '#38bdf8']; // one colour per compared strain
const MAX_COMPARE = 3;

// Strain cards with soil filter, search and sort, plus side-by-side compare of up to 3 strains.
export default function StrainExplorer({ strains }: { strains: NapierStrain[] }) {
  const [query, setQuery] = useState('');
  const [soil, setSoil] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('cng');
  const [compare, setCompare] = useState<string[]>([]);

  const soils = useMemo(() => [...new Set(strains.flatMap((s) => s.suitableSoils))].sort(), [strains]);

  const visible = useMemo(() => {
    const sort = SORTS.find((s) => s.key === sortKey)!;
    const q = query.trim().toLowerCase();
    return strains
      .filter((s) => !soil || s.suitableSoils.includes(soil))
      .filter((s) => !q || [s.name, s.scientificName, s.origin, s.bestFor].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => sort.value(b) - sort.value(a));
  }, [strains, query, soil, sortKey]);

  const compared = compare.map((slug) => strains.find((s) => s.slug === slug)!);

  const toggleCompare = (slug: string) =>
    setCompare((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length < MAX_COMPARE ? [...cur, slug] : cur,
    );

  return (
    <div>
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
          <label className="relative">
            <span className="sr-only">Search strains</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, origin, use…"
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-emerald-400"
            />
          </label>
          {/* Soil filter: one soil at a time, or all soils */}
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Soil{' '}
            <select
              value={soil ?? ''}
              onChange={(e) => setSoil(e.target.value || null)}
              className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <option value="">All soils</option>
              {soils.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Sort by{' '}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 && (
        <p className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-400">
          No strains match your search. Try another word or set Soil to “All soils”.
        </p>
      )}

      {/* Strain cards */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((s) => {
            const selected = compare.includes(s.slug);
            const full = !selected && compare.length >= MAX_COMPARE;
            return (
              <motion.article
                key={s.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className={clsx(
                  'rounded-3xl bg-slate-900 border p-6 flex flex-col transition-colors',
                  selected ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/50' : 'border-slate-800 hover:border-slate-700',
                )}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2 line-clamp-1">
                  {s.origin}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{s.name}</h3>
                {/* Two lines reserved so the stats start at the same height in every card of a row. */}
                <p className="text-xs italic text-slate-500 mb-4 min-h-8 line-clamp-2" title={s.scientificName}>
                  {s.scientificName}
                </p>

                <dl className="grid grid-cols-3 gap-2 mb-4">
                  <Stat label="m³ CH₄/t organic" value={publishedMethane(s) ?? '—'} />
                  <Stat label="t/acre/yr" value={s.annualYieldTons} />
                  <Stat label="Protein" value={`${s.crudeProtein}%`} />
                </dl>

                <p className="text-sm text-slate-300 leading-relaxed mb-5 flex-1">{s.bestFor}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCompare(s.slug)}
                    disabled={full}
                    aria-pressed={selected}
                    className={clsx(
                      'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400',
                      selected
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {selected ? 'Comparing' : 'Compare'}
                  </button>
                  <Link
                    href={`/strains/${s.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors"
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Comparison panel */}
      <AnimatePresence>
        {compared.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-10 rounded-3xl border border-emerald-900/40 bg-linear-to-br from-slate-900 to-emerald-950/30 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-white">
                {compared.length < 2 ? 'Pick one more strain to compare' : 'Side-by-side comparison'}
              </h3>
              <button
                onClick={() => setCompare([])}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
            {compared.length >= 2 && <Comparison strains={compared} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// One small figure box on a strain card, e.g. "17% Protein".
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    // Keeps every number at the top of its box, even when the label wraps to two lines.
    <div className="flex flex-col-reverse justify-end rounded-xl bg-slate-950/60 border border-slate-800 px-2 py-2 text-center">
      <dt className="text-[10px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-base font-bold text-white font-mono">{value}</dd>
    </div>
  );
}

// The rows of the comparison table and the corners of the radar chart.
const METRICS = [
  { label: 'Protein', value: (s: NapierStrain) => s.crudeProtein, unit: '%' },
  { label: 'Yield', value: (s: NapierStrain) => s.annualYieldTons, unit: ' t/acre' },
  { label: 'Dry matter', value: (s: NapierStrain) => s.dryMatter, unit: '%' },
  { label: 'Bio-CNG', value: (s: NapierStrain) => methanePerTonDm(s), unit: ' m³/t organic matter' },
  { label: 'Speed', value: (s: NapierStrain) => s.firstHarvestDays, unit: ' days to 1st cut', lowerIsBetter: true },
  { label: 'Height', value: (s: NapierStrain) => s.maxHeightFeet, unit: ' ft' },
];

// Radar chart and table comparing the selected strains; the best value in each row is highlighted.
function Comparison({ strains }: { strains: NapierStrain[] }) {
  // Scores are relative to the best strain in the comparison (100 = best).
  const radarData = METRICS.map((m) => {
    const values = strains.map(m.value);
    const best = m.lowerIsBetter ? Math.min(...values) : Math.max(...values);
    const row: Record<string, string | number> = { metric: m.label };
    strains.forEach((s, i) => {
      row[s.slug] = Math.round(m.lowerIsBetter ? (best / values[i]) * 100 : (values[i] / best) * 100);
    });
    return row;
  });

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="h-80" role="img" aria-label="Radar chart comparing the selected strains">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
              formatter={(v, name) => [`${v}/100`, strains.find((s) => s.slug === name)?.name ?? name]}
            />
            {strains.map((s, i) => (
              <Radar
                key={s.slug}
                dataKey={s.slug}
                stroke={COMPARE_COLORS[i]}
                fill={COMPARE_COLORS[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-2 pr-4 font-medium">Metric</th>
              {strains.map((s, i) => (
                <th key={s.slug} className="py-2 pr-4 font-medium">
                  <span className="inline-flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMPARE_COLORS[i] }} />
                    {s.name.split(' (')[0]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {METRICS.map((m) => {
              const values = strains.map(m.value);
              const best = m.lowerIsBetter ? Math.min(...values) : Math.max(...values);
              return (
                <tr key={m.label}>
                  <td className="py-2.5 pr-4 text-slate-400">{m.label}</td>
                  {strains.map((s, i) => (
                    <td
                      key={s.slug}
                      className={clsx('py-2.5 pr-4 font-mono', values[i] === best ? 'text-emerald-300 font-semibold' : 'text-slate-200')}
                    >
                      {values[i]}
                      {m.label === 'Bio-CNG' && publishedMethane(s) === null && '*'}
                      <span className="text-slate-500 font-sans text-xs">{m.unit}</span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {strains.some((s) => publishedMethane(s) === null) && (
          <p className="mt-3 text-xs text-slate-500">* No published methane figure; a conservative estimate is used.</p>
        )}
      </div>
    </div>
  );
}
