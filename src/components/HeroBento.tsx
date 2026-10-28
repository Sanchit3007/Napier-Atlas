import Link from 'next/link';
import { ArrowRight, Flame, ShieldCheck, TrendingUp, Zap, Sprout } from 'lucide-react';
import BentoCard from '@/components/BentoCard';
import CountUp from '@/components/CountUp';
import GrassToGasFlow from '@/components/GrassToGasFlow';

// Top of the home page: headline, grass → gas animation and four key-fact cards.
export default function HeroBento() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-14 lg:pt-14">
      {/* Soft green glow behind the hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-emerald-600/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Banner: headline on the left, animated grass → gas plant on the right */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 lg:items-end mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-xs font-mono mb-6 shadow-inner">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Napier Grass → Bio-CNG Knowledge Hub</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Turning Napier Grass into <span className="bg-linear-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">Clean Bio-CNG</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Learn how one of the world&apos;s fastest-growing grasses becomes a renewable gas fuel — from the field to the digester to the fuel cylinder — and explore the Napier varieties that make it possible.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#process"
                className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02]"
              >
                See How It Works <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#calculator"
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition-all hover:border-slate-700"
              >
                Estimate Bio-CNG Potential
              </Link>
            </div>
          </div>
          <GrassToGasFlow />
        </div>

        {/* Four key-fact cards; they fade in one after another */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: methane yield (2 columns wide on desktop) */}
          <BentoCard
            index={0}
            glow="245 158 11"
            className="md:col-span-2 rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-900/40 hover:border-amber-700/60 p-8 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <Flame className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Up to ~<CountUp value={250} /> m³ of Methane per Ton of Organic Matter
              </h2>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                In lab tests, digester microbes turn Napier grass into biogas yielding about 120–250 m³ of methane per ton of its organic matter. Purified to at least 90% methane and compressed, it becomes Bio-CNG — a renewable alternative to fossil CNG.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2 items-center justify-between text-xs font-mono text-amber-400">
              <span>RENEWABLE VEHICLE & COOKING FUEL</span>
              <span>DIGESTATE → ORGANIC MANURE</span>
            </div>
          </BentoCard>

          {/* Card 2: fresh biomass yield per acre */}
          <BentoCard
            index={1}
            glow="16 185 129"
            className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-900 border border-slate-800 hover:border-emerald-800/70 p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                <CountUp value={40} /> – <CountUp value={200} /> Tons per Acre a Year
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fresh fodder, from dwarf types up to the breeder-reported best case for Pakchong-1. First cut about 75 days after planting, then every 45 days as the crop regrows.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-emerald-400">
              REGROWS AFTER EVERY CUT
            </div>
          </BentoCard>

          {/* Card 3: crude protein for livestock */}
          <BentoCard
            index={2}
            glow="20 184 166"
            className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-900 border border-slate-800 hover:border-teal-800/70 p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                <CountUp value={16} />% – <CountUp value={18} />% Crude Protein
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The breeder of Pakchong-1 reports 16–18% crude protein, against 8–12% for ordinary Napier cut at 45–55 days.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-teal-400">
              BREEDER-REPORTED · PAKCHONG-1
            </div>
          </BentoCard>

          {/* Card 4: soil erosion control (2 columns wide on desktop) */}
          <BentoCard
            index={3}
            glow="34 197 94"
            className="md:col-span-2 rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-green-950/30 border border-emerald-900/40 hover:border-emerald-700/60 p-8 flex flex-col justify-between"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Roots That Hold the Soil</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  A review of studies from India&apos;s hill regions found grass barriers cut runoff by 42% and soil erosion by 63%, and rated hybrid Napier the most effective barrier grass for the western Himalayas and Eastern Ghats.
                </p>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-2xl p-5 text-center min-w-40">
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  <CountUp value={63} />%
                </div>
                <div className="text-xs text-slate-300 mt-1">Less soil erosion</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2 items-center justify-between text-xs font-mono text-green-400">
              <span>EROSION CONTROL · GRASS BARRIERS</span>
              <span>INDIAN HILL REGIONS · REVIEW</span>
            </div>
          </BentoCard>

        </div>

      </div>
    </section>
  );
}