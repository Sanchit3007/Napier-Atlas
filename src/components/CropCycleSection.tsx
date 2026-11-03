import { CalendarDays } from 'lucide-react';
import { getStrains } from '@/lib/strains';
import AnimatedHeading from '@/components/AnimatedHeading';
import CropCycleTimeline from '@/components/CropCycleTimeline';

// "Cultivation Lifecycle" section: loads the strains for the harvest timeline.
export default async function CropCycleSection() {
  const strains = await getStrains();

  return (
    <section id="lifecycle" className="scroll-mt-20 pt-16 pb-14 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-fern text-xs font-mono uppercase tracking-widest mb-3">
            <CalendarDays className="w-4 h-4" /> Cultivation Lifecycle
          </div>
          <AnimatedHeading
            effect="wind"
            text="One planting, harvest after harvest"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-3"
          />
          <p className="text-ink leading-relaxed">
            Napier is a ratoon crop: after each cut it regrows from the same roots. Pick a strain to see its
            milestones and how many harvests it could deliver to a biogas plant over an example five-year period.
          </p>
        </div>
        <CropCycleTimeline
          strains={strains.map(
            ({ slug, name, firstHarvestDays, ratoonCycleDays, annualYieldTons, dryMatter, bioCngPotential }) => ({
              slug,
              name,
              firstHarvestDays,
              ratoonCycleDays,
              annualYieldTons,
              dryMatter,
              bioCngPotential,
            }),
          )}
        />
      </div>
    </section>
  );
}
