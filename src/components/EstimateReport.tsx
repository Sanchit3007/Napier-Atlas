import { formatEstimateDate, type EstimateExport } from '@/lib/estimate-export';

const n = (v: number) => v.toLocaleString('en-IN');

// The white report printed by "Save as PDF". It stays hidden on screen and is only shown when printing;
// the date and full link are filled in at that moment.
export default function EstimateReport({ estimate: e }: Readonly<{ estimate: EstimateExport }>) {
  const max = e.projection.at(-1)?.cumulative || 1;
  const metrics = [
    ['Fresh biomass / year', `${n(e.estimatedAnnualTons)} t`],
    ['Methane / year', `${n(e.bioCngCubicMeters)} m³`],
    ['Bio-CNG output', `${n(e.cbgKgPerDay)} kg/day`],
    ['Fossil CO₂ avoided / year', `${n(e.co2AvoidedTons)} t`],
  ];

  return (
    <article className="mx-auto max-w-2xl bg-white text-slate-900 text-sm leading-relaxed">
      <header className="flex justify-between gap-4 pb-3 border-b-2 border-emerald-700">
        <div>
          <div className="text-xl font-extrabold text-emerald-700">NapierAtlas</div>
          <div className="text-[10px] font-mono tracking-widest text-emerald-700">BIO-CNG KNOWLEDGE HUB</div>
        </div>
        <div className="text-right text-xs text-slate-600">
          Bio-CNG estimate
          <br />
          <span data-print-date>{e.savedAt ? formatEstimateDate(new Date(e.savedAt)) : ''}</span>
        </div>
      </header>

      <h1 className="mt-5 mb-3 text-2xl font-extrabold">
        {e.landAcres} acres · {e.goal}
      </h1>
      <dl className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Soil type</dt>
          <dd className="font-semibold">{e.soilType}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Irrigation</dt>
          <dd className="font-semibold">{e.irrigationLevel}</dd>
        </div>
      </dl>

      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="text-[11px] uppercase tracking-wide text-emerald-700">Recommended strain</div>
        <div className="text-base font-bold">{e.strainName}</div>
        {!e.soilSuited && <div className="text-xs text-amber-700">Not ideal for {e.soilType}, so yield is reduced by 20%</div>}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-2.5">
            <div className="font-mono font-bold">{value}</div>
            <div className="text-[11px] text-slate-600">{label}</div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs text-slate-700">
        {n(e.dryMatterTons)} t dry matter / year · {n(e.stemsRequired)} stem cuttings to plant
        {e.cattleSupported > 0 && ` · ${n(e.cattleSupported)} cattle fed from the fodder share`}
      </p>

      <table className="w-full text-xs tabular-nums">
        <thead>
          <tr className="text-left text-slate-600 border-b border-slate-300">
            <th className="py-1.5 pr-2 font-semibold">Year</th>
            <th className="py-1.5 pr-2 font-semibold">Harvested that year</th>
            <th className="py-1.5 pr-2 font-semibold">Cumulative total</th>
            <th className="py-1.5 w-1/3" />
          </tr>
        </thead>
        <tbody>
          {e.projection.map((p) => (
            <tr key={p.year} className="border-b border-slate-200">
              <td className="py-1.5 pr-2">{p.year}</td>
              <td className="py-1.5 pr-2">{n(p.tons)} t</td>
              <td className="py-1.5 pr-2">{n(p.cumulative)} t</td>
              <td className="py-1.5">
                <span className="block h-2 rounded-r bg-emerald-600" style={{ width: `${(p.cumulative / max) * 100}%` }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-[11px] text-slate-500">
        Estimates are for learning purposes, based on typical published strain values. Real output depends on local
        climate, crop management and digester efficiency.
        {e.path && (
          <>
            <br />
            Saved estimate: <span data-print-link={e.path}>{e.path}</span>
          </>
        )}
      </p>
    </article>
  );
}
