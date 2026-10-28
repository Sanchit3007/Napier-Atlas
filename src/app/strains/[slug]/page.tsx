import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, BookOpen, Calculator, CheckCircle2, Droplets, ExternalLink, Flame, Layers, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStrainBySlug, getStrains } from '@/lib/strains';

// Builds a page for every strain ahead of time.
export async function generateStaticParams() {
  const strains = await getStrains();
  return strains.map((s) => ({ slug: s.slug }));
}

// Browser-tab title and search description for each strain page.
export async function generateMetadata({ params }: PageProps<'/strains/[slug]'>): Promise<Metadata> {
  const strain = await getStrainBySlug((await params).slug);
  return strain ? { title: strain.name, description: strain.bestFor } : {};
}

// Strain detail page: key figures, highlights, soils, water needs and sources.
export default function StrainPage({ params }: Readonly<PageProps<'/strains/[slug]'>>) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Suspense fallback={<StrainSkeleton />}>
        <StrainDetail params={params} />
      </Suspense>
      <Footer />
    </main>
  );
}

// Loads the strain from the database; an unknown strain shows the "not found" page.
async function StrainDetail({ params }: Readonly<Pick<PageProps<'/strains/[slug]'>, 'params'>>) {
  const strain = await getStrainBySlug((await params).slug);
  if (!strain) notFound();

  const stats = [
    { label: 'Crude protein', value: `${strain.crudeProtein}%`, hint: 'dry matter basis' },
    { label: 'Annual yield', value: `${strain.annualYieldTons} t`, hint: 'fresh, per acre' },
    { label: 'Dry matter', value: `${strain.dryMatter}%`, hint: 'of fresh weight' },
    { label: 'First harvest', value: `${strain.firstHarvestDays} days`, hint: 'after planting' },
    { label: 'Ratoon cycle', value: `${strain.ratoonCycleDays} days`, hint: 'between cuts' },
    { label: 'Max height', value: `${strain.maxHeightFeet} ft`, hint: 'canopy' },
  ];

  return (
    <article className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-80 bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link href="/#strains" className="flex w-fit items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 mb-8">
          <ArrowLeft className="w-4 h-4" /> All strains
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-xs font-mono mb-4">
          <MapPin className="w-3.5 h-3.5" /> {strain.origin}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">{strain.name}</h1>
        <p className="italic text-slate-400 mb-6">{strain.scientificName}</p>
        <p className="text-lg text-slate-200 max-w-3xl mb-10">{strain.bestFor}</p>

        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <dt className="text-sm text-slate-400 mt-1">
                {s.label} <span className="text-slate-600">· {s.hint}</span>
              </dt>
              <dd className="text-2xl font-extrabold font-mono text-white">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="font-semibold text-white mb-4">Key highlights</h2>
            <ul className="space-y-3">
              {strain.keyHighlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <Detail icon={Flame} tone="text-amber-400" label="Bio-CNG potential" value={strain.bioCngPotential} />
            <Detail icon={Droplets} tone="text-sky-400" label="Water requirement" value={strain.waterRequirement} />
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Suitable soils
              </div>
              <div className="flex flex-wrap gap-2">
                {strain.suitableSoils.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {strain.sources.length > 0 && (
          <section className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 mb-10" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="flex items-center gap-2 font-semibold text-white mb-1">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Sources
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Figures on this page come from these published studies and official pages. Yields are fresh fodder
              under good management; results on a real farm vary.
            </p>
            <ol className="space-y-2 list-decimal list-inside text-sm text-slate-300 marker:text-slate-500">
              {strain.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:text-emerald-200 underline decoration-emerald-800 underline-offset-2"
                  >
                    {s.label}
                    <ExternalLink className="inline w-3.5 h-3.5 ml-1 -mt-0.5" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Link
          href="/#calculator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/40 transition-colors"
        >
          <Calculator className="w-4 h-4" /> Simulate yield for your land
        </Link>
      </div>
    </article>
  );
}

// One labelled fact with an icon, such as "Water requirement".
function Detail({
  icon: Icon,
  tone,
  label,
  value,
}: Readonly<{
  icon: typeof Flame;
  tone: string;
  label: string;
  value: string;
}>) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
        <Icon className={`w-4 h-4 ${tone}`} /> {label}
      </div>
      <p className="text-slate-100">{value}</p>
    </div>
  );
}

// Grey placeholder shown while the strain loads.
function StrainSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 animate-pulse" aria-busy="true">
      <div className="h-4 w-24 bg-slate-800 rounded mb-8" />
      <div className="h-10 w-2/3 bg-slate-800 rounded mb-4" />
      <div className="h-4 w-1/3 bg-slate-900 rounded mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
