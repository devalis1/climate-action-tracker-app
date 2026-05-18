# City Climate Action Tracker

PostgreSQL-backed City Admin CRUD (`/admin`) with **multi-city scope** (HTTP-only `admin_city_id` cookie + DB-backed selector), Greenville default dashboard (`/`), **multi-city read** route (`/city/[slug]`, e.g. `/city/riverside` after migration 003), and `POST /api/import-action` for **review-before-save** LLM ingestion. Optional **`/admin/login`** + **`/admin/logout`** set/clear `admin_demo` when `ADMIN_DEMO_SECRET` is configured. Fixtures in `src/lib/sample-data.ts` mirror the Greenville seed for parity; **`/`, `/city/...`, and `/admin` read/write live database rows**.

## Prerequisites

- Docker Desktop (local PostgreSQL)
- Node.js 20+
- npm
- Optional: [Ollama](https://ollama.com/) on the host for local-first import (`OLLAMA_*` in `.env.example`)

## One-time setup

1. Install dependencies:

```bash
npm install
```

2. Environment:

```bash
cp .env.example .env.local
```

Edit only if you changed Postgres ports/credentials in `docker-compose.yml` or need LLM/cloud toggles. **Never commit `.env.local`.**

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Postgres connection (see `.env.example`) |
| `OLLAMA_*`, `LLM_*`, `GEMINI_*` | Server-only import pipeline |
| `ADMIN_DEMO_SECRET` | Optional: when set, `/admin` shows a **login gate** until sign-in via **`/admin/login`** sets HTTP-only **`admin_demo`** (or use `Authorization: Bearer <secret>` from API/tooling). Cleared via **`GET /admin/logout`**. JWT peek helper: `src/lib/admin-jwt-peek.ts`. |

## Database (Docker Postgres)

Start Postgres:

```bash
docker compose up -d
```

Wait until healthy, then from the **host**:

```bash
npm run db:migrate
npm run db:check
```

Expect `ok: true`: Greenville baseline (1 city, 6 actions), slug **`greenville`**, plus seeded **Riverside** (`riverside`, 2 actions) after **`003_city_slugs_and_riverside_seed.sql`**. Extended operator smoke (counts + sample `curl` for import):

```bash
npm run db:smoke
```

Stop / reset is documented under **Troubleshooting** below.

### Connection strings

| Where the app runs | Postgres host |
| ------------------ | ------------- |
| `npm run dev` on your machine | `localhost` |
| A future Compose app service | `postgres` (service name) |

## Application

```bash
npm run dev
```

Open:

| Route | Role |
| ----- | ---- |
| [http://localhost:3000](http://localhost:3000) | Public viewer |
| [http://localhost:3000/admin](http://localhost:3000/admin) | City Admin (CRUD + import review; city selector) |
| [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Demo secret sign-in (only when `ADMIN_DEMO_SECRET` is set) |

Routes are `force-dynamic`. Without `DATABASE_URL` you will see onboarding cards instead of the dashboard.

## Build & quality

`tsconfig.json` **excludes** `*.test.ts` / `vitest.config.ts` so **`npm run build`** does not require Vitest packages to be present; **Vitest still type-checks tests** when you run **`npm test`** after **`npm install`**.

```bash
npm run build        # production build
npm test             # Vitest (unit + mocked import route; no live Ollama/Postgres required)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Vitest + v8 coverage (requires devDependencies installed)
```

## Scripts reference

```bash
npm run dev
npm run build
npm run start
npm run db:migrate   # applies migrations/*.sql once each (schema_migrations)
npm run db:check     # Greenville row-count sanity
npm run db:smoke     # db:check + prints optional import API curl
npm test
```

## Testing notes

- **Unit:** `src/lib/*.test.ts` — calculations, sorting whitelist, Zod schemas, PDF LED golden fixture, **admin city cookie helpers** (`admin-city-context.test.ts`).
- **Integration-style:** `src/app/api/import-action/route.integration.test.ts` — mocks `@/server/llm` so CI does not need Docker Ollama or Postgres.
- **Manual E2E:** `docs/MANUAL_TEST_CHECKLIST.md` (browser → API → DB).

## Troubleshooting

| Symptom | What to check |
| ------- | ---------------- |
| `DATABASE_URL` / DB onboarding | Copy `.env.example` → `.env.local`; `docker compose ps` healthy; run `npm run db:migrate` |
| Connection refused to Postgres | Port 5432 not published or wrong host in `DATABASE_URL` |
| Import always fails | Ollama not running or model not pulled; or enable Gemini fallback per `.env.example` |
| Optional admin gate | With `ADMIN_DEMO_SECRET`, open **`/admin/login`**, submit the secret, or attach `Authorization: Bearer …` for scripted mutations. Log out via **`/admin/logout`**. |
| `npm test` missing | Run `npm install` (adds `vitest`, `vite`, `@vitest/coverage-v8`) |

## Assessment deliverables

- Source of truth: `docs/OEF AI-Native Software Engineer Exercise.pdf`
- AI workflow write-up (four PDF questions): `docs/AI_WORKFLOW_RESPONSE.md`
- Manual checklist: `docs/MANUAL_TEST_CHECKLIST.md`

## Stack (summary)

- Next.js App Router, React, TypeScript, PostgreSQL, Zod
- Ollama-first import with optional Gemini fallback (`src/server/llm.ts`)
- Open Earth styling: `docs/DESIGN_SYSTEM.md`

## Deferred / stretch

See `docs/TODO.md` — production OAuth/JWKS verification, extra chart polish beyond the Sprint 5 SVG trajectory.
