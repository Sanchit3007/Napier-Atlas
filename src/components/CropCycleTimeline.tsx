'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import GrowingPlantStory, { type StoryStrain } from '@/components/GrowingPlantStory';

type CycleStrain = StoryStrain & { slug: string };

const YEARS = 5; // length of the example harvest calendar

// Pick a strain to see its growth milestones (as a scroll story) and a 5-year harvest calendar.
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
              'px-3.5 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-2 focus-visible:outline-fern',
              s.slug === strain.slug
                ? 'bg-fern/15 border-fern/60 text-fern'
                : 'bg-card border-line text-ink hover:border-line',
            )}
          >
            {s.name.split(' (')[0]}
          </button>
        ))}
      </fieldset>

      {/* Milestones: the plant beside a text box that scrolls on its own. Keyed by strain, so picking a different
          variety starts the story again from Day 0 and plays it through (clicking the current one changes nothing). */}
      <GrowingPlantStory key={strain.slug} strain={strain} harvests={cuts.length} />

      {/* Five-year harvest calendar */}
      <div className="rounded-2xl bg-card border border-line p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <h3 className="font-semibold text-ink">5-year harvest calendar</h3>
          <p className="text-sm text-ink">
            <span className="text-2xl font-extrabold font-mono text-fern">{cuts.length}</span> harvests from a
            single planting
          </p>
        </div>

        {/* Phones: one thin line per year, with a dot on each harvest day */}
        <div className="sm:hidden space-y-3">
          {years.map(({ year, cuts: yearCuts }) => (
            <div key={year} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-ink-muted">Y{year}</span>
              <div className="relative h-3">
                <span className="absolute inset-x-0 top-1.25 h-0.5 rounded-full bg-line" />
                {year === 1 && (
                  <span
                    className="absolute left-0 top-1.25 border-t-2 border-dashed border-amber-500"
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
                      className="absolute top-0.5 -ml-1 w-2 h-2 rounded-full bg-fern-dark ring-2 ring-card"
                      style={{ left: `${((d - (year - 1) * 365) / 365) * 100}%` }}
                      title={`Harvest on day ${d}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-ink text-right">{yearCuts.length}×</span>
            </div>
          ))}
        </div>

        {/* Tablets and laptops: one bar per year with glowing harvest dots */}
        <div className="hidden sm:block space-y-3">
          {years.map(({ year, cuts: yearCuts }) => (
            <div key={year} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-3">
              <span className="text-xs font-mono text-ink-muted">Year {year}</span>
              <div className="relative h-6 rounded-full bg-page/70 border border-line">
                {year === 1 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-l-full bg-amber-500/25 border-r border-dashed border-amber-500/70"
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
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-fern-dark ring-4 ring-fern/20"
                    style={{ left: `${((d - (year - 1) * 365) / 365) * 100}%` }}
                    title={`Harvest on day ${d}`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-ink text-right">{yearCuts.length}×</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-fern-dark" /> Harvest
          </span>
          <span className="inline-flex items-center gap-2 sm:hidden">
            <span className="w-4 border-t-2 border-dashed border-amber-500" /> Growing before first cut
          </span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="w-4 h-3 rounded-sm bg-amber-500/25 border border-dashed border-amber-500/70" /> Establishment
            before first cut
          </span>
          <span>TNAU advises splitting (quartering) the clumps every year, or whenever they grow too large.</span>
        </div>
      </div>
    </div>
  );
}
