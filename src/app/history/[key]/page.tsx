import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, ArrowRight, History, Link2, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CopyLinkButton from '@/components/CopyLinkButton';
import EstimateDownloads from '@/components/EstimateDownloads';
import { ClearHistoryButton, RememberHistoryKey } from '@/components/HistoryClient';
import { clearHistory, removeEstimate } from '@/app/actions';
import { getHistory, getStrains } from '@/lib/strains';
import { GOALS, IRRIGATION_LEVELS, simulate } from '@/lib/simulator';
import { formatEstimateDate, toEstimateExport } from '@/lib/estimate-export';
import { isHistoryKey } from '@/lib/history';

// A history link is private, so keep it out of search engines.
export const metadata: Metadata = { title: 'Your saved estimates', robots: { index: false } };

// A visitor's saved estimates, with their private history link, downloads and remove buttons.
export default function HistoryKeyPage({ params }: Readonly<PageProps<'/history/[key]'>>) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-14 text-slate-500">Loading your estimates…</div>}>
        <HistoryDetail params={params} />
      </Suspense>
      <Footer />
    </main>
  );
}

// Loads the estimates saved under this key; a malformed key shows the "not found" page.
async function HistoryDetail({ params }: Readonly<Pick<PageProps<'/history/[key]'>, 'params'>>) {
  const { key } = await params;
  if (!isHistoryKey(key)) notFound();
  const [saves, strains] = await Promise.all([getHistory(key), getStrains()]);

  const rows = saves.map((sim) => {
    const strain = strains.find((s) => s.name === sim.recommendedStrain);
    const result = strain ? simulate([strain], sim) : null;
    return { sim, result };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <RememberHistoryKey historyKey={key} />
      <Link href="/#calculator" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to the estimator
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <History className="w-4 h-4" /> My estimates
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Your saved estimates</h1>
          <p className="text-slate-400 mt-1">{saves.length} saved · newest first</p>
        </div>
        {saves.length > 0 && <ClearHistoryButton action={clearHistory.bind(null, key)} />}
      </div>

      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-900/40 p-6 mb-6">
        <h2 className="font-semibold text-white inline-flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-400" /> Your private history link
        </h2>
        <p className="text-sm text-slate-300 mt-2 mb-4">
          Open this page&apos;s link on any phone or computer to see this same list. Keep it private: anyone with the
          link can see these estimates.
        </p>
        <CopyLinkButton label="Copy my history link" />
        <p className="text-xs text-slate-400 mt-3">
          This browser remembers the link for you. If you lose it and clear your browser data, the list can&apos;t be
          recovered.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-400">
          No saved estimates yet. Try the{' '}
          <Link href="/#calculator" className="text-emerald-300 hover:text-emerald-200">
            Bio-CNG estimator
          </Link>{' '}
          and press “Save &amp; share this estimate”.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ sim, result }) => (
            <li
              key={sim.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-x-6 gap-y-1">
                <div>
                  <div className="text-xs text-slate-400">{formatEstimateDate(sim.createdAt)}</div>
                  <div className="font-semibold text-white">
                    {sim.landAcres} acres · {GOALS.find((g) => g.value === sim.primaryGoal)?.label ?? sim.primaryGoal}
                  </div>
                  <div className="text-xs text-slate-400">
                    {sim.soilType} · {IRRIGATION_LEVELS.find((i) => i.value === sim.irrigationLevel)?.short ?? sim.irrigationLevel}
                  </div>
                </div>
                <div className="text-sm text-slate-200 sm:self-center">{sim.recommendedStrain.split(' (')[0]}</div>
                <div className="text-sm sm:self-center">
                  <span className="font-mono text-white">
                    {(result?.projection.at(-1)?.cumulative ?? sim.estimatedAnnualTons).toLocaleString('en-IN')} t
                  </span>{' '}
                  <span className="text-slate-400">{result ? 'over 5 years' : 'per year'}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/simulation/${sim.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors"
                >
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
                {result && (
                  <EstimateDownloads
                    compact
                    estimate={toEstimateExport(sim, result, { savedAt: sim.createdAt, path: `/simulation/${sim.id}` })}
                  />
                )}
                <form action={removeEstimate.bind(null, key, sim.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove the ${sim.landAcres}-acre estimate from ${formatEstimateDate(sim.createdAt)}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-800 text-slate-400 hover:text-red-300 hover:border-red-500/50 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
