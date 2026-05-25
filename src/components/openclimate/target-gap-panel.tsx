import type {
  OpenClimateBaselineComparison,
  OpenClimateTargetGap,
} from "@/lib/openclimate-types";

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat("en-US");

type TargetGapPanelProps = {
  targetGap: OpenClimateTargetGap;
  baselineComparison: OpenClimateBaselineComparison;
  planningTargetYear: number;
};

function narrativeCopy(targetGap: OpenClimateTargetGap): string {
  switch (targetGap.narrative) {
    case "ahead":
      return "Tracked programmatic reductions exceed the nearest official OpenClimate target.";
    case "behind":
      return "Modeled reductions trail the nearest official OpenClimate target — more action needed.";
    case "aligned":
      return "Tracked reductions align with the nearest official OpenClimate target.";
    default:
      return "No official OpenClimate target matched this planning horizon — compare local baseline only.";
  }
}

export function TargetGapPanel({
  targetGap,
  baselineComparison,
  planningTargetYear,
}: TargetGapPanelProps) {
  return (
    <section className="rounded-[10px] border border-white/12 bg-brand-surface/90 p-6 shadow-brand sm:p-8">
      <div className="mb-6 border-b border-white/10 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green-soft">
          Progress vs OpenClimate
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-white">
          Target gap analysis
        </h2>
        <p className="mt-2 text-sm text-white/58">{narrativeCopy(targetGap)}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[8px] border border-white/10 bg-black/15 p-4">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
            Local tracked reductions
          </dt>
          <dd className="mt-2 font-mono text-2xl tabular-nums text-brand-accent">
            {percentFormatter.format(targetGap.localReductionPercent)}%
          </dd>
          <dd className="mt-1 text-xs text-white/50">of inventoried baseline (Postgres actions)</dd>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-black/15 p-4">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
            Official OpenClimate target
          </dt>
          {targetGap.officialTargetPercent !== null ? (
            <>
              <dd className="mt-2 font-mono text-2xl tabular-nums text-white">
                {percentFormatter.format(targetGap.officialTargetPercent)}%
              </dd>
              <dd className="mt-1 text-xs text-white/50">
                by {targetGap.officialTargetYear} · nearest to plan year {planningTargetYear}
              </dd>
            </>
          ) : (
            <dd className="mt-2 text-sm text-white/55">Not indexed for this actor</dd>
          )}
        </div>

        {targetGap.gapPercentPoints !== null ? (
          <div className="rounded-[8px] border border-white/10 bg-black/15 p-4 sm:col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
              Gap (local − official)
            </dt>
            <dd
              className={`mt-2 font-mono text-2xl tabular-nums ${
                targetGap.gapPercentPoints >= 0 ? "text-brand-accent" : "text-[#ffb877]"
              }`}
            >
              {targetGap.gapPercentPoints >= 0 ? "+" : ""}
              {percentFormatter.format(targetGap.gapPercentPoints)} pp
            </dd>
          </div>
        ) : null}

        {baselineComparison.reportedEmissionsTons !== null ? (
          <div className="rounded-[8px] border border-white/10 bg-black/15 p-4 sm:col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
              Baseline cross-check
            </dt>
            <dd className="mt-2 text-sm text-white/72">
              Local baseline{" "}
              <span className="font-mono tabular-nums text-white">
                {numberFormatter.format(baselineComparison.localBaselineTons)} t/yr
              </span>{" "}
              vs OpenClimate reported{" "}
              <span className="font-mono tabular-nums text-white">
                {numberFormatter.format(baselineComparison.reportedEmissionsTons)} t
              </span>{" "}
              ({baselineComparison.reportedYear})
              {baselineComparison.deltaPercent !== null ? (
                <>
                  {" "}
                  · delta{" "}
                  <span className="font-mono text-brand-green-soft">
                    {baselineComparison.deltaPercent >= 0 ? "+" : ""}
                    {percentFormatter.format(baselineComparison.deltaPercent)}%
                  </span>
                </>
              ) : null}
            </dd>
            {baselineComparison.datasourceName ? (
              <dd className="mt-1 text-xs text-white/45">{baselineComparison.datasourceName}</dd>
            ) : null}
          </div>
        ) : null}
      </dl>
    </section>
  );
}
