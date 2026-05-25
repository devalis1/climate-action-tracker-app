import { percentOfBaseline, totalAnnualReduction } from "@/lib/calculations";
import type { ClimateAction } from "@/lib/schemas";
import type {
  OpenClimateBaselineComparison,
  OpenClimateBenchmarkEmissions,
  OpenClimateTarget,
  OpenClimateTargetGap,
} from "@/lib/openclimate-types";

/** Pick the official target closest to the city's planning target year. */
export function pickNearestOfficialTarget(
  targets: readonly OpenClimateTarget[],
  planningTargetYear: number,
): OpenClimateTarget | null {
  if (targets.length === 0) return null;

  return targets.reduce<OpenClimateTarget | null>((best, current) => {
    if (!best) return current;
    const bestDelta = Math.abs(best.targetYear - planningTargetYear);
    const currentDelta = Math.abs(current.targetYear - planningTargetYear);
    return currentDelta < bestDelta ? current : best;
  }, null);
}

/** Prefer CDP self-reported citywide inventory when multiple benchmarks exist. */
export function pickPreferredBenchmark(
  benchmarks: readonly OpenClimateBenchmarkEmissions[],
): OpenClimateBenchmarkEmissions | null {
  if (benchmarks.length === 0) return null;

  const cdp = benchmarks.find((row) =>
    /cdp|city-wide|citywide/i.test(row.datasourceName),
  );
  if (cdp) return cdp;

  return [...benchmarks].sort((a, b) => b.year - a.year)[0] ?? null;
}

export function computeTargetGap(input: {
  actions: readonly ClimateAction[];
  baselineEmissions: number;
  planningTargetYear: number;
  officialTargets: readonly OpenClimateTarget[];
}): OpenClimateTargetGap {
  const localReduction = totalAnnualReduction(input.actions);
  const localReductionPercent = percentOfBaseline(
    localReduction,
    input.baselineEmissions,
  );

  const official = pickNearestOfficialTarget(
    input.officialTargets,
    input.planningTargetYear,
  );

  if (!official) {
    return {
      localReductionPercent,
      officialTargetPercent: null,
      officialTargetYear: null,
      officialTargetType: null,
      gapPercentPoints: null,
      narrative: "no_official_target",
    };
  }

  const gapPercentPoints = localReductionPercent - official.targetValue;
  let narrative: OpenClimateTargetGap["narrative"] = "aligned";
  if (gapPercentPoints > 1) narrative = "ahead";
  else if (gapPercentPoints < -1) narrative = "behind";

  return {
    localReductionPercent,
    officialTargetPercent: official.targetValue,
    officialTargetYear: official.targetYear,
    officialTargetType: official.targetType,
    gapPercentPoints,
    narrative,
  };
}

export function compareBaselineToOpenClimate(input: {
  localBaselineTons: number;
  benchmark: OpenClimateBenchmarkEmissions | null;
}): OpenClimateBaselineComparison {
  if (!input.benchmark || input.benchmark.totalEmissions <= 0) {
    return {
      localBaselineTons: input.localBaselineTons,
      reportedEmissionsTons: null,
      reportedYear: null,
      deltaPercent: null,
      datasourceName: null,
    };
  }

  const reported = input.benchmark.totalEmissions;
  const deltaPercent =
    ((input.localBaselineTons - reported) / reported) * 100;

  return {
    localBaselineTons: input.localBaselineTons,
    reportedEmissionsTons: reported,
    reportedYear: input.benchmark.year,
    deltaPercent,
    datasourceName: input.benchmark.datasourceName,
  };
}
