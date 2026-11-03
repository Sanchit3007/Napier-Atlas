'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { NapierStrain } from '@prisma/client';
import { clsx } from 'clsx';
import { methanePerTonDm, publishedMethane } from '@/lib/simulator';
import StrainDetailCard from '@/components/StrainDetailCard';

// "Sort by" options for the strain cards.
const SORTS = [
  { key: 'cng', label: 'Bio-CNG potential', value: (s: NapierStrain) => methanePerTonDm(s) },
  { key: 'yield', label: 'Biomass yield', value: (s: NapierStrain) => s.annualYieldTons },
  { key: 'protein', label: 'Protein', value: (s: NapierStrain) => s.crudeProtein },
  { key: 'speed', label: 'Fastest cut', value: (s: NapierStrain) => -s.firstHarvestDays },
];

const COMPARE_COLORS = ['#2e4d1a', '#b45309', '#0369a1']; // one colour per compared strain
const MAX_COMPARE = 3;

// Strain cards with soil filter, search and sort, plus side-by-side compare of up to 3 strains.
export default function StrainExplorer({ strains }: Readonly<{ strains: NapierStrain[] }>) {
  const [query, setQuery] = useState('');
  const [soil, setSoil] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('cng');
  const [compare, setCompare] = useState<string[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const detailsButton = useRef<HTMLButtonElement | null>(null);

  // Closes the pop-out card and puts focus back on the Details button that opened it.
  const closeDetails = useCallback(() => {
    setOpenSlug(null);
    detailsButton.current?.focus();
  }, []);
  const openStrain = strains.find((s) => s.slug === openSlug);

  const soils = useMemo(() => [...new Set(strains.flatMap((s) => s.suitableSoils))].sort((a, b) => a.localeCompare(b)), [strains]);

  const visible = useMemo(() => {
    const sort = SORTS.find((s) => s.key === sortKey)!;
    const q = query.trim().toLowerCase();
    return strains
      .filter((s) => !soil || s.suitableSoils.includes(soil))
      .filter((s) => !q || [s.name, s.scientificName, s.origin, s.bestFor].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => sort.value(b) - sort.value(a));
  }, [strains, query, soil, sortKey]);

  const compared = compare.map((slug) => strains.find((s) => s.slug === slug)!);

  // Adds or removes a strain from the comparison (at most MAX_COMPARE at once).
  const toggleCompare = (slug: string) =>
    setCompare((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug);
      return cur.length < MAX_COMPARE ? [...cur, slug] : cur;
    });

  return (
    <div>
      {/* Filters: phones get a search box and a filter sheet; tablets and laptops get the row below. */}
      <div className="mb-8">
        <MobileFilters
          query={query}
          setQuery={setQuery}
          soil={soil}
          setSoil={setSoil}
          sortKey={sortKey}
          setSortKey={setSortKey}
          soils={soils}
          count={visible.length}
        />
        <div className="hidden sm:flex sm:flex-row sm:flex-wrap gap-3 sm:items-center">
          <label className="relative">
            <span className="sr-only">Search strains</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, origin, use…"
              className="w-full sm:w-64 bg-card border border-line rounded-lg pl-9 pr-3 py-1.5 text-sm text-ink placeholder:text-ink-dim focus-visible:outline-2 focus-visible:outline-fern"
            />
          </label>
          {/* Soil filter: one soil at a time, or all soils */}
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Soil{' '}
            <select
              value={soil ?? ''}
              onChange={(e) => setSoil(e.target.value || null)}
              className="flex-1 sm:flex-none bg-card border border-line rounded-lg px-3 py-1.5 text-ink focus-visible:outline-2 focus-visible:outline-fern"
            >
              <option value="">All soils</option>
              {soils.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Sort by{' '}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="flex-1 sm:flex-none bg-card border border-line rounded-lg px-3 py-1.5 text-ink focus-visible:outline-2 focus-visible:outline-fern"
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
        <p className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-muted">
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
                layoutId={`strain-card-${s.slug}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className={clsx(
                  'rounded-3xl bg-card border p-6 flex flex-col transition-colors',
                  selected ? 'border-fern/60 shadow-lg shadow-fern/15' : 'border-line hover:border-line',
                )}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-fern mb-2 line-clamp-1">
                  {s.origin}
                </div>
                <h3 className="text-lg font-bold text-ink leading-snug">{s.name}</h3>
                {/* Two lines reserved so the stats start at the same height in every card of a row. */}
                <p className="text-xs italic text-ink-dim mb-4 min-h-8 line-clamp-2" title={s.scientificName}>
                  {s.scientificName}
                </p>

                <dl className="grid grid-cols-3 gap-2 mb-4">
                  <Stat label="m³ CH₄/t organic" value={publishedMethane(s) ?? '—'} />
                  <Stat label="t/acre/yr" value={s.annualYieldTons} />
                  <Stat label="Protein" value={`${s.crudeProtein}%`} />
                </dl>

                <p className="text-sm text-ink leading-relaxed mb-5 flex-1">{s.bestFor}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCompare(s.slug)}
                    disabled={full}
                    aria-pressed={selected}
                    className={clsx(
                      'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-fern',
                      selected
                        ? 'bg-fern border-fern text-white'
                        : 'bg-page border-line text-ink hover:border-line disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {selected ? 'Comparing' : 'Compare'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      detailsButton.current = e.currentTarget;
                      setOpenSlug(s.slug);
                    }}
                    aria-haspopup="dialog"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-fern hover:text-fern-dark hover:bg-fern/10 transition-colors focus-visible:outline-2 focus-visible:outline-fern"
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pop-out details card; it grows out of the strain card via the shared layoutId */}
      <AnimatePresence>
        {openStrain && (
          <StrainDetailCard
            key={openStrain.slug}
            strain={openStrain}
            layoutId={`strain-card-${openStrain.slug}`}
            onClose={closeDetails}
          />
        )}
      </AnimatePresence>

      {/* Comparison panel */}
      <AnimatePresence>
        {compared.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-10 rounded-3xl border border-line bg-card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-ink">
                {compared.length < 2 ? 'Pick one more strain to compare' : 'Side-by-side comparison'}
              </h3>
              <button
                onClick={() => setCompare([])}
                className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
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

// Phones only: search plus a filter button that opens Soil and Sort in a sheet sliding up from the bottom.
function MobileFilters({
  query,
  setQuery,
  soil,
  setSoil,
  sortKey,
  setSortKey,
  soils,
  count,
}: Readonly<{
  query: string;
  setQuery: (q: string) => void;
  soil: string | null;
  setSoil: (s: string | null) => void;
  sortKey: string;
  setSortKey: (k: string) => void;
  soils: string[];
  count: number;
}>) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const active = (soil ? 1 : 0) + (sortKey === 'cng' ? 0 : 1);
  const sortLabel = SORTS.find((s) => s.key === sortKey)!.label;

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  // While open: Escape closes, the page behind stops scrolling, and focus moves into the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const chip = (on: boolean) =>
    clsx(
      'px-3.5 py-2 rounded-full text-sm border transition-colors focus-visible:outline-2 focus-visible:outline-fern',
      on ? 'bg-fern/15 border-fern/60 text-fern' : 'bg-page border-line text-ink',
    );

  return (
    <div className="sm:hidden">
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search strains</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, origin, use…"
            className="w-full h-11 bg-card border border-line rounded-xl pl-9 pr-3 text-base text-ink placeholder:text-ink-dim focus-visible:outline-2 focus-visible:outline-fern"
          />
        </label>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={active ? `Filters (${active} active)` : 'Filters'}
          className={clsx(
            'relative w-11 h-11 shrink-0 rounded-xl border bg-card flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-fern',
            active ? 'border-fern/60 text-fern' : 'border-line text-ink',
          )}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {active > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-fern text-[11px] font-bold leading-4.5 text-white">
              {active}
            </span>
          )}
        </button>
      </div>
      <p className="mt-2.5 text-xs text-ink-muted">
        {soil ? `${soil} · ` : ''}Sorted by {sortLabel} · {count} {count === 1 ? 'strain' : 'strains'}
      </p>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label="Close filters" onClick={close} className="absolute inset-0 bg-page/70 backdrop-blur-sm" />
            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5 outline-none"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between">
                <h3 id="filter-sheet-title" className="text-base font-semibold text-ink">
                  Filter strains
                </h3>
                <button type="button" onClick={close} aria-label="Close filters" className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-mono uppercase tracking-widest text-ink-muted">Soil</legend>
                <div className="flex flex-wrap gap-2">
                  {[null, ...soils].map((s) => (
                    <button key={s ?? 'all'} type="button" onClick={() => setSoil(s)} aria-pressed={soil === s} className={chip(soil === s)}>
                      {s ?? 'All soils'}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-mono uppercase tracking-widest text-ink-muted">Sort by</legend>
                <div className="space-y-1">
                  {SORTS.map((s) => (
                    <label key={s.key} className="flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm text-ink has-checked:bg-line/50">
                      <input
                        type="radio"
                        name="mobile-sort"
                        value={s.key}
                        checked={sortKey === s.key}
                        onChange={() => setSortKey(s.key)}
                        className="w-4 h-4 accent-fern"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-[auto_1fr] gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSoil(null);
                    setSortKey('cng');
                  }}
                  className="h-11 px-4 rounded-xl border border-line text-sm font-semibold text-ink"
                >
                  Reset
                </button>
                <button type="button" onClick={close} className="h-11 rounded-xl bg-fern text-sm font-semibold text-white">
                  Show {count} {count === 1 ? 'strain' : 'strains'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// One small figure box on a strain card, e.g. "17% Protein".
function Stat({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    // Keeps every number at the top of its box, even when the label wraps to two lines.
    <div className="flex flex-col-reverse justify-end rounded-xl bg-page/60 border border-line px-2 py-2 text-center">
      <dt className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-base font-bold text-ink font-mono">{value}</dd>
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
function Comparison({ strains }: Readonly<{ strains: NapierStrain[] }>) {
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
            <PolarGrid stroke="#a3bf87" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#29391d', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#cedfbc', border: '1px solid #a3bf87', color: '#18260f', borderRadius: 12, fontSize: 12 }}
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
            <tr className="text-left text-ink-muted">
              <th className="py-2 pr-4 font-medium">Metric</th>
              {strains.map((s, i) => (
                <th key={s.slug} className="py-2 pr-4 font-medium">
                  <span className="inline-flex items-center gap-2 text-ink">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMPARE_COLORS[i] }} />
                    {s.name.split(' (')[0]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {METRICS.map((m) => {
              const values = strains.map(m.value);
              const best = m.lowerIsBetter ? Math.min(...values) : Math.max(...values);
              return (
                <tr key={m.label}>
                  <td className="py-2.5 pr-4 text-ink-muted">{m.label}</td>
                  {strains.map((s, i) => (
                    <td
                      key={s.slug}
                      className={clsx('py-2.5 pr-4 font-mono', values[i] === best ? 'text-fern font-semibold' : 'text-ink')}
                    >
                      {values[i]}
                      {m.label === 'Bio-CNG' && publishedMethane(s) === null && '*'}
                      <span className="text-ink-dim font-sans text-xs">{m.unit}</span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {strains.some((s) => publishedMethane(s) === null) && (
          <p className="mt-3 text-xs text-ink-dim">* No published methane figure; a conservative estimate is used.</p>
        )}
      </div>
    </div>
  );
}
