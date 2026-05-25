# TODO: OEF Climate Action Tracker

Session started: Saturday, May 16, 2026, 11:15 AM UTC-3

Record sprint start and completion times here after each phase is done—not as predictions upfront.

## Sprint 1: Initial Setup & Design System

Target duration: 30 minutes
Status: Complete

Phase 0 (planning/docs):

- Started: Saturday, May 16, 2026, 11:15 AM UTC-3
- Completed: Saturday, May 16, 2026, ~11:50 AM UTC-3 (approximately 30-40 minutes)
- Paused before implementation (break).

Phase 1 (implementation):

- Started: Saturday, May 16, 2026, ~3:23 PM UTC-3
- Completed: Saturday, May 16, 2026, ~3:55 PM UTC-3
- Elapsed: approximately 32 minutes

- [x] Create the Next.js + TypeScript app in the repository root.
- [x] Add Open Earth design tokens from `docs/DESIGN_SYSTEM.md`.
- [x] Add public viewer and admin routes.
- [x] Add Greenville sample data as an initial fixture.
- [x] Confirm no generic shadcn defaults remain in first-pass UI.

Definition of done:

- App boots locally.
- Open Earth colors/fonts/tokens are wired.
- The assessment PDF and project docs are discoverable from the repo.

## Sprint 2: Database Schema & Partitioning Logic

Target duration: 30 minutes

Status: Complete — operator verified (Docker, migrations, `db:check`, build).

Phase 2 (implementation):

- Started: Saturday, May 16, 2026, ~4:25 PM UTC-3
- Completed: Saturday, May 16, 2026, ~4:48 PM UTC-3
- Elapsed: approximately 23 minutes

- [x] Create PostgreSQL migration under `migrations/`.
- [x] Model `cities` and `climate_actions`.
- [x] Add sector/status constraints or enums.
- [x] Add indexes for `city_id`, `sector`, `status`, and `start_year`.
- [x] Add comments explaining scaling strategy for millions of action records: indexed filtering, database sorting, cursor pagination, and optional partitioning by `city_id` or `start_year`.
- [x] Add Greenville seed data.

Definition of done:

- Schema supports the required City Admin and Public Viewer flows.
- Sorting/filtering design is documented in migration or adjacent source comments.

## Sprint 3: Local-First LLM Service

Target duration: 30 minutes

Status: Complete — operator sanity: `npm run build` OK; `ƒ /api/import-action` + `src/server/llm.ts` + PDF LED fixture; optional Ollama smoke still recommended.

Phase 3 (implementation):

- Started: Monday, May 18, 2026, ~3:05 PM UTC-3
- Completed: Monday, May 18, 2026, ~3:30 PM UTC-3
- Elapsed: approximately 25 minutes

- [x] Define Zod schema for imported climate actions.
- [x] Implement server-only free-text import flow.
- [x] Try Ollama first.
- [x] Validate structured JSON output.
- [x] Add bounded repair retry.
- [x] Add optional Gemini fallback behind an explicit environment flag.
- [x] Include the PDF example text as a test fixture.

Definition of done:

- The sample LED street lighting paragraph parses into the expected structured action shape.
- LLM secrets remain server-only.

## Sprint 4: Frontend Dashboard & Visualizations

Target duration: 30 minutes

Status: Complete — operator verified (Postgres dashboards, `/admin` CRUD + import review-save, build + db:check).

Phase 4 (implementation):

- Started: Monday, May 18, 2026, ~3:32 PM UTC-3
- Completed: Monday, May 18, 2026, ~4:00 PM UTC-3
- Elapsed: approximately 28 minutes

- [x] Build City Admin baseline/target controls.
- [x] Build action CRUD UI.
- [x] Build free-text import review-before-save UI.
- [x] Build Public Viewer dashboard.
- [x] Show total estimated reductions vs baseline.
- [x] Show sector breakdown.
- [x] Show on-track/not-on-track state.
- [x] Add projected emissions chart if time allows. — delivered Sprint 5 (`EmissionsTrajectoryChart` on `/`).

Definition of done:

- Admin can manage actions.
- Public viewer can understand progress without admin context.
- UI visually feels native to Open Earth / CityCatalyst.

## Sprint 5: Unit Testing & Final Documentation

Target duration: 30 minutes

Status: Complete — agent: tests + docs + chart + README (operator: `npm install` if lockfile not yet updated, then `npm test` / browser QA).

Phase 5 (implementation):

- Started: Monday, May 18, 2026, ~4:10 PM UTC-3
- Completed: Monday, May 18, 2026, ~4:45 PM UTC-3
- Elapsed: approximately 35 minutes

- [x] Unit-test progress calculations.
- [x] Unit-test action sorting/filtering helpers.
- [x] Unit-test free-text import schema parsing.
- [x] Add at least one integration-style test or documented manual test for database/LLM boundary.
- [x] Write `README.md` with build/run instructions.
- [x] Write the one-page AI workflow response required by the PDF.
- [x] Update `docs/PROGRESS.md` and `docs/status/current.md`.

Definition of done:

- Deliverables are ready for GitHub or zip.
- The AI workflow write-up answers all four assessment questions.
- Remaining stretch goals are clearly documented.

## Sprint 6: Stretch polish (PDF extras — multi-city read + admin + auth UX + QA)

Target duration: 45 minutes

Status: Complete — agent: multi-city read + demo admin auth + Vitest + browser QA (operator: `npm run db:migrate` if DB predates migration 003).

Phase 6 (implementation):

- Started: Monday, May 18, 2026, ~4:50 PM UTC-3
- Completed: Monday, May 18, 2026, ~5:23 PM UTC-3
- Elapsed: approximately 33 minutes

- [x] Multi-city read routing + seed (`/city/[slug]`, Riverside rowset, `cities.slug` migration).
- [x] Demo admin gate: Bearer/cookie `ADMIN_DEMO_SECRET`, `/admin/login`, `/admin/logout`, `isDemoAdminAuthenticated`; JWT peek helper + tests (no JWKS verifier).
- [x] Multi-city `/admin`: `admin_city_id` cookie, city selector, `resolveAdminContextCityId`, DB-first revalidation + `admin-city-context` tests.
- [x] Trajectory chart axis / current-year marker; Vitest `src/` coverage include/exclude tune.
- [x] `db:check` + README aligned with Riverside seed; operators must migrate.
- [x] `assessment-notes.md` PDF alignment table; Log out uses `<a href="/admin/logout">` for reliable cookie clear.

Definition of done:

- Greenville remains default **`/`**; **`npm run db:migrate`** applies slug migration cleanly.
- PDF stretch extras for this assessment are Phase 6 only (no separate Phase 7).
- Production JWKS/OAuth remains deferred (see Stretch Goals).

## Stretch Goals

- [x] Projected emissions chart (SVG trajectory on `/`, Open Earth palette — no extra chart library).
- [x] PostgreSQL persistence fully wired into app routes/server actions.
- [x] Multiple city management (**admin UX**): `/admin` selector + `admin_city_id` + `listCitiesSummary` (bounded query).
- [ ] Admin authentication — **production**: OAuth/JWT with **JWKS signature verification** in-repo (or trusted upstream session). **Demo slice shipped:** `ADMIN_DEMO_SECRET` + `/admin/login` cookie + Bearer parity; **`peekUnverifiedJwtClaims`** remains non-auth.

## v2.0 experimental (branch `v2.0` — do not merge to `main`)

Status: Phase A–C shipped on branch — Phase D (ESLint/CI/E2E/stretch) pending.

Phase v2-audit (investigation):

- Started: Monday, May 25, 2026
- Completed: Monday, May 25, 2026
- Elapsed: single session (audit + scope doc only)

- [x] Create `v2.0` branch from `main`.
- [x] Full codebase audit (`npm test`, `npm run build`, checklist walk).
- [x] Publish prioritized backlog in **`docs/V2_SCOPE.md`**.

Phase A (shared UI + feedback):

- [x] Design-system `Button`, `Input`, `Dialog`, `Toast` primitives.
- [x] Toast notifications for admin mutations + login.
- [x] Branded `ConfirmDialog` replacing `window.confirm`.
- [x] Header active route indication.
- [x] Extract shared system-state panels.

Phase B (admin workflow):

- [x] Decompose `admin-workspace.tsx` into `src/components/admin/*`.
- [x] Edit-in-modal + import review modal.
- [x] Paginated/sorted admin table (25/page, filters).
- [x] Gate `POST /api/import-action` when `ADMIN_DEMO_SECRET` set.

Phase C (public viewer):

- [x] Wire `ActionTable` into `PublicCityDashboard` with pagination.

Phase D (planned — infrastructure / stretch):

- [ ] ESLint + Prettier + `npm run lint`.
- [ ] GitHub Actions CI on `v2.0`.
- [ ] Component / Playwright admin smoke tests.
- [ ] JWT/OAuth, optimistic updates, import streaming (stretch).

### v2.0 — OEF ecosystem (experimental investigation)

Status: Complete — **`docs/V2_OEF_ECOSYSTEM.md`** + **`docs/V2_OEF_PORTS.md`**; awaiting operator **Go** before further OEF ports.

- [x] Survey CityCatalyst, OpenClimate, cc-poc-template, OpenClimate-Schema (remote).
- [x] Publish feature adoption matrix + prioritized OEF-inspired recommendations.
- [x] Publish actionable port plan with source paths, effort, and build order (`docs/V2_OEF_PORTS.md`).
- [ ] Admin edit **modal** + public read **drawer** (CityCatalyst pattern — not scroll-to-composer).
- [ ] Import staged review modal + AI disclaimer (GHGI wizard pattern, not full file pipeline).
- [ ] Public action list + optional `BarVisualization` (Tier A).
- [x] OpenClimate read-only enrichment proxy (`/api/openclimate/*`, live panels on public viewer).
- [ ] Admin edit **modal** + public read **drawer** (CityCatalyst pattern — not scroll-to-composer).
- [ ] Playwright admin smoke (CityCatalyst E2E pattern).
- [ ] Defer: full GHGI wizard, HIAP live API, nested-accounts-map, OAuth (document only).

