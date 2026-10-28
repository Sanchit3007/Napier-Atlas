import {
  ANIMALS,
  FEEDING,
  GOALS,
  PRIORITIES,
  SUNLIGHT,
  situationOf,
  type RankedStrain,
  type SimInput,
  type SimResult,
  type YearProjection,
} from '@/lib/simulator';

// Everything the CSV file and the printable report need, as plain serialisable data.
export type EstimateExport = {
  landAcres: number;
  soilType: string;
  irrigationLevel: string;
  goal: string;
  situation: [label: string, answer: string][]; // e.g. ["Sunlight on the plot", "Open field"]
  topMatches: { name: string; score: number }[]; // best three strains with their match %
  strainName: string;
  soilSuited: boolean;
  estimatedAnnualTons: number;
  bioCngCubicMeters: number;
  cbgKgPerDay: number;
  co2AvoidedTons: number;
  dryMatterTons: number;
  stemsRequired: number;
  cattleSupported: number;
  projection: YearProjection[];
  savedAt?: string; // ISO date, only for saved estimates
  path?: string; // e.g. /simulation/<id>, only for saved estimates
};

const labelOf = (list: { value: string; label: string }[], value: string) => list.find((o) => o.value === value)?.label ?? value;

// The situation answers as readable label/answer pairs; animal questions only apply when some harvest is fed.
export function situationLabels(input: SimInput): [string, string][] {
  const s = situationOf(input);
  const feedsAnimals = (GOALS.find((g) => g.value === input.primaryGoal)?.fodderShare ?? 0) > 0;
  return [
    ...(feedsAnimals
      ? ([
          ['Animals fed', labelOf(ANIMALS, s.animals)],
          ['How they eat it', labelOf(FEEDING, s.feeding)],
        ] as [string, string][])
      : []),
    ['Sunlight on the plot', labelOf(SUNLIGHT, s.sunlight)],
    ['What matters most', labelOf(PRIORITIES, s.priority)],
  ];
}

// Packs an estimate's inputs and results for the CSV and PDF downloads.
// `ranking` defaults to the result's own; saved pages pass the ranking across all strains.
export function toEstimateExport(
  input: SimInput,
  result: SimResult,
  saved?: { savedAt: Date; path: string },
  ranking: RankedStrain[] = result.ranking,
): EstimateExport {
  return {
    landAcres: input.landAcres,
    soilType: input.soilType,
    irrigationLevel: input.irrigationLevel,
    goal: GOALS.find((g) => g.value === input.primaryGoal)?.label ?? input.primaryGoal,
    situation: situationLabels(input),
    topMatches: ranking.slice(0, 3).map((r) => ({ name: r.strain.name, score: r.score })),
    strainName: result.strain.name,
    soilSuited: result.soilSuited,
    estimatedAnnualTons: result.estimatedAnnualTons,
    bioCngCubicMeters: result.bioCngCubicMeters,
    cbgKgPerDay: result.cbgKgPerDay,
    co2AvoidedTons: result.co2AvoidedTons,
    dryMatterTons: result.dryMatterTons,
    stemsRequired: result.stemsRequired,
    cattleSupported: result.cattleSupported,
    projection: result.projection,
    savedAt: saved?.savedAt.toISOString(),
    path: saved?.path,
  };
}

// Dates like "28 Oct 2026".
export const formatEstimateDate = (date: Date) => date.toLocaleDateString('en-IN', { dateStyle: 'medium' });

// Download file name, e.g. "napier-estimate-10-acres-2026-10-28".
export function estimateFileName(e: EstimateExport, date: Date) {
  return `napier-estimate-${e.landAcres}-acres-${date.toISOString().slice(0, 10)}`;
}

const cell = (value: string | number) => {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

// The CSV file: inputs and results first, then the 5-year projection table.
export function estimateCsv(e: EstimateExport, date: Date, origin: string) {
  const rows: (string | number)[][] = [
    ['NapierAtlas Bio-CNG estimate', '', ''],
    ['Item', 'Value', 'Unit'],
    ['Date', formatEstimateDate(date), ''],
    ['Land size', e.landAcres, 'acres'],
    ['Soil type', e.soilType, ''],
    ['Irrigation', e.irrigationLevel, ''],
    ['Primary goal', e.goal, ''],
    ...e.situation.map(([label, answer]) => [label, answer, '']),
    ['Recommended strain', e.strainName, ''],
    ['Fresh biomass / year', e.estimatedAnnualTons, 'tons'],
    ['Methane / year', e.bioCngCubicMeters, 'm³ CH₄'],
    ['Bio-CNG output', e.cbgKgPerDay, 'kg per day'],
    ['Fossil CO₂ avoided / year', e.co2AvoidedTons, 'tons'],
    ['Dry matter / year', e.dryMatterTons, 'tons'],
    ['Stem cuttings to plant', e.stemsRequired, 'cuttings'],
    ['Cattle fed from fodder share', e.cattleSupported, 'cattle'],
    ['', '', ''],
    ['Best matches', 'Match score', ''],
    ...e.topMatches.map((m, i) => [`${i + 1}. ${m.name}`, `${m.score}%`, '']),
    ['', '', ''],
    ['Year', 'Biomass that year (tons)', 'Cumulative (tons)'],
    ...e.projection.map((p) => [p.year, p.tons, p.cumulative]),
  ];
  if (e.path) rows.push(['', '', ''], ['Saved estimate link', `${origin}${e.path}`, '']);
  return rows.map((r) => r.map(cell).join(',')).join('\r\n');
}
