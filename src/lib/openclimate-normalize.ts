import { pickPreferredBenchmark } from "@/lib/openclimate-comparison";
import type {
  OpenClimateBenchmarkEmissions,
  OpenClimateEnrichment,
  OpenClimateSearchResult,
  OpenClimateTarget,
} from "@/lib/openclimate-types";

type RawPopulationRow = {
  population?: number;
  year?: number;
};

type RawTargetRow = {
  target_type?: string;
  target_year?: number;
  target_value?: number | string;
  baseline_year?: number;
};

type RawEmissionsPoint = {
  year?: number;
  total_emissions?: number;
};

type RawEmissionsSource = {
  datasource_id?: string;
  name?: string;
  publisher?: string;
  URL?: string;
  data?: RawEmissionsPoint[];
};

type RawActorOverview = {
  actor_id?: string;
  name?: string;
  type?: string;
  area?: number;
  has_data?: boolean | null;
  population?: RawPopulationRow[];
  targets?: RawTargetRow[];
  emissions?: Record<string, RawEmissionsSource>;
};

type RawSearchActor = {
  actor_id?: string;
  name?: string;
  type?: string;
  has_data?: boolean | null;
  root_path_geo?: Array<{ name?: string }>;
};

type RawPathActor = {
  name?: string;
};

export function normalizeSearchResults(raw: unknown): OpenClimateSearchResult[] {
  if (!raw || typeof raw !== "object" || !("data" in raw)) return [];
  const data = (raw as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  return data
    .map((row): OpenClimateSearchResult | null => {
      const actor = row as RawSearchActor;
      if (!actor.actor_id || !actor.name) return null;
      return {
        actorId: actor.actor_id,
        name: actor.name,
        type: actor.type ?? "city",
        hasData: actor.has_data ?? null,
        geographicPath: (actor.root_path_geo ?? [])
          .map((part) => part.name)
          .filter((name): name is string => Boolean(name)),
      };
    })
    .filter((row): row is OpenClimateSearchResult => row !== null);
}

export function normalizeActorPath(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || !("data" in raw)) return [];
  const data = (raw as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return (data as RawPathActor[])
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));
}

function normalizeTargets(raw: RawTargetRow[] | undefined): OpenClimateTarget[] {
  if (!raw) return [];
  return raw
    .map((row) => {
      const targetYear =
        typeof row.target_year === "number" ? row.target_year : null;
      const targetValueRaw = row.target_value;
      const targetValue =
        typeof targetValueRaw === "number"
          ? targetValueRaw
          : typeof targetValueRaw === "string" && targetValueRaw.trim() !== ""
            ? Number(targetValueRaw)
            : NaN;

      if (targetYear === null || Number.isNaN(targetValue)) return null;

      return {
        targetType: row.target_type ?? "Target",
        targetYear,
        targetValue,
        baselineYear:
          typeof row.baseline_year === "number" ? row.baseline_year : null,
      };
    })
    .filter((row): row is OpenClimateTarget => row !== null);
}

function normalizeBenchmarks(
  emissions: Record<string, RawEmissionsSource> | undefined,
): OpenClimateBenchmarkEmissions[] {
  if (!emissions) return [];

  const rows: OpenClimateBenchmarkEmissions[] = [];

  for (const source of Object.values(emissions)) {
    const points = source.data ?? [];
    if (points.length === 0) continue;

    const latest = [...points].sort(
      (a, b) => (b.year ?? 0) - (a.year ?? 0),
    )[0];
    if (
      typeof latest.year !== "number" ||
      typeof latest.total_emissions !== "number"
    ) {
      continue;
    }

    rows.push({
      datasourceId: source.datasource_id ?? "unknown",
      datasourceName: source.name ?? "Emissions dataset",
      publisher: source.publisher ?? "Unknown",
      year: latest.year,
      totalEmissions: latest.total_emissions,
      url: source.URL ?? null,
    });
  }

  return rows;
}

function normalizeLatestPopulation(
  population: RawPopulationRow[] | undefined,
): { year: number; population: number } | null {
  if (!population?.length) return null;
  const sorted = [...population]
    .filter(
      (row) =>
        typeof row.year === "number" && typeof row.population === "number",
    )
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const latest = sorted[0];
  if (!latest) return null;
  return { year: latest.year as number, population: latest.population as number };
}

export function normalizeActorOverview(
  overviewRaw: unknown,
  pathNames: string[],
  emissionsRaw?: unknown,
): OpenClimateEnrichment | null {
  if (!overviewRaw || typeof overviewRaw !== "object" || !("data" in overviewRaw)) {
    return null;
  }

  const data = (overviewRaw as { data?: RawActorOverview }).data;
  if (!data?.actor_id || !data.name) return null;

  let emissionsBlock = data.emissions;
  if (
    emissionsRaw &&
    typeof emissionsRaw === "object" &&
    "data" in emissionsRaw &&
    (emissionsRaw as { data?: unknown }).data &&
    typeof (emissionsRaw as { data: unknown }).data === "object"
  ) {
    emissionsBlock = (emissionsRaw as { data: Record<string, RawEmissionsSource> })
      .data;
  }

  const benchmarks = normalizeBenchmarks(emissionsBlock);
  const preferred = pickPreferredBenchmark(benchmarks);

  return {
    actorId: data.actor_id,
    name: data.name,
    type: data.type ?? "city",
    areaKm2: typeof data.area === "number" ? data.area : null,
    population: normalizeLatestPopulation(data.population),
    geographicPath: pathNames.length > 0 ? pathNames : [data.name],
    targets: normalizeTargets(data.targets),
    benchmarkEmissions: preferred,
    hasData: Boolean(data.has_data),
  };
}

export function normalizeEmissionsSources(
  emissionsRaw: unknown,
): OpenClimateBenchmarkEmissions[] {
  if (
    !emissionsRaw ||
    typeof emissionsRaw !== "object" ||
    !("data" in emissionsRaw) ||
    typeof (emissionsRaw as { data?: unknown }).data !== "object"
  ) {
    return [];
  }
  return normalizeBenchmarks(
    (emissionsRaw as { data: Record<string, RawEmissionsSource> }).data,
  );
}
