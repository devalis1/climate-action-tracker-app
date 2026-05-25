import "server-only";

import {
  compareBaselineToOpenClimate,
  computeTargetGap,
  pickPreferredBenchmark,
} from "@/lib/openclimate-comparison";
import {
  normalizeActorOverview,
  normalizeActorPath,
  normalizeEmissionsSources,
  normalizeSearchResults,
} from "@/lib/openclimate-normalize";
import type {
  OpenClimateCoverageStats,
  OpenClimateEnrichment,
  OpenClimateSearchResult,
} from "@/lib/openclimate-types";
import type { CityProfile } from "@/lib/schemas";

const DEFAULT_BASE_URL = "https://openclimate.network";
const REVALIDATE_SECONDS = 86_400;

export class OpenClimateFetchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "OpenClimateFetchError";
  }
}

export function getOpenClimateBaseUrl(): string {
  return (process.env.OPENCLIMATE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function isOpenClimateEnrichmentEnabled(): boolean {
  return process.env.OPENCLIMATE_ENRICHMENT !== "0";
}

async function openClimateFetch(path: string): Promise<unknown> {
  const url = `${getOpenClimateBaseUrl()}${path}`;
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new OpenClimateFetchError(
      `OpenClimate request failed (${response.status}) for ${path}`,
    );
  }

  return response.json();
}

export async function searchOpenClimateActors(input: {
  name: string;
  type?: string;
}): Promise<OpenClimateSearchResult[]> {
  const name = input.name.trim();
  if (!name) return [];

  const params = new URLSearchParams({ name });
  if (input.type) params.set("type", input.type);

  const raw = await openClimateFetch(`/api/v1/search/actor?${params.toString()}`);
  return normalizeSearchResults(raw);
}

export async function fetchOpenClimateEnrichment(
  actorId: string,
): Promise<OpenClimateEnrichment | null> {
  const encoded = encodeURIComponent(actorId.trim());
  if (!encoded) return null;

  const [overviewRaw, pathRaw, emissionsRaw] = await Promise.all([
    openClimateFetch(`/api/v1/actor/${encoded}`),
    openClimateFetch(`/api/v1/actor/${encoded}/path`),
    openClimateFetch(`/api/v1/actor/${encoded}/emissions`).catch(() => null),
  ]);

  const pathNames = normalizeActorPath(pathRaw);
  const enrichment = normalizeActorOverview(overviewRaw, pathNames, emissionsRaw);
  if (!enrichment) return null;

  if (!enrichment.benchmarkEmissions && emissionsRaw) {
    const benchmarks = normalizeEmissionsSources(emissionsRaw);
    const preferred = pickPreferredBenchmark(benchmarks);
    if (preferred) {
      return { ...enrichment, benchmarkEmissions: preferred };
    }
  }

  return enrichment;
}

export async function fetchOpenClimateCoverageStats(): Promise<OpenClimateCoverageStats | null> {
  try {
    const raw = await openClimateFetch("/api/v1/coverage/stats");
    if (!raw || typeof raw !== "object") return null;
    const data =
      "data" in raw
        ? (raw as { data?: Record<string, unknown> }).data
        : (raw as Record<string, unknown>);
    if (!data || typeof data !== "object") return null;

    return {
      numberOfCities: Number(data.number_of_cities ?? 0),
      numberOfCitiesWithEmissions: Number(data.number_of_cities_with_emissions ?? 0),
      numberOfCitiesWithTargets: Number(data.number_of_cities_with_targets ?? 0),
      numberOfEmissionsRecords: Number(data.number_of_emissions_records ?? 0),
    };
  } catch {
    return null;
  }
}

export type OpenClimateDashboardContext = {
  enrichment: OpenClimateEnrichment;
  targetGap: ReturnType<typeof computeTargetGap>;
  baselineComparison: ReturnType<typeof compareBaselineToOpenClimate>;
};

export async function loadOpenClimateDashboardContext(input: {
  actorId: string | null | undefined;
  profile: CityProfile;
}): Promise<OpenClimateDashboardContext | null> {
  if (!isOpenClimateEnrichmentEnabled()) return null;
  if (!input.actorId?.trim()) return null;

  try {
    const enrichment = await fetchOpenClimateEnrichment(input.actorId);
    if (!enrichment) return null;

    return {
      enrichment,
      targetGap: computeTargetGap({
        actions: input.profile.actions,
        baselineEmissions: input.profile.baselineEmissions,
        planningTargetYear: input.profile.targetYear,
        officialTargets: enrichment.targets,
      }),
      baselineComparison: compareBaselineToOpenClimate({
        localBaselineTons: input.profile.baselineEmissions,
        benchmark: enrichment.benchmarkEmissions,
      }),
    };
  } catch {
    return null;
  }
}
