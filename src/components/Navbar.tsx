import Link from 'next/link';
import { Sprout, BookOpen, Calculator, CalendarDays, Workflow } from 'lucide-react';
import HistoryNavLink from '@/components/HistoryNavLink';
import MobileMenu from '@/components/MobileMenu';

// Sticky top bar with the logo and section links; on phones the links move into the ☰ menu.
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-emerald-400 to-green-200 bg-clip-text text-transparent">
              NapierAtlas
            </span>
            <span className="block text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
              Bio-CNG Knowledge Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#process" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-emerald-500" /> How It Works
          </Link>
          <Link href="/#strains" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-500" /> Strains
          </Link>
          <Link href="/#calculator" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-500" /> Bio-CNG Estimator
          </Link>
          <Link href="/#lifecycle" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-emerald-500" /> Lifecycle
          </Link>
          <HistoryNavLink />
        </nav>

        {/* Phone menu (☰) */}
        <MobileMenu />
      </div>
    </header>
  );
}