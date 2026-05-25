import type { OpenClimateCoverageStats } from "@/lib/openclimate-types";

const numberFormatter = new Intl.NumberFormat("en-US");

type OpenClimateAttributionProps = {
  actorId?: string | null;
  coverage?: OpenClimateCoverageStats | null;
  className?: string;
};

export function OpenClimateAttribution({
  actorId,
  coverage,
  className = "",
}: OpenClimateAttributionProps) {
  return (
    <footer
      className={`border-t border-white/10 bg-brand-bg-deep/80 ${className}`.trim()}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-accent">
            OpenClimate integration
          </p>
          <p className="mt-1 text-sm text-white/58">
            Live enrichment via{" "}
            <a
              className="text-brand-green-soft underline-offset-4 hover:underline"
              href="https://openclimate.network/"
              rel="noreferrer"
              target="_blank"
            >
              openclimate.network
            </a>
            {actorId ? (
              <>
                {" "}
                · actor{" "}
                <span className="font-mono text-white/72">{actorId}</span>
              </>
            ) : null}
          </p>
        </div>
        {coverage ? (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/45">
            {numberFormatter.format(coverage.numberOfCities)} cities indexed ·{" "}
            {numberFormatter.format(coverage.numberOfCitiesWithEmissions)} with emissions ·{" "}
            {numberFormatter.format(coverage.numberOfCitiesWithTargets)} with targets
          </p>
        ) : null}
      </div>
    </footer>
  );
}
