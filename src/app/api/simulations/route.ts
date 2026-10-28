import { createSimulation, toSimInput } from '@/lib/simulations';

// POST /api/simulations
// Body: { "landAcres": 10, "soilType": "Black Cotton", "irrigationLevel": "Assured Drip / Borewell", "primaryGoal": "BIO_CNG_BIOMASS" }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  try {
    const saved = await createSimulation(toSimInput(body as Record<string, unknown>));
    if (!saved.ok) return Response.json({ error: saved.error }, { status: 422 });

    const { strain, projection, ...figures } = saved.result;
    return Response.json(
      { id: saved.id, url: `/simulation/${saved.id}`, recommendedStrain: strain.name, ...figures, projection },
      { status: 201 },
    );
  } catch (e) {
    console.error('POST /api/simulations failed', e);
    return Response.json({ error: 'Could not save the simulation.' }, { status: 500 });
  }
}
