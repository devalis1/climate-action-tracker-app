# Current Status

## Real

- Phase 1 / Sprint 1 is complete and verified against the assessment scope.
- Repository exists and has initial project guidance for the OEF AI-Native Software Engineer Exercise.
- `docs/OEF AI-Native Software Engineer Exercise.pdf` is the source-of-truth assessment document.
- `docs/assessment-notes.md` summarizes the assessment plus personal implementation notes.
- `docs/DEVELOPER_PROFILE.md` documents local development preferences, clean code standards, Git etiquette, and local-first LLM implementation style.
- `docs/DESIGN_SYSTEM.md` documents the Open Earth / CityCatalyst visual system from live site inspection.
- `docs/PROJECT_STRUCTURE.md` documents the lean repo structure.
- `.cursorrules` defines project-specific agent rules, including no `git commit` / `git push`.
- `docs/TODO.md` breaks the work into 30-minute sprints.
- `docs/PROGRESS.md` tracks what is done and what is next.
- Structure now targets Next.js, TypeScript, PostgreSQL, and local-first Ollama with optional Gemini fallback.
- Sprint 1 is implemented as a root-level Next.js App Router app.
- Tailwind CSS is configured with Open Earth / CityCatalyst brand tokens from `docs/DESIGN_SYSTEM.md`; `src/app/globals.css` uses Tailwind v4’s `@import "tailwindcss"` and `@config` so the JS config (including `brand-*` colors and spacing scale) is actually applied.
- `src/lib/schemas.ts` defines Zod contracts and exported TypeScript types for sectors, statuses, climate actions, and city profiles.
- `src/lib/sample-data.ts` contains the Greenville assessment data as a validated in-memory fixture.
- `src/lib/calculations.ts` contains initial calculation helpers for dashboard totals and progress display.
- `/` renders the Greenville Public Viewer dashboard with computed metrics, sector breakdown, and on-track panel; layout uses aligned max-width padding, a dashboard-style KPI strip, and a two-column sector vs. status layout on large screens.
- `/admin` renders the City Admin shell with baseline/target cards, disabled future workflow buttons, and a read-only action table.
- `README.md` documents prerequisites, install/run commands, and local URLs.
- Time tracking for Sprint 1 is recorded in `docs/TODO.md` and `docs/PROGRESS.md`.

## Planned

- Add PostgreSQL migrations under `migrations/` when schema work starts.
- Add local-first LLM orchestration under `src/server/llm.ts`.
- Build City Admin CRUD/import workflows.
- Replace the placeholder on-track helper with a Sprint 4 emissions projection.
- Write the one-page AI workflow response required by the PDF.

## Operator Actions

- Review the Sprint 1 UI and docs.
- Commit and push manually when ready.
