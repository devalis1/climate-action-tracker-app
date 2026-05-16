-- City Climate Action Tracker — initial schema
--
-- Scaling & partitioning notes (millions of rows)
-- ---------------------------------------------------------------
-- Sorting & pagination:
--   Always ORDER BY indexed columns at the database. Prefer keyset (cursor)
--   pagination on (start_year DESC, id DESC) or (start_year ASC, id ASC) over
--   OFFSET for deep pages — OFFSET walks skipped rows and degrades at scale.
--   Example keyset predicate for “next page” after (sy, rid):
--     WHERE (start_year, id) < ($cursor_start_year, $cursor_id)
--     ORDER BY start_year DESC, id DESC LIMIT $limit;
--
-- Indexed filters:
--   Partial/filtered queries should align with btree indexes below:
--   city_id (tenant scope), sector, status, start_year — composite indexes
--   can be added later for hot paths (e.g. (city_id, sector)).
--
-- Partitioning (optional):
--   RANGE partitioning on start_year: improves pruning for year-window queries;
--   cross-year scans need broader planner awareness; fewer partitions =
--   simpler ops.
--   HASH or LIST partitioning on city_id: isolates megacity tenants and keeps
--   indexes smaller per partition; cross-city reporting becomes harder — use
--   only when multi-city volume dominates.
--
-- Client bundles:
--   Never load unbounded action lists into the browser; always LIMIT/OFFSET or
--   keyset at the DB and return bounded JSON pages from server routes.

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  baseline_emissions_tons_per_year BIGINT NOT NULL CHECK (baseline_emissions_tons_per_year > 0),
  target_year SMALLINT NOT NULL CHECK (target_year >= 1900 AND target_year <= 2200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE climate_actions (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sector TEXT NOT NULL CHECK (
    sector IN ('transport', 'energy', 'buildings', 'waste', 'land use')
  ),
  annual_reduction_tons_per_year BIGINT NOT NULL CHECK (annual_reduction_tons_per_year >= 0),
  status TEXT NOT NULL CHECK (
    status IN ('planned', 'in progress', 'completed')
  ),
  start_year SMALLINT NOT NULL CHECK (start_year >= 1900 AND start_year <= 2200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_climate_actions_city_id ON climate_actions (city_id);
CREATE INDEX idx_climate_actions_sector ON climate_actions (sector);
CREATE INDEX idx_climate_actions_status ON climate_actions (status);
CREATE INDEX idx_climate_actions_start_year ON climate_actions (start_year);

COMMENT ON TABLE cities IS 'City baseline emissions (tons/year) and net-zero target year; aligns with src/lib/schemas.ts cityProfile.';
COMMENT ON TABLE climate_actions IS 'Climate actions per city; sector/status CHECK constraints mirror src/lib/schemas.ts.';
COMMENT ON COLUMN climate_actions.annual_reduction_tons_per_year IS 'Estimated annual CO2 reduction (tons/year); maps to annualReduction in Zod.';
