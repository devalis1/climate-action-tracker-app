/**
 * Slugs with a first-class public dashboard route (`/city/[slug]`).
 * Keep in sync with migrations that seed those cities.
 *
 * Admin mutations prefer `listCitiesSummary()` → `citySlugPublicPaths` for
 * `revalidatePath`; this const remains a **fallback** if the DB read fails
 * mid-request (duplicate risk if migrations add cities but this list is not
 * updated — prefer extending seeds + this tuple together).
 */
export const PUBLIC_VIEWER_SLUGS = ["greenville", "riverside"] as const;

export type PublicViewerSlug = (typeof PUBLIC_VIEWER_SLUGS)[number];
