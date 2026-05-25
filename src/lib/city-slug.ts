/** URL-safe slug segment for `/city/[slug]` — lowercase letters, digits, hyphens. */
export const CITY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Mirrors migration 003 slug derivation: trim, lowercase, spaces → hyphens. */
export function deriveCitySlugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCitySlugInput(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidCitySlug(slug: string): boolean {
  const normalized = normalizeCitySlugInput(slug);
  return normalized.length > 0 && normalized.length <= 64 && CITY_SLUG_PATTERN.test(normalized);
}
