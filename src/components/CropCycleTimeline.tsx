'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Scissors, Sprout, Waypoints } from 'lucide-react';
import { clsx } from 'clsx';

type CycleStrain = { slug: string; name: string; firstHarvestDays: number; ratoonCycleDays: number };

const YEARS = 5; // length of the example harvest calendar
const ROOTING_DAY = 30; // roots and first tillers are established about a month after planting

// Pick a strain to see its growth milestones and a 5-year harvest calendar.
export default function CropCycleTimeline({ strains }: Readonly<{ strains: CycleStrain[] }>) {
  const [slug, setSlug] = useState(
    strains.find((s) => s.slug === 'super-napier-pakchong-1')?.slug ?? strains[0]?.slug,
  );
  const strain = strains.find((s) => s.slug === slug) ?? strains[0];

  // Every harvest day over the five years: the first cut, then one cut each time the crop regrows.
  const cuts = useMemo(() => {
    const days: number[] = [];
    for (let d = strain.firstHarvestDays; d < YEARS * 365; d += strain.ratoonCycleDays) days.push(d);
    return days;
  }, [strain]);

  // The same harvest days split into one list per year (year 1 to 5).
  const years = useMemo(
    () =>
      Array.from({ length: YEARS }, (_, y) => ({
        year: y + 1,
        cuts: cuts.filter((d) => d >= y * 365 && d < (y + 1) * 365),
      })),
    [cuts],
  );

  const milestones = [
    { icon: Sprout, day: 'Day 0', title: 'Stem planting', text: 'Two-node stem cuttings go into moist soil.' },
    { icon: Waypoints, day: `Day ${ROOTING_DAY}`, title: 'Rooting & tillering', text: 'Roots establish and new shoots (tillers) appear.' },
    { icon: Scissors, day: `Day ${strain.firstHarvestDays}`, title: 'First cut', text: 'The first harvest, sent to the digester or used as fodder.' },
    { icon: RefreshCw, day: `Every ${strain.ratoonCycleDays} days`, title: 'Ratoon harvests', text: 'The crop regrows from its roots and is cut again.' },
  ];

  return (
    <div className="space-y-6">
      <fieldset className="flex flex-wrap gap-2 min-w-0">
        <legend className="sr-only">Choose a strain</legend>
        {strains.map((s) => (
          <button
            key={s.slug}
            onClick={() => setSlug(s.slug)}
            aria-pressed={s.slug === strain.slug}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400',
              s.slug === strain.slug
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700',
            )}
          >
            {s.name.split(' (')[0]}
          </button>
        ))}
      </fieldset>

      {/* Milestones */}
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-3xl bg-slate-900 border border-slate-800 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm font-mono text-emerald-300">{m.day}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{m.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{m.text}</p>
            </motion.li>
          );
        })}
      </ol>

      {/* Five-year harvest calendar */}
      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-900/40 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <h3 className="font-semibold text-white">5-year harvest calendar</h3>
          <p className="text-sm text-slate-300">
            <span className="text-2xl font-extrabold font-mono text-emerald-300">{cuts.length}</span> harvests from a
            single planting
          </p>
        </div>

        {/* Phones: one thin line per year, with a dot on each harvest day */}
        <div className="sm:hidden space-y-3">
          {years.map(({ year, cuts: yearCuts }) => (
            <div key={year} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-slate-400">Y{year}</span>
              <div className="relative h-3">
                <span className="absolute inset-x-0 top-1.25 h-0.5 rounded-full bg-slate-700" />
                {year === 1 && (
                  <span
                    className="absolute left-0 top-1.25 border-t-2 border-dashed border-amber-500/75"
                    style={{ width: `${(strain.firstHarvestDays / 365) * 100}%` }}
                    title="Growing before the first cut"
                  />
                )}
                <div className="absolute inset-y-0 left-1 right-1">
                  {yearCuts.map((d, i) => (
                    <motion.span
                      key={`${strain.slug}-${d}`}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (year - 1) * 0.1 + i * 0.04 }}
                      className="absolute top-0.5 -ml-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900"
                      style={{ left: `${((d - (year - 1) * 365) / 365) * 100}%` }}
                      title={`Harvest on day ${d}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-300 text-right">{yearCuts.length}×</span>
            </div>
          ))}
        </div>

        {/* Tablets and laptops: one bar per year with glowing harvest dots */}
        <div className="hidden sm:block space-y-4">
          {years.map(({ year, cuts: yearCuts }) => (
            <div key={year} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Year {year}</span>
              <div className="relative h-8 rounded-full bg-slate-950/70 border border-slate-800">
                {year === 1 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-l-full bg-amber-500/10 border-r border-dashed border-amber-500/40"
                    style={{ width: `${(strain.firstHarvestDays / 365) * 100}%` }}
                    title="Establishment period"
                  />
                )}
                {yearCuts.map((d, i) => (
                  <motion.span
                    key={`${strain.slug}-${d}`}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (year - 1) * 0.1 + i * 0.04 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                    style={{ left: `${((d - (year - 1) * 365) / 365) * 100}%` }}
                    title={`Harvest on day ${d}`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-slate-300 text-right">{yearCuts.length}×</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400" /> Harvest
          </span>
          <span className="inline-flex items-center gap-2 sm:hidden">
            <span className="w-4 border-t-2 border-dashed border-amber-500/75" /> Growing before first cut
          </span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="w-4 h-3 rounded-sm bg-amber-500/20 border border-dashed border-amber-500/40" /> Establishment
            before first cut
          </span>
          <span>TNAU advises splitting (quartering) the clumps every year, or whenever they grow too large.</span>
        </div>
      </div>
    </div>
  );
}
