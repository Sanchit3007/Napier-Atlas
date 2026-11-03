'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { CBG_KG_PER_M3_METHANE, ORGANIC_SHARE_OF_DM, STEMS_PER_ACRE, methanePerTonDm } from '@/lib/simulator';

const ROOTING_DAY = 30; // roots and first tillers are established about a month after planting
const AUTOPLAY_STEP_MS = 4500; // time on each step while autoplaying; the first-cut animation takes about 4.3 s
const SWIPE_DISTANCE = 30; // sideways trackpad scroll (px) that counts as a two-finger swipe
const TOUCH_SWIPE_DISTANCE = 50; // finger movement (px) that counts as a swipe on a phone
const SWIPE_LOCK_MS = 700; // longest a swipe's leftover momentum can block the next swipe

// The strain fields the story needs for its days and per-acre figures.
export type StoryStrain = {
  name: string;
  firstHarvestDays: number;
  ratoonCycleDays: number;
  annualYieldTons: number;
  dryMatter: number;
  bioCngPotential: string;
};

type Figure = { value: string; unit?: string; label: string; gas?: boolean };

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

// The flat plant drawing (viewBox 240×320, ground at y 210, clump centred at x 120). Shapes are built once from a
// seeded random sequence, so the plant looks the same on every load and on the server.
const GROUND = 210;
const r1 = (s: number) => (s * 16807) % 2147483647;
function seeded(seed: number) {
  let s = seed;
  return (a: number, b: number) => {
    s = r1(s);
    return a + (b - a) * (s / 2147483647);
  };
}
const f1 = (n: number) => n.toFixed(1);

// A clump of leaf blades fanning out from the base; each blade arches outward at the tip.
function clump(seed: number, scale: number, count: number, fills: string[]) {
  const rnd = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const ang = -0.95 + (1.9 * (i + rnd(-0.3, 0.3))) / (count - 1);
    const len = scale * (210 - Math.abs(ang) * 80) * rnd(0.85, 1.08);
    const w = 8 * scale;
    const x = 120 + ang * 8 * scale;
    const droop = Math.abs(ang) * len * 0.55;
    const tx = x + Math.sin(ang) * len * 0.7 + Math.sign(ang) * droop * 0.5;
    const ty = GROUND - Math.cos(ang) * len + droop * 0.45;
    const cx = x + Math.sin(ang) * len * 0.3;
    const cy = GROUND - len * 0.85;
    return {
      d: `M${f1(x - w / 2)} ${GROUND} Q${f1(cx - w / 3)} ${f1(cy)} ${f1(tx)} ${f1(ty)} Q${f1(cx + w / 3)} ${f1(cy)} ${f1(x + w / 2)} ${GROUND}Z`,
      fill: fills[i % fills.length],
      delay: `${f1(-rnd(0, 4))}s`,
    };
  });
}
const MATURE = clump(5, 0.9, 15, ['#3f7a2a', '#5a9a3a', '#2f6320', '#77b052']);
const REGROWTH = clump(17, 0.85, 13, ['#6fae47', '#8cc65e', '#5a9a3a']);
// Three jointed canes in the middle of the clump, with a node band every 23 units.
const CANES = [-6, 0, 7].map((dx, i) => ({ x: 120 + dx * 0.9, h: 0.9 * (100 + i * 12) }));
const CUT = GROUND - 20; // cut height: about 15 cm of stubble

// The grown clump: three canes inside a fan of blades.
function MatureClump() {
  return (
    <g className="shoots">
      {CANES.map((c) => (
        <g key={c.x}>
          <rect x={c.x - 2.25} y={GROUND - c.h} width="4.5" height={c.h} rx="2" fill="#8fa55a" />
          {Array.from({ length: Math.floor(c.h / 23) }, (_, k) => (
            <rect key={k} x={c.x - 2.7} y={GROUND - (k + 1) * 23} width="5.4" height="2" fill="#5f7035" />
          ))}
        </g>
      ))}
      {MATURE.map((b) => (
        <path key={b.d} className="blade" style={{ animationDelay: b.delay }} d={b.d} fill={b.fill} />
      ))}
    </g>
  );
}
const ROOTS = (() => {
  const rnd = seeded(3);
  return Array.from({ length: 12 }, (_, i) => {
    const a = -1.2 + (2.4 * i) / 11 + rnd(-0.15, 0.15);
    const l = 70 * rnd(0.6, 1);
    return `M120 ${GROUND + 4} Q${f1(120 + Math.sin(a) * l * 0.3)} ${f1(GROUND + l * 0.6)} ${f1(120 + Math.sin(a) * l)} ${f1(GROUND + 8 + Math.cos(a) * l * 0.75)}`;
  });
})();

// Lifecycle milestones as a slider: the illustrated plant beside a text box (stacked on phones) with a day ruler,
// the step's text and a few per-acre figures for the strain. Previous/Next, a two-finger sideways swipe on a trackpad,
// or a finger swipe on a phone changes the step, and the plant plays that stage once (.gp rules in globals.css).
// Each time the section comes into view it plays through all four steps by itself, until the visitor takes over.
export default function GrowingPlantStory({
  strain,
  harvests,
}: Readonly<{
  strain: StoryStrain;
  harvests: number; // cuts from one planting over the 5-year calendar
}>) {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tookOver = useRef(false); // set once the visitor uses the buttons or swipes
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();

    // The visitor's own step change (buttons, trackpad or touch swipe) stops the autoplay for good.
  const stepBy = (delta: number) => {
    tookOver.current = true;
    setAutoplay(false);
    setActive((cur) => Math.min(3, Math.max(0, cur + delta)));
  };

  // Each time the section comes into view, play through from the first step (unless the visitor has taken over);
  // pause when it leaves. Reduced-motion visitors use the buttons instead.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (tookOver.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (entry.isIntersecting) setActive(0);
        setAutoplay(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // While autoplaying, move to the next step after a pause; it stops by itself on the last step.
  useEffect(() => {
    if (!autoplay || active >= 3) return;
    const timer = setTimeout(() => setActive(active + 1), AUTOPLAY_STEP_MS);
    return () => clearTimeout(timer);
  }, [autoplay, active]);

  // Two-finger sideways swipe on a trackpad: one step per swipe. Mainly up/down scrolling still scrolls the page.
  // Listening natively (not passive) lets it stop the browser treating the swipe as Back/Forward.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let total = 0;
    let lastAt = 0;
    let lockedUntil = 0;
    let lockCap = 0;
    let fading = false; // after a step: ignore the swipe's fading momentum until a new swipe speeds up
    let prevSize = 0;
    const onWheel = (e: WheelEvent) => {
      // Mostly sideways counts, so a slightly diagonal swipe still works.
      if (e.deltaX === 0 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.8) return;
      e.preventDefault();
      const now = performance.now();
      const size = Math.abs(e.deltaX);
      // Right after a step, ignore the rest of that swipe until the trackpad is quiet for 150 ms (at most 700 ms).
      if (now < lockedUntil) {
        lockedUntil = Math.min(now + 150, lockCap);
        prevSize = size;
        lastAt = now;
        return;
      }
      // Then skip momentum that keeps fading (each event no bigger than the last); a new swipe speeds up again.
      if (fading) {
        if (now - lastAt < 200 && size <= prevSize) {
          prevSize = size;
          lastAt = now;
          return;
        }
        fading = false;
        total = 0;
      }
      if (now - lastAt > 200) total = 0;
      lastAt = now;
      prevSize = size;
      total += e.deltaX;
      if (Math.abs(total) >= SWIPE_DISTANCE) {
        stepBy(total > 0 ? 1 : -1);
        total = 0;
        lockedUntil = now + 150;
        lockCap = now + SWIPE_LOCK_MS;
        fading = true;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const { firstHarvestDays: first, ratoonCycleDays: ratoon } = strain;
  const shortName = strain.name.split(' (')[0];

  // Per-acre figures with the estimator's constants (full yield, assured water).
  const tonsPerCut = (strain.annualYieldTons * ratoon) / 365;
  const methaneM3PerTonFresh = (strain.dryMatter / 100) * ORGANIC_SHARE_OF_DM * methanePerTonDm(strain);
  const methanePerCut = tonsPerCut * methaneM3PerTonFresh;
  const bioCngPerYear = strain.annualYieldTons * methaneM3PerTonFresh * CBG_KG_PER_M3_METHANE;

  const steps: { day: string; at: number; title: string; text: string; points: string[]; caption: string; figures: Figure[] }[] = [
    {
      day: 'Day 0',
      at: 0,
      title: 'Stem planting',
      text: 'Two-node stem cuttings go into moist soil. Nothing shows above ground yet.',
      points: ['Cuttings about 2 × 2 ft apart', 'Keep the soil moist while roots form'],
      caption: 'Day 0 · cutting planted',
      figures: [
        { value: fmt(STEMS_PER_ACRE), label: 'stem cuttings per acre' },
        { value: String(first), unit: 'days', label: 'until the first cut' },
        { value: '2', unit: 'nodes', label: 'on each cutting, one buried' },
      ],
    },
    {
      day: `Day ${ROOTING_DAY}`,
      at: ROOTING_DAY,
      title: 'Rooting & tillering',
      text: 'Roots spread out from the buried nodes and the first shoots (tillers) push up.',
      points: ['Roots grow from each node', 'Several shoots per cutting'],
      caption: `Day ${ROOTING_DAY} · roots and shoots`,
      figures: [
        { value: String(ROOTING_DAY), unit: 'days', label: 'to roots and first shoots' },
        { value: String(first - ROOTING_DAY), unit: 'days', label: 'more until the first cut' },
      ],
    },
    {
      day: `Day ${first}`,
      at: first,
      title: 'First cut',
      text: 'The clump is cut a few inches above the ground while the stems are still tender. The harvest goes to the digester or is fed as fodder.',
      points: ['Cut before the stems turn woody', 'The stubble is left to regrow'],
      caption: `Day ${first} · first cut`,
      figures: [
        { value: `≈ ${tonsPerCut.toFixed(1)}`, unit: 't', label: 'fresh grass from one cut' },
        { value: `≈ ${fmt(methanePerCut)}`, unit: 'm³', label: 'methane from that cut', gas: true },
        { value: `≈ ${fmt(methanePerCut * CBG_KG_PER_M3_METHANE)}`, unit: 'kg', label: 'Bio-CNG from that cut', gas: true },
      ],
    },
    {
      day: `Every ${ratoon} days`,
      at: first + ratoon,
      title: 'Ratoon harvests',
      text: 'The same roots send up new shoots and the clump is cut again and again, with no replanting.',
      points: ['No replanting needed', `Cut again every ${ratoon} days`],
      caption: `Every ${ratoon} days · regrows`,
      figures: [
        { value: String(harvests), label: 'harvests in five years' },
        { value: String(ratoon), unit: 'days', label: 'between cuts' },
        { value: `≈ ${fmt(bioCngPerYear)}`, unit: 'kg', label: 'Bio-CNG a year', gas: true },
      ],
    },
  ];
  const step = steps[active];
  const shift = reduceMotion ? 0 : 48; // how far the text slides in and out

  // Day ruler position (% of Day 0 → second cut). While autoplaying, the fill and dot travel from this step's day to
  // the next one over the step's time, arriving as the next step begins; otherwise they glide to this step's day.
  const rulerAt = (day: number) => `${(day / steps[3].at) * 100}%`;
  const travelling = autoplay && active < 3;
  const rulerFrom = rulerAt(step.at);
  const rulerTo = travelling ? rulerAt(steps[active + 1].at) : rulerFrom;
  const rulerMove = travelling
    ? { duration: AUTOPLAY_STEP_MS / 1000, ease: 'linear' as const }
    : { duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' as const };

  return (
    // Laptops: the text box sizes to its tallest step and the plant stretches to match. Phones: stacked.
    <div ref={rootRef} className="grid md:grid-cols-[20rem_minmax(0,1fr)] gap-4 md:gap-6">
      {/* The plant: a flat daytime scene with its stage caption inside. The sky, hills and soil run far past the
          drawing's edges, so a box of any shape shows no gaps. */}
      <div className="relative h-64 md:h-auto md:min-h-80 overflow-hidden rounded-2xl border border-line bg-[#e3edd2]">
        <svg
          className="gp absolute inset-0 w-full h-full overflow-visible"
          data-stage={active}
          viewBox="0 0 240 320"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Illustrated Napier plant: ${step.caption}`}
        >
          <defs>
            {/* The clump is drawn twice: the stubble below the cut, and the tops above it, which fall at the cut.
                "air" keeps the fallen tops from showing below the ground line. */}
            <clipPath id="gp-below-cut">
              <rect x="-400" y={CUT} width="1040" height="600" />
            </clipPath>
            <clipPath id="gp-above-cut">
              <rect x="-400" y="-400" width="1040" height={CUT + 400} />
            </clipPath>
            <clipPath id="gp-air">
              <rect x="-400" y="-400" width="1040" height={GROUND + 402} />
            </clipPath>
          </defs>
          <circle cx="44" cy="58" r="20" fill="#f4e6a6" />
          <path d={`M-400 ${GROUND - 34} Q60 ${GROUND - 70} 130 ${GROUND - 42} T640 ${GROUND - 50} V${GROUND} H-400Z`} fill="#bcd3a1" />
          <path d={`M-400 ${GROUND - 14} Q100 ${GROUND - 34} 640 ${GROUND - 18} V${GROUND} H-400Z`} fill="#a3c185" />
          <rect x="-400" y={GROUND} width="1040" height="600" fill="#7a5433" />
          <rect x="-400" y={GROUND} width="1040" height="7" fill="#5e3f22" />
          <rect x="-400" y={GROUND + 52} width="1040" height="600" fill="#6a4729" />
          {ROOTS.map((d) => (
            <path key={d} className="root" d={d} />
          ))}
          {/* The two-node cane cutting, planted at an angle, with a bud at the top node */}
          <g className="cutting">
            <g transform={`rotate(-30 120 ${GROUND})`}>
              <rect x="115" y={GROUND - 24} width="10" height="62" rx="3" fill="#b49a5a" />
              <rect x="114" y={GROUND - 12} width="12" height="3" fill="#7a6634" />
              <rect x="114" y={GROUND + 22} width="12" height="3" fill="#7a6634" />
            </g>
            <path className="bud" d={`M109 ${GROUND - 18} q-2 -12 3 -18 q3 10 -3 18z`} fill="#77b052" />
          </g>
          <g clipPath="url(#gp-below-cut)">
            <MatureClump />
          </g>
          <g clipPath="url(#gp-air)">
            <g className="tops">
              <g clipPath="url(#gp-above-cut)">
                <MatureClump />
              </g>
            </g>
          </g>
          <g className="regrow">
            {REGROWTH.map((b) => (
              <path key={b.d} className="blade" style={{ animationDelay: b.delay }} d={b.d} fill={b.fill} />
            ))}
          </g>
          <line className="cutline" x1="34" y1={CUT} x2="190" y2={CUT} stroke="#c2410c" strokeWidth="2" strokeDasharray="6 5" />
          {/* First cut: a hand sickle comes in from the right at cut height and swings through the stems */}
          <g className="sickle">
            <g transform={`translate(150 ${CUT})`}>
              <g className="swing">
                <rect x="2" y="-4" width="34" height="8" rx="4" fill="#9a6b3a" />
                <rect x="2" y="-4" width="6" height="8" rx="2" fill="#6b4423" />
                <path
                  d="M2 0 C -10 -2, -30 -6, -40 -22 C -44 -30, -40 -40, -32 -44 C -36 -34, -34 -24, -24 -14 C -16 -7, -6 -4, 2 -3Z"
                  fill="#cbd5d1"
                  stroke="#64706b"
                  strokeWidth="1"
                />
                <path d="M-30 -40 C -36 -30, -32 -20, -20 -12" fill="none" stroke="#f8fafc" strokeWidth="1" opacity=".8" />
              </g>
            </g>
          </g>
        </svg>
        <span
          className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-line bg-card/90 px-2.5 py-0.5 text-xs font-mono font-semibold text-fern"
          aria-hidden="true"
        >
          {step.caption}
        </span>
      </div>

      {/* The text box. A two-finger sideways swipe on a trackpad, or a finger swipe on a phone, changes the step
          (overscroll-x-contain stops Back/Forward). */}
      <div
        ref={textRef}
        className="flex flex-col min-w-0 overflow-hidden overscroll-x-contain touch-pan-y rounded-2xl border border-line bg-card"
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > TOUCH_SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) stepBy(dx < 0 ? 1 : -1);
        }}
      >
        {/* Day ruler: Day 0 to the second cut, with a dot at the current step. It also shows autoplay progress. */}
        <div className="px-6 md:px-8 pt-4 md:pt-5" aria-hidden="true">
          <div className="relative h-7">
            <span className="absolute inset-x-0 top-2 h-0.5 rounded-full bg-line" />
            {/* Keyframes start from this step's day, so a restart begins at Day 0 rather than sliding back. */}
            <motion.span
              className="absolute left-0 top-2 h-0.5 rounded-full bg-fern-dark"
              initial={false}
              animate={{ width: travelling ? [rulerFrom, rulerTo] : rulerTo }}
              transition={rulerMove}
            />
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={clsx(
                  'absolute top-1 -ml-1.25 size-2.5 rounded-full border-2 transition-colors duration-500',
                  i <= active ? 'border-fern bg-fern-dark' : 'border-line bg-card',
                )}
                style={{ left: rulerAt(s.at) }}
              >
                <span
                  className={clsx(
                    'absolute top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px]',
                    i === active ? 'text-fern' : 'text-ink-dim',
                  )}
                >
                  Day {s.at}
                </span>
              </span>
            ))}
            <motion.span
              className="absolute top-0 -ml-2 size-4 rounded-full bg-fern-dark ring-4 ring-fern/20"
              initial={false}
              animate={{ left: travelling ? [rulerFrom, rulerTo] : rulerTo }}
              transition={rulerMove}
            />
          </div>
        </div>

        {/* On laptops all four steps share one grid cell, so the box keeps the tallest step's height and never jumps.
            Only the active step is shown; earlier steps wait off to the left and later ones to the right, so a step
            slides in from the side it comes from. */}
        <div className="grid flex-1 overflow-hidden" aria-live="polite">
          {steps.map((s, i) => {
            const shown = i === active;
            const offset = i < active ? -shift : shift; // where a hidden step waits: left if earlier, right if later
            return (
              <motion.div
                key={s.title}
                // On phones only the active step takes space, so the box fits each step's own height.
                className={clsx('col-start-1 row-start-1 px-5 pt-3 pb-4 md:px-7 md:pt-4', !shown && 'pointer-events-none max-md:hidden')}
                initial={false}
                animate={{
                  opacity: shown ? 1 : 0,
                  x: shown ? 0 : offset,
                }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                aria-hidden={!shown}
                inert={!shown}
              >
                <span className="block mb-1 text-sm font-mono text-fern">{s.day}</span>
                <h3 className="mb-1.5 md:mb-2 text-lg md:text-2xl font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="max-w-xl text-sm md:text-base leading-relaxed text-ink">{s.text}</p>
                <ul className="mt-2 md:mt-3 space-y-0.5 list-disc pl-5 text-xs md:text-sm text-ink-muted marker:text-fern">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>

                {/* Per-acre figures for this step */}
                <dl className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
                  {s.figures.map((f) => (
                    <div
                      key={f.label}
                      className={clsx(
                        'flex flex-col-reverse justify-end rounded-xl border px-3 py-2 last:odd:col-span-2 md:last:odd:col-span-1',
                        f.gas ? 'border-fern/30 bg-fern/10' : 'border-line bg-page',
                      )}
                    >
                      <dt className="text-xs text-ink-muted leading-snug">{f.label}</dt>
                      <dd className={clsx('font-mono text-lg md:text-xl font-bold', f.gas ? 'text-fern' : 'text-ink')}>
                        {f.value}
                        {f.unit && <span className="ml-1 text-xs font-medium text-ink-muted">{f.unit}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[11px] text-ink-dim">
                  {i >= 2
                    ? `Estimates per acre with assured water, from ${shortName}’s published figures.`
                    : `Per acre, for ${shortName}.`}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Previous / Next */}
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5 md:px-5 md:py-3">
          <button
            type="button"
            onClick={() => stepBy(-1)}
            disabled={active === 0}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-ink hover:bg-line/50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-fern"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="font-mono text-xs text-ink-dim">Step {active + 1} of 4</span>
          <button
            type="button"
            onClick={() => stepBy(1)}
            disabled={active === 3}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-fern hover:bg-fern/10 hover:text-fern-dark disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-fern"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
