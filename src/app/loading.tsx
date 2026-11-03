import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Grey placeholder layout with a spinner, shown while a page's data is loading.
export default function Loading() {
  return (
    <main className="min-h-screen bg-page text-ink">
      <Navbar />
      <output aria-label="Loading page" className="block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="motion-safe:animate-pulse">
          <div className="h-3.5 w-40 rounded-md bg-line mb-5" />
          <div className="h-10 w-full max-w-lg rounded-lg bg-line/50 mb-5" />
          <div className="h-3.5 w-full max-w-3xl rounded-md bg-card mb-3" />
          <div className="h-3.5 w-full max-w-2xl rounded-md bg-card mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-30 rounded-3xl bg-card border border-line" />
            ))}
          </div>
          <div className="h-52 rounded-3xl bg-card border border-line" />
        </div>
        <p className="mt-6 flex items-center gap-2.5 text-sm text-ink-muted">
          <Loader2 className="w-4.5 h-4.5 text-fern motion-safe:animate-spin" />
          Loading Napier data…
        </p>
      </output>
    </main>
  );
}
