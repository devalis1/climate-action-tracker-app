/**
 * Pure helpers for admin city selection (cookie ↔ validated id).
 * Server resolution against Postgres lives in `src/server/admin-city-resolve.ts`.
 */

export const ADMIN_CITY_ID_COOKIE = "admin_city_id";

export function parseAdminCityIdCookie(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Prefer cookie when it points at a live city row; else default city when still present; else smallest valid id. */
export function pickAdminCityId(
  defaultCityId: number,
  cookieCityId: number | null,
  validCityIds: Set<number>,
): number {
  if (cookieCityId !== null && validCityIds.has(cookieCityId)) {
    return cookieCityId;
  }
  if (validCityIds.has(defaultCityId)) {
    return defaultCityId;
  }
  const sorted = [...validCityIds].sort((a, b) => a - b);
  const first = sorted[0];
  if (first === undefined) {
    throw new Error("No cities in database.");
  }
  return first;
}

/** Paths to revalidate for public city dashboards (`/city/[slug]`). */
export function citySlugPublicPaths(slugs: string[]): string[] {
  return slugs
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((slug) => `/city/${slug}`);
}
