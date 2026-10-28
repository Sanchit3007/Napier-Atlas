// Animated plant diagram for the hero: grass → digester → purifier → Bio-CNG cylinder.
// Drawn in SVG and animated by the .hf rules in globals.css; the stages light up in turn every 6 s.

// Labels under the four stages; each lights up in turn with its part of the drawing.
const STAGES = [
  { name: 'Napier grass', fact: '40–200 t/acre·yr', tone: 'text-green-300', left: '0%', width: '22%', delay: '0s' },
  { name: 'Digester', fact: 'biogas 50–60% CH₄', tone: 'text-amber-300', left: '29.5%', width: '23%', delay: '1.5s' },
  { name: 'Purifier', fact: 'removes CO₂, H₂S', tone: 'text-slate-400', left: '54%', width: '20.5%', delay: '3s' },
  { name: 'Bio-CNG', fact: '≥ 90% CH₄ fuel', tone: 'text-cyan-300', left: '76%', width: '24%', delay: '4.5s' },
];

// Shapes and colours of the swaying grass blades.
const LEAVES = [
  { d: 'M30 236 C 28 200, 18 168, 8 140 C 24 166, 34 198, 38 236 Z', fill: '#15803d', delay: '0s' },
  { d: 'M42 236 C 42 190, 36 140, 34 96 C 46 140, 52 190, 52 236 Z', fill: '#22c55e', delay: '.5s' },
  { d: 'M56 236 C 58 186, 62 130, 70 82 C 70 132, 66 188, 66 236 Z', fill: '#4ade80', delay: '1s' },
  { d: 'M68 236 C 72 196, 82 156, 98 120 C 90 160, 80 198, 78 236 Z', fill: '#16a34a', delay: '1.5s' },
  { d: 'M50 236 C 46 206, 40 182, 26 160 C 42 180, 54 204, 58 236 Z', fill: '#4ade80', delay: '.8s' },
  { d: 'M80 236 C 86 210, 96 190, 112 172 C 102 194, 92 214, 90 236 Z', fill: '#22c55e', delay: '1.9s' },
];

export default function GrassToGasFlow() {
  return (
    <div
      className="hf hf-in relative rounded-[28px] border border-emerald-800/45 px-5 pt-6 pb-4.5 sm:px-5.5"
      style={{
        background:
          'radial-gradient(420px 220px at 50% 60%, rgb(16 185 129 / 0.10), transparent 70%), linear-gradient(135deg, rgb(2 44 34 / 0.55), #0f172a)',
      }}
    >
      <div className="mb-1 text-xs font-mono uppercase tracking-widest text-emerald-400">From grass to gas</div>

      <div className="relative w-full max-w-140 mx-auto">
        <svg
          viewBox="0 0 560 250"
          className="block w-full h-auto"
          role="img"
          aria-label="Animated plant: Napier grass is chopped and carried into a dome digester, raw biogas flows through a pipe to a purifier, and clean Bio-CNG charges a fuel cylinder"
        >
          <defs>
            <linearGradient id="hfDome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34d399" stopOpacity="0.55" />
              <stop offset="1" stopColor="#064e3b" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="hfSteel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1e293b" />
              <stop offset="0.45" stopColor="#475569" />
              <stop offset="1" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="hfTank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hfCng" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0891b2" />
              <stop offset="0.5" stopColor="#67e8f9" />
              <stop offset="1" stopColor="#0891b2" />
            </linearGradient>
            <radialGradient id="hfHaloG">
              <stop offset="0" stopColor="#34d399" stopOpacity="0.32" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hfHaloC">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0.32" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <clipPath id="hfTankClip">
              <rect x="162" y="160" width="136" height="74" rx="6" />
            </clipPath>
            <clipPath id="hfColClip">
              <rect x="344" y="102" width="32" height="132" rx="8" />
            </clipPath>
          </defs>

          {/* Halos behind each stage, lit in turn */}
          <circle className="halo" style={{ animationDelay: '0s' }} cx="62" cy="186" r="74" fill="url(#hfHaloG)" />
          <circle className="halo" style={{ animationDelay: '1.5s' }} cx="230" cy="170" r="92" fill="url(#hfHaloG)" />
          <circle className="halo" style={{ animationDelay: '3s' }} cx="360" cy="168" r="64" fill="url(#hfHaloC)" />
          <circle className="halo" style={{ animationDelay: '4.5s' }} cx="476" cy="170" r="76" fill="url(#hfHaloC)" />

          {/* Ground and swaying grass */}
          <rect x="8" y="236" width="544" height="3" rx="1.5" fill="#1e293b" />
          <rect x="14" y="236" width="104" height="6" rx="3" fill="#3f6212" />
          {LEAVES.map((leaf) => (
            <path key={leaf.d} className="sway" style={{ animationDelay: leaf.delay }} d={leaf.d} fill={leaf.fill} />
          ))}

          {/* Conveyor carrying chopped grass */}
          <line x1="104" y1="230" x2="160" y2="202" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <circle cx="104" cy="230" r="5" fill="#475569" />
          <circle cx="160" cy="202" r="5" fill="#475569" />
          <g transform="translate(104 226) rotate(-26.6)">
            {[['0s', 6, '#4ade80'], ['.45s', 5, '#22c55e'], ['.9s', 6, '#86efac'], ['1.35s', 5, '#4ade80']].map(([delay, w, fill]) => (
              <rect key={delay} className="bit" style={{ animationDelay: delay as string }} x="0" y="-3" width={w} height="3" rx="1" fill={fill as string} />
            ))}
          </g>

          {/* Digester: sloshing slurry, rising bubbles, breathing gas dome, pressure gauge */}
          <rect x="160" y="158" width="140" height="78" rx="8" fill="url(#hfTank)" stroke="#475569" strokeWidth="2" />
          <g clipPath="url(#hfTankClip)">
            <path
              className="slosh"
              d="M130 190 Q 145 184 160 190 T 190 190 T 220 190 T 250 190 T 280 190 T 310 190 T 340 190 V 240 H 130 Z"
              fill="#4d7c0f"
              fillOpacity="0.75"
            />
            {[[182, 226, 3.5, '0s'], [206, 228, 2.5, '.7s'], [232, 224, 4, '1.3s'], [256, 228, 3, '1.9s']].map(([cx, cy, r, delay]) => (
              <circle key={cx} className="rise" style={{ animationDelay: delay as string }} cx={cx} cy={cy} r={r} fill="#bef264" />
            ))}
          </g>
          <path className="breathe" d="M162 159 C 166 104, 294 104, 298 159 Z" fill="url(#hfDome)" stroke="#10b981" strokeWidth="2" />
          <circle cx="278" cy="192" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <line className="needle" x1="278" y1="192" x2="278" y2="185" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <rect x="152" y="196" width="10" height="12" rx="2" fill="#334155" />

          {/* Raw biogas pipe to the purifier */}
          <path d="M230 116 V78 H360 V102" fill="none" stroke="#334155" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
          <path className="flow" d="M230 116 V78 H360 V102" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

          {/* Purifier column: amber raw gas in, cyan clean gas out */}
          <rect x="342" y="100" width="36" height="136" rx="10" fill="#0b1220" stroke="#64748b" strokeWidth="2" />
          <g clipPath="url(#hfColClip)">
            {[130, 155, 180, 205].map((y) => (
              <line key={y} x1="344" y1={y} x2="376" y2={y} stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
            ))}
            <circle className="rise2" style={{ animationDelay: '0s' }} cx="354" cy="228" r="3" fill="#fbbf24" />
            <circle className="rise2" style={{ animationDelay: '.7s' }} cx="366" cy="226" r="2.5" fill="#fbbf24" />
            <circle className="rise2" style={{ animationDelay: '.35s' }} cx="356" cy="168" r="3" fill="#67e8f9" />
            <circle className="rise2" style={{ animationDelay: '1.1s' }} cx="366" cy="170" r="2.5" fill="#67e8f9" />
          </g>

          {/* Clean gas pipe to the cylinder */}
          <path d="M378 114 H420 V84 H475 V94" fill="none" stroke="#334155" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
          <path className="flow" d="M378 114 H420 V84 H475 V94" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

          {/* Bio-CNG cylinder charging segment by segment */}
          <rect x="461" y="92" width="28" height="6" rx="3" fill="#cbd5e1" />
          <rect x="468" y="98" width="14" height="12" rx="2" fill="#94a3b8" />
          <rect x="440" y="108" width="72" height="128" rx="32" fill="url(#hfSteel)" stroke="#64748b" strokeWidth="2" />
          {[212, 195, 178, 161, 144, 127].map((y, i) => (
            <rect key={y} className="chg" style={{ animationDelay: `${i * 0.45}s` }} x="453" y={y} width="46" height="13" rx="4" fill="url(#hfCng)" />
          ))}
          <rect x="447" y="118" width="5" height="104" rx="2.5" fill="#ffffff" fillOpacity="0.12" />

          {/* Blue flame: the fuel in use */}
          <path className="flame" d="M532 236 C 520 222, 526 206, 534 196 C 536 208, 546 212, 544 226 C 543 232, 538 236, 532 236 Z" fill="#22d3ee" fillOpacity="0.85" />
          <path className="flame" style={{ animationDelay: '.3s' }} d="M533 236 C 528 228, 531 218, 535 212 C 537 220, 541 224, 540 230 C 539 234, 536 236, 533 236 Z" fill="#cffafe" />
          <rect x="522" y="236" width="24" height="4" rx="2" fill="#475569" />
        </svg>

        {/* Stage labels, aligned under each part of the drawing */}
        <div className="relative h-10 sm:h-13 mt-1 text-xs sm:text-[13px]">
          {STAGES.map((s) => (
            <div
              key={s.name}
              className="stage absolute text-center rounded-xl py-1.5"
              style={{ left: s.left, width: s.width, animationDelay: s.delay }}
            >
              <div className="font-semibold text-slate-200">{s.name}</div>
              <div className={`hidden sm:block font-mono text-[11px] whitespace-nowrap ${s.tone}`}>{s.fact}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap justify-between gap-2 text-xs font-mono">
        <span className="text-amber-400">UP TO ~250 M³ CH₄ / TON ORGANIC MATTER</span>
        <span className="text-green-300">DIGESTATE → MANURE</span>
      </div>
    </div>
  );
}
