'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Factory, Filter, Fuel, Gauge, Recycle, Scissors, Sprout, Wind, Workflow } from 'lucide-react';
import { clsx } from 'clsx';

// The six steps from grass to Bio-CNG, with a short summary and three facts each.
const STEPS = [
  {
    icon: Sprout,
    title: 'Cultivate',
    summary: 'Napier is planted once from stem cuttings and regrows after every harvest.',
    body: 'Napier grass is a perennial tropical grass. Farmers plant two-node stem cuttings, and after the first harvest at 60–80 days the same roots keep sending up new shoots — so one planting gives harvest after harvest.',
    facts: ['First cut 60–80 days after planting', 'Re-cut every 30–45 days', 'Regrows from the same roots'],
  },
  {
    icon: Scissors,
    title: 'Harvest & chop',
    summary: 'Cut before stems turn woody, then chop into small pieces.',
    body: 'Grass is harvested while stems are still tender, because woody (lignified) stems are hard for microbes to digest. It is then chopped to a few centimetres to expose more surface area. Surplus can be ensiled — stored airtight as silage — to keep the plant fed year-round.',
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
    body: 'Upgrading technologies such as water scrubbing, pressure swing adsorption or membranes strip out the impurities. In India, compressed biogas must contain at least 90% methane to meet the IS 16087 standard — about the same as fossil CNG.',
    facts: ['Water scrubbing, PSA or membranes', '≥ 90% methane (IS 16087)', 'H₂S removed to protect engines'],
  },
  {
    icon: Gauge,
    title: 'Compress → Bio-CNG',
    summary: 'Purified gas is compressed into cylinders as Bio-CNG.',
    body: 'The upgraded biomethane is compressed to about 250 bar and stored in cylinder cascades. It can then be used anywhere fossil CNG is used — in vehicles, industry, or piped into city gas networks.',
    facts: ['~250 bar storage', 'Drop-in replacement for CNG', 'Vehicles, industry, city gas'],
  },
];

// "How It Works": click a step to read what happens at that stage.
export default function ProcessSection() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="process" className="scroll-mt-20 pt-16 pb-14 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Workflow className="w-4 h-4" /> From Grass to Gas
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            How Napier grass becomes Bio-CNG
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Six steps take a field of grass to a cylinder of renewable fuel. Select a step to learn what happens.
          </p>
        </div>

        {/* Phones: six numbered dots on one line, with a line that fills as you move through the steps */}
        <div className="sm:hidden relative mb-6 px-1">
          <div className="absolute left-5 right-5 top-4 h-0.5 rounded-full bg-slate-800" />
          <div
            className="absolute left-5 top-4 h-0.5 rounded-full bg-linear-to-r from-emerald-500 to-amber-400 transition-[width] duration-300"
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
                    'w-8 h-8 rounded-full border font-mono text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400',
                    i === active && 'bg-emerald-500 border-emerald-400 text-white ring-4 ring-emerald-500/20',
                    i < active && 'bg-emerald-950 border-emerald-800/70 text-emerald-400',
                    i > active && 'bg-slate-900 border-slate-800 text-slate-400',
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
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-px bg-slate-800" />
          <motion.div
            className="hidden lg:block absolute top-7 left-[8%] h-px bg-linear-to-r from-emerald-500 to-amber-400 origin-left"
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
                  className="group flex flex-col items-center text-center gap-3 p-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  <span
                    className={clsx(
                      'w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors',
                      isActive && 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/50',
                      done && 'bg-emerald-950 border-emerald-800/60 text-emerald-400',
                      !isActive && !done && 'bg-slate-900 border-slate-800 text-slate-400 group-hover:border-slate-600',
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">STEP {i + 1}</span>
                  <span className={clsx('text-sm font-semibold', isActive ? 'text-white' : 'text-slate-300')}>{s.title}</span>
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
          className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-900/40 p-6 sm:p-8 min-h-64"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2">
                <div className="text-xs font-mono text-emerald-400 mb-2">
                  STEP {active + 1} OF {STEPS.length}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-emerald-200/90 mb-4">{step.summary}</p>
                <p className="text-slate-300 leading-relaxed">{step.body}</p>
              </div>
              <ul className="space-y-3 self-center">
                {step.facts.map((f) => (
                  <li key={f} className="rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-200">
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => setActive((a) => a - 1)}
              disabled={active === 0}
              className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActive((a) => a + 1)}
              disabled={active === STEPS.length - 1}
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next step →
            </button>
          </div>
        </div>

        {/* Circular economy note */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Nothing is wasted</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                What remains after digestion — the digestate — is a nutrient-rich organic manure that goes back onto
                the fields, closing the loop between the farm and the gas plant.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Why it matters</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The carbon in Bio-CNG was pulled from the air by the grass as it grew, so using it in place of fossil
                CNG avoids adding new fossil carbon to the atmosphere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
