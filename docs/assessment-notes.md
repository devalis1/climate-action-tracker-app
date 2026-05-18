# Assessment Notes

Source of truth:

- `docs/OEF AI-Native Software Engineer Exercise.pdf`
- Personal implementation notes from May 16, 2026

## Required Product

Build a small web application for a City Climate Action Tracker.

Roles:

- City Admin: set city baseline emissions and net-zero target year; add, edit, remove climate actions; import an action from free text with an LLM; review before saving.
- Public Viewer: view climate actions, progress, sector breakdown, and whether the city is on track.

Core action fields:

- Title
- Sector: `transport`, `energy`, `buildings`, `waste`, `land use`
- Estimated annual CO2 reduction in tons/year
- Status: `planned`, `in progress`, `completed`
- Start year

## Chosen Stack

- Next.js
- React
- TypeScript
- PostgreSQL
- Local-first LLM via Ollama, with optional Gemini fallback

## Stretch Goals To Target

- Chart showing projected emissions per year.
- PostgreSQL persistence.
- Ability to manage multiple cities if time allows.
- Lightweight admin authentication if time allows.

## Production engineering depth (where reasonable)

- Unit tests vs. integration tests.
- Sorting and filtering climate action data.
- PostgreSQL indexing and partitioning approach for millions of records.
- OAuth/JWT-aware admin-auth design, even if implementation is minimal.
- AI-native workflow via `.cursorrules`, `PROGRESS.md`, `TODO.md`, and final AI workflow write-up.

## Final alignment vs PDF (May 18, 2026)

Cross-checked implementation against `docs/OEF AI-Native Software Engineer Exercise.pdf` via this summary (PDF is source of truth if any wording differs):

| PDF / notes expectation | Repo evidence |
| ----------------------- | ------------- |
| City Admin: baseline, target, CRUD, LLM import with **review before save** | `/admin`, `admin-workspace.tsx`, Server Actions, `POST /api/import-action` parse-only until save |
| Public Viewer: actions, progress, sectors, on-track | `/`, `/city/[slug]`, `calculations.ts`, dashboard components |
| Core action field set + enums | `src/lib/schemas.ts`, migrations CHECK constraints |
| Greenville sample city + six actions | `002_seed_greenville.sql`, `sample-data.ts` |
| Stack: Next.js, React, TypeScript, PostgreSQL, Ollama (+ optional Gemini) | `package.json`, `src/server/llm.ts`, `.env.example` |
| Stretch: projected emissions chart | `EmissionsTrajectoryChart` on `/` and public city dashboard |
| Stretch: Postgres persistence | Wired reads/writes via `src/server/db.ts` |
| Stretch: multiple cities | Public: `/city/[slug]`; Admin: city selector + `admin_city_id` (**Phase 6** stretch) |
| Stretch: lightweight admin auth | `ADMIN_DEMO_SECRET`, `/admin/login`, `/admin/logout`, Bearer parity |
| Engineering: tests, sort/scale story, minimal OAuth/JWT-shaped gate | Vitest, `sorting.ts`, migration index comments, `admin-jwt-peek.ts` (unverified peek only) |

**Explicitly out of scope for this exercise:** in-app JWKS JWT verification, full IdP OAuth UX.
