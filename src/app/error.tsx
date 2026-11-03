'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Friendly error page with "Try again" and "Back to home", shown when a page fails to load.
export default function ErrorPage({ error, retry }: Readonly<{ error: unknown; retry: () => void }>) {
  useEffect(() => {
    // Details stay in the logs; the visitor only sees the friendly message below.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="flex justify-center px-4 py-24">
        <div role="alert" className="max-w-md w-full rounded-3xl bg-card border border-line p-9 flex flex-col items-center text-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-800">
            <AlertTriangle className="w-6.5 h-6.5" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
          <p className="text-ink leading-relaxed">
            We couldn&apos;t load the Napier data right now. This is usually a short connection hiccup — please try again.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => retry()}
              className="min-h-11.5 px-5.5 rounded-xl bg-fern hover:bg-fern-dark text-white font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fern"
            >
              Try again
            </button>
            <Link
              href="/"
              className="min-h-11.5 px-5.5 inline-flex items-center rounded-xl bg-page border border-line hover:border-line text-ink font-semibold transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
