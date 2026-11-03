import { Calculator } from 'lucide-react';
import { getStrains } from '@/lib/strains';
import AnimatedHeading from '@/components/AnimatedHeading';
import YieldSimulator from '@/components/YieldSimulator';

// "Bio-CNG Potential Estimator" section: loads the strains for the estimator.
export default async function SimulatorSection() {
  const strains = await getStrains();

  return (
    <section id="calculator" className="scroll-mt-20 pt-16 pb-14 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-fern text-xs font-mono uppercase tracking-widest mb-3">
            <Calculator className="w-4 h-4" /> Bio-CNG Potential Estimator
          </div>
          <AnimatedHeading
            effect="rise"
            text="How much Bio-CNG can Napier grass produce?"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-3"
          />
          <p className="text-ink leading-relaxed">
            Pick a land size, soil and water availability to see which strain suits it best and how much
            biomass, methane and compressed Bio-CNG it could yield — updated as you change the inputs.
          </p>
        </div>
        <YieldSimulator strains={strains} />
      </div>
    </section>
  );
}
