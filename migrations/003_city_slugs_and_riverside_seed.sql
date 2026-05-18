-- Multi-city stretch: URL-safe slugs + seeded second city (Riverside demo).
-- Greenville stays the default on `/`; `/city/{slug}` resolves by `cities.slug`.

ALTER TABLE cities ADD COLUMN slug TEXT;

UPDATE cities
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE cities
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX idx_cities_slug ON cities (slug);

COMMENT ON COLUMN cities.slug IS 'Stable public path segment for /city/[slug]; indexed for lookup.';

-- Second demo city (not the PDF Greenville rowset): smaller inventory for multi-city smoke.
INSERT INTO cities (name, baseline_emissions_tons_per_year, target_year, slug)
VALUES ('Riverside', 380000, 2040, 'riverside');

INSERT INTO climate_actions (
  city_id,
  title,
  sector,
  annual_reduction_tons_per_year,
  status,
  start_year
)
SELECT c.id,
  v.title,
  v.sector,
  v.reduction,
  v.status,
  v.start_year
FROM cities c
CROSS JOIN (
  VALUES
    ('Bus rapid transit corridor'::text, 'transport'::text, 22000::bigint, 'in progress'::text, 2025::smallint),
    ('Commercial heat-pump accelerator'::text, 'buildings'::text, 14000::bigint, 'planned'::text, 2026::smallint)
) AS v(title, sector, reduction, status, start_year)
WHERE c.slug = 'riverside';
