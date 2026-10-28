'use client';

import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const format = (n: number, decimals: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// A number that counts up to its value once it scrolls into view (and from old to new when it changes).
export default function CountUp({ value, decimals = 0 }: Readonly<{ value: number; decimals?: number }>) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduceMotion) {
      shown.current = value;
      node.textContent = format(value, decimals);
      return;
    }
    const controls = animate(shown.current, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        shown.current = v;
        node.textContent = format(v, decimals);
      },
    });
    return () => controls.stop();
  }, [value, decimals, inView, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(0, decimals)}
    </span>
  );
}
