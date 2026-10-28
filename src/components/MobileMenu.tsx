'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Calculator, CalendarDays, History, Menu, Workflow, X } from 'lucide-react';
import { useHistoryKey } from '@/components/HistoryClient';

// The same section links as the desktop navbar.
const LINKS = [
  { href: '/#process', label: 'How It Works', icon: Workflow },
  { href: '/#strains', label: 'Strains', icon: BookOpen },
  { href: '/#calculator', label: 'Bio-CNG Estimator', icon: Calculator },
  { href: '/#lifecycle', label: 'Lifecycle', icon: CalendarDays },
];

// Phone-only ☰ button that opens the navbar links in a panel; tapping a link, outside, or Escape closes it.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const key = useHistoryKey();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onTap = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onTap);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onTap);
    };
  }, [open]);

  const links = [...LINKS, { href: key ? `/history/${key}` : '/history', label: 'View History', icon: History }];

  return (
    <div ref={menuRef} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="w-11 h-11 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-200 hover:border-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute left-0 right-0 top-full border-b border-emerald-900/40 bg-slate-900/95 backdrop-blur-md shadow-xl shadow-black/40"
        >
          <ul className="max-w-7xl mx-auto px-4 py-3 grid gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  <Icon className="w-5 h-5 text-emerald-500" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
