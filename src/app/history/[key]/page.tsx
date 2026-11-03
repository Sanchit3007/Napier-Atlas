import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, ArrowRight, History, Link2, Trash2 } from 'lucide-react';
import AnimatedHeading from '@/components/AnimatedHeading';
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
    <main className="min-h-screen bg-page text-ink">
      <Navbar />
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-14 text-ink-dim">Loading your estimates…</div>}>
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
    // Estimates saved with the situation questions export the full top-3 ranking.
    const ranking = sim.priority ? simulate(strains, sim).ranking : result?.ranking;
    return { sim, result, ranking };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <RememberHistoryKey historyKey={key} />
      <Link href="/#calculator" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-fern-dark mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to the estimator
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-fern text-xs font-mono uppercase tracking-widest mb-3">
            <History className="w-4 h-4" /> My estimates
          </div>
          <AnimatedHeading
            as="h1"
            effect="underline"
            text="Your saved estimates"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink"
          />
          <p className="text-ink-muted mt-3">{saves.length} saved · newest first</p>
        </div>
        {saves.length > 0 && <ClearHistoryButton action={clearHistory.bind(null, key)} />}
      </div>

      <div className="rounded-3xl bg-card border border-line p-6 mb-6">
        <h2 className="font-semibold text-ink inline-flex items-center gap-2">
          <Link2 className="w-4 h-4 text-fern" /> Your private history link
        </h2>
        <p className="text-sm text-ink mt-2 mb-4">
          Open this page&apos;s link on any phone or computer to see this same list. Keep it private: anyone with the
          link can see these estimates.
        </p>
        <CopyLinkButton label="Copy my history link" />
        <p className="text-xs text-ink-muted mt-3">
          This browser remembers the link for you. If you lose it and clear your browser data, the list can&apos;t be
          recovered.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-muted">
          No saved estimates yet. Try the{' '}
          <Link href="/#calculator" className="text-fern hover:text-fern-dark">
            Bio-CNG estimator
          </Link>{' '}
          and press “Save &amp; share this estimate”.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ sim, result, ranking }) => (
            <li
              key={sim.id}
              className="rounded-3xl bg-card border border-line p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-x-6 gap-y-1">
                <div>
                  <div className="text-xs text-ink-muted">{formatEstimateDate(sim.createdAt)}</div>
                  <div className="font-semibold text-ink">
                    {sim.landAcres} acres · {GOALS.find((g) => g.value === sim.primaryGoal)?.label ?? sim.primaryGoal}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {sim.soilType} · {IRRIGATION_LEVELS.find((i) => i.value === sim.irrigationLevel)?.short ?? sim.irrigationLevel}
                  </div>
                </div>
                <div className="text-sm text-ink sm:self-center">{sim.recommendedStrain.split(' (')[0]}</div>
                <div className="text-sm sm:self-center">
                  <span className="font-mono text-ink">
                    {(result?.projection.at(-1)?.cumulative ?? sim.estimatedAnnualTons).toLocaleString('en-IN')} t
                  </span>{' '}
                  <span className="text-ink-muted">{result ? 'over 5 years' : 'per year'}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/simulation/${sim.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-fern hover:text-fern-dark hover:bg-fern/10 transition-colors"
                >
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
                {result && (
                  <EstimateDownloads
                    compact
                    estimate={toEstimateExport(sim, result, { savedAt: sim.createdAt, path: `/simulation/${sim.id}` }, ranking)}
                  />
                )}
                <form action={removeEstimate.bind(null, key, sim.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove the ${sim.landAcres}-acre estimate from ${formatEstimateDate(sim.createdAt)}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-line text-ink-muted hover:text-red-800 hover:border-red-500/50 transition-colors focus-visible:outline-2 focus-visible:outline-fern"
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
