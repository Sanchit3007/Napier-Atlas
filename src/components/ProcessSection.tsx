'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Factory, Filter, Gauge, Scissors, Sprout, Wind, Workflow } from 'lucide-react';
import { clsx } from 'clsx';
import AnimatedHeading, { TypedLabel, typingTime } from '@/components/AnimatedHeading';
import { CarbonScene, LoopScene, StepScene } from '@/components/ProcessScenes';

const LABEL = 'How It Works';
// A note card: its drawing sits beside the text when the card is wide enough, centred above it when narrow.
const NOTE_CARD = '@container rounded-[22px] bg-card border border-line px-5 py-4.5';
const NOTE_LAYOUT = 'grid gap-4 items-center @[420px]:grid-cols-[150px_minmax(0,1fr)]';

// The six steps from grass to Bio-CNG, with a short summary and three facts each.
const STEPS = [
  {
    icon: Sprout,
    title: 'Cultivate',
    summary: 'Napier is planted once from stem cuttings and regrows after every harvest.',
    body: 'Napier grass is a perennial tropical grass. Farmers plant two-node stem cuttings, and after the first harvest at 60–80 days the same roots keep sending up new shoots, so one planting gives harvest after harvest.',
    facts: ['First cut 60–80 days after planting', 'Re-cut every 30–45 days', 'Regrows from the same roots'],
  },
  {
    icon: Scissors,
    title: 'Harvest & chop',
    summary: 'Cut before stems turn woody, then chop into small pieces.',
    body: 'Grass is harvested while stems are still tender, because woody (lignified) stems are hard for microbes to digest. It is then chopped to a few centimetres to expose more surface area. Surplus can be ensiled, stored airtight as silage, to keep the plant fed year-round.',
    facts: ['Tender stems digest better', 'Chopping speeds up digestion', 'Silage smooths seasonal supply'],
  },
  {
    icon: Factory,
    title: 'Anaerobic digestion',
    summary: 'Microbes break the grass down in a sealed, oxygen-free tank.',
    body: 'Inside a warm, airtight digester, communities of microbes work in four stages: hydrolysis breaks down cellulose, acidogenesis and acetogenesis turn it into simple acids, and methanogens finally convert those acids into methane-rich biogas.',
    facts: ['Kept at ~35–40 °C (mesophilic)', 'Grass stays about 30 days', 'Four microbial stages'],
  },
  {
    icon: Wind,
    title: 'Raw biogas',
    summary: 'A mixture of methane, carbon dioxide and trace gases.',
    body: 'The gas leaving the digester is roughly 50–60% methane and 35–45% carbon dioxide, with small amounts of hydrogen sulphide and moisture. It can be burned directly for heat or electricity, but needs cleaning to be used as vehicle fuel.',
    facts: ['~50–60% methane (CH₄)', '~35–45% carbon dioxide', 'Traces of H₂S and water'],
  },
  {
    icon: Filter,
    title: 'Purify (upgrade)',
    summary: 'CO₂, H₂S and moisture are removed to concentrate the methane.',
    body: 'Upgrading technologies such as water scrubbing, pressure swing adsorption or membranes strip out the impurities. In India, compressed biogas must contain at least 90% methane to meet the IS 16087 standard, about the same as fossil CNG.',
    facts: ['Water scrubbing, PSA or membranes', '≥ 90% methane (IS 16087)', 'H₂S removed to protect engines'],
  },
  {
    icon: Gauge,
    title: 'Compress → Bio-CNG',
    summary: 'Purified gas is compressed into cylinders as Bio-CNG.',
    body: 'The upgraded biomethane is compressed to about 250 bar and stored in cylinder cascades. It can then be used anywhere fossil CNG is used: in vehicles, industry, or piped into city gas networks.',
    facts: ['~250 bar storage', 'Drop-in replacement for CNG', 'Vehicles, industry, city gas'],
  },
];

// "How It Works": click a step to read what happens at that stage.
export default function ProcessSection() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="process" className="scroll-mt-20 pt-16 pb-14 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <TypedLabel
            icon={<Workflow className="w-4 h-4" />}
            text={LABEL}
            className="inline-flex items-center gap-2 text-fern text-xs font-mono uppercase tracking-widest mb-3"
          />
          <AnimatedHeading
            effect="follow"
            text="How Napier grass becomes Bio-CNG"
            delayMs={typingTime(LABEL)}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-3"
          />
          <p className="text-ink leading-relaxed">
            Six steps take a field of grass to a cylinder of renewable fuel. Select a step to learn what happens.
          </p>
        </div>

        {/* Phones: six numbered dots on one line, with a line that fills as you move through the steps */}
        <div className="sm:hidden relative mb-6 px-1">
          <div className="absolute left-5 right-5 top-4 h-0.5 rounded-full bg-fern/15" />
          <div
            className="absolute left-5 top-4 h-0.5 rounded-full bg-linear-to-r from-fern to-amber-600 transition-[width] duration-300"
            style={{ width: `calc((100% - 2.5rem) * ${active / (STEPS.length - 1)})` }}
          />
          <ol className="relative flex justify-between" aria-label="Bio-CNG production steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  className={clsx(
                    'w-8 h-8 rounded-full border font-mono text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-fern',
                    i === active && 'bg-fern border-fern text-white ring-4 ring-fern/20',
                    i < active && 'bg-fern/15 border-line/70 text-fern',
                    i > active && 'bg-card border-line text-ink-muted',
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Tablets and laptops: icon step selector */}
        <div className="hidden sm:block relative mb-8">
          <div className="hidden lg:block absolute top-9 left-[8%] right-[8%] h-px bg-fern/15" />
          <motion.div
            className="hidden lg:block absolute top-9 left-[8%] h-px bg-linear-to-r from-fern to-amber-600 origin-left"
            initial={false}
            animate={{ width: `${(active / (STEPS.length - 1)) * 84}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <div role="tablist" aria-label="Bio-CNG production steps" className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              const done = i < active;
              return (
                <motion.button
                  key={s.title}
                  role="tab"
                  id={`process-tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="process-panel"
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex flex-col items-center text-center gap-3 p-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-fern"
                >
                  <span
                    className={clsx(
                      'w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors',
                      isActive && 'bg-fern border-fern text-white shadow-lg shadow-fern/15',
                      done && 'bg-line border-fern/40 text-fern',
                      !isActive && !done && 'bg-card border-line text-ink-muted group-hover:border-line',
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="text-[11px] font-mono text-ink-dim">STEP {i + 1}</span>
                  <span className="text-sm font-semibold text-ink">{s.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step detail */}
        <div
          id="process-panel"
          role="tabpanel"
          aria-labelledby={`process-tab-${active}`}
          className="rounded-3xl bg-card border border-line p-6 sm:p-8 min-h-64"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-[220px_minmax(0,1fr)] gap-5 md:gap-7 md:items-center"
            >
              {/* This step's small drawing; it plays when the step opens (stacked above the text on phones). */}
              <div className="aspect-4/3 max-w-full overflow-hidden rounded-[18px] border border-line bg-[#e3edd2]">
                <StepScene step={active} />
              </div>
              <div>
                <div className="text-xs font-mono font-semibold tracking-[0.08em] text-fern">
                  STEP {active + 1} OF {STEPS.length}
                </div>
                <h3 className="mt-1.5 mb-1.5 text-[22px] md:text-[26px] font-extrabold tracking-[-0.015em] text-ink">{step.title}</h3>
                <p className="mb-2.5 font-medium text-fern">{step.summary}</p>
                <p className="text-[14.5px] leading-relaxed text-ink-muted">{step.body}</p>
                {/* The three facts, each ticked off in turn */}
                <ul className="mt-3.5 grid gap-2">
                  {step.facts.map((f, k) => (
                    <li key={f} className="ps-in flex items-start gap-2.5 text-sm text-ink" style={{ animationDelay: `${k * 0.15}s` }}>
                      <svg viewBox="0 0 18 18" className="mt-px size-4.5 shrink-0" aria-hidden="true">
                        <circle cx="9" cy="9" r="8" fill="#2e4d1a" />
                        <path
                          className="ps-tick"
                          style={{ animationDelay: `${0.3 + k * 0.25}s` }}
                          d="M5 9.5 l2.6 2.5 L13 6.5"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-2.5 mt-5 pt-3.5 border-t border-line">
            <button
              onClick={() => setActive((a) => a - 1)}
              disabled={active === 0}
              className="min-h-11 px-1 text-sm font-semibold text-fern hover:text-fern-dark disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="font-mono text-xs text-ink-dim">
              {active + 1} / {STEPS.length}
            </span>
            <button
              onClick={() => setActive((a) => a + 1)}
              disabled={active === STEPS.length - 1}
              className="min-h-11 px-1 text-sm font-semibold text-fern hover:text-fern-dark disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next step →
            </button>
          </div>
        </div>

        {/* Two notes, each with a looping drawing: the farm → gas plant → manure cycle, and the carbon cycle */}
        <div className="mt-3.5 grid md:grid-cols-2 gap-3.5">
          <div className={NOTE_CARD}>
            <div className={NOTE_LAYOUT}>
              <LoopScene />
              <div>
                <h3 className="mb-1 font-semibold text-ink">Nothing is wasted</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  What remains after digestion, the digestate, is a nutrient-rich organic manure that goes back onto the
                  fields, closing the loop between the farm and the gas plant.
                </p>
              </div>
            </div>
          </div>
          <div className={NOTE_CARD}>
            <div className={NOTE_LAYOUT}>
              <CarbonScene />
              <div>
                <h3 className="mb-1 font-semibold text-ink">Why it matters</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  The carbon in Bio-CNG was pulled from the air by the grass as it grew, so using it in place of fossil
                  CNG avoids adding new fossil carbon to the atmosphere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
