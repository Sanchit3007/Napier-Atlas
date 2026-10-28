'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createSimulation, toSimInput } from '@/lib/simulations';
import { isHistoryKey } from '@/lib/history';

export type SaveSimulationState = { error: string | null };

// "Save & share": stores the estimate under the visitor's history key, then opens its saved page.
export async function saveSimulation(
  _prev: SaveSimulationState,
  formData: FormData,
): Promise<SaveSimulationState> {
  const key = formData.get('historyKey');
  const historyKey = isHistoryKey(key) ? key : undefined;

  let id: string;
  try {
    const saved = await createSimulation(toSimInput(Object.fromEntries(formData)), historyKey);
    if (!saved.ok) return { error: saved.error };
    id = saved.id;
  } catch (e) {
    console.error('saveSimulation failed', e);
    return { error: 'Could not save your estimate right now. Please try again.' };
  }

  if (historyKey) updateTag(`history-${historyKey}`);
  redirect(`/simulation/${id}?saved=1`);
}

// Only removes the estimate when it belongs to this history, so a key can't delete other people's estimates.
export async function removeEstimate(historyKey: string, id: string) {
  if (!isHistoryKey(historyKey) || !/^[a-f\d]{24}$/i.test(id)) return;
  await prisma.simulationLog.deleteMany({ where: { id, historyKey } });
  updateTag(`history-${historyKey}`);
  updateTag(`simulation-${id}`);
}

// "Clear all" on the history page: deletes every estimate in one visitor's history.
export async function clearHistory(historyKey: string) {
  if (!isHistoryKey(historyKey)) return;
  const saved = await prisma.simulationLog.findMany({ where: { historyKey }, select: { id: true } });
  await prisma.simulationLog.deleteMany({ where: { historyKey } });
  updateTag(`history-${historyKey}`);
  saved.forEach(({ id }) => updateTag(`simulation-${id}`));
}
