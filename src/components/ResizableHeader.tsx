'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const COMPACT_AFTER = 60; // px scrolled before the bar shrinks into a pill

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

// Sticky header that shrinks into a floating pill once the page is scrolled past the top.
// Children style themselves with `group-data-compact/nav:` classes.
export default function ResizableHeader({ children }: Readonly<{ children: ReactNode }>) {
  // Re-renders only when crossing the threshold, not on every scroll event.
  const compact = useSyncExternalStore(
    subscribe,
    () => window.scrollY > COMPACT_AFTER,
    () => false,
  );

  return (
    <header
      data-compact={compact || undefined}
      className="group/nav sticky top-0 z-50 flex justify-center text-ink transition-[padding] duration-500 data-compact:pt-3 motion-reduce:transition-none"
    >
      {children}
    </header>
  );
}
