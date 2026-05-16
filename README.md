# City Climate Action Tracker

Phase 2 adds **PostgreSQL in Docker**, SQL migrations under `migrations/`, a server-only DB module at `src/server/db.ts`, and Greenville seed data matching `src/lib/sample-data.ts`. The **Next.js UI at `/` and `/admin` still reads in-memory fixtures** until a later sprint wires routes to the database.

## Prerequisites

- **Docker Desktop** (for local PostgreSQL)
- Node.js 20 or newer
- npm

## One-time setup

1. Install JS dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env.local
```

Adjust values only if you changed Postgres credentials or ports in `docker-compose.yml`.

## Database (Docker Postgres)

Start Postgres (detached):

```bash
docker compose up -d
```

Wait until healthy (`docker compose ps` shows healthy), then apply migrations from the **host** (requires `DATABASE_URL` in `.env.local`):

```bash
npm run db:migrate
```

Verify Greenville seed (`greenvilleCityRows: 1`, `greenvilleActionRows: 6`, `ok: true`):

```bash
npm run db:check
```

Optional manual inspection:

```bash
docker compose exec postgres psql -U climate -d climate_action_tracker -c "SELECT COUNT(*) FROM climate_actions;"
```

Stop containers (data persists in the named volume unless you remove it):

```bash
docker compose down
```

Remove data volume intentionally (destructive):

```bash
docker compose down -v
```

### Connection strings

| Where the app runs | Postgres host |
| ------------------ | ------------- |
| `npm run dev` on your machine | `localhost` |
| Future Compose service next to DB | `postgres` (Compose service name) |

## Application (unchanged from Phase 1)

```bash
npm run dev
```

Open:

- Public Viewer: [http://localhost:3000](http://localhost:3000)
- City Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:migrate   # applies migrations/*.sql once each (tracks schema_migrations)
npm run db:check     # Greenville row-count sanity check
```

## Phase 2 scope

- Docker Compose Postgres (`postgres:16-alpine`), persistent volume, healthcheck.
- Schema + indexes + scaling/partitioning commentary in `migrations/001_initial_schema.sql`.
- Greenville seed in `migrations/002_seed_greenville.sql`.
- `src/server/db.ts` typed query helpers (offset + keyset sketch for `start_year`).
- `src/lib/sorting.ts` whitelist mapping for SQL `ORDER BY`.

Deferred: LLM import, CRUD UI, auth, charts, Vitest, wiring `/` and `/admin` to Postgres.
