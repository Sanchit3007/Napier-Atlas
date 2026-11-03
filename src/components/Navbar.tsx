import Link from 'next/link';
import { Sprout, BookOpen, Calculator, CalendarDays, Workflow } from 'lucide-react';
import HistoryNavLink from '@/components/HistoryNavLink';
import MobileMenu from '@/components/MobileMenu';
import ResizableHeader from '@/components/ResizableHeader';

// Sticky top bar with the logo and section links; on phones the links move into the ☰ menu.
// After scrolling past the top it shrinks into a floating pill (see ResizableHeader).
export default function Navbar() {
  return (
    <ResizableHeader>
      {/* Full width at the top of the page; a centred pill once scrolled */}
      <div className="relative w-full h-20 px-4 sm:px-6 lg:px-[max(2rem,calc((100%-80rem)/2+2rem))] flex items-center justify-between bg-card/90 backdrop-blur-md border-b border-line transition-[width,height,padding,border-radius,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none group-data-compact/nav:w-[calc(100%-1.5rem)] md:group-data-compact/nav:w-[min(64rem,calc(100%-2rem))] group-data-compact/nav:h-15 group-data-compact/nav:pl-4 group-data-compact/nav:pr-2 md:group-data-compact/nav:px-5 lg:group-data-compact/nav:px-6 group-data-compact/nav:rounded-full group-data-compact/nav:border group-data-compact/nav:border-fern/30 group-data-compact/nav:shadow-xl group-data-compact/nav:shadow-ink/20">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-fern to-fern-dark flex items-center justify-center shadow-lg shadow-fern/15 group-hover:scale-105 transition-all duration-300 group-data-compact/nav:w-8.5 group-data-compact/nav:h-8.5">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-fern">
              NapierAtlas
            </span>
            <span className="block max-h-4 overflow-hidden text-[10px] text-fern font-mono tracking-widest uppercase transition-all duration-300 group-data-compact/nav:max-h-0 group-data-compact/nav:opacity-0">
              Bio-CNG Knowledge Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink transition-[gap] duration-500 group-data-compact/nav:gap-6">
          <Link href="/#process" className="hover:text-fern-dark transition-colors flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-fern" /> How It Works
          </Link>
          <Link href="/#strains" className="hover:text-fern-dark transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-fern" /> Strains
          </Link>
          <Link href="/#calculator" className="hover:text-fern-dark transition-colors flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-fern" /> Bio-CNG Estimator
          </Link>
          <Link href="/#lifecycle" className="hover:text-fern-dark transition-colors flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-fern" /> Lifecycle
          </Link>
          <HistoryNavLink />
        </nav>

        {/* Phone menu (☰) */}
        <MobileMenu />
      </div>
    </ResizableHeader>
  );
}
