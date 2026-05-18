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
- [ ] Add projected emissions chart if time allows. — stretch not completed

Definition of done:

- Admin can manage actions.
- Public viewer can understand progress without admin context.
- UI visually feels native to Open Earth / CityCatalyst.

## Sprint 5: Unit Testing & Final Documentation

Target duration: 30 minutes

- [ ] Unit-test progress calculations.
- [ ] Unit-test action sorting/filtering helpers.
- [ ] Unit-test free-text import schema parsing.
- [ ] Add at least one integration-style test or documented manual test for database/LLM boundary.
- [ ] Write `README.md` with build/run instructions.
- [ ] Write the one-page AI workflow response required by the PDF.
- [ ] Update `docs/PROGRESS.md` and `docs/status/current.md`.

Definition of done:

- Deliverables are ready for GitHub or zip.
- The AI workflow write-up answers all four assessment questions.
- Remaining stretch goals are clearly documented.

## Stretch Goals

- [ ] Projected emissions chart.
- [x] PostgreSQL persistence fully wired into app routes/server actions.
- [ ] Multiple city management.
- [ ] Admin authentication with OAuth/JWT-compatible architecture.

