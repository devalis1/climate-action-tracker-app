-- Seed Greenville + 6 actions — must match docs/OEF PDF and src/lib/sample-data.ts

INSERT INTO cities (name, baseline_emissions_tons_per_year, target_year)
VALUES ('Greenville', 500000, 2035);

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
    ('Expand bike lane network'::text, 'transport'::text, 12000::bigint, 'in progress'::text, 2024::smallint),
    ('Solar panel incentive program'::text, 'energy'::text, 45000::bigint, 'in progress'::text, 2023::smallint),
    ('Municipal building retrofits'::text, 'buildings'::text, 18000::bigint, 'planned'::text, 2026::smallint),
    ('Organic waste composting program'::text, 'waste'::text, 8000::bigint, 'completed'::text, 2022::smallint),
    ('Urban reforestation initiative'::text, 'land use'::text, 15000::bigint, 'planned'::text, 2025::smallint),
    ('EV fleet transition for public transit'::text, 'transport'::text, 30000::bigint, 'planned'::text, 2026::smallint)
) AS v(title, sector, reduction, status, start_year)
WHERE c.name = 'Greenville';
