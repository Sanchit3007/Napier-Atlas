import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight, Sprout } from 'lucide-react';
import { clsx } from 'clsx';
import AnimatedHeading from '@/components/AnimatedHeading';
import BentoCard from '@/components/BentoCard';
import CountUp from '@/components/CountUp';
import GrassToGasFlow from '@/components/GrassToGasFlow';

// Shared looks for the four fact cards: the card, its big number and unit, and the source line at the bottom.
const FACT_CARD = 'grid grid-rows-[auto_1fr_auto] gap-4 rounded-3xl border border-line hover:border-fern/50 px-7 pt-6.5 pb-5 text-ink';
const FACT_NUMBER = 'text-5xl sm:text-6xl font-extrabold tracking-[-0.04em] leading-[0.95] tabular-nums';
const FACT_UNIT = 'ml-[0.12em] text-[0.42em] font-bold tracking-[-0.01em]';
const FACT_SOURCE = 'flex flex-wrap justify-between gap-x-3.5 gap-y-1.5 border-t pt-3 font-mono text-xs';

// Top of the home page: headline, grass → gas animation and four key-fact cards.
export default function HeroBento() {
  return (
    <section className="relative overflow-hidden bg-page text-ink pt-10 pb-14 lg:pt-14">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Banner: headline on the left, animated grass → gas plant on the right */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 lg:items-end mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fern/10 border border-line/50 text-fern text-xs font-mono mb-6 shadow-inner">
              <Sprout className="w-3.5 h-3.5 text-fern" />
              <span>Napier Grass → Bio-CNG Knowledge Hub</span>
            </div>
            <AnimatedHeading
              as="h1"
              effect="ripen"
              loop
              text="Turning Napier Grass into"
              accent="Clean Bio-CNG"
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            />
            <p className="text-lg text-ink leading-relaxed mb-8">
              Learn how one of the world&apos;s fastest-growing grasses becomes a renewable gas fuel — from the field to the digester to the fuel cylinder — and explore the Napier varieties that make it possible.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#process"
                className="px-7 py-3.5 rounded-xl bg-fern hover:bg-fern-dark text-white font-semibold flex items-center gap-2 shadow-lg shadow-fern/15 transition-all hover:scale-[1.02]"
              >
                See How It Works <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#calculator"
                className="px-7 py-3.5 rounded-xl bg-card hover:bg-line/50 border border-line text-ink font-semibold transition-all hover:border-line"
              >
                Estimate Bio-CNG Potential
              </Link>
            </div>
          </div>
          <GrassToGasFlow />
        </div>

        {/* Four key-fact cards: each leads with its number (counting up), a small drawing of the fact and its source.
            They fade in one after another; the methane card is the dark lead card. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: methane yield (2 columns wide on desktop), with a gas cylinder filling to ≥90% methane */}
          <BentoCard
            index={0}
            glow="140 198 94"
            className="md:col-span-2 grid grid-rows-[auto_1fr_auto] gap-4 rounded-3xl bg-panel border border-[#2c4320] px-7 pt-6.5 pb-5 text-[#eef5e4]"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
              <div>
                <h2 className={FACT_NUMBER}>
                  <span className="text-[#8cc65e]">~</span>
                  <CountUp value={250} />
                  <small className={FACT_UNIT}>m³</small>
                </h2>
                <p className="mt-2 text-[15px] font-semibold">of methane per ton of organic matter</p>
              </div>
              <svg className="w-20 sm:w-27.5 h-auto" viewBox="0 0 120 120" aria-hidden="true">
                <rect x="44" y="10" width="32" height="8" rx="3" fill="#4b6b36" />
                <rect x="36" y="18" width="48" height="94" rx="20" fill="#22371a" stroke="#4b6b36" strokeWidth="2" />
                <clipPath id="fact-cylinder">
                  <rect x="38" y="20" width="44" height="90" rx="18" />
                </clipPath>
                <g clipPath="url(#fact-cylinder)">
                  <rect className="fact-fill" x="38" y="29" width="44" height="81" fill="#8cc65e" opacity=".85" />
                </g>
                <circle className="fact-bub" cx="52" cy="96" r="3" fill="none" stroke="#eef5e4" strokeWidth="1.5" style={{ animationDelay: '0.2s' }} />
                <circle className="fact-bub" cx="66" cy="100" r="2.5" fill="none" stroke="#eef5e4" strokeWidth="1.5" style={{ animationDelay: '1.1s' }} />
                <circle className="fact-bub" cx="58" cy="104" r="2" fill="none" stroke="#eef5e4" strokeWidth="1.5" style={{ animationDelay: '1.8s' }} />
                <text x="60" y="66" textAnchor="middle" fontFamily="var(--font-geist-mono)" fontSize="11" fontWeight="600" fill="#17240f">≥90%</text>
                <text x="60" y="78" textAnchor="middle" fontFamily="var(--font-geist-mono)" fontSize="7" fill="#17240f">CH₄</text>
              </svg>
            </div>
            <p className="max-w-[52ch] text-sm leading-relaxed text-[#c9dbb6]">
              In lab tests, digester microbes turn Napier into biogas at about 120–250 m³ of methane per ton of organic matter. Purified to at least 90% methane and compressed, it becomes Bio-CNG.
            </p>
            <div className={clsx(FACT_SOURCE, 'border-[#2c4320] text-[#b9d19f]')}>
              <span><b className="font-semibold text-[#8cc65e]">Source</b> · lab digestion tests</span>
              <span>Digestate → organic manure</span>
            </div>
          </BentoCard>

          {/* Card 2: fresh fodder per acre, with the 40–200 t range on a 0–200 scale */}
          <BentoCard index={1} glow="46 77 26" className={clsx(FACT_CARD, 'bg-card')}>
            <div>
              <h3 className={FACT_NUMBER}>
                <CountUp value={40} />–<CountUp value={200} />
                <small className={FACT_UNIT}>t</small>
              </h3>
              <p className="mt-2 text-[15px] font-semibold">fresh fodder per acre a year</p>
            </div>
            <div>
              <div className="relative h-13.5 mt-1" aria-hidden="true">
                <span className="absolute inset-x-0 top-5 h-2.5 rounded-full bg-line" />
                <span className="fact-span absolute left-[20%] top-5 h-2.5 rounded-full bg-linear-to-r from-[#8cc65e] to-fern" />
                <span className="fact-pin absolute right-0 top-0 flex flex-col items-end font-mono text-[11px] font-semibold text-fern">
                  <span>Pakchong-1</span>
                  <span className="mt-0.5 h-4 w-0.5 bg-fern" />
                </span>
                <span className="absolute left-0 top-9 font-mono text-[11px] text-ink-dim">0</span>
                <span className="absolute left-[20%] top-9 -translate-x-1/2 font-mono text-[11px] text-ink-dim">40 t</span>
                <span className="absolute right-0 top-9 font-mono text-[11px] text-ink-dim">200 t</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                First cut about 75 days after planting, then every 45 days as it regrows.
              </p>
            </div>
            <div className={clsx(FACT_SOURCE, 'border-line text-ink-dim')}>
              <span><b className="font-semibold text-fern">Source</b> · breeder-reported best case</span>
            </div>
          </BentoCard>

          {/* Card 3: crude protein, Pakchong-1 against ordinary Napier on one 0–20% scale */}
          <BentoCard index={2} glow="46 77 26" className={clsx(FACT_CARD, 'bg-[#c4d9ae]')}>
            <div>
              <h3 className={FACT_NUMBER}>
                <CountUp value={16} />–<CountUp value={18} />
                <small className={FACT_UNIT}>%</small>
              </h3>
              <p className="mt-2 text-[15px] font-semibold">crude protein in Pakchong-1</p>
            </div>
            <div className="grid gap-2 mt-1 text-[12.5px] text-ink-muted">
              {[
                { label: 'Ordinary Napier', value: '8–12%', width: '60%', strong: false },
                { label: 'Pakchong-1', value: '16–18%', width: '90%', strong: true },
              ].map((row) => (
                <div key={row.label} className={clsx('grid grid-cols-[8.5rem_minmax(0,1fr)_3.4rem] gap-2.5 items-center', row.strong && 'font-semibold text-ink')}>
                  <span>{row.label}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <i
                      className={clsx('fact-bar block h-full rounded-full', row.strong ? 'fact-bar-hi bg-fern' : 'bg-[#5a9a3a]')}
                      style={{ '--w': row.width } as CSSProperties}
                    />
                  </span>
                  <span className="text-right font-mono text-xs">{row.value}</span>
                </div>
              ))}
              <p className="text-[13px]">Cut at 45–55 days.</p>
            </div>
            <div className={clsx(FACT_SOURCE, 'border-line text-ink-dim')}>
              <span><b className="font-semibold text-fern">Source</b> · Pakchong-1 breeder</span>
            </div>
          </BentoCard>

          {/* Card 4: soil erosion (2 columns wide on desktop), with a slope where runoff slows at a Napier strip */}
          <BentoCard index={3} glow="46 77 26" className={clsx(FACT_CARD, 'md:col-span-2 bg-card')}>
            <div className="grid sm:grid-cols-[minmax(0,1fr)_190px] gap-6 items-center">
              <div>
                <h3 className={FACT_NUMBER}>
                  <CountUp value={63} />
                  <small className={FACT_UNIT}>%</small>
                </h3>
                <p className="mt-2 text-[15px] font-semibold">less soil erosion with grass barriers</p>
                <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-ink-muted">
                  Across India&apos;s hill regions, grass barriers cut runoff by 42% and erosion by 63%. Hybrid Napier was rated the most effective barrier grass for the western Himalayas and Eastern Ghats.
                </p>
              </div>
              <svg className="w-full h-auto" viewBox="0 0 190 120" aria-hidden="true">
                <path d="M0 40 L190 105 L190 120 L0 120Z" fill="#7a5433" />
                <path d="M0 40 L190 105" stroke="#5e3f22" strokeWidth="3" />
                <g fill="#3f7a2a">
                  <path d="M88 71 q-3 -16 1 -26 q3 12 2 26z" />
                  <path d="M93 73 q2 -18 8 -26 q-3 14 -5 27z" />
                  <path d="M84 70 q-7 -12 -14 -16 q9 3 16 15z" />
                  <path d="M99 75 q-2 -14 2 -22 q2 10 1 23z" />
                  <path d="M104 76 q4 -12 10 -16 q-5 9 -7 17z" />
                </g>
                <path className="fact-runoff" d="M10 34 L76 57" stroke="#6fb2d6" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path className="fact-runoff" d="M118 84 L150 95" stroke="#6fb2d6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7" />
                <text x="20" y="22" fontFamily="var(--font-geist-mono)" fontSize="9" fill="#29391d">runoff</text>
                <text x="128" y="78" fontFamily="var(--font-geist-mono)" fontSize="9" fill="#29391d">−42%</text>
              </svg>
            </div>
            <div className={clsx(FACT_SOURCE, 'items-center border-line text-ink-dim')}>
              <span><b className="font-semibold text-fern">Source</b> · review of studies, Indian hill regions</span>
              <svg className="size-10.5" viewBox="0 0 42 42" aria-hidden="true">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#a3bf87" strokeWidth="5" />
                <circle className="fact-ring" cx="21" cy="21" r="15.9" fill="none" stroke="#2e4d1a" strokeWidth="5" pathLength="100" transform="rotate(-90 21 21)" strokeLinecap="round" />
              </svg>
            </div>
          </BentoCard>
        </div>

      </div>
    </section>
  );
}