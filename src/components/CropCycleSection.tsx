import { CalendarDays } from 'lucide-react';
import { getStrains } from '@/lib/strains';
import CropCycleTimeline from '@/components/CropCycleTimeline';

// "Cultivation Lifecycle" section: loads the strains for the harvest timeline.
export default async function CropCycleSection() {
  const strains = await getStrains();

  return (
    <section id="lifecycle" className="scroll-mt-20 pt-16 pb-14 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <CalendarDays className="w-4 h-4" /> Cultivation Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            One planting, harvest after harvest
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Napier is a ratoon crop: after each cut it regrows from the same roots. Pick a strain to see its
            milestones and how many harvests it could deliver to a biogas plant over an example five-year period.
          </p>
        </div>
        <CropCycleTimeline
          strains={strains.map(({ slug, name, firstHarvestDays, ratoonCycleDays }) => ({
            slug,
            name,
            firstHarvestDays,
            ratoonCycleDays,
          }))}
        />
      </div>
    </section>
  );
}
