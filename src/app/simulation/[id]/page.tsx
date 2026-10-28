import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Beef, CheckCircle2, CloudOff, Flame, Fuel, Info, Layers, Sprout, Wheat } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectionChart from '@/components/ProjectionChart';
import CopyLinkButton from '@/components/CopyLinkButton';
import EstimateDownloads from '@/components/EstimateDownloads';
import { situationLabels, toEstimateExport } from '@/lib/estimate-export';
import { getSimulation, getStrains } from '@/lib/strains';
import { GOALS, cbgKgPerDay, co2AvoidedTons, simulate } from '@/lib/simulator';

export const metadata: Metadata = { title: 'Saved Bio-CNG estimate' };

// Saved estimate page: results, 5-year chart, share link and CSV / PDF downloads.
export default function SimulationPage({ params, searchParams }: Readonly<PageProps<'/simulation/[id]'>>) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-14 text-slate-500">Loading estimate…</div>}>
        <SimulationDetail params={params} searchParams={searchParams} />
      </Suspense>
      <Footer />
    </main>
  );
}

// Loads the saved estimate; "Saved to your history" shows only right after saving (?saved=1).
async function SimulationDetail({
  params,
  searchParams,
}: Readonly<Pick<PageProps<'/simulation/[id]'>, 'params' | 'searchParams'>>) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [sim, strains] = await Promise.all([getSimulation(id), getStrains()]);
  if (!sim) notFound();

  const strain = strains.find((s) => s.name === sim.recommendedStrain);
  // The projection isn't stored, so rebuild it from the saved inputs.
  const result = strain ? simulate([strain], sim) : null;
  const projection = result?.projection ?? null;
  // Estimates saved with the situation questions also show how every strain ranked.
  const ranking = sim.priority ? simulate(strains, sim).ranking : null;
  const goal = GOALS.find((g) => g.value === sim.primaryGoal)?.label ?? sim.primaryGoal;

  const metrics = [
    { icon: Wheat, label: 'Fresh biomass / year', value: `${sim.estimatedAnnualTons.toLocaleString('en-IN')} t` },
    { icon: Flame, label: 'Methane / year', value: `${sim.bioCngCubicMeters.toLocaleString('en-IN')} m³` },
    { icon: Fuel, label: 'Bio-CNG output', value: `${cbgKgPerDay(sim.bioCngCubicMeters).toLocaleString('en-IN')} kg/day` },
    { icon: CloudOff, label: 'Fossil CO₂ avoided / year', value: `${co2AvoidedTons(sim.bioCngCubicMeters).toLocaleString('en-IN')} t` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {saved === '1' && (
        <output className="flex items-center gap-2 mb-7 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved to your history
        </output>
      )}
      <Link href="/#calculator" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 mb-8">
        <ArrowLeft className="w-4 h-4" /> Try another estimate
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" /> Estimate saved
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sim.landAcres} acres · {goal}
          </h1>
          <p className="text-slate-400 mt-1">
            {sim.soilType} soil · {sim.irrigationLevel} · saved{' '}
            {sim.createdAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <CopyLinkButton />
          {result && (
            <EstimateDownloads
              estimate={toEstimateExport(
                sim,
                result,
                { savedAt: sim.createdAt, path: `/simulation/${sim.id}` },
                ranking ?? result.ranking,
              )}
            />
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-linear-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Recommended strain</div>
        {strain ? (
          <Link href={`/strains/${strain.slug}`} className="text-2xl font-bold text-white hover:text-emerald-200">
            {sim.recommendedStrain}
          </Link>
        ) : (
          <div className="text-2xl font-bold text-white">{sim.recommendedStrain}</div>
        )}
        {ranking && (
          <>
            <p className="mt-2 text-sm text-slate-400">
              {situationLabels(sim)
                .map(([, answer]) => answer)
                .join(' · ')}
            </p>
            <ol className="mt-4 space-y-2">
              {ranking.map((r, i) => (
                <li key={r.strain.slug} className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.75rem] sm:grid-cols-[minmax(0,1fr)_10rem_2.75rem] items-center gap-3 text-sm">
                  <span className={i === 0 ? 'truncate font-semibold text-white' : 'truncate text-slate-300'}>
                    {i + 1}. {r.strain.name}
                  </span>
                  <span className="h-1.5 rounded-full bg-slate-950 overflow-hidden" aria-hidden="true">
                    <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${r.score}%` }} />
                  </span>
                  <span className="font-mono text-right text-slate-300">{r.score}%</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
            <Icon className="w-5 h-5 text-emerald-400 mb-3" />
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{value}</div>
            <div className="text-sm text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl bg-slate-900/60 border border-slate-800 px-5 py-3 text-sm text-slate-300 mb-6">
        {strain && (
          <span className="inline-flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-white">
              {Math.round((sim.estimatedAnnualTons * strain.dryMatter) / 100).toLocaleString('en-IN')}
            </span>{' '}
            t dry matter / year
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <Sprout className="w-4 h-4 text-green-400" />
          <span className="font-mono text-white">{sim.stemsRequired.toLocaleString('en-IN')}</span> stem cuttings to plant
        </span>
        {sim.cattleSupported > 0 && (
          <span className="inline-flex items-center gap-2">
            <Beef className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-white">{sim.cattleSupported.toLocaleString('en-IN')}</span> cattle fed from the fodder share
          </span>
        )}
      </div>

      {projection && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">5-year yield projection</h2>
          <ProjectionChart data={projection} />
        </div>
      )}

      <p className="flex gap-2 text-xs text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 shrink-0" />
        Estimates are for learning purposes, based on typical published strain values. Real output depends on local
        climate, crop management and digester efficiency.
      </p>
    </div>
  );
}
