# Current Status

## Real

- **Phase 1–4** unchanged in scope: Greenville demo, Postgres-backed **`/`** + **`/admin`**, CRUD + **review-before-save** import via `POST /api/import-action`, linear glide **on-track** heuristic (`src/lib/calculations.ts`).
- **Phase 5 / Sprint 5 (implementation complete in repo):**
  - **Vitest** wired in `package.json` + `vitest.config.ts`; unit tests for `calculations.ts`, `sorting.ts`, `schemas.ts`, `pdf-led-import-fixture.ts`; mocked **`POST /api/import-action`** integration test (no live Ollama/Postgres).
  - **`npm run db:smoke`** — runs Greenville `db:check` and prints optional import `curl`.
  - **Docs:** `README.md` entrypoint, **`docs/AI_WORKFLOW_RESPONSE.md`** (four PDF questions), **`docs/MANUAL_TEST_CHECKLIST.md`**.
  - **Trajectory chart (stretch):** `EmissionsTrajectoryChart` on `/` using `projectedAnnualEmissionsTonsForYear` + Open Earth palette (SVG).
  - **Admin gate (minimal):** `src/server/admin-auth.ts` — optional **`ADMIN_DEMO_SECRET`** requires cookie **`admin_demo`** for Server Actions (extension point for OAuth/JWT claims).
- Assessment PDF + `.cursorrules` + design system remain the product contract.

## Planned / deferred

- **Multi-city** UX and routing (technical hooks: `city_id`, migrations already indexed).
- **Full OAuth/OIDC** provider — cookie secret is a deliberate minimal stand-in only.

## Operator actions

- **Automated checks:** **`npm test`** (32 passed), **`npm run build`**, **`npm run db:check`** — **green** on latest sanity run (see **`docs/PROGRESS.md` → Verified**).
- **Ready to commit/push** (owner-owned).
- **Optional:** **`docs/MANUAL_TEST_CHECKLIST.md`** in the browser (admin import + live Ollama/Gemini for LLM demo).
- **Git:** agents do not commit; `.env.local` and **`coverage/`** stay untracked by design (see `.gitignore`).
