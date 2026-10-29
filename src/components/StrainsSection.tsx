import { BookOpen } from 'lucide-react';
import { getStrains } from '@/lib/strains';
import StrainExplorer from '@/components/StrainExplorer';

// "Napier Strains" section: loads the strains for the explorer cards.
export default async function StrainsSection() {
  const strains = await getStrains();

  return (
    <section id="strains" className="scroll-mt-20 pt-16 pb-14 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <BookOpen className="w-4 h-4" /> Napier Strains
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Find the right variety for your land
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {strains.length} field-tested Napier varieties. Filter by soil, sort by what matters to you,
            and pick up to three to compare side by side.
          </p>
        </div>
        <StrainExplorer strains={strains} />
      </div>
    </section>
  );
}
