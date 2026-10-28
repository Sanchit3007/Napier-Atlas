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

export const MIN_ACRES = 0.5;
export const MAX_ACRES = 500;

const COW_FODDER_TONS_PER_YEAR = 14.6; // ~40 kg green fodder per adult cow per day
const STEMS_PER_ACRE = 11000; // two-node setts at ~2 × 2 ft spacing
const UNSUITED_SOIL_FACTOR = 0.8; // 20% lower yield on a soil the strain isn't suited to
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
};

export type YearProjection = { year: string; tons: number; cumulative: number };

export type SimResult = {
  strain: SimStrain;
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
  const match = /(\d+) ?m³/.exec(strain.bioCngPotential);
  return match ? Number(match[1]) : null;
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
    GOALS.some((g) => g.value === input.primaryGoal)
  );
}

// Fresh tons per acre a year after the water-supply and soil adjustments.
function yieldPerAcre(strain: SimStrain, input: SimInput) {
  const irrigation = IRRIGATION_LEVELS.find((i) => i.value === input.irrigationLevel)?.factor ?? 1;
  const soil = strain.suitableSoils.includes(input.soilType) ? 1 : UNSUITED_SOIL_FACTOR;
  return strain.annualYieldTons * irrigation * soil;
}

// Scores each strain on protein output (dairy) and methane output (Bio-CNG), weighted by the goal.
function recommendStrain(strains: SimStrain[], input: SimInput) {
  const share = GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0.5;
  const scored = strains.map((s) => {
    const tons = yieldPerAcre(s, input);
    return {
      strain: s,
      dairy: tons * s.crudeProtein,
      cng: tons * (s.dryMatter / 100) * ORGANIC_SHARE_OF_DM * methanePerTonDm(s),
    };
  });
  const maxDairy = Math.max(...scored.map((s) => s.dairy));
  const maxCng = Math.max(...scored.map((s) => s.cng));
  return scored.reduce((best, s) => {
    const score = (x: typeof s) => share * (x.dairy / maxDairy) + (1 - share) * (x.cng / maxCng);
    return score(s) > score(best) ? s : best;
  }).strain;
}

// Full estimate: picks the best strain, then works out biomass, gas, CO₂, cattle and the 5-year projection.
export function simulate(strains: SimStrain[], input: SimInput): SimResult {
  const strain = recommendStrain(strains, input);
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
