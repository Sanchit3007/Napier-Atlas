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
        className="w-11 h-11 rounded-xl border border-line bg-card flex items-center justify-center text-ink hover:border-line transition-all focus-visible:outline-2 focus-visible:outline-fern group-data-compact/nav:w-10 group-data-compact/nav:h-10 group-data-compact/nav:rounded-full"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute left-0 right-0 top-full border-b border-line bg-card/95 backdrop-blur-md shadow-xl shadow-ink/20 group-data-compact/nav:top-[calc(100%+0.5rem)] group-data-compact/nav:rounded-2xl group-data-compact/nav:border group-data-compact/nav:bg-card"
        >
          <ul className="max-w-7xl mx-auto px-4 py-3 grid gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-ink hover:bg-line/50 hover:text-fern-dark transition-colors focus-visible:outline-2 focus-visible:outline-fern"
                >
                  <Icon className="w-5 h-5 text-fern" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
