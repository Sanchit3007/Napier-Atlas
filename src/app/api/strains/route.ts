import type { NextRequest } from 'next/server';
import { getStrains } from '@/lib/strains';

// GET /api/strains?q=pakchong&soil=Red%20Soil
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase();
  const soil = request.nextUrl.searchParams.get('soil');

  const strains = (await getStrains()).filter(
    (s) =>
      (!soil || s.suitableSoils.includes(soil)) &&
      (!q || [s.name, s.scientificName, s.origin, s.bestFor].some((f) => f.toLowerCase().includes(q))),
  );

  return Response.json({ count: strains.length, strains });
}
