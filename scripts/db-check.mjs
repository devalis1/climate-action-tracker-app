/**
 * Quick sanity check: Greenville + seeded multi-city Riverside after migrate.
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(repoRoot, ".env.local") });
dotenv.config({ path: path.join(repoRoot, ".env") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const cities = await client.query(
      "SELECT COUNT(*)::int AS n FROM cities WHERE name = $1",
      ["Greenville"],
    );
    const actions = await client.query(
      `SELECT COUNT(*)::int AS n FROM climate_actions ca
       INNER JOIN cities c ON c.id = ca.city_id
       WHERE c.name = $1`,
      ["Greenville"],
    );

    const gvSlug = await client.query(
      "SELECT COUNT(*)::int AS n FROM cities WHERE slug = $1",
      ["greenville"],
    );
    const rs = await client.query(
      "SELECT COUNT(*)::int AS n FROM cities WHERE slug = $1 AND name = $2",
      ["riverside", "Riverside"],
    );
    const rsActions = await client.query(
      `SELECT COUNT(*)::int AS n FROM climate_actions ca
       INNER JOIN cities c ON c.id = ca.city_id
       WHERE c.slug = $1`,
      ["riverside"],
    );

    const cityOk = cities.rows[0]?.n === 1;
    const actionsOk = actions.rows[0]?.n === 6;
    const slugOk =
      gvSlug.rows[0]?.n === 1 &&
      rs.rows[0]?.n === 1 &&
      rsActions.rows[0]?.n === 2;

    console.log(
      JSON.stringify(
        {
          greenvilleCityRows: cities.rows[0]?.n,
          greenvilleActionRows: actions.rows[0]?.n,
          greenvilleSlugRows: gvSlug.rows[0]?.n,
          riversideCityRows: rs.rows[0]?.n,
          riversideActionRows: rsActions.rows[0]?.n,
          ok: cityOk && actionsOk && slugOk,
        },
        null,
        2,
      ),
    );

    if (!cityOk || !actionsOk || !slugOk) {
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
