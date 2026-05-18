# City Climate Action Tracker

PostgreSQL-backed City Admin CRUD (`/admin`), public Greenville dashboard (`/`), and Sprint 3 `POST /api/import-action` for **review-before-save** ingestion. Fixtures in `src/lib/sample-data.ts` remain for parity checks against the seeded SQL baseline but **`/` and `/admin` prefer live database rows.**

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

## Application

```bash
npm run dev
```

Open:

- Public Viewer (Postgres aggregates): [http://localhost:3000](http://localhost:3000)
- City Admin (Postgres mutations + reviewed import pipeline): [http://localhost:3000/admin](http://localhost:3000/admin)

> **Reminder:** Routes are `force-dynamic`; without `DATABASE_URL` or a reachable DB you’ll see onboarding cards instead of the dashboard. Optionally run **Ollama** when exercising free-text admin import (`OLLAMA_*` vars in `.env.example`).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:migrate   # applies migrations/*.sql once each (tracks schema_migrations)
npm run db:check     # Greenville row-count sanity check
```

## Phase 2 baseline

- Docker Compose Postgres (`postgres:16-alpine`), persistent volume, healthcheck.
- Schema + indexes + scaling/partitioning commentary in `migrations/001_initial_schema.sql`.
- Greenville seed in `migrations/002_seed_greenville.sql`.
- `src/server/db.ts` typed helpers (reads + Sprint 4 mutations).
- `src/lib/sorting.ts` whitelist mapping for SQL `ORDER BY`.

## Deferred / Stretch

Full multi-city switching, hardened OAuth-backed admin guards, richer charts/tests — see Sprint 5 / stretch checklist in `docs/TODO.md`.

## Sprint 3 (LLM import) reminder

Configured via `.env.example`: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `LLM_INFERENCE_MODE`, `ENABLE_CLOUD_FALLBACK`, `GEMINI_API_KEY`, optional timeouts. Inference stays **server-only**; `/admin` parses text through `POST /api/import-action`, then persists only after manual confirmation.

