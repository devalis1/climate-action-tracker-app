import "server-only";

import type { PoolClient } from "pg";
import pg from "pg";

import type { Sector, Status } from "@/lib/schemas";
import {
  type ClimateActionSortKey,
  type SortDirection,
  climateActionsOrderBySql,
} from "@/lib/sorting";

/**
 * PostgreSQL access layer (server-only). Reads DATABASE_URL; never import from Client Components.
 *
 * Scaling (millions of rows): prefer indexed ORDER BY + keyset pagination over OFFSET at depth.
 * Indexes exist on city_id, sector, status, start_year — see migrations/001_initial_schema.sql.
 * Optional partitioning tradeoffs are documented there (city_id vs start_year).
 */

export class DbConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbConfigurationError";
  }
}

export class DbQueryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DbQueryError";
  }
}

export interface CityRecord {
  id: number;
  name: string;
  slug: string;
  baselineEmissionsTonsPerYear: number;
  targetYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClimateActionRecord {
  id: number;
  cityId: number;
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClimateActionListCursor {
  startYear: number;
  id: number;
}

export interface CitySummaryRow {
  id: number;
  name: string;
  slug: string;
}

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "") {
    throw new DbConfigurationError(
      "DATABASE_URL is not set. Copy .env.example to .env.local for local development.",
    );
  }

  pool ??= new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

function mapCity(row: {
  id: number;
  name: string;
  slug: string;
  baseline_emissions_tons_per_year: string | number;
  target_year: number;
  created_at: Date;
  updated_at: Date;
}): CityRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    baselineEmissionsTonsPerYear: Number(row.baseline_emissions_tons_per_year),
    targetYear: row.target_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapClimateAction(row: {
  id: number;
  city_id: number;
  title: string;
  sector: string;
  annual_reduction_tons_per_year: string | number;
  status: string;
  start_year: number;
  created_at: Date;
  updated_at: Date;
}): ClimateActionRecord {
  return {
    id: row.id,
    cityId: row.city_id,
    title: row.title,
    sector: row.sector as Sector,
    annualReductionTonsPerYear: Number(row.annual_reduction_tons_per_year),
    status: row.status as Status,
    startYear: row.start_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } catch (cause) {
    if (cause instanceof DbQueryError) throw cause;
    throw new DbQueryError("Database query failed.", { cause });
  } finally {
    client.release();
  }
}

export async function getCityById(id: number): Promise<CityRecord | null> {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT id, name, slug, baseline_emissions_tons_per_year, target_year, created_at, updated_at
       FROM cities WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapCity(row) : null;
  });
}

export async function getCityByName(name: string): Promise<CityRecord | null> {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT id, name, slug, baseline_emissions_tons_per_year, target_year, created_at, updated_at
       FROM cities WHERE name = $1`,
      [name],
    );
    const row = result.rows[0];
    return row ? mapCity(row) : null;
  });
}

export async function getCityBySlug(slug: string): Promise<CityRecord | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  return withClient(async (client) => {
    const result = await client.query(
      `SELECT id, name, slug, baseline_emissions_tons_per_year, target_year, created_at, updated_at
       FROM cities WHERE slug = $1`,
      [normalized],
    );
    const row = result.rows[0];
    return row ? mapCity(row) : null;
  });
}

const ADMIN_CITY_LIST_LIMIT = 500;

/** Lightweight list for admin city selector (bounded; no action rows). */
export async function listCitiesSummary(): Promise<CitySummaryRow[]> {
  return withClient(async (client) => {
    const result = await client.query<{
      id: number;
      name: string;
      slug: string;
    }>(
      `SELECT id, name, slug FROM cities ORDER BY name ASC LIMIT $1`,
      [ADMIN_CITY_LIST_LIMIT],
    );
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));
  });
}

export interface ListClimateActionsOffsetParams {
  cityId: number;
  limit: number;
  offset?: number;
  sort?: ClimateActionSortKey;
  direction?: SortDirection;
}

/** Offset pagination — OK for shallow pages; prefer keyset at very large offsets. */
export async function listClimateActionsForCityOffset(
  params: ListClimateActionsOffsetParams,
): Promise<ClimateActionRecord[]> {
  const sort = params.sort ?? "startYear";
  const direction = params.direction ?? "desc";
  const offset = Math.max(0, params.offset ?? 0);
  const limit = Math.min(Math.max(1, params.limit), 500);

  const orderBy = climateActionsOrderBySql(sort, direction);

  return withClient(async (client) => {
    const result = await client.query(
      `SELECT id, city_id, title, sector, annual_reduction_tons_per_year, status, start_year,
              created_at, updated_at
       FROM climate_actions
       WHERE city_id = $1
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [params.cityId, limit, offset],
    );
    return result.rows.map(mapClimateAction);
  });
}

export interface ListClimateActionsKeysetParams {
  cityId: number;
  limit: number;
  /** Cursor row from the previous page (same sort direction). Omit for first page. */
  cursor?: ClimateActionListCursor;
  sort?: ClimateActionSortKey;
  direction?: SortDirection;
}

/**
 * Keyset pagination on (sort column, id). Default primary sort: start_year DESC.
 */
export async function listClimateActionsForCityKeyset(
  params: ListClimateActionsKeysetParams,
): Promise<ClimateActionRecord[]> {
  const sort = params.sort ?? "startYear";
  const direction = params.direction ?? "desc";
  const limit = Math.min(Math.max(1, params.limit), 500);
  const orderBy = climateActionsOrderBySql(sort, direction);

  return withClient(async (client) => {
    if (!params.cursor) {
      const result = await client.query(
        `SELECT id, city_id, title, sector, annual_reduction_tons_per_year, status, start_year,
                created_at, updated_at
         FROM climate_actions
         WHERE city_id = $1
         ORDER BY ${orderBy}
         LIMIT $2`,
        [params.cityId, limit],
      );
      return result.rows.map(mapClimateAction);
    }

    const cursor = params.cursor;

    if (sort !== "startYear") {
      throw new DbQueryError(
        "Keyset pagination for this sprint is implemented for startYear ordering only.",
      );
    }

    const cmp = direction === "desc" ? "<" : ">";
    const result = await client.query(
      `SELECT id, city_id, title, sector, annual_reduction_tons_per_year, status, start_year,
              created_at, updated_at
       FROM climate_actions
       WHERE city_id = $1
         AND (start_year, id) ${cmp} ($2::smallint, $3::int)
       ORDER BY ${orderBy}
       LIMIT $4`,
      [params.cityId, cursor.startYear, cursor.id, limit],
    );
    return result.rows.map(mapClimateAction);
  });
}

/** Update baseline inventory (tons/year) and net-zero target year for `cities.id`. */
export async function updateCityBaselineAndTarget(
  cityId: number,
  input: {
    baselineEmissionsTonsPerYear: number;
    targetYear: number;
  },
): Promise<CityRecord | null> {
  const baseline = BigInt(Math.floor(input.baselineEmissionsTonsPerYear));
  const targetYear = Math.floor(input.targetYear);

  return withClient(async (client) => {
    const result = await client.query(
      `UPDATE cities
       SET baseline_emissions_tons_per_year = $2,
           target_year = $3,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, slug, baseline_emissions_tons_per_year, target_year,
                 created_at, updated_at`,
      [cityId, baseline, targetYear],
    );
    const row = result.rows[0];
    return row ? mapCity(row) : null;
  });
}

export async function insertClimateAction(input: {
  cityId: number;
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
}): Promise<ClimateActionRecord> {
  const reduction = BigInt(Math.floor(input.annualReductionTonsPerYear));
  const startYear = Math.floor(input.startYear);

  return withClient(async (client) => {
    const result = await client.query(
      `INSERT INTO climate_actions (
         city_id, title, sector, annual_reduction_tons_per_year, status, start_year
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, city_id, title, sector, annual_reduction_tons_per_year,
                 status, start_year, created_at, updated_at`,
      [
        input.cityId,
        input.title.trim(),
        input.sector,
        reduction,
        input.status,
        startYear,
      ],
    );
    return mapClimateAction(result.rows[0]);
  });
}

export async function updateClimateAction(input: {
  id: number;
  cityId: number;
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
}): Promise<ClimateActionRecord | null> {
  const reduction = BigInt(Math.floor(input.annualReductionTonsPerYear));
  const startYear = Math.floor(input.startYear);

  return withClient(async (client) => {
    const result = await client.query(
      `UPDATE climate_actions
       SET title = $3,
           sector = $4,
           annual_reduction_tons_per_year = $5,
           status = $6,
           start_year = $7,
           updated_at = NOW()
       WHERE id = $1 AND city_id = $2
       RETURNING id, city_id, title, sector, annual_reduction_tons_per_year,
                 status, start_year, created_at, updated_at`,
      [
        input.id,
        input.cityId,
        input.title.trim(),
        input.sector,
        reduction,
        input.status,
        startYear,
      ],
    );
    const row = result.rows[0];
    return row ? mapClimateAction(row) : null;
  });
}

export async function deleteClimateAction(input: {
  id: number;
  cityId: number;
}): Promise<boolean> {
  return withClient(async (client) => {
    const result = await client.query(
      `DELETE FROM climate_actions WHERE id = $1 AND city_id = $2`,
      [input.id, input.cityId],
    );
    return (result.rowCount ?? 0) > 0;
  });
}

