import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HistoryRedirect } from '@/components/HistoryClient';

export const metadata: Metadata = { title: 'Your saved estimates', robots: { index: false } };

// /history: opens this browser's own history page, or explains how to start one.
export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">Your saved estimates</h1>
        <HistoryRedirect />
      </div>
      <Footer />
    </main>
  );
}
