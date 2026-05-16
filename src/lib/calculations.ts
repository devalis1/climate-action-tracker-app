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

export function isOnTrack(
  reduction: number,
  baseline: number,
  targetYear: number,
  currentYear = new Date().getFullYear()
): boolean {
  void targetYear;
  void currentYear;

  // TODO Sprint 4: replace this placeholder with a projection against the target year.
  return percentOfBaseline(reduction, baseline) >= 20;
}
