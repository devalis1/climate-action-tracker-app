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

- [ ] Create PostgreSQL migration under `migrations/`.
- [ ] Model `cities` and `climate_actions`.
- [ ] Add sector/status constraints or enums.
- [ ] Add indexes for `city_id`, `sector`, `status`, and `start_year`.
- [ ] Add comments explaining scaling strategy for millions of action records: indexed filtering, database sorting, cursor pagination, and optional partitioning by `city_id` or `start_year`.
- [ ] Add Greenville seed data.

Definition of done:

- Schema supports the required City Admin and Public Viewer flows.
- Sorting/filtering design is documented in migration or adjacent source comments.

## Sprint 3: Local-First LLM Service

Target duration: 30 minutes

- [ ] Define Zod schema for imported climate actions.
- [ ] Implement server-only free-text import flow.
- [ ] Try Ollama first.
- [ ] Validate structured JSON output.
- [ ] Add bounded repair retry.
- [ ] Add optional Gemini fallback behind an explicit environment flag.
- [ ] Include the PDF example text as a test fixture.

Definition of done:

- The sample LED street lighting paragraph parses into the expected structured action shape.
- LLM secrets remain server-only.

## Sprint 4: Frontend Dashboard & Visualizations

Target duration: 30 minutes

- [ ] Build City Admin baseline/target controls.
- [ ] Build action CRUD UI.
- [ ] Build free-text import review-before-save UI.
- [ ] Build Public Viewer dashboard.
- [ ] Show total estimated reductions vs baseline.
- [ ] Show sector breakdown.
- [ ] Show on-track/not-on-track state.
- [ ] Add projected emissions chart if time allows.

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
- [ ] PostgreSQL persistence fully wired into app routes/server actions.
- [ ] Multiple city management.
- [ ] Admin authentication with OAuth/JWT-compatible architecture.

