# Progress

Start Time: Saturday, May 16, 2026, 11:15 AM UTC-3

## Current State

**Phase 1–4** remain as shipped earlier; **Phase 5 / Sprint 5** adds **Vitest** (`vitest.config.ts`, `npm test`), **unit tests** under `src/lib/*.test.ts`, **mocked `POST /api/import-action` integration test** (`src/app/api/import-action/route.integration.test.ts`), **`docs/AI_WORKFLOW_RESPONSE.md`** (answers all **four** PDF workflow questions), **`docs/MANUAL_TEST_CHECKLIST.md`**, **`npm run db:smoke`**, README refresh, and a **stretch SVG trajectory chart** on **`/`** (`src/components/emissions-trajectory-chart.tsx` + `projectedAnnualEmissionsTonsForYear` in `src/lib/calculations.ts`). **Phase 6 (PDF stretch extras — single phase, no separate Phase 7):** **`/city/[slug]`** + **`migrations/003_city_slugs_and_riverside_seed.sql`** (Greenville slug + Riverside demo), **`PublicCityDashboard`**, **`db:check`** Riverside counts, **`EmissionsTrajectoryChart`** axes + calendar-year marker, Vitest **`admin-mutation`** + **`admin-jwt-peek`** + **`admin-city-context`** + coverage include/exclude tuning; optional **`ADMIN_DEMO_SECRET`** via **`Authorization: Bearer …`** or **`admin_demo`** (`src/server/admin-auth.ts`); **`/admin/login`**, **`/admin/logout`**, **`isDemoAdminAuthenticated`** gate; **multi-city admin** — HTTP-only **`admin_city_id`**, **`listCitiesSummary`** selector, **`resolveAdminContextCityId`**, **`selectAdminCity`**, **`citySlugPublicPaths`** revalidation with **`PUBLIC_VIEWER_SLUGS`** fallback; **Log out** is **`<a href="/admin/logout">`** so Route Handler cookie expiry runs on full navigation. **JWT peek** (`src/lib/admin-jwt-peek.ts`) remains **unverified** / non-auth.

**Sprint 3 (unchanged):** `src/server/llm.ts` — Ollama, Zod, repair retry, optional Gemini, server-only keys. **`POST /api/import-action`** remains parse-only until `/admin` saves.

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
- **Sprint 5**: Vitest + **`npm test`** / **`test:watch`** / **`test:coverage`**; unit tests for **`src/lib/calculations.ts`**, **`src/lib/sorting.ts`**, **`src/lib/schemas.ts`**, **`src/lib/pdf-led-import-fixture.ts`**; **integration-style** mocked **`POST /api/import-action`** test; **`scripts/db-smoke.mjs`** + **`npm run db:smoke`**; **`docs/AI_WORKFLOW_RESPONSE.md`**, **`docs/MANUAL_TEST_CHECKLIST.md`**, README overhaul; **`EmissionsTrajectoryChart`** on **`/`**; **`src/server/admin-auth.ts`** optional gate; removed inert **`assertDemoAdminWritesAllowed` stub** from **`src/server/db.ts`**.
- **Phase 6 (PDF stretch extras — one block):** Migration **`003`** (`cities.slug`, Greenville backfill, Riverside + 2 actions); **`getCityBySlug`**, **`listCitiesSummary`**; **`/city/[slug]`** + **`not-found`**; **`PublicCityDashboard`**; home → slug links; **`PUBLIC_VIEWER_SLUGS`** comment + DB-first revalidation (**`citySlugPublicPaths`**) after mutations; **`EmissionsTrajectoryChart`** axis + “now” marker; Bearer/cookie **`ADMIN_DEMO_SECRET`** gate, **`/admin/login`**, **`/admin/logout`**, **`isDemoAdminAuthenticated`**; multi-city **`/admin`** (**`admin_city_id`**, **`resolveAdminContextCityId`**, **`selectAdminCity`**); **`src/lib/admin-city-context.ts`**, **`src/server/admin-city-resolve.ts`**, **`admin-city-context.test.ts`**; **`admin-jwt-peek.ts`**, **`admin-jwt-peek.test.ts`**, **`admin-mutation-schemas.test.ts`**; **`vitest.config.ts`** coverage tune; **`scripts/db-check.mjs`** Riverside; README / **`.env.example`**; **`<a>` logout** for cookie clear; **`assessment-notes.md`** PDF alignment table + browser QA notes in **Verified**.
- **`EmissionsTrajectoryChart` UX:** baseline cap in the blurb **and** upper-left SVG caption; **`w-full`** card (**no** inner `max-w-3xl`) so it aligns with **`DashboardSummary`** inside the **`max-w-7xl`** shell; plot height via **`clamp()`** (**`~13–26rem`** → **`~15–32rem`** sm+).

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
- **Repository sanity** (after operator fixed npm registry): **`npm test`** — **32 tests passed** (Vitest 3.2.4); **`npm run build`** — **exit 0** (Next.js 16.2.6); **`npm run db:check`** / **`npm run db:smoke`** — **`ok: true`** (Greenville 1 city / 6 actions); **`npm run test:coverage`** — **exit 0**.
- **Phase 6 (agent + operator DB with migration 003):** **`npm test`** — **41 passed**; **`npm run build`** — success (route **`ƒ /city/[slug]`**); **`npm run db:migrate`** + **`npm run db:check`** — **`ok: true`** (Greenville + Riverside slug seed); **`npm run test:coverage`** — exit **0** with trimmed `src/` include/exclude table.
- **Final pre-commit sanity (re-run):** **`npm test`** — **32 passed**; **`npm run build`** — **success**; **`npm run db:check`** — **`ok: true`** — immediately before operator commit.
- **Still optional before Q&A demo:** walk **`docs/MANUAL_TEST_CHECKLIST.md`** in the browser (especially **`/admin`** import with live Ollama/Gemini if demonstrating LLM).
- **Phase 6 final verification (May 18, 2026):** **`npm test`** (**48** passed), **`npm run build`**, **`npm run db:check`** (**`ok: true`**); **MCP browser** pass on **`/`**, **`/city/greenville`**, **`/city/riverside`**, **`/city/unknown-city-slug`** (not-found), **`/admin`** gate, **`/admin/login`** (configured secret), multi-city selector (Greenville ↔ Riverside), **`GET /admin/logout`**; **`docs/assessment-notes.md`** PDF alignment table; **`<a href="/admin/logout">`** for reliable cookie clear. **Note:** Next.js **dev** hydration overlay text was observed on **`/city/riverside`** in automation; confirm with **`npm run start`** if needed.
- **Trajectory chart (follow-up):** hard refresh **`/`** or **`/city/[slug]`** — confirm **no** tons glyph on the SVG; smaller footprint (`emissions-trajectory-chart.tsx`).

## v2.0 experimental branch (May 25, 2026)

- Created branch **`v2.0`** from frozen **`main`** (non-merge policy — assessment deliverable stays on `main`).
- **`docs/V2_SCOPE.md`** — audit-backed backlog and phased plan.
- **Phase A–C implemented (first v2 slice):**
  - Design-system UI primitives: `src/components/ui/{button,input,label,dialog,confirm-dialog,toast-provider}.tsx`
  - Global **`ToastProvider`** in `src/app/layout.tsx`; toasts on admin mutations, city switch, import parse/save, login
  - Branded **`ConfirmDialog`** replaces `window.confirm` for delete
  - **`SiteNavLinks`** active route states (`/` + `/city/*` → Public; `/admin/*` → Admin)
  - Shared system-state panels: `src/components/system-states/`
  - Admin decomposed: `src/components/admin/*` + slim `admin-workspace.tsx`
  - **Edit-in-modal** + **import review modal** (`ActionFormModal`)
  - Paginated admin table (25/page, sort headers, sector/status filters) via URL searchParams + `countClimateActionsForCity`
  - **`POST /api/import-action`** returns **401** when `ADMIN_DEMO_SECRET` is set and admin cookie/Bearer missing
  - Public **`ActionTable`** wired in `PublicCityDashboard` with client pagination (25/page)
  - **Public multi-city default:** `/` redirects to `/city/[slug]`; header **Viewing city** selector (`PublicCityPicker`) — no hero slug link

## Verified (v2 audit + implementation)

- **`npm test`** — **52 passed** (includes `admin-list-params.test.ts`, import auth integration test).
- **`npm run build`** — success (Next.js 16.2.6).

## Next

- **v2 Phase D (optional):** ESLint/Prettier, CI workflow, component/E2E tests, JWT/OAuth stretch — see **`docs/V2_SCOPE.md`**.
- **main (unchanged):** operator may commit/push **`v2.0`** when satisfied; do not merge into **`main`** without explicit decision.

## Operator-Owned Actions

- **Commit and push** when satisfied (agents do not run `git commit` / `git push`).
- After pulling: if **`db:check`** errors on missing **`slug`**, run **`npm run db:migrate`** once.

## Final sanity matrix (Phase 5)

| Area | PDF requirement | Code / docs evidence |
| ---- | ---------------- | -------------------- |
| City Admin | Baseline, target, CRUD, LLM import review-before-save | `/admin` + `src/app/admin/actions.ts` + `admin-workspace.tsx`; import via `POST /api/import-action` + Zod review |
| Public Viewer | Actions, progress, sectors, on-track | **`/`**, **`/city/[slug]`** + `src/lib/calculations.ts` + dashboard components |
| Stack | Next, TS, Postgres, Ollama (+ optional Gemini); keys server-only | `package.json`, `src/server/llm.ts`, `.env.example` |
| Scale story | Indexes, sort/pagination commentary | `migrations/001_initial_schema.sql`, `src/server/db.ts`, `src/lib/sorting.ts` |
| Tests | Unit + integration posture | `vitest.config.ts`, `src/lib/*.test.ts`, `route.integration.test.ts`, `docs/MANUAL_TEST_CHECKLIST.md` |
| Design | Open Earth aesthetic | `docs/DESIGN_SYSTEM.md`, Tailwind brand tokens, trajectory chart palette |

**Intentional gaps vs PDF:** production **OAuth/OIDC + JWKS** verification in-app is still deferred — Bearer/cookie **`ADMIN_DEMO_SECRET`** + **unverified** JWT payload peek only; **`peekUnverifiedJwtClaims`** must not be treated as authentication until signatures are verified (see file docstring).

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
- Sprint 5 implementation started Monday, May 18, 2026, ~4:10 PM UTC-3.
- Phase 5 / Sprint 5 completed Monday, May 18, 2026, ~4:45 PM UTC-3 (agent: tests/docs/chart/guard); post–npm-fix verification: **`npm test`** + **`npm run build`** + DB smoke green.
- Phase 5 elapsed from implementation start through agent hand-off: approximately 35 minutes.
- Sprint 6 implementation started Monday, May 18, 2026, ~4:50 PM UTC-3.
- Phase 6 / Sprint 6 completed Monday, May 18, 2026, ~5:23 PM UTC-3 (agent: PDF stretch — multi-city read, admin selector + demo login, Vitest, browser QA); verification: **`npm test`** + **`npm run build`** + **`npm run db:check`**.
- Phase 6 elapsed from implementation start through agent hand-off: approximately 33 minutes.
- v2.0 audit started Monday, May 25, 2026 (branch `v2.0` from `main`; scope doc only, no feature implementation).
- v2.0 Phase A–C implementation completed Monday, May 25, 2026 (UI primitives, admin workflow, public action list, import auth gate).
- v2.0 OEF ecosystem investigation completed Monday, May 25, 2026 (`docs/V2_OEF_ECOSYSTEM.md`; remote survey only, no feature implementation).
- v2.0 OEF code & feature port plan completed Monday, May 25, 2026 (`docs/V2_OEF_PORTS.md`; investigation only, no feature implementation).
- v2.0 OEF port plan reframed Monday, May 25, 2026 — **live integrations first** (OpenClimate API + CityCatalyst HIAP/OAuth), UI polish secondary.

- v2.0 OpenClimate live integration completed Monday, May 25, 2026 — server proxy to `openclimate.network`, public enrichment + target gap panels, admin actor linker, migration `004_openclimate_actor_id.sql`.

## v2.0 OpenClimate live integration (May 25, 2026)

**What changed**

- **`migrations/004_openclimate_actor_id.sql`** — `cities.openclimate_actor_id`; demo seeds Greenville → `US CHI`, Riverside → `US RAL`.
- **`src/server/openclimate.ts`** — search, actor overview, emissions, coverage stats; `loadOpenClimateDashboardContext`.
- **`src/lib/openclimate-normalize.ts`**, **`openclimate-comparison.ts`**, **`openclimate-types.ts`** — pure normalize + target gap / baseline cross-check.
- **API routes:** `GET /api/openclimate/search`, `GET /api/openclimate/actor/[id]`.
- **UI:** `OpenClimateContextPanel`, `TargetGapPanel`, `OpenClimateAttribution`, admin `OpenClimateActorPicker`.
- **`PublicCityDashboard`** — live OpenClimate sections above local Postgres metrics; footer coverage stats.
- **Admin:** `saveCityOpenClimateActor` server action; actor search + link in city profile section.
- **Admin city create:** `createAdminCity` + **New city** modal — Postgres insert, auto slug, optional OpenClimate actor, switches admin context; public `/city/[slug]` live immediately.
- **Tests:** `openclimate-comparison.test.ts`, `openclimate-normalize.test.ts`, `city-slug.test.ts` (69 total).

**What was verified**

- `npm test` 60/60 · `npm run build` success · `npm run db:migrate` applies 004.
- Browser: `/` shows Chicago targets, CDP benchmark link, target gap, OpenClimate footer stats.
- Browser: `/city/riverside` shows `US RAL` enrichment.
- API: `/api/openclimate/search?name=Chicago` and `/api/openclimate/actor/US CHI` return live data.

**What is next**

- Operator review demo narrative (Greenville local data + Chicago OpenClimate actor for live target demo).
- Optional: link other actors via admin without CityCatalyst OAuth.

**Operator-owned actions**

- Run `npm run db:migrate` if `openclimate_actor_id` column missing.
- Set `OPENCLIMATE_ENRICHMENT=0` to disable live calls.

## v2.0 OEF code & feature port plan (May 25, 2026)

**What changed**

- Added **`docs/V2_OEF_PORTS.md`**: ranked summary (top 10), repos surveyed, port candidates table (20 rows), detailed specs for top 8 candidates, quick wins, phase-2 integrations, not-worth-porting list, AGPL notes, build order, operator open questions.
- Consolidates actionable port guidance from CityCatalyst, OpenClimate, cc-poc-template, OpenClimate-Schema, and CAP-Plan-Creator surveys; notes v2.0 items already shipped (toasts, modals, public `ActionTable`).

**What was verified**

- Mandatory repos via `gh` + raw GitHub reads: CC `ActionDrawer`, `ClimateActionCard`, `BarVisualization`, GHGI import steps, modals, HIAP, E2E; OpenClimate `API.md` + search/actor routes; cc-poc OAuth guide + HIAP modal.
- Live OpenClimate: `search/actor?name=Chicago` → `US CHI`; `actor/US CHI` → targets + emissions datasources.
- **`npm test`**: 52/52 pass · **`npm run build`**: success on `v2.0`.

**What is next**

- Operator **Go** on port plan build order (C1 quick wins → C2 public drawer → C3 OpenClimate enrichment → C4 HIAP mock → D Playwright/OAuth).
- Resolve open questions: AGPL policy, demo actor IDs vs mock enrichment, drawer vs card grid preference.

**Operator-owned actions**

- Review **`docs/V2_OEF_PORTS.md`** and approve implementation priority before coding.

## v2.0 OEF ecosystem investigation (May 25, 2026)

**What changed**

- Added **`docs/V2_OEF_ECOSYSTEM.md`**: executive summary, repo survey table, feature adoption matrix (Tier A/B/C), top 10 prioritized recommendations, integration sketches, out-of-scope list, cross-reference with **`docs/V2_SCOPE.md`**, operator open questions.
- Updated **`docs/TODO.md`** with v2.0 OEF ecosystem backlog bullets (experimental, no merge to `main`).
- Updated **`docs/status/current.md`** to reflect both v2 scope docs.

**What was verified**

- Remote read of CityCatalyst (`ActionDrawer`, `ClimateActionCard`, import steps, modals, toaster, E2E), cc-poc-template (README, module registry, OAuth guide), OpenClimate (API.md, NotificationProvider), OpenClimate-Schema (README, tables).
- Live OpenClimate API: `name=Chicago` → actor `US CHI` with population/targets/emissions; generic Greenville/Riverside `q=` searches unreliable on production API.
- **`npm test`**: 48/48 pass on `v2.0`. **`npm run build`**: failed at investigation time due to parallel `admin-workspace.tsx` type export (not fixed in this pass).

**What is next**

- Operator **Go** on merged roadmap from **`docs/V2_SCOPE.md`** + **`docs/V2_OEF_ECOSYSTEM.md`**.
- Phase A: toasts + confirm dialog (aligns OEF + internal P0).
- Phase B: admin edit modal (OEF clarifies modal=edit, drawer=read-only detail) + import review modal.
- Phase C: public action list + optional OpenClimate enrichment proxy.

**Operator-owned actions**

- Decide AGPL reference-only policy, OpenClimate demo city actor IDs vs mock enrichment, modal vs drawer final UX, OAuth/HIAP deferral.
