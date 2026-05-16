/**
 * Maps dashboard sort controls → SQL ORDER BY fragments for climate_actions.
 * Uses a whitelist only — never interpolate arbitrary client strings into SQL.
 */

export type ClimateActionSortKey =
  | "startYear"
  | "title"
  | "sector"
  | "status"
  | "annualReduction";

export type SortDirection = "asc" | "desc";

const SORT_COLUMNS: Record<ClimateActionSortKey, string> = {
  startYear: "start_year",
  title: "title",
  sector: "sector",
  status: "status",
  annualReduction: "annual_reduction_tons_per_year",
};

/** Stable ordering for pagination: primary column + id tie-breaker (same direction). */
export function climateActionsOrderBySql(
  sort: ClimateActionSortKey,
  direction: SortDirection,
): string {
  const col = SORT_COLUMNS[sort];
  const dir = direction === "asc" ? "ASC" : "DESC";
  return `${col} ${dir}, id ${dir}`;
}
