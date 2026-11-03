'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Flame, Leaf, X } from 'lucide-react';
import type { NapierStrain } from '@prisma/client';
import { publishedMethane } from '@/lib/simulator';

// Header colour for each strain's pop-out card; unknown strains fall back to emerald.
const HERO: Record<string, string> = {
  'super-napier-pakchong-1': 'linear-gradient(135deg, #6ee7b7, #10b981)',
  'giant-king-biomass': 'linear-gradient(135deg, #bef264, #4d7c0f)',
  'tnau-co-5-hybrid': 'linear-gradient(135deg, #99f6e4, #14b8a6)',
  'red-napier-anthocyanin': 'linear-gradient(135deg, #f9a8d4, #a855f7)',
  'smart-dwarf-napier': 'linear-gradient(135deg, #fef08a, #84cc16)',
};

// A strain's full details in a card that grows out of its strain card (shared layoutId) and shrinks back on close.
// Escape, the ✕ button or a click outside closes it; the page behind stops scrolling while it is open.
export default function StrainDetailCard({
  strain,
  layoutId,
  onClose,
}: Readonly<{
  strain: NapierStrain;
  layoutId: string;
  onClose: () => void;
}>) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const methane = publishedMethane(strain);
  const stats = [
    { value: strain.annualYieldTons, label: 't/acre/yr fresh' },
    { value: `${strain.crudeProtein}%`, label: 'Crude protein' },
    { value: `${strain.dryMatter}%`, label: 'Dry matter' },
    { value: methane ?? '—', label: 'm³ CH₄/t organic', gas: true },
    { value: strain.firstHarvestDays, label: 'Days to 1st cut' },
    { value: strain.ratoonCycleDays, label: 'Days between cuts' },
    { value: strain.maxHeightFeet, label: 'ft max height' },
    { value: strain.sources.length, label: 'Sources' },
  ];

  return (
    <div className="fixed inset-0 z-70 grid place-items-center p-4">
      <motion.button
        type="button"
        aria-label="Close details"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        layoutId={reduceMotion ? undefined : layoutId}
        initial={reduceMotion ? { opacity: 0 } : undefined}
        animate={reduceMotion ? { opacity: 1 } : undefined}
        exit={reduceMotion ? { opacity: 0 } : undefined}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="strain-detail-title"
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-[26px] bg-card border border-line shadow-2xl shadow-ink/20"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 text-emerald-950 flex items-center justify-center hover:bg-white focus-visible:outline-2 focus-visible:outline-fern"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* Coloured header */}
          <div className="relative overflow-hidden px-6 pt-6 pb-5" style={{ background: HERO[strain.slug] ?? HERO['super-napier-pakchong-1'] }}>
            <svg className="absolute -right-1.5 -bottom-1 w-42 h-30 opacity-55" viewBox="0 0 170 120" aria-hidden="true">
              <path d="M30 120 C 40 70, 46 40, 60 6 C 52 44, 48 80, 46 120Z" fill="#022c22" fillOpacity=".35" />
              <path d="M60 120 C 74 80, 92 50, 126 16 C 102 56, 86 88, 80 120Z" fill="#022c22" fillOpacity=".28" />
              <path d="M92 120 C 104 96, 124 80, 168 64 C 136 86, 120 102, 112 120Z" fill="#022c22" fillOpacity=".22" />
            </svg>
            <div className="relative pr-12">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-950">{strain.origin}</div>
              <h3 id="strain-detail-title" className="mt-1.5 text-2xl font-extrabold tracking-tight text-emerald-950">
                {strain.name}
              </h3>
              <p className="text-sm italic text-emerald-950/80">{strain.scientificName}</p>
            </div>
          </div>

          <motion.div
            className="px-6 pt-5 pb-6 space-y-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.15 }}
          >
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end rounded-xl bg-page border border-line p-2.5">
                  <dt className="text-[10.5px] uppercase tracking-wide text-ink-muted leading-snug">{s.label}</dt>
                  <dd className={`text-lg font-bold font-mono ${s.gas ? 'text-fern' : 'text-ink'}`}>{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex gap-2.5 rounded-xl border border-fern/30 bg-fern/10 px-3.5 py-3 text-sm text-ink">
              <Flame className="w-4.5 h-4.5 shrink-0 mt-0.5 text-fern" /> {strain.bioCngPotential}
            </div>

            <Section title="Best for">
              <p className="text-sm text-ink">{strain.bestFor}</p>
            </Section>

            <Section title="Key highlights">
              <ul className="space-y-2">
                {strain.keyHighlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-sm text-ink">
                    <Leaf className="w-4 h-4 shrink-0 mt-0.5 text-fern" /> {h}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Grows well in">
              <div className="flex flex-wrap gap-1.5">
                {strain.suitableSoils.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full text-xs bg-fern/10 border border-fern/35 text-fern">
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Water">
              <p className="text-sm text-ink">{strain.waterRequirement}</p>
            </Section>

            {strain.sources.length > 0 && (
              <Section title="Sources">
                <ol className="space-y-1 list-decimal pl-5 text-xs text-ink-muted marker:text-ink-dim">
                  {strain.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-fern-dark underline decoration-ink-dim underline-offset-2"
                      >
                        {s.label}
                        <ExternalLink className="inline w-3 h-3 ml-1 -mt-0.5" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </Section>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// A small labelled block inside the card, such as "Water".
function Section({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-mono uppercase tracking-widest text-fern">{title}</h4>
      {children}
    </div>
  );
}
