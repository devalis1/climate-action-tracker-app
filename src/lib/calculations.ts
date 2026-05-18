import type { ClimateAction } from "@/lib/schemas";

export function totalAnnualReduction(actions: ClimateAction[]): number {
  return actions.reduce((total, action) => total + action.annualReduction, 0);
}

export function percentOfBaseline(reduction: number, baseline: number): number {
  if (baseline <= 0) {
    return 0;
  }

  return (reduction / baseline) * 100;
}

function clampFraction(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * When there are tracked actions we anchor the glide path on the earliest `startYear`,
 * clipped so there is room to reach targetYear (“start before net-zero”).
 * When there are no actions we fall back to a nominal 12-year planning window preceding
 * `targetYear`, still clipped to stay before net-zero — this avoids division-by-zero
 * while documenting that demos without modeled actions behave like zero reduction.
 *
 * Sprint 4 heuristic (demo): modeled annual programmatic reductions (`summedAnnualReduction`)
 * should meet-or-beat a linear wedge of eliminating `baselineAnnual` over `[glideStart, targetYear]`.
 */
export function glidePathStartYearFromActions(
  actions: readonly Pick<ClimateAction, "startYear">[],
  targetYear: number,
): number {
  if (targetYear <= 1900 + 1) {
    return 1900;
  }

  if (actions.length > 0) {
    const earliest = Math.min(...actions.map((action) => action.startYear));
    return Math.min(earliest, targetYear - 1);
  }

  const nominal = Math.max(1900, targetYear - 12);
  return Math.min(nominal, targetYear - 1);
}

export function projectedLinearAnnualReductionDemand(
  baselineAnnualEmissions: number,
  glideStartYear: number,
  targetYear: number,
  currentYear: number,
): number {
  if (baselineAnnualEmissions <= 0) {
    return 0;
  }

  const spanYears = Math.max(1, targetYear - glideStartYear);
  const elapsedYears = Math.min(
    spanYears,
    Math.max(0, currentYear - glideStartYear),
  );
  const fraction = elapsedYears / spanYears;
  return baselineAnnualEmissions * clampFraction(fraction);
}

/**
 * Determines whether summed modeled reductions are ahead of an idealized linear glide path toward
 * net-zero modeled as eliminating the baseline wedge by targetYear starting at glideStartYear.
 */
export function isOnTrack(
  summedAnnualReduction: number,
  baselineAnnualEmissions: number,
  targetYear: number,
  glideStartYear: number,
  currentYear = new Date().getFullYear(),
): boolean {
  const demanded = projectedLinearAnnualReductionDemand(
    baselineAnnualEmissions,
    glideStartYear,
    targetYear,
    currentYear,
  );
  return summedAnnualReduction + 1e-6 >= demanded;
}

/**
 * Idealized trajectory of remaining annual emissions if the city linearly phases out
 * the inventoried baseline from glideStartYear through targetYear (0 at net-zero year).
 * Years before glideStartYear are modeled at full baseline; after targetYear as zero.
 */
export function projectedAnnualEmissionsTonsForYear(
  baselineAnnualEmissions: number,
  glideStartYear: number,
  targetYear: number,
  year: number,
): number {
  if (baselineAnnualEmissions <= 0) {
    return 0;
  }

  if (targetYear <= glideStartYear) {
    return year >= targetYear ? 0 : baselineAnnualEmissions;
  }

  if (year <= glideStartYear) {
    return baselineAnnualEmissions;
  }
  if (year >= targetYear) {
    return 0;
  }

  const spanYears = targetYear - glideStartYear;
  const elapsed = year - glideStartYear;
  const fraction = elapsed / spanYears;
  return baselineAnnualEmissions * (1 - clampFraction(fraction));
}
