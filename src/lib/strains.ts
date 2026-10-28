import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

// All strains, highest yield first. Cached for hours because strain data rarely changes.
export async function getStrains() {
  'use cache';
  cacheLife('hours');
  cacheTag('strains');
  return prisma.napierStrain.findMany({ orderBy: { annualYieldTons: 'desc' } });
}

// One strain by its URL name (slug), for the strain detail page.
export async function getStrainBySlug(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('strains');
  return prisma.napierStrain.findUnique({ where: { slug } });
}

// One saved estimate by its ID. Saved estimates never change, so they are cached for days.
export async function getSimulation(id: string) {
  'use cache';
  cacheLife('days');
  cacheTag(`simulation-${id}`);
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return prisma.simulationLog.findUnique({ where: { id } });
}

// One visitor's saved estimates, newest first. Refreshed whenever they save or remove one.
export async function getHistory(key: string) {
  'use cache';
  cacheLife('days');
  cacheTag(`history-${key}`);
  return prisma.simulationLog.findMany({ where: { historyKey: key }, orderBy: { createdAt: 'desc' }, take: 100 });
}
