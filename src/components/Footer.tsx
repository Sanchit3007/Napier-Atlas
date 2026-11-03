import Link from 'next/link';
import { BookOpen, Calculator, CalendarDays, Sprout, Workflow } from 'lucide-react';
import HistoryNavLink from '@/components/HistoryNavLink';
import { getStrains } from '@/lib/strains';

// Section links in the footer's Explore column.
const EXPLORE = [
  { href: '/#process', label: 'How It Works', icon: Workflow },
  { href: '/#strains', label: 'Strains', icon: BookOpen },
  { href: '/#calculator', label: 'Bio-CNG Estimator', icon: Calculator },
  { href: '/#lifecycle', label: 'Lifecycle', icon: CalendarDays },
];

const linkClass = 'inline-flex items-center gap-2 text-ink hover:text-fern-dark transition-colors';

// Site footer: brand, Explore links and links to every strain page (names come from the database).
export default async function Footer() {
  const strains = await getStrains();

  return (
    <footer className="border-t border-line bg-page text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-fern to-fern-dark flex items-center justify-center shadow-lg shadow-fern/15 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight text-fern">
                NapierAtlas
              </span>
              <span className="block text-[10px] text-fern font-mono tracking-widest uppercase">
                Bio-CNG Knowledge Hub
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-ink-muted leading-relaxed">
            A free guide to how Napier grass becomes renewable Bio-CNG, from the field to the digester to the fuel
            cylinder.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-fern">Explore</h2>
          <ul className="space-y-3">
            {EXPLORE.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  <Icon className="w-4 h-4 text-fern" /> {label}
                </Link>
              </li>
            ))}
            <li className="text-ink">
              <HistoryNavLink />
            </li>
          </ul>
        </nav>

        <nav aria-label="Strains">
          <h2 className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-fern">Strains</h2>
          <ul className="space-y-3">
            {strains.map((s) => (
              <li key={s.slug}>
                <Link href={`/strains/${s.slug}`} className={linkClass}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
