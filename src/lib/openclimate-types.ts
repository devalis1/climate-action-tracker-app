/** Client-safe DTOs for OpenClimate enrichment (no raw upstream payloads). */

export type OpenClimateTarget = {
  targetType: string;
  targetYear: number;
  targetValue: number;
  baselineYear: number | null;
};

export type OpenClimateBenchmarkEmissions = {
  datasourceId: string;
  datasourceName: string;
  publisher: string;
  year: number;
  totalEmissions: number;
  url: string | null;
};

export type OpenClimateEnrichment = {
  actorId: string;
  name: string;
  type: string;
  areaKm2: number | null;
  population: { year: number; population: number } | null;
  geographicPath: string[];
  targets: OpenClimateTarget[];
  benchmarkEmissions: OpenClimateBenchmarkEmissions | null;
  hasData: boolean;
};

export type OpenClimateSearchResult = {
  actorId: string;
  name: string;
  type: string;
  hasData: boolean | null;
  geographicPath: string[];
};

export type OpenClimateTargetGap = {
  localReductionPercent: number;
  officialTargetPercent: number | null;
  officialTargetYear: number | null;
  officialTargetType: string | null;
  gapPercentPoints: number | null;
  narrative: "ahead" | "behind" | "aligned" | "no_official_target";
};

export type OpenClimateBaselineComparison = {
  localBaselineTons: number;
  reportedEmissionsTons: number | null;
  reportedYear: number | null;
  deltaPercent: number | null;
  datasourceName: string | null;
};

export type OpenClimateCoverageStats = {
  numberOfCities: number;
  numberOfCitiesWithEmissions: number;
  numberOfCitiesWithTargets: number;
  numberOfEmissionsRecords: number;
};
