import type { ReactNode } from 'react';

// Small drawings for "How It Works" (styles under "How It Works scenes" in globals.css). Each step's scene plays
// when its step opens, because ProcessSection remounts the panel for every step. Drawn in a 160 × 120 box.

const GROUND = 92;

const soil = (
  <>
    <rect x="0" y={GROUND} width="160" height="28" fill="#7a5433" />
    <rect x="0" y={GROUND} width="160" height="4" fill="#5e3f22" />
  </>
);

// Three leaf blades rising from x at the ground, scaled by s.
function Blades({ x, s, grow = false }: Readonly<{ x: number; s: number; grow?: boolean }>) {
  return (
    <g className={grow ? 'ps-grow' : undefined}>
      <path d={`M${x} ${GROUND} q-4 -${30 * s} -16 -${46 * s} q12 ${12 * s} 20 ${46 * s}z`} fill="#3f7a2a" />
      <path d={`M${x + 2} ${GROUND} q0 -${40 * s} 4 -${60 * s} q2 ${22 * s} 0 ${60 * s}z`} fill="#5a9a3a" />
      <path d={`M${x + 4} ${GROUND} q6 -${28 * s} 18 -${40 * s} q-10 ${12 * s} -14 ${40 * s}z`} fill="#77b052" />
    </g>
  );
}

// A gas-mix bar: each part's share of the gas, filling in from the left.
function GasBar({ parts, label, filter }: Readonly<{ parts: [string, number, string][]; label: string; filter?: boolean }>) {
  const width = 132;
  const widths = parts.map(([, pct]) => (width * pct) / 100);
  const starts = widths.map((_, k) => 14 + widths.slice(0, k).reduce((sum, w) => sum + w, 0));
  return (
    <svg viewBox="0 0 160 120" className="block size-full" aria-hidden="true">
      {filter ? (
        <path d="M60 14 h40 l-14 16 v12 l-12 5 v-17Z" fill="#cedfbc" stroke="#2e4d1a" strokeWidth="2" />
      ) : (
        <>
          <path d="M70 40 q-6 -10 2 -18 q6 6 0 18" fill="#9aa58a" opacity=".7" />
          <path d="M86 40 q-6 -12 3 -22 q6 8 -1 22" fill="#9aa58a" opacity=".5" />
        </>
      )}
      <rect x="14" y="52" width={width} height="22" rx="4" fill="#e3edd2" stroke="#a3bf87" />
      {parts.map(([name, pct, color], k) => (
        <g key={color}>
          <rect className="ps-seg" style={{ animationDelay: `${k * 0.25}s` }} x={starts[k]} y="52" width={widths[k]} height="22" fill={color} />
          {name && pct > 4 && (
            <text className="font-mono" x={starts[k] + 4} y="88" fontSize="8.5" fill="#29391d">
              {name} {pct}%
            </text>
          )}
        </g>
      ))}
      <text className="font-mono" x="14" y="108" fontSize="9" fill="#2e4d1a">
        {label}
      </text>
    </svg>
  );
}

// 0 shoot grows from a cutting · 1 sickle cuts, chopped bits fall · 2 bubbles rise in the warm digester ·
// 3 raw gas mix · 4 the same gas after upgrading · 5 pressure gauge swings to ~250 bar.
export function StepScene({ step }: Readonly<{ step: number }>) {
  switch (step) {
    case 0:
      return (
        <svg viewBox="0 0 160 120" className="block size-full" aria-hidden="true">
          {soil}
          <g transform={`rotate(-28 80 ${GROUND + 4})`}>
            <rect x="76" y="86" width="8" height="30" rx="2" fill="#b49a5a" />
            <rect x="75" y="92" width="10" height="2" fill="#7a6634" />
          </g>
          <Blades x={76} s={1} grow />
          <text className="font-mono" x="8" y="16" fontSize="9" fill="#29391d">
            day 0 → 60–80
          </text>
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 160 120" className="block size-full" aria-hidden="true">
          {soil}
          <Blades x={60} s={1} />
          <Blades x={84} s={0.9} />
          <line x1="40" x2="120" y1="78" y2="78" stroke="#c2410c" strokeDasharray="5 4" />
          <g transform="translate(118 78)">
            <g className="ps-swing">
              <rect x="2" y="-3" width="26" height="6" rx="3" fill="#9a6b3a" />
              <path
                d="M2 0 C -8 -2 -24 -5 -32 -18 C -35 -24 -32 -32 -26 -35 C -29 -27 -27 -19 -19 -11 C -13 -6 -5 -3 2 -2Z"
                fill="#cbd5d1"
                stroke="#64706b"
              />
            </g>
          </g>
          {[30, 60, 90, 120].map((x, k) => (
            <rect key={x} className="ps-drop" style={{ animationDelay: `${k * 0.3}s` }} x={x} y="100" width="7" height="3" rx="1" fill="#77b052" />
          ))}
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 160 120" className="block size-full" aria-hidden="true">
          <rect x="0" y="100" width="160" height="20" fill="#7a5433" />
          <path d="M34 100 V66 a46 30 0 0 1 92 0 V100Z" fill="#55704a" stroke="#2e4d1a" strokeWidth="2" />
          <rect x="38" y="76" width="84" height="22" fill="#6b5a2c" opacity=".7" />
          {[54, 72, 90, 108].map((x, k) => (
            <circle key={x} className="ps-rise" style={{ animationDelay: `${k * 0.5}s` }} cx={x} cy="88" r="3" fill="none" stroke="#e8f5d6" strokeWidth="1.5" />
          ))}
          <rect x="136" y="44" width="6" height="40" rx="3" fill="#fff" stroke="#29391d" />
          <rect className="ps-grow" x="137" y="60" width="4" height="23" fill="#c2410c" />
          <text className="font-mono" x="128" y="38" fontSize="9" fill="#29391d">
            37 °C
          </text>
        </svg>
      );
    case 3:
      return (
        <GasBar
          label="raw biogas"
          parts={[
            ['CH₄', 55, '#2e4d1a'],
            ['CO₂', 40, '#9aa58a'],
            ['H₂S + water', 5, '#b45309'],
          ]}
        />
      );
    case 4:
      return (
        <GasBar
          label="after upgrading"
          filter
          parts={[
            ['CH₄', 92, '#2e4d1a'],
            ['CO₂', 6, '#9aa58a'],
            ['', 2, '#b45309'],
          ]}
        />
      );
    default:
      return (
        <svg viewBox="0 0 160 120" className="block size-full" aria-hidden="true">
          <path d="M30 84 A50 50 0 0 1 130 84" fill="none" stroke="#a3bf87" strokeWidth="10" strokeLinecap="round" />
          <path d="M104 46 A50 50 0 0 1 130 84" fill="none" stroke="#2e4d1a" strokeWidth="10" strokeLinecap="round" />
          <line className="ps-needle" x1="80" y1="84" x2="80" y2="42" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="84" r="6" fill="#18260f" />
          <text className="font-mono" x="80" y="108" textAnchor="middle" fontSize="11" fontWeight="600" fill="#18260f">
            ~250 bar
          </text>
        </svg>
      );
  }
}

// The two notes' drawings, in a 150 × 150 box with labels large enough to read (~11px).
const NOTE_ART = 'w-37.5 max-w-full justify-self-center rounded-2xl bg-[#e3edd2]';

// One stop on the loop: a circle with its picture inside and its name underneath.
function LoopStop({ cx, cy, label, labelY, children }: Readonly<{ cx: number; cy: number; label: string; labelY: number; children: ReactNode }>) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="22" fill="#cedfbc" stroke="#2e4d1a" strokeWidth="2" />
      {children}
      <text className="font-mono" x={cx} y={labelY} textAnchor="middle" fontSize="11" fontWeight="600" fill="#18260f">
        {label}
      </text>
    </g>
  );
}

// "Nothing is wasted": the farm → gas plant → manure loop, its dashed line flowing round.
export function LoopScene() {
  return (
    <svg viewBox="0 0 150 150" className={NOTE_ART} aria-hidden="true">
      <circle className="ps-flow" cx="75" cy="78" r="46" fill="none" stroke="#2e4d1a" strokeWidth="2.5" />
      <LoopStop cx={75} cy={32} label="Farm" labelY={64}>
        <path className="ps-sway" d="M70 42 q-2 -12 -8 -16 q8 2 10 16z M75 42 q0 -14 3 -20 q1 10 -1 20z M79 42 q4 -10 10 -12 q-6 5 -8 12z" fill="#3f7a2a" />
      </LoopStop>
      <LoopStop cx={115} cy={102} label="Gas plant" labelY={140}>
        <path d="M103 112 v-8 a12 8 0 0 1 24 0 v8z" fill="#55704a" />
        <circle className="ps-bub" cx="112" cy="104" r="2" fill="none" stroke="#fff" />
      </LoopStop>
      <LoopStop cx={35} cy={102} label="Manure" labelY={140}>
        <path d="M22 110 h26 l-4 -10 h-18z" fill="#8a5a2b" />
      </LoopStop>
    </svg>
  );
}

// "Why it matters": CO₂ goes down into the growing grass, and back up out of the fuel.
export function CarbonScene() {
  return (
    <svg viewBox="0 0 150 150" className={NOTE_ART} aria-hidden="true">
      <text className="font-mono" x="75" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#2f6f96">
        CO₂ in the air
      </text>
      <path className="ps-flow" d="M38 34 V84" stroke="#4f93bd" strokeWidth="2.5" fill="none" />
      <path d="M32 78 l6 8 l6 -8" fill="none" stroke="#4f93bd" strokeWidth="2.5" />
      <path className="ps-flow" d="M112 84 V34" stroke="#4f93bd" strokeWidth="2.5" fill="none" />
      <path d="M106 40 l6 -8 l6 8" fill="none" stroke="#4f93bd" strokeWidth="2.5" />
      <rect x="0" y="118" width="150" height="32" fill="#7a5433" />
      <path className="ps-sway" d="M34 118 q-4 -16 -12 -24 q10 6 16 24z M38 118 q0 -20 4 -30 q2 16 -1 30z M42 118 q6 -14 14 -18 q-9 8 -11 18z" fill="#3f7a2a" />
      <rect x="100" y="92" width="24" height="26" rx="6" fill="#55704a" stroke="#2e4d1a" strokeWidth="1.5" />
      <text className="font-mono" x="112" y="108" textAnchor="middle" fontSize="7" fill="#fff">
        CNG
      </text>
      <text className="font-mono" x="38" y="140" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
        grass
      </text>
      <text className="font-mono" x="112" y="140" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
        fuel
      </text>
    </svg>
  );
}
