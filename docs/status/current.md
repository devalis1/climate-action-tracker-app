# Current Status

## Real

- **Phase 1 / Sprint 1** is complete and verified against the assessment scope.
- **Phase 2 / Sprint 2** is **complete and operator-verified**: Docker Postgres, migrations, Greenville seed, `db:check`, and `npm run build` all passed on the operator machine; UI smoke for `/` and `/admin` OK.
- **Phase 3 / Sprint 3 complete (operator sanity)**: `src/server/llm.ts` (Ollama + Zod + one repair pass + optional Gemini; **`think: false`** for Qwen-style thinking models), `POST /api/import-action`, `src/lib/pdf-led-import-fixture.ts`, `.env.example` LLM vars. Sign-off: **`npm run build`** OK **Monday, May 18, 2026**; optional Ollama smoke still adds confidence.
- Repository exists and has initial project guidance for the OEF City Climate Action Tracker Exercise.
- `docs/OEF AI-Native Software Engineer Exercise.pdf` is the source-of-truth assessment document.
- `docs/assessment-notes.md` summarizes the assessment plus personal implementation notes.
- `docs/DEVELOPER_PROFILE.md` documents local development preferences, clean code standards, Git etiquette, and local-first LLM implementation style.
- `docs/DESIGN_SYSTEM.md` documents the Open Earth / CityCatalyst visual system from live site inspection.
- `docs/PROJECT_STRUCTURE.md` documents the lean repo structure.
- `.cursorrules` defines project-specific agent rules, including no `git commit` / `git push`.
- `docs/TODO.md` breaks the work into 30-minute sprints.
- `docs/PROGRESS.md` tracks what is done and what is next (includes PDF alignment through Phase 2 and Sprint 3 LLM notes in **Current State**).
- Structure targets Next.js, TypeScript, PostgreSQL, and local-first Ollama with optional Gemini fallback.
- Sprint 1 is implemented as a root-level Next.js App Router app.
- Tailwind CSS is configured with Open Earth / CityCatalyst brand tokens from `docs/DESIGN_SYSTEM.md`; `src/app/globals.css` uses Tailwind v4’s `@import "tailwindcss"` and `@config` so the JS config (including `brand-*` colors and spacing scale) is actually applied.
- `src/lib/schemas.ts` defines Zod contracts and exported TypeScript types for sectors, statuses, climate actions, and city profiles.
- `src/lib/sample-data.ts` contains the Greenville assessment data as a validated in-memory fixture (**still backing `/` and `/admin`** until server routes read from Postgres).
- `src/lib/calculations.ts` contains initial calculation helpers for dashboard totals and progress display.
- `/` renders the Greenville Public Viewer dashboard with computed metrics, sector breakdown, and on-track panel; layout uses aligned max-width padding, a dashboard-style KPI strip, and a two-column sector vs. status layout on large screens.
- `/admin` renders the City Admin shell with baseline/target cards, disabled future workflow buttons, and a read-only action table.
- **Phase 2 / Sprint 2**: `docker-compose.yml` runs Postgres `16-alpine` with persistent volume `postgres_data`, published port `5432`, dev placeholders, and a healthcheck.
- **Phase 2 / Sprint 2**: `migrations/001_initial_schema.sql` defines `cities` and `climate_actions` with CHECK constraints aligned to Zod enums, timestamps, scaling/partitioning commentary, and indexes on `city_id`, `sector`, `status`, `start_year`.
- **Phase 2 / Sprint 2**: `migrations/002_seed_greenville.sql` seeds Greenville plus six actions matching the PDF / fixture.
- **Phase 2 / Sprint 2**: `npm run db:migrate` applies migrations once each using `schema_migrations`; `npm run db:check` verifies Greenville counts.
- **Phase 2 / Sprint 2**: `src/server/db.ts` exposes server-only typed reads (`getCityById`, `getCityByName`, offset listings, keyset helper for default `start_year` ordering).
- **Phase 2 / Sprint 2**: `src/lib/sorting.ts` maps sort keys to safe SQL `ORDER BY` fragments for future filtering/sorting routes.
- **Phase 2 / Sprint 2**: `.env.example` documents `DATABASE_URL` (localhost → Docker Postgres) and Compose-related vars (development placeholders).
- **Phase 3 / Sprint 3**: `.env.example` also documents `LLM_INFERENCE_MODE`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `LLM_REQUEST_TIMEOUT_MS`, `ENABLE_CLOUD_FALLBACK`, `GEMINI_API_KEY`, `GEMINI_MODEL` (names and safe defaults only).
- `README.md` documents Docker Desktop prerequisite, `.env.local` copy, Compose up/down, migrations, db check, and `npm run dev` workflow.

## Planned

- **Sprint 4**: Postgres-backed admin CRUD + free-text import **review-before-save**, public viewer from same data, real on-track/progression logic, optional projected-emissions chart.
- Write the one-page AI workflow response required by the PDF (Sprint 5).

## Operator Actions

- Run your own **test pass** and **commit/push** when satisfied.
- **Optional (LLM)**: Ollama + `POST /api/import-action` with **`PDF_LED_STREET_LIGHTING_PARAGRAPH`** (`src/lib/pdf-led-import-fixture.ts`).
- Proceed to **Sprint 4** (hand off using the Phase 4 agent prompt).
