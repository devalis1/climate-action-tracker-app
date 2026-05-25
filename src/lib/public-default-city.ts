import type { CitySummaryRow } from "@/server/db";

/** Preferred landing slug when seeded (see migrations). */
export const DEFAULT_PUBLIC_CITY_SLUG = "greenville";

export function resolveDefaultPublicCitySlug(
  cities: Pick<CitySummaryRow, "slug">[],
): string | null {
  if (cities.length === 0) return null;
  const preferred = cities.find((city) => city.slug === DEFAULT_PUBLIC_CITY_SLUG);
  return preferred?.slug ?? cities[0]!.slug;
}

export function publicCityPath(slug: string): string {
  return `/city/${encodeURIComponent(slug.trim().toLowerCase())}`;
}

export function slugFromPublicCityPath(pathname: string): string | null {
  const match = pathname.match(/^\/city\/([^/]+)/);
  return match?.[1]?.toLowerCase() ?? null;
}
