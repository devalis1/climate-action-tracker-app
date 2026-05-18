import {
  glidePathStartYearFromActions,
  isOnTrack,
  percentOfBaseline,
  totalAnnualReduction,
} from "@/lib/calculations";
import type { CityProfile } from "@/lib/schemas";

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

type ProfileMetricsProps = {
  profile: CityProfile;
};

export function DashboardSummary({ profile }: ProfileMetricsProps) {
  const totalReduction = totalAnnualReduction(profile.actions);
  const baselinePercent = percentOfBaseline(totalReduction, profile.baselineEmissions);

  const metrics = [
    {
      label: "Baseline",
      value: `${numberFormatter.format(profile.baselineEmissions)} tCO2e`,
      detail: "Annual city baseline"
    },
    {
      label: "Target",
      value: profile.targetYear.toString(),
      detail: "Net-zero planning year"
    },
    {
      label: "Actions",
      value: profile.actions.length.toString(),
      detail: "Tracked initiatives"
    },
    {
      label: "Reductions",
      value: `${numberFormatter.format(totalReduction)} t/yr`,
      detail: `${percentFormatter.format(baselinePercent)}% of baseline`
    }
  ];

  return (
    <section
      aria-label="Key emissions metrics"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
    >
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="flex min-h-[148px] flex-col justify-between rounded-[10px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] p-5 shadow-brand sm:p-6"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brand-cyan-soft/95">
            {metric.label}
          </p>
          <p className="mt-5 font-mono text-xl font-medium tabular-nums tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
            {metric.value}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/60 sm:text-sm">
            {metric.detail}
          </p>
        </article>
      ))}
    </section>
  );
}

export function TrackStatusPanel({ profile }: ProfileMetricsProps) {
  const totalReduction = totalAnnualReduction(profile.actions);
  const glideStart = glidePathStartYearFromActions(
    profile.actions,
    profile.targetYear,
  );
  const onTrack = isOnTrack(
    totalReduction,
    profile.baselineEmissions,
    profile.targetYear,
    glideStart,
  );

  return (
    <aside
      aria-label="Progress versus baseline"
      className="rounded-[10px] border border-brand-accent/45 bg-brand-surface/95 p-6 shadow-brand backdrop-blur-sm sm:p-7"
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-accent">
            Track status
          </p>
          <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-white sm:text-2xl">
            {profile.city} is {onTrack ? "on track" : "not yet on track"} for
            summed modeled reductions versus the city baseline.
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Deterministic glide from {glideStart}→{profile.targetYear}: modeled reductions should
            keep pace with a linear wedge of the baseline disappearing by the net-zero horizon.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-5 py-2 font-heading text-xs uppercase tracking-[0.16em] ${
            onTrack
              ? "border-brand-accent text-brand-accent"
              : "border-[#ffb877] text-[#ffb877]"
          }`}
        >
          {onTrack ? "On track" : "Needs acceleration"}
        </span>
      </div>
    </aside>
  );
}
