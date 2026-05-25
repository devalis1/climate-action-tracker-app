-- OpenClimate actor linkage (UNLOCODE-style actor_id from openclimate.network).
-- Enables live enrichment: population, official targets, benchmark emissions.

ALTER TABLE cities ADD COLUMN IF NOT EXISTS openclimate_actor_id TEXT;

COMMENT ON COLUMN cities.openclimate_actor_id IS
  'OpenClimate actor_id (e.g. US CHI). Used for live enrichment via openclimate.network API.';

-- Name-aligned demo links. Greenville (assessment fictional city) uses Chicago actor
-- for rich live targets/emissions demo; Riverside → Riverside CA (US RAL).
UPDATE cities SET openclimate_actor_id = 'US CHI' WHERE slug = 'greenville' AND openclimate_actor_id IS NULL;
UPDATE cities SET openclimate_actor_id = 'US RAL' WHERE slug = 'riverside' AND openclimate_actor_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_cities_openclimate_actor_id ON cities (openclimate_actor_id)
  WHERE openclimate_actor_id IS NOT NULL;
