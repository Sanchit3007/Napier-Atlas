'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import { clsx } from 'clsx';

// A hero fact card that fades in when scrolled into view, with a soft glow that follows the mouse.
export default function BentoCard({
  index,
  glow,
  className,
  children,
}: Readonly<{
  index: number;
  glow: string; // space-separated RGB, e.g. "245 158 11"
  className?: string;
  children: ReactNode;
}>) {
  const reduceMotion = useReducedMotion();

  // Writing CSS variables directly avoids a React re-render on every pointer move.
  const track = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
      onPointerMove={track}
      className={clsx('group relative isolate overflow-hidden transition-colors duration-200', className)}
    >
      {/* The pointer glow: drawn above the card's background but below its text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(280px circle at var(--x) var(--y), rgb(${glow} / 0.16), transparent 65%)` }}
      />
      {children}
    </motion.div>
  );
}
