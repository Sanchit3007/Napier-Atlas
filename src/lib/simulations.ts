import { prisma } from '@/lib/prisma';
import { getStrains } from '@/lib/strains';
import { isValidInput, simulate, type SimInput, type SimResult } from '@/lib/simulator';

export type CreateSimulationResult =
  | { ok: true; id: string; result: SimResult }
  | { ok: false; error: string };

// Keeps a field only if it is text; anything else becomes "" and fails validation.
const text = (value: unknown) => (typeof value === 'string' ? value : '');

// Turns raw form or API fields into a typed estimator input.
export function toSimInput(raw: Record<string, unknown>): SimInput {
  return {
    landAcres: Number(raw.landAcres),
    soilType: text(raw.soilType),
    irrigationLevel: text(raw.irrigationLevel),
    primaryGoal: text(raw.primaryGoal),
  };
}

// Shared by the simulator's Server Action and POST /api/simulations.
// Figures are always recomputed here so the stored results can't be tampered with by the client.
export async function createSimulation(input: SimInput, historyKey?: string): Promise<CreateSimulationResult> {
  if (!isValidInput(input)) {
    return { ok: false, error: 'Please check the land size and selections, then try again.' };
  }

  const result = simulate(await getStrains(), input);
  const log = await prisma.simulationLog.create({
    data: {
      ...input,
      recommendedStrain: result.strain.name,
      estimatedAnnualTons: result.estimatedAnnualTons,
      cattleSupported: result.cattleSupported,
      bioCngCubicMeters: result.bioCngCubicMeters,
      stemsRequired: result.stemsRequired,
      historyKey,
    },
  });
  return { ok: true, id: log.id, result };
}
