# Progress

Start Time: Saturday, May 16, 2026, 11:15 AM UTC-3

## Current State

**Phase 1 (Sprint 1), Phase 2 (Sprint 2), Phase 3 (Sprint 3), and Phase 4 (Sprint 4)** are implemented in code; **Phase 4 / Sprint 4** reached **operator sign-off Monday, May 18, 2026** after manual UI + Postgres verification (Compose, **`/` + `/admin`**, CRUD, reviewed import)—see **Timing** below.

**Phase 4 (Sprint 4)** wires **`/` + `/admin` to Postgres** (Greenville demo name), ships **baseline/target edits**, **`climate_actions` CRUD** via Server Actions backed by **`src/server/db.ts` mutations**, **`POST /api/import-action` + Zod-reviewed UI** (`src/components/admin-workspace.tsx`), and replaces **`isOnTrack`** with a **linear glide heuristic** anchored on earliest modeled action (`src/lib/calculations.ts`). Admin auth remains a **`assertDemoAdminWritesAllowed` stub** documenting OAuth/JWT follow-up (`src/server/db.ts`). Charts remain stretch (not shipped).

**Sprint 3:** `src/server/llm.ts` calls **Ollama** (`/api/chat`, JSON mode), validates with **`climateActionSchema`**, runs **one repair pass** on Zod failure, and optionally uses **Gemini** when `ENABLE_CLOUD_FALLBACK` is explicitly enabled (and `LLM_INFERENCE_MODE=platform` forces cloud-only). **`POST /api/import-action`** returns `{ ok, action?, errors? }` **without automatically writing to Postgres**. **Sprint 4 `/admin`** layers **review-before-save** confirmations on top (`src/app/admin/actions.ts`). The assessment **LED street lighting** paragraph lives in **`src/lib/pdf-led-import-fixture.ts`** with the **PDF-documented golden object** (`9500` tCO₂/yr, `energy`, `planned`, `2027`).

## Alignment with assessment (PDF / notes) through Phase 2

The runnable code and schema are checked against **`docs/assessment-notes.md`** (summary of **`docs/OEF AI-Native Software Engineer Exercise.pdf`**, the authoritative brief).

| PDF / assessment expectation | Repo state through Phase 2 |
| ---------------------------- | ---------------------------- |
| **City**: name; baseline emissions (tons/year); target (net-zero) year | `cities`: `name`, `baseline_emissions_tons_per_year`, `target_year`; Zod `cityProfileSchema`; Greenville **500 000**, **2035** in fixture + seed |
| **Climate action**: title; sector (`transport`, `energy`, `buildings`, `waste`, `land use`); estimated annual tons/year; status (`planned`, `in progress`, `completed`); start year | `climate_actions` CHECKs mirror `src/lib/schemas.ts`; column `annual_reduction_tons_per_year` ↔ Zod `annualReduction` |
| **Greenville sample**: city + actions as in PDF | **`migrations/002_seed_greenville.sql`** matches **`src/lib/sample-data.ts`** (six actions, same titles/sectors/reductions/statuses/years) |
| Stack: Next.js, React, TypeScript, **PostgreSQL** | Present; Postgres local path is Docker Compose + `DATABASE_URL` |
| **Out of scope for Phase 2** per phased plan | LLM import, CRUD wired to DB, auth, charts, Vitest — not implemented yet (correct) |

Scalability groundwork in place: indexing + partitioning commentary in **`migrations/001_initial_schema.sql`**; sort helpers in **`src/lib/sorting.ts`**.

## Done

- Fixed **Tailwind CSS v4 configuration**: v4 does not auto-load `tailwind.config.ts` and ignores legacy `@tailwind base/components/utilities` directives. Replaced with `@import "tailwindcss"` + `@config` in `src/app/globals.css` so spacing utilities (`p-*`, `gap-*`, `m-*`), shadows, and **`brand-*` theme colors** are emitted again—this was why the UI looked “unstyled” (flush text, touching grid cells, missing glass/brand tokens). Softened the global contour grid overlay so it competes less with content.
- Added `docs/OEF AI-Native Software Engineer Exercise.pdf` as the source-of-truth assessment document.
- Added `docs/assessment-notes.md` to summarize the PDF and personal implementation notes.
- Moved planning markdown under `docs/`.
- Preserved `docs/DEVELOPER_PROFILE.md` with personal workflow, clean-code, Git, and local-first LLM preferences.
- Preserved `docs/DESIGN_SYSTEM.md` with Open Earth / CityCatalyst visual constraints and Tailwind token mapping.
- Rewrote `docs/PROJECT_STRUCTURE.md` to favor a single focused Next.js app instead of a premature monorepo.
- Added `.cursorrules` with visual, operational, architectural, LLM, safety, and workflow constraints.
- Added `docs/TODO.md` with 30-minute sprints and time checkpoints.
- Removed premature empty implementation folders and `.gitkeep` placeholders.
- Removed the standalone Tailwind config until the real Next.js app is initialized.
- Created the root Next.js + TypeScript app scaffold: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `src/app/layout.tsx`, and `src/app/globals.css`.
- Added `.gitignore` entries for Next.js output, dependencies, local env files, logs, and editor/OS artifacts.
- Added Zod schemas and TypeScript types for sectors, statuses, climate actions, and city profiles.
- Added Greenville sample data from the assessment PDF with 6 actions, baseline emissions of 500,000, and target year 2035.
- Added calculation helpers for total annual reduction, percent of baseline, and dashboard comparisons tied to Postgres-backed profiles.
- Replaced Sprint 4 `isOnTrack` placeholder with a documented **linear glide** heuristic anchored on earliest action start versus the net-zero planning year (`src/lib/calculations.ts`).
- Evolved `/` + `/admin` across Sprint 4: **`src/components/admin-workspace.tsx`**, **Server Actions** (`src/app/admin/actions.ts`), and dynamic Postgres-backed loading with onboarding states when DB env is absent.
- Added `README.md` with prerequisites, install/dev commands, and local URLs.
- Updated `docs/TODO.md` to mark Sprint 1 setup/design-system items complete.
- Added `"type": "module"` to `package.json` so Tailwind/Next TypeScript config files parse as ESM without Node warnings.
- **Sprint 2**: Added `docker-compose.yml` with named volume `postgres_data`, published port `5432`, dev-safe Postgres credentials via env defaults, and `pg_isready` healthcheck.
- **Sprint 2**: Added `migrations/001_initial_schema.sql` (`cities`, `climate_actions`) with CHECK constraints aligned to `src/lib/schemas.ts`, btree indexes on `city_id`, `sector`, `status`, `start_year`, and scaling/partitioning commentary for million-row workloads.
- **Sprint 2**: Added `migrations/002_seed_greenville.sql` seeding Greenville + six actions matching `src/lib/sample-data.ts`.
- **Sprint 2**: Added `scripts/run-migrations.mjs` (`npm run db:migrate`) applying ordered `*.sql` once each via `schema_migrations`; loads `.env.local` / `.env` through `dotenv`.
- **Sprint 2**: Added `scripts/db-check.mjs` (`npm run db:check`) for Greenville row-count verification.
- **Sprint 2**: Added `src/server/db.ts` (server-only pool, typed reads, offset listing + keyset helper for default `start_year` ordering) plus brief scaling pointers mirroring migrations.
- **Sprint 2**: Added `src/lib/sorting.ts` whitelist helpers mapping UI sort keys → SQL `ORDER BY` clauses for later dashboard wiring.
- **Sprint 2**: Declared `serverExternalPackages: ["pg"]` in `next.config.ts`.
- **Sprint 2**: Dependencies `pg`, `server-only`; devDependencies `@types/pg`, `dotenv`.
- **Sprint 2**: `.env.example`-documents `DATABASE_URL` and Compose-related vars (development placeholders only).
- **Sprint 3**: Added **`src/server/llm.ts`** (Ollama-first import + bounded Zod repair + optional Gemini behind `ENABLE_CLOUD_FALLBACK`), **`src/app/api/import-action/route.ts`**, **`src/lib/pdf-led-import-fixture.ts`** (PDF LED paragraph + golden `ClimateAction`), and expanded **`.env.example`** with LLM variables per `docs/DEVELOPER_PROFILE.md`.
- **`next.config.ts`**: **`htmlLimitedBots: /.*/`** to avoid Next 16 streaming-metadata wrapper drift (SSR vs client hid `Suspense` boundary) causing **hydration mismatch warnings** in dev for `MetadataWrapper` / `<__next_metadata_boundary__>` (no app-route code changed).
- **`src/server/llm.ts`**: Ollama **`/api/chat`** body sets **`think: false`** so thinking-capable models (default **`qwen3.5`** in `.env.example`) put structured output in **`message.content`** instead of timing out / returning empty **`content`** while filling **`thinking`**.
- **Sprint 4**: Expanded **`src/server/db.ts`** mutations + **`src/lib/admin-mutation-schemas.ts`**, Greenville demo constant (`src/lib/demo-city.ts`), profile mappers (`src/lib/profile-map.ts`), **`AdminWorkspace`** client UX, onboarding fallbacks when `DATABASE_URL` is absent, deterministic **`calculations.ts`** glide heuristic, `README.md` refresh for Postgres-first workflow.
- **Sprint 4 follow-up**: **`createClimateActionMutationSchema` / `updateClimateActionMutationSchema`** coerce **`annualReduction`** and **`startYear`** from string form values (`z.coerce.number`) so **Save to Postgres** from the composer accepts normal HTML inputs without Zod **`expected number, received string`** failures.

## Verified

- Phase 1 was checked against `docs/OEF AI-Native Software Engineer Exercise.pdf`, `.cursorrules`, and `docs/DESIGN_SYSTEM.md`.
- Sprint 1 stays within scope: no PostgreSQL migrations, LLM service, auth, CRUD persistence, charts, or tests were implemented.
- `npm run build` after the Tailwind v4 `globals.css` fix; confirmed emitted CSS includes spacing and `brand-*` utilities.
- `npm run build` passed again after adding `"type": "module"`; no Tailwind/ESM warning remains.
- Browser smoke check on `http://localhost:3000/` shows expected regions: key metrics grid, sector breakdown, track status aside.
- Browser smoke check on `http://localhost:3000/admin` shows Postgres-backed editors (baseline, CRUD surfaces, reviewed import UX) once Sprint 4 is deployed locally.
- The assessment PDF was readable and contains the City Climate Action Tracker requirements.
- The intended stack is Next.js, React, TypeScript, PostgreSQL, and local-first Ollama with optional Gemini fallback.
- Empty implementation folders were removed; no `.gitkeep` placeholders remain.
- `npm install` completed successfully.
- `npm run dev` started successfully.
- Route smoke checks returned `200` for `/` and `/admin` after the Tailwind correction.
- **Sprint 2 (agent + operator)**: `npm run build` succeeds with current dependencies; **operator completed** the manual checklist (Docker Compose, `npm run db:migrate`, `npm run db:check`, build, route smoke). **Agent re-ran `npm run build` after doc updates — exit code 0** (Next.js 16.2.6).
- **Phase 2 vs PDF (via `docs/assessment-notes.md`)**: city and action field sets, enum values, and Greenville numbers match fixture + SQL seed; phased deferrals (LLM, full CRUD to DB, etc.) match the sprint plan.
- **Sprint 3 (agent + operator sanity)**: `npm run build` succeeds; route table includes **`ƒ /api/import-action`**. Operator sanity pass recorded **Monday, May 18, 2026** (build + route presence). **Optional**: Ollama running, **`OLLAMA_MODEL`** pulled, `POST /api/import-action` with LED text from **`src/lib/pdf-led-import-fixture.ts`** → **`action`** aligns with **`PDF_LED_STREET_LIGHTING_EXPECTED_ACTION`** (same numeric and enum fields; title ideally `"LED street lighting conversion"`).
- **`npm run build`** succeeds after **`htmlLimitedBots`** config change (**Next.js 16.2.6**); operator should confirm **dev** console is clean or report if mismatch persists (extensions / Turbopack can still interfere).
- **`npm run build`** (Monday, May 18, 2026) after Sprint 4 edits — TypeScript passes; **`ƒ /`**, **`ƒ /admin`**, **`ƒ /api/import-action`** in route manifest.
- **Operator-manual Sprint 4 QA** (Compose + Postgres + browser): verifies **`/`** aggregates + **`/admin`** baseline/target save, **`climate_actions`** CRUD, and import **review-before-save → persist** aligns with seeded Greenville data after cleanup.
- **Repository sanity** (Monday, May 18, 2026, close-out): **`npm run build`** exit code **0** (Next.js 16.2.6); **`npm run db:check`** **`ok: true`** (six Greenville actions). **Integration tests**: no `npm test` / Vitest / Playwright script in **`package.json` yet (**`npm test`** exits *Missing script*); Sprint 5.

## Next

- Sprint 5: Vitest/unit coverage, richer manual test notes for DB/LLM, assessment write-up polish.

## Operator-Owned Actions

- Run any additional **tests** you want before pushing.
- **Commit and push manually** when ready; agents must not run `git commit` or `git push`.
- Handle all commits and pushes manually.

## Timing

- Sprint 1 implementation started around Saturday, May 16, 2026, 3:23 PM UTC-3.
- Phase 1 / Sprint 1 completed Saturday, May 16, 2026, ~3:55 PM UTC-3 (operator sign-off after corrections and re-verification).
- Operator planning/docs time before implementation was approximately 30-40 minutes.
- Phase 1 elapsed from implementation start to operator sign-off: approximately 32 minutes.
- Sprint 2 implementation started around Saturday, May 16, 2026, ~4:25 PM UTC-3.
- Phase 2 / Sprint 2 completed Saturday, May 16, 2026, ~4:48 PM UTC-3 (operator sign-off after checklist).
- Phase 2 elapsed from implementation start to operator sign-off: approximately 23 minutes.
- Sprint 3 implementation started Monday, May 18, 2026, ~3:05 PM UTC-3.
- Phase 3 / Sprint 3 completed Monday, May 18, 2026, ~3:30 PM UTC-3 (implementation through operator sanity: `npm run build`, import route present).
- Phase 3 elapsed from implementation start through sign-off: approximately 25 minutes.
- Sprint 4 implementation started Monday, May 18, 2026, ~3:32 PM UTC-3.
- Phase 4 / Sprint 4 completed Monday, May 18, 2026, ~4:00 PM UTC-3 (implementation through operator sanity: Postgres-backed `/` and `/admin`, `npm run build`, `npm run db:check`).
- Phase 4 elapsed from implementation start through sign-off: approximately 28 minutes.
