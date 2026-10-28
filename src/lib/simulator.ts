import type { NapierStrain } from '@prisma/client';

// Bio-CNG estimator maths: runs live in the browser and again on the server when an estimate is saved.

// The strain fields the estimator needs.
export type SimStrain = Pick<
  NapierStrain,
  | 'name'
  | 'slug'
  | 'crudeProtein'
  | 'dryMatter'
  | 'annualYieldTons'
  | 'firstHarvestDays'
  | 'ratoonCycleDays'
  | 'bioCngPotential'
  | 'suitableSoils'
>;

// Options shown in the estimator form; `factor` is the share of full yield for that water supply.
export const SOIL_TYPES = ['Black Cotton', 'Loamy', 'Red Soil', 'Alluvial', 'Sandy Loam', 'Marginal Lands'];

export const IRRIGATION_LEVELS = [
  { value: 'Assured Drip / Borewell', short: 'Assured', factor: 1 },
  { value: 'Moderate Canal / Rainfed + Supplemental', short: 'Moderate', factor: 0.82 },
  { value: 'Rainfed Only', short: 'Rainfed', factor: 0.6 },
];

// `fodderShare` is the part of the harvest fed to cattle; the rest goes to the digester.
export const GOALS = [
  { value: 'BIO_CNG_BIOMASS', label: 'Bio-CNG', fodderShare: 0 },
  { value: 'DUAL_PURPOSE', label: 'Bio-CNG + Fodder', fodderShare: 0.5 },
  { value: 'DAIRY_FODDER', label: 'Fodder only', fodderShare: 1 },
];

// Situation questions used to match a strain to the farm, not just to the highest yield.
export const ANIMALS = [
  { value: 'cows', label: 'Dairy cows / buffalo' },
  { value: 'goats', label: 'Goats or sheep' },
];
export const FEEDING = [
  { value: 'cut', label: 'Cut and carried' },
  { value: 'graze', label: 'Grazed in the field' },
];
export const SUNLIGHT = [
  { value: 'open', label: 'Open field' },
  { value: 'shaded', label: 'Partly shaded (orchard, coconut)' },
];
// `weights` split the match score between output per acre, feed quality and fit to the situation.
export const PRIORITIES = [
  { value: 'tonnage', label: 'Most tonnage', weights: { output: 0.5, quality: 0.05, fit: 0.45 } },
  { value: 'balanced', label: 'Balanced', weights: { output: 0.3, quality: 0.2, fit: 0.5 } },
  { value: 'quality', label: 'Best feed quality', weights: { output: 0.1, quality: 0.4, fit: 0.5 } },
];
// Used when an estimate (or an older saved one) doesn't answer the situation questions.
export const SITUATION_DEFAULTS = { animals: 'cows', feeding: 'cut', sunlight: 'open', priority: 'balanced' };

export const MIN_ACRES = 0.5;
export const MAX_ACRES = 500;

// Strain slugs, so each strain's published strengths can be matched to the farmer's answers.
const PAKCHONG = 'super-napier-pakchong-1';
const GIANT_KING = 'giant-king-biomass';
const CO5 = 'tnau-co-5-hybrid';
const RED = 'red-napier-anthocyanin';
const DWARF = 'smart-dwarf-napier';

// How well each strain suits each answer (1 = ideal). Model judgement from each strain's published strengths.
const FIT: Record<string, Record<string, Record<string, number>>> = {
  animals: {
    none: { [PAKCHONG]: 0.7, [GIANT_KING]: 1, [CO5]: 0.55, [RED]: 0.4, [DWARF]: 0.2 },
    cows: { [PAKCHONG]: 1, [GIANT_KING]: 0.35, [CO5]: 0.9, [RED]: 0.85, [DWARF]: 0.6 },
    goats: { [PAKCHONG]: 0.55, [GIANT_KING]: 0.25, [CO5]: 0.7, [RED]: 1, [DWARF]: 1 },
  },
  feeding: {
    cut: { [PAKCHONG]: 1, [GIANT_KING]: 1, [CO5]: 1, [RED]: 0.85, [DWARF]: 0.45 },
    graze: { [PAKCHONG]: 0.25, [GIANT_KING]: 0.15, [CO5]: 0.35, [RED]: 0.65, [DWARF]: 1 },
  },
  sunlight: {
    open: { [PAKCHONG]: 1, [GIANT_KING]: 1, [CO5]: 1, [RED]: 1, [DWARF]: 1 },
    shaded: { [PAKCHONG]: 0.35, [GIANT_KING]: 0.3, [CO5]: 1, [RED]: 0.4, [DWARF]: 0.45 },
  },
};
const fitOf = (table: Record<string, number>, slug: string) => table[slug] ?? 0.6; // unknown strains sit mid-way

const COW_FODDER_TONS_PER_YEAR = 14.6; // ~40 kg green fodder per adult cow per day
const STEMS_PER_ACRE = 11000; // two-node setts at ~2 × 2 ft spacing
const UNSUITED_SOIL_FACTOR = 0.8; // 20% lower yield on a soil the strain isn't suited to
const UNSUITED_SOIL_SCORE = 0.75; // match score ×0.75 on a soil the strain isn't listed for
const NO_SHADE_TRIAL_SCORE = 0.8; // on a shaded plot, match score ×0.8 for strains without a published shade trial
const ORGANIC_SHARE_OF_DM = 0.862; // Feedipedia: 13.8% of Napier dry matter is ash, which makes no methane
const YEAR_FACTORS = [1, 1, 1, 1, 1]; // no published decline rate, so yields are held steady after year 1
const CBG_KG_PER_M3_METHANE = 0.72; // density of methane at standard conditions
const CO2_KG_PER_KG_CBG = 2.75; // fossil CO₂ released by burning the same mass of natural gas

// Compressed biogas per day, assuming year-round digester operation.
export function cbgKgPerDay(methaneM3PerYear: number) {
  return Math.round((methaneM3PerYear * CBG_KG_PER_M3_METHANE) / 365);
}

// Fossil CO₂ avoided per year when this CBG replaces fossil CNG.
export function co2AvoidedTons(methaneM3PerYear: number) {
  return Math.round((methaneM3PerYear * CBG_KG_PER_M3_METHANE * CO2_KG_PER_KG_CBG) / 1000);
}

export type SimInput = {
  landAcres: number;
  soilType: string;
  irrigationLevel: string;
  primaryGoal: string;
  // Situation answers; optional so API callers and older saved estimates still work.
  animals?: string | null;
  feeding?: string | null;
  sunlight?: string | null;
  priority?: string | null;
};

export type YearProjection = { year: string; tons: number; cumulative: number };

// One strain's place in the recommendation: match score (0–100) and plain-language reasons.
export type RankedStrain = { strain: SimStrain; score: number; reasons: string[]; cautions: string[] };

export type SimResult = {
  strain: SimStrain;
  ranking: RankedStrain[];
  soilSuited: boolean;
  estimatedAnnualTons: number;
  dryMatterTons: number;
  cattleSupported: number;
  bioCngCubicMeters: number;
  cbgKgPerDay: number;
  co2AvoidedTons: number;
  stemsRequired: number;
  projection: YearProjection[];
};

// Reads the methane figure from a strain's text, e.g. "Up to ~250 m³ CH₄ …" → 250 (null if there is none).
export function publishedMethane(strain: Pick<SimStrain, 'bioCngPotential'>) {
  const unitAt = strain.bioCngPotential.indexOf('m³');
  if (unitAt === -1) return null;
  // Walk back over the digits just before "m³".
  const before = strain.bioCngPotential.slice(0, unitAt).trimEnd();
  let start = before.length;
  while (start > 0 && before[start - 1] >= '0' && before[start - 1] <= '9') start--;
  return start < before.length ? Number(before.slice(start)) : null;
}

// Leafy strains without a published figure get a conservative default for calculations.
export function methanePerTonDm(strain: Pick<SimStrain, 'bioCngPotential'>) {
  return publishedMethane(strain) ?? 250;
}

// Checks the land size and every choice are within the allowed options.
export function isValidInput(input: SimInput) {
  return (
    Number.isFinite(input.landAcres) &&
    input.landAcres >= MIN_ACRES &&
    input.landAcres <= MAX_ACRES &&
    SOIL_TYPES.includes(input.soilType) &&
    IRRIGATION_LEVELS.some((i) => i.value === input.irrigationLevel) &&
    GOALS.some((g) => g.value === input.primaryGoal) &&
    (!input.animals || ANIMALS.some((a) => a.value === input.animals)) &&
    (!input.feeding || FEEDING.some((f) => f.value === input.feeding)) &&
    (!input.sunlight || SUNLIGHT.some((s) => s.value === input.sunlight)) &&
    (!input.priority || PRIORITIES.some((p) => p.value === input.priority))
  );
}

// The situation answers, with defaults filled in for any that are missing.
export function situationOf(input: SimInput) {
  return {
    animals: input.animals || SITUATION_DEFAULTS.animals,
    feeding: input.feeding || SITUATION_DEFAULTS.feeding,
    sunlight: input.sunlight || SITUATION_DEFAULTS.sunlight,
    priority: input.priority || SITUATION_DEFAULTS.priority,
  };
}

// Fresh tons per acre a year after the water-supply and soil adjustments.
function yieldPerAcre(strain: SimStrain, input: SimInput) {
  const irrigation = IRRIGATION_LEVELS.find((i) => i.value === input.irrigationLevel)?.factor ?? 1;
  const soil = strain.suitableSoils.includes(input.soilType) ? 1 : UNSUITED_SOIL_FACTOR;
  return strain.annualYieldTons * irrigation * soil;
}

// Strain strengths quoted as reasons when they match the farmer's answers.
const GOAT_FEED: Record<string, string> = {
  [RED]: 'Anthocyanin-rich silage studied for dairy goats',
  [DWARF]: 'Leafy, high-quality feed for goats and sheep',
};
const DAIRY_FEED: Record<string, string> = { [PAKCHONG]: 'Proven dairy fodder', [CO5]: 'Proven dairy fodder' };
const GRAZING: Record<string, string> = { [DWARF]: 'Short and leafy: made for grazing', [RED]: 'Semi-dwarf, so it can be grazed' };

// Plain-language reasons for a strain's place: each check is shown when it applies, as a reason or a caution.
function reasonsFor(strain: SimStrain, input: SimInput, outputShare: number) {
  const { animals, feeding, sunlight } = situationOf(input);
  const forAnimals = (GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0) > 0;
  const slug = strain.slug;
  const suited = strain.suitableSoils.includes(input.soilType);
  const shadeTrial = slug === CO5;

  const checks = [
    { show: true, good: suited, text: suited ? `Grows well in ${input.soilType}` : `Not listed for ${input.soilType} soil` },
    {
      show: sunlight === 'shaded',
      good: shadeTrial,
      text: shadeTrial ? 'Still yields under 50% shade in a published trial' : 'No published shade trial; expect a lower yield',
    },
    { show: forAnimals && animals === 'goats' && slug in GOAT_FEED, good: true, text: GOAT_FEED[slug] },
    { show: forAnimals && animals === 'cows' && slug in DAIRY_FEED, good: true, text: DAIRY_FEED[slug] },
    { show: forAnimals && feeding === 'graze', good: slug in GRAZING, text: GRAZING[slug] ?? 'Tall: better cut and carried than grazed' },
    { show: forAnimals && strain.crudeProtein >= 16, good: true, text: `High protein (${strain.crudeProtein}%)` },
    { show: forAnimals && strain.crudeProtein < 11, good: false, text: `Low protein (${strain.crudeProtein}%) for feeding animals` },
    { show: !forAnimals && slug === GIANT_KING, good: true, text: 'Grown for biomass tonnage' },
    { show: outputShare >= 0.95, good: true, text: forAnimals ? 'Most output per acre of the five' : 'Most methane per acre of the five' },
  ].filter((c) => c.show);

  return { reasons: checks.filter((c) => c.good).map((c) => c.text), cautions: checks.filter((c) => !c.good).map((c) => c.text) };
}

// Ranks every strain by how well it fits the farm: output per acre, feed quality and the situation answers.
// Output uses a square root so a strain with 3× the tonnage gains, but can't outweigh everything else.
export function rankStrains(strains: SimStrain[], input: SimInput): RankedStrain[] {
  const share = GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0.5;
  const { animals, feeding, sunlight, priority } = situationOf(input);
  const weights = (PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1]).weights;

  const rows = strains.map((s) => {
    const tons = yieldPerAcre(s, input);
    return { s, dairy: tons * s.crudeProtein, gas: tons * (s.dryMatter / 100) * methanePerTonDm(s) };
  });
  const maxDairy = Math.max(...rows.map((r) => r.dairy));
  const maxGas = Math.max(...rows.map((r) => r.gas));
  const maxProtein = Math.max(...strains.map((s) => s.crudeProtein));

  return rows
    .map(({ s, dairy, gas }) => {
      const outputShare = share * (dairy / maxDairy) + (1 - share) * (gas / maxGas);
      const quality = s.crudeProtein / maxProtein;
      const fits = [fitOf(FIT.animals[share > 0 ? animals : 'none'], s.slug), fitOf(FIT.sunlight[sunlight], s.slug)];
      if (share > 0) fits.push(fitOf(FIT.feeding[feeding], s.slug));
      const fit = fits.reduce((a, b) => a + b, 0) / fits.length;

      const soilFactor = s.suitableSoils.includes(input.soilType) ? 1 : UNSUITED_SOIL_SCORE;
      const shadeFactor = sunlight === 'shaded' && s.slug !== CO5 ? NO_SHADE_TRIAL_SCORE : 1;
      const raw = weights.output * Math.sqrt(outputShare) + weights.quality * quality + weights.fit * fit;
      return { strain: s, score: Math.round(soilFactor * shadeFactor * raw * 100), ...reasonsFor(s, input, outputShare) };
    })
    .sort((a, b) => b.score - a.score);
}

// Full estimate: picks the best-matching strain, then works out biomass, gas, CO₂, cattle and the 5-year projection.
export function simulate(strains: SimStrain[], input: SimInput): SimResult {
  const ranking = rankStrains(strains, input);
  const strain = ranking[0].strain;
  const share = GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0.5;
  const annualTons = yieldPerAcre(strain, input) * input.landAcres;

  // Year 1 loses the establishment period before the first cut.
  const cutsPerYear = 365 / strain.ratoonCycleDays;
  const firstYearCuts = 1 + Math.floor((365 - strain.firstHarvestDays) / strain.ratoonCycleDays);
  const perCut = annualTons / cutsPerYear;

  let cumulative = 0;
  const projection = YEAR_FACTORS.map((factor, i) => {
    const tons = Math.round((i === 0 ? perCut * firstYearCuts : annualTons) * factor);
    cumulative += tons;
    return { year: `Year ${i + 1}`, tons, cumulative };
  });

  // Only the Bio-CNG share of the harvest, and only its organic part, makes methane.
  const methane = Math.round(
    annualTons * (1 - share) * (strain.dryMatter / 100) * ORGANIC_SHARE_OF_DM * methanePerTonDm(strain),
  );

  return {
    strain,
    ranking,
    soilSuited: strain.suitableSoils.includes(input.soilType),
    estimatedAnnualTons: Math.round(annualTons),
    dryMatterTons: Math.round(annualTons * (strain.dryMatter / 100)),
    cattleSupported: Math.floor((annualTons * share) / COW_FODDER_TONS_PER_YEAR),
    bioCngCubicMeters: methane,
    cbgKgPerDay: cbgKgPerDay(methane),
    co2AvoidedTons: co2AvoidedTons(methane),
    stemsRequired: Math.round(input.landAcres * STEMS_PER_ACRE),
    projection,
  };
}
