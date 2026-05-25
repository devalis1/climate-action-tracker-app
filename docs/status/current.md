# Current Status

## v2.0 experimental (May 25, 2026)

- Branch **`v2.0`** from frozen **`main`** — **not for merge** into assessment deliverable.
- **`docs/V2_SCOPE.md`** — audit + backlog; **Phase A–C shipped** (toasts, confirm dialog, admin modals/pagination, public action table, import auth gate).
- **`docs/V2_OEF_ECOSYSTEM.md`** — OEF GitHub ecosystem investigation (separate pass).
- **`docs/V2_OEF_PORTS.md`** — actionable code & feature port plan (OpenClimate Tier 1 implemented).
- **OpenClimate live integration** — public viewer enriches from `openclimate.network` when `cities.openclimate_actor_id` is set; admin actor search/link; no CityCatalyst OAuth.
- **Admin city create** — **New city** modal inserts into Postgres (name, slug, baseline, target, optional OpenClimate actor); switches admin context; `/city/[slug]` and header picker update without a migration.
- Verified on branch: **`npm test`** (69), **`npm run build`** (pass). Phase D (ESLint/CI/E2E/stretch) pending.
- **Public multi-city UX:** `/` redirects to `/city/[defaultSlug]`; header **Viewing city** selector lists all seeded cities (no inline slug link in hero copy).

## Real

- **Phase 1–4** unchanged in scope: Greenville primary admin footprint, Postgres-backed **`/`** + **`/admin`**, CRUD + **review-before-save** import via `POST /api/import-action`, linear glide **on-track** heuristic (`src/lib/calculations.ts`).
- **Phase 5 / Sprint 5:** Vitest wired in `package.json` + `vitest.config.ts`; unit tests for `calculations.ts`, `sorting.ts`, `schemas.ts`, `pdf-led-import-fixture.ts`; mocked **`POST /api/import-action`** integration test (no live Ollama/Postgres).
- **`npm run db:smoke`** — runs `db:check` and prints optional import `curl`.
- **Docs:** `README.md` entrypoint, **`docs/AI_WORKFLOW_RESPONSE.md`** (four PDF questions), **`docs/MANUAL_TEST_CHECKLIST.md`**.
- **Trajectory chart:** `EmissionsTrajectoryChart` (axes, calendar-year marker when in-range).
- **Admin gate (`src/server/admin-auth.ts`):** optional **`ADMIN_DEMO_SECRET`** — **`Authorization: Bearer <secret>`** or cookie **`admin_demo`** must match when set; **`isDemoAdminAuthenticated`** hides the workspace until the cookie is present; **`/admin/login`** (Server Action sets cookie) + **`/admin/logout`** (clears `admin_demo` + **`admin_city_id`**).
- **Multi-city admin:** HTTP-only **`admin_city_id`** cookie; **`listCitiesSummary`** powers the selector; mutations use **`resolveAdminContextCityId`** (`src/server/admin-city-resolve.ts`); **`selectAdminCity`** switches context; post-mutation **`revalidatePath`** prefers DB slugs via **`citySlugPublicPaths`**, with **`PUBLIC_VIEWER_SLUGS`** fallback — see comment in `src/lib/public-viewer-slugs.ts`.
- **`src/lib/admin-jwt-peek.ts`:** **`peekUnverifiedJwtClaims`** (no signature verification) — documented as **non-auth** until JWKS/IdP verification exists.
- **Phase 6 polish (multi-city read + admin stretch):** **`migrations/003_city_slugs_and_riverside_seed.sql`** adds **`cities.slug`**, backfills Greenville as **`greenville`**, seeds **Riverside** (`riverside`, 2 actions). Public **`/city/[slug]`** + **`src/components/public-city-dashboard.tsx`**; **`/`** links to Greenville slug path; **`npm run db:check`** verifies Riverside counts; multi-city **`/admin`**, **`/admin/login`**, **`/admin/logout`** as above.
- **Phase 6 (May 18, 2026 — stretch extras):** **`npm test`** (**48**), **`npm run build`**, **`npm run db:check`**; browser spot-check (`/`, `/city/greenville`, `/city/riverside`, gated `/admin`, login, city switch, **`GET /admin/logout`**); **`docs/assessment-notes.md` → Final alignment vs PDF**. **Log out** is **`<a href="/admin/logout">`**. *(There is no Phase 7 — all PDF stretch items are Phase 6.)*

## Planned / deferred

- **Verified JWT / OAuth:** no issuer/JWKS verifier in-repo — demo **`ADMIN_DEMO_SECRET`** + unsafe JWT peek only; production IdP/session wiring remains an operator exercise.

## Operator actions

- **Migrate:** databases created before **May 18, 2026** slug work need **`npm run db:migrate`** once (applies **`003_city_slugs_and_riverside_seed.sql`**). **`db:check`** errors referencing missing **`slug`** mean migrate has not run.
- **Gated admin:** set **`ADMIN_DEMO_SECRET`** in `.env.local`, restart dev, open **`/admin/login`**, submit the same value, then use **`/admin`**. Log out via **`/admin/logout`** or clear cookies.
- **Automated checks:** **`npm test`**, **`npm run build`**, **`npm run db:check`** (after migrate) — see **`docs/PROGRESS.md` → Verified**.
- **Ready to commit/push** (owner-owned).
