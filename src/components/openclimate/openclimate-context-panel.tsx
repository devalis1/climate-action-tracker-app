import type { OpenClimateEnrichment } from "@/lib/openclimate-types";

const numberFormatter = new Intl.NumberFormat("en-US");

type OpenClimateContextPanelProps = {
  enrichment: OpenClimateEnrichment;
};

export function OpenClimateContextPanel({ enrichment }: OpenClimateContextPanelProps) {
  const pathLabel =
    enrichment.geographicPath.length > 0
      ? enrichment.geographicPath.join(" → ")
      : enrichment.name;

  return (
    <section className="rounded-[10px] border border-brand-accent/25 bg-[linear-gradient(145deg,rgba(98,245,138,0.08)_0%,rgba(35,82,220,0.18)_45%,rgba(1,1,45,0.55)_100%)] p-6 shadow-brand sm:p-8">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-accent">
            Official data · OpenClimate
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">
            {enrichment.name}
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            {pathLabel}
          </p>
        </div>
        <p className="font-mono text-xs text-white/55">
          actor <span className="text-brand-green-soft">{enrichment.actorId}</span>
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {enrichment.population ? (
          <div className="rounded-[8px] border border-white/12 bg-black/20 p-4">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
              Population
            </dt>
            <dd className="mt-2 font-mono text-lg tabular-nums text-white">
              {numberFormatter.format(enrichment.population.population)}
            </dd>
            <dd className="mt-1 text-xs text-white/50">{enrichment.population.year} census</dd>
          </div>
        ) : null}

        {enrichment.areaKm2 ? (
          <div className="rounded-[8px] border border-white/12 bg-black/20 p-4">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
              Area
            </dt>
            <dd className="mt-2 font-mono text-lg tabular-nums text-white">
              {numberFormatter.format(enrichment.areaKm2)} km²
            </dd>
          </div>
        ) : null}

        {enrichment.benchmarkEmissions ? (
          <div className="rounded-[8px] border border-white/12 bg-black/20 p-4 sm:col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
              Benchmark emissions
            </dt>
            <dd className="mt-2 font-mono text-lg tabular-nums text-white">
              {numberFormatter.format(enrichment.benchmarkEmissions.totalEmissions)} tCO2e
            </dd>
            <dd className="mt-1 text-xs text-white/55">
              {enrichment.benchmarkEmissions.year} · {enrichment.benchmarkEmissions.publisher} ·{" "}
              {enrichment.benchmarkEmissions.datasourceName}
            </dd>
            {enrichment.benchmarkEmissions.url ? (
              <dd className="mt-2">
                <a
                  className="text-sm text-brand-green-soft underline-offset-4 hover:underline"
                  href={enrichment.benchmarkEmissions.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  View datasource
                </a>
              </dd>
            ) : null}
          </div>
        ) : null}
      </dl>

      {enrichment.targets.length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand-muted">
            Published targets
          </p>
          <ul className="mt-3 space-y-2">
            {enrichment.targets.map((target) => (
              <li
                key={`${target.targetType}-${target.targetYear}-${target.targetValue}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-white/78">{target.targetType}</span>
                <span className="font-mono tabular-nums text-brand-accent">
                  {target.targetValue}% by {target.targetYear}
                  {target.baselineYear ? (
                    <span className="text-white/45"> (baseline {target.baselineYear})</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-white/55">
          No official reduction targets indexed for this actor yet. Population and geography still
          resolve from OpenClimate.
        </p>
      )}
    </section>
  );
}
