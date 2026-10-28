import { GOALS, type SimInput, type SimResult, type YearProjection } from '@/lib/simulator';

// Everything the CSV file and the printable report need, as plain serialisable data.
export type EstimateExport = {
  landAcres: number;
  soilType: string;
  irrigationLevel: string;
  goal: string;
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

// Packs an estimate's inputs and results for the CSV and PDF downloads.
export function toEstimateExport(
  input: SimInput,
  result: SimResult,
  saved?: { savedAt: Date; path: string },
): EstimateExport {
  return {
    landAcres: input.landAcres,
    soilType: input.soilType,
    irrigationLevel: input.irrigationLevel,
    goal: GOALS.find((g) => g.value === input.primaryGoal)?.label ?? input.primaryGoal,
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
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
    ['Recommended strain', e.strainName, ''],
    ['Fresh biomass / year', e.estimatedAnnualTons, 'tons'],
    ['Methane / year', e.bioCngCubicMeters, 'm³ CH₄'],
    ['Bio-CNG output', e.cbgKgPerDay, 'kg per day'],
    ['Fossil CO₂ avoided / year', e.co2AvoidedTons, 'tons'],
    ['Dry matter / year', e.dryMatterTons, 'tons'],
    ['Stem cuttings to plant', e.stemsRequired, 'cuttings'],
    ['Cattle fed from fodder share', e.cattleSupported, 'cattle'],
    ['', '', ''],
    ['Year', 'Biomass that year (tons)', 'Cumulative (tons)'],
    ...e.projection.map((p) => [p.year, p.tons, p.cumulative]),
  ];
  if (e.path) rows.push(['', '', ''], ['Saved estimate link', `${origin}${e.path}`, '']);
  return rows.map((r) => r.map(cell).join(',')).join('\r\n');
}
