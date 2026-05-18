import type {
  ClimateAction,
  CityProfile,
  Sector,
  Status,
} from "@/lib/schemas";

/** Shape compatible with rows from Postgres / `ClimateActionRecord` — kept local to avoid `server-only` churn. */
export type ClimateActionRowLike = {
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
};

export type CityRowLike = {
  name: string;
  baselineEmissionsTonsPerYear: number;
  targetYear: number;
};

export function climateActionRowToClimateAction(
  row: ClimateActionRowLike,
): ClimateAction {
  return {
    title: row.title,
    sector: row.sector,
    annualReduction: row.annualReductionTonsPerYear,
    status: row.status,
    startYear: row.startYear,
  };
}

export function cityAndClimateRowsToCityProfile(
  city: CityRowLike,
  actions: ClimateActionRowLike[],
): CityProfile {
  return {
    city: city.name,
    baselineEmissions: city.baselineEmissionsTonsPerYear,
    targetYear: city.targetYear,
    actions: actions.map(climateActionRowToClimateAction),
  };
}
