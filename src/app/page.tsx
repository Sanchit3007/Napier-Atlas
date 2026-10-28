import Navbar from '@/components/Navbar';
import HeroBento from '@/components/HeroBento';
import ProcessSection from '@/components/ProcessSection';
import CropCycleSection from '@/components/CropCycleSection';
import StrainsSection from '@/components/StrainsSection';
import SimulatorSection from '@/components/SimulatorSection';
import Footer from '@/components/Footer';

// Home page: hero, How It Works, Lifecycle, Strains, the Bio-CNG estimator and the footer.
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <HeroBento />
      <ProcessSection />
      <CropCycleSection />
      <StrainsSection />
      <SimulatorSection />

      <Footer />
    </main>
  );
}
