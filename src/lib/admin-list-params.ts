import type { ClimateActionSortKey, SortDirection } from "@/lib/sorting";
import { sectorSchema, statusSchema, type Sector, type Status } from "@/lib/schemas";

export const ADMIN_ACTIONS_PAGE_SIZE = 25;

export type AdminActionsListParams = {
  page: number;
  sort: ClimateActionSortKey;
  direction: SortDirection;
  sector?: Sector;
  status?: Status;
};

const sortKeys: ClimateActionSortKey[] = [
  "startYear",
  "title",
  "sector",
  "status",
  "annualReduction",
];

export function parseAdminActionsListParams(
  input: Record<string, string | string[] | undefined>,
): AdminActionsListParams {
  const pageRaw = Array.isArray(input.page) ? input.page[0] : input.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const sortRaw = Array.isArray(input.sort) ? input.sort[0] : input.sort;
  const sort = sortKeys.includes(sortRaw as ClimateActionSortKey)
    ? (sortRaw as ClimateActionSortKey)
    : "startYear";

  const directionRaw = Array.isArray(input.direction) ? input.direction[0] : input.direction;
  const direction: SortDirection = directionRaw === "asc" ? "asc" : "desc";

  const sectorRaw = Array.isArray(input.sector) ? input.sector[0] : input.sector;
  const sectorParsed = sectorSchema.safeParse(sectorRaw);
  const sector = sectorParsed.success ? sectorParsed.data : undefined;

  const statusRaw = Array.isArray(input.status) ? input.status[0] : input.status;
  const statusParsed = statusSchema.safeParse(statusRaw);
  const status = statusParsed.success ? statusParsed.data : undefined;

  return { page, sort, direction, sector, status };
}

export function adminActionsQueryString(
  params: AdminActionsListParams,
  overrides?: Partial<AdminActionsListParams>,
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  if (merged.page > 1) search.set("page", String(merged.page));
  if (merged.sort !== "startYear") search.set("sort", merged.sort);
  if (merged.direction !== "desc") search.set("direction", merged.direction);
  if (merged.sector) search.set("sector", merged.sector);
  if (merged.status) search.set("status", merged.status);
  const query = search.toString();
  return query ? `?${query}` : "";
}
