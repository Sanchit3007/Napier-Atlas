import type { Metadata } from 'next';
import AnimatedHeading from '@/components/AnimatedHeading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HistoryRedirect } from '@/components/HistoryClient';

export const metadata: Metadata = { title: 'Your saved estimates', robots: { index: false } };

// /history: opens this browser's own history page, or explains how to start one.
export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <AnimatedHeading
          as="h1"
          effect="underline"
          text="Your saved estimates"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-8"
        />
        <HistoryRedirect />
      </div>
      <Footer />
    </main>
  );
}
