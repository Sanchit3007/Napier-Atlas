'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, Beef, Check, CloudOff, Flame, Fuel, Info, Layers, Loader2, Save, Sprout, Wheat } from 'lucide-react';
import { clsx } from 'clsx';
import {
  ANIMALS,
  FEEDING,
  GOALS,
  IRRIGATION_LEVELS,
  MAX_ACRES,
  MIN_ACRES,
  PRIORITIES,
  SITUATION_DEFAULTS,
  SOIL_TYPES,
  SUNLIGHT,
  simulate,
  type SimInput,
  type SimStrain,
} from '@/lib/simulator';
import { saveSimulation } from '@/app/actions';
import CountUp from '@/components/CountUp';
import ProjectionChart from '@/components/ProjectionChart';
import EstimateDownloads from '@/components/EstimateDownloads';
import { toEstimateExport } from '@/lib/estimate-export';
import { ensureHistoryKey } from '@/lib/history';

// Bio-CNG estimator: choose land, soil, water and goal to see the best strain, outputs and a 5-year chart.
export default function YieldSimulator({ strains }: Readonly<{ strains: SimStrain[] }>) {
  const [input, setInput] = useState<SimInput>({
    landAcres: 10,
    soilType: 'Black Cotton',
    irrigationLevel: IRRIGATION_LEVELS[0].value,
    primaryGoal: 'BIO_CNG_BIOMASS',
    ...SITUATION_DEFAULTS,
  });
  const [state, formAction, pending] = useActionState(saveSimulation, { error: null });

  const result = useMemo(() => simulate(strains, input), [strains, input]);
  const fodderShare = GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0;
  const [best, ...others] = result.ranking;
  const set = <K extends keyof SimInput>(key: K, value: SimInput[K]) => setInput((cur) => ({ ...cur, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <form
          action={(formData) => {
            // The browser's history key is only created when the visitor first saves an estimate.
            formData.set('historyKey', ensureHistoryKey());
            formAction(formData);
          }}
          className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col gap-7"
        >
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label htmlFor="acres" className="text-sm font-medium text-slate-200">
                Land size
              </label>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  aria-label="Land size in acres"
                  min={MIN_ACRES}
                  max={MAX_ACRES}
                  step={0.5}
                  value={input.landAcres}
                  onChange={(e) => set('landAcres', Math.min(MAX_ACRES, Math.max(MIN_ACRES, Number(e.target.value) || MIN_ACRES)))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right font-mono text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400"
                />
                <span className="text-sm text-slate-400">acres</span>
              </div>
            </div>
            <input
              id="acres"
              type="range"
              min={MIN_ACRES}
              max={100}
              step={0.5}
              value={Math.min(input.landAcres, 100)}
              onChange={(e) => set('landAcres', Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            {/* The slider caps at 100 for usability; the hidden field carries the exact value. */}
            <input type="hidden" name="landAcres" value={input.landAcres} />
          </div>

          <Choice
            legend="Soil type"
            name="soilType"
            options={SOIL_TYPES.map((s) => ({ value: s, label: s }))}
            value={input.soilType}
            onChange={(v) => set('soilType', v)}
            columns={2}
          />
          <Choice
            legend="Irrigation"
            name="irrigationLevel"
            options={IRRIGATION_LEVELS.map((i) => ({ value: i.value, label: i.short }))}
            value={input.irrigationLevel}
            onChange={(v) => set('irrigationLevel', v)}
            columns={3}
          />
          <Choice
            legend="Primary goal"
            name="primaryGoal"
            options={GOALS.map((g) => ({ value: g.value, label: g.label }))}
            value={input.primaryGoal}
            onChange={(v) => set('primaryGoal', v)}
            columns={3}
          />
          {/* Situation questions: animal ones only matter when some of the harvest is fed. */}
          {fodderShare > 0 && (
            <>
              <Choice
                legend="Animals you feed"
                name="animals"
                options={ANIMALS}
                value={input.animals ?? SITUATION_DEFAULTS.animals}
                onChange={(v) => set('animals', v)}
                columns={2}
              />
              <Choice
                legend="How they eat it"
                name="feeding"
                options={FEEDING}
                value={input.feeding ?? SITUATION_DEFAULTS.feeding}
                onChange={(v) => set('feeding', v)}
                columns={2}
              />
            </>
          )}
          <Choice
            legend="Sunlight on the plot"
            name="sunlight"
            options={SUNLIGHT}
            value={input.sunlight ?? SITUATION_DEFAULTS.sunlight}
            onChange={(v) => set('sunlight', v)}
            columns={2}
          />
          <Choice
            legend="What matters most"
            name="priority"
            options={PRIORITIES}
            value={input.priority ?? SITUATION_DEFAULTS.priority}
            onChange={(v) => set('priority', v)}
            columns={3}
          />

          {/* Save, CSV and PDF buttons; kept at the bottom when the results column is taller. */}
          <div className="mt-auto pt-2">
            <button
              type="submit"
              disabled={pending}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold shadow-lg shadow-emerald-900/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {pending ? 'Saving estimate…' : 'Save & share this estimate'}
            </button>
            <EstimateDownloads estimate={toEstimateExport(input, result)} className="mt-3" />
            {state.error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {state.error}
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        <div className="lg:col-span-3 flex flex-col gap-6" aria-live="polite">
          {/* Best match, with its match score and the reasons behind it */}
          <AnimatePresence mode="wait">
            <motion.div
              key={best.strain.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl bg-linear-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Best match for your farm</div>
                  <div className="text-2xl font-bold text-white">{best.strain.name}</div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 shrink-0">
                  <span className="font-mono text-2xl font-extrabold text-white">
                    {best.score}%<span className="ml-1 font-sans text-xs font-normal text-slate-400">match</span>
                  </span>
                  <Link
                    href={`/strains/${best.strain.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    View strain <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm">
                {best.reasons.slice(0, 3).map((r) => (
                  <li key={r} className="flex gap-2 text-slate-200">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" /> {r}
                  </li>
                ))}
                {best.cautions.slice(0, 2).map((c) => (
                  <li key={c} className="flex gap-2 text-amber-300">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-2 auto-rows-fr gap-4 flex-1">
            <Metric icon={Wheat} tone="emerald" label="Fresh biomass / year" unit="tons" value={result.estimatedAnnualTons} />
            <Metric icon={Flame} tone="amber" label="Methane / year" unit="m³ CH₄" value={result.bioCngCubicMeters} />
            <Metric icon={Fuel} tone="teal" label="Bio-CNG output" unit="kg per day" value={result.cbgKgPerDay} />
            <Metric icon={CloudOff} tone="green" label="Fossil CO₂ avoided / year" unit="tons" value={result.co2AvoidedTons} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl bg-slate-900/60 border border-slate-800 px-5 py-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-white">{result.dryMatterTons.toLocaleString('en-IN')}</span> t dry matter / year
            </span>
            <span className="inline-flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-400" />
              <span className="font-mono text-white">{result.stemsRequired.toLocaleString('en-IN')}</span> stem cuttings to plant
            </span>
            {fodderShare > 0 && (
              <span className="inline-flex items-center gap-2">
                <Beef className="w-4 h-4 text-teal-400" />
                <span className="font-mono text-white">{result.cattleSupported.toLocaleString('en-IN')}</span> cattle fed from the fodder share
              </span>
            )}
            {fodderShare === 1 && (
              <span className="text-slate-400">All biomass goes to fodder — choose a Bio-CNG goal to see gas output.</span>
            )}
          </div>

          {/* The other strains, ranked by match score */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-5 py-4">
            <h4 className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-400">Other strains, ranked</h4>
            <ol className="space-y-2.5">
              {others.map((r, i) => (
                <li key={r.strain.slug} className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.75rem] sm:grid-cols-[minmax(0,1fr)_8rem_2.75rem] items-center gap-3 text-sm">
                  <Link href={`/strains/${r.strain.slug}`} className="truncate text-slate-200 hover:text-emerald-300" title={r.reasons[0] ?? r.cautions[0]}>
                    {i + 2}. {r.strain.name}
                  </Link>
                  <span className="h-1.5 rounded-full bg-slate-950 overflow-hidden" aria-hidden="true">
                    <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${r.score}%` }} />
                  </span>
                  <span className="font-mono text-right text-slate-300">{r.score}%</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Full-width chart below both columns keeps the inputs and results the same height. */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-semibold text-white">5-year yield projection</h3>
          <span className="text-xs font-mono text-slate-400">
            Total <CountUp value={result.projection.at(-1)!.cumulative} /> t
          </span>
        </div>
        <ProjectionChart data={result.projection} />
      </div>

      <p className="flex gap-2 text-xs text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-slate-400" />
        Estimates are for learning purposes, based on the published strain values on each strain page. The
        estimator also assumes 82% of full yield with moderate water, 60% when rainfed and 80% on unsuited soil,
        about 40 kg of green fodder per cow a day, and that 86% of dry matter is organic matter that can make
        methane. The match score combines output per acre, protein and how well each strain suits your answers
        (from its published strengths), with a soil it isn&apos;t listed for scoring ×0.75 and, on a shaded plot,
        strains without a shade trial scoring ×0.8. Real output depends on local climate, crop management and
        digester efficiency.
      </p>
    </div>
  );
}

// A group of option buttons (radio inputs), such as Soil type or Irrigation.
function Choice({
  legend,
  name,
  options,
  value,
  onChange,
  columns,
}: Readonly<{
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  columns: 2 | 3;
}>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-200 mb-3">{legend}</legend>
      <div className={clsx('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {options.map((o) => (
          <label
            key={o.value}
            className={clsx(
              'cursor-pointer rounded-xl border px-3 py-2 text-sm text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-emerald-400',
              value === o.value
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Icon colours for the four result boxes.
const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
};

// One result box, e.g. "Methane / year", with a number that counts up.
function Metric({
  icon: Icon,
  tone,
  label,
  unit,
  value,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
  label: string;
  unit: string;
  value: number;
}>) {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
      <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center mb-4', TONES[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
        <CountUp value={value} />
      </div>
      <div className="text-xs text-slate-400 mt-1">{unit}</div>
      <div className="text-sm text-slate-300 mt-2">{label}</div>
    </div>
  );
}
