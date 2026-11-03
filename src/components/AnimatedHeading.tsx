'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { clsx } from 'clsx';

// How each heading moves each time it scrolls into view (styles in globals.css, under "Heading text motion"):
// ripen: letters darken from young-leaf green · follow: fades up after its typed label · wind: letters lean like
// grass in a gust · leaf: a leaf pops in, then the words slide in · rise: words slide up from behind a mask ·
// underline: a hand-drawn grass-green stroke grows under it.
export type HeadingEffect = 'ripen' | 'follow' | 'wind' | 'leaf' | 'rise' | 'underline';

const TYPE_MS_PER_LETTER = 32;

// How long a TypedLabel takes to type out, so the heading under it can start just after.
export const typingTime = (label: string) => label.length * TYPE_MS_PER_LETTER + 120;

const SHOW_RATIO = 0.35; // how much of the element must be on screen for its animation to start
const REPLAY_AFTER_MS = 2000; // how long it must be fully off screen before it is reset to play again

// `inView` turns on when the element is a third in view, so its animation plays. With `replay`, it is reset once
// the element has been fully off screen for 2 s, so the animation plays again on the next visit. Resetting only
// when fully gone (and starting only when well in view) stops it restarting while it sits at the screen edge.
// A click on a link to the element's section (e.g. the navbar) replays it, even if that section is already on screen.
// `visible` says whether it is on screen right now (used to pause a loop).
function useInView<T extends Element>(replay = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let resetTimer: number | undefined;
    let onScreen = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        setVisible(entry.isIntersecting);
        if (entry.intersectionRatio >= SHOW_RATIO) {
          window.clearTimeout(resetTimer);
          setInView(true);
        } else if (!entry.isIntersecting && replay) {
          resetTimer = window.setTimeout(() => setInView(false), REPLAY_AFTER_MS);
        }
      },
      { threshold: [0, SHOW_RATIO] },
    );
    io.observe(el);

    const section = el.closest('section[id]');
    const onLinkClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]');
      if (!replay || !section || !(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.pathname !== window.location.pathname || url.hash !== `#${section.id}`) return;
      window.clearTimeout(resetTimer);
      setInView(false);
      // Already on screen: start again after the reset has painted. Otherwise the observer starts it on arrival.
      if (onScreen) requestAnimationFrame(() => requestAnimationFrame(() => setInView(true)));
    };
    document.addEventListener('click', onLinkClick);

    return () => {
      io.disconnect();
      window.clearTimeout(resetTimer);
      document.removeEventListener('click', onLinkClick);
    };
  }, [replay]);
  return [ref, inView, visible] as const;
}

// Splits text into words (each kept whole when a line wraps) and letters, numbered from the given starts so the
// numbering runs on across the plain and accent parts of a heading.
function splitText(text: string, firstLetter = 0, firstWord = 0) {
  let letter = firstLetter;
  let word = firstWord;
  const nodes: ReactNode[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      nodes.push(' ');
      continue;
    }
    const w = word++;
    const letters: ReactNode[] = [];
    for (const c of part) {
      const i = letter++;
      letters.push(
        <span key={i} className="tm-l" style={{ '--i': i } as CSSProperties}>
          {c}
        </span>,
      );
    }
    nodes.push(
      <span key={`w${w}`} className="tm-w">
        <span className="tm-wi" style={{ '--w': w } as CSSProperties}>
          {letters}
        </span>
      </span>,
    );
  }
  return { nodes, letters: letter, words: word };
}

type Props = Readonly<{
  as?: 'h1' | 'h2';
  effect: HeadingEffect;
  text: string;
  accent?: string; // trailing words in fern green, e.g. "Clean Bio-CNG"
  delayMs?: number; // for "follow": wait for the label above to finish typing
  loop?: boolean; // after the entrance, a soft green wave runs through the letters every 9 s (paused off screen)
  className?: string;
}>;

export default function AnimatedHeading({ as: Tag = 'h2', effect, text, accent, delayMs = 0, loop = false, className }: Props) {
  // A looping heading (the hero) keeps its wave going instead of replaying its entrance.
  const [ref, inView, visible] = useInView<HTMLHeadingElement>(!loop);
  const main = splitText(text);
  const extra = accent ? splitText(accent, main.letters, main.words) : null;

  return (
    <Tag
      ref={ref}
      className={clsx('tm', className)}
      data-effect={effect}
      data-in={inView || undefined}
      data-loop={loop || undefined}
      data-visible={visible || undefined}
      aria-label={accent ? `${text} ${accent}` : text}
      style={{ '--tm-delay': `${delayMs}ms` } as CSSProperties}
    >
      <span aria-hidden="true">
        {effect === 'leaf' && (
          <svg className="tm-leaf" viewBox="0 0 24 24">
            <path d="M4 20 C 4 10, 10 4, 21 3 C 20 14, 14 20, 4 20Z" fill="#5a9a3a" />
            <path d="M5 19 L 15 9" stroke="#2e4d1a" strokeWidth="1.5" fill="none" />
          </svg>
        )}
        {main.nodes}
        {extra && (
          <>
            {' '}
            <span className="tm-accent text-fern">{extra.nodes}</span>
          </>
        )}
        {effect === 'underline' && (
          <svg className="tm-blade" viewBox="0 0 300 20" preserveAspectRatio="none">
            <path d="M4 14 C 60 6, 140 4, 210 9 S 280 16, 296 6" />
          </svg>
        )}
      </span>
    </Tag>
  );
}

// A small section label (icon + mono caps) that types itself out each time it scrolls into view.
export function TypedLabel({ icon, text, className }: Readonly<{ icon: ReactNode; text: string; className?: string }>) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx('tm-type', className)} data-in={inView || undefined}>
      {icon}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{splitText(text).nodes}</span>
    </div>
  );
}
