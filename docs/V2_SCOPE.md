# v2.0 Experimental Scope

## Branch policy

- **Branch:** `v2.0` — created from frozen `main` (OEF assessment deliverable).
- **Purpose:** Personal/experimental UX polish, admin workflow improvements, public viewer completeness, and infrastructure/DX upgrades. `main` stays untouched and merge-ready for assessment review.
- **Non-merge policy:** Do **not** merge `v2.0` into `main`. Treat assessment scope on `main` as complete; v2 is a sandbox for post-assessment iteration.
- **Git safety:** No `git commit` or `git push` unless the operator explicitly requests it.
- **Design constraint:** All UI changes must follow `docs/DESIGN_SYSTEM.md` — dark Open Earth / CityCatalyst aesthetic; no generic light SaaS or unstyled shadcn defaults.

---

## Investigation summary

Audit performed on branch `v2.0` (May 25, 2026): full read of admin, public, data, LLM, auth, design tokens, migrations, and docs; **`npm test`** (48/48 pass) and **`npm run build`** (Next.js 16.2.6, success).

**What is solid on `main`**

- Postgres schema, indexes, and scaling commentary (`migrations/001_initial_schema.sql`, `src/server/db.ts`, `src/lib/sorting.ts`).
- Local-first LLM import with Zod validation and bounded repair (`src/server/llm.ts`, `src/app/api/import-action/route.ts`).
- Admin CRUD + review-before-save import wired through Server Actions (`src/app/admin/actions.ts`).
- Public dashboards with metrics, trajectory chart, sector breakdown, on-track heuristic (`src/components/public-city-dashboard.tsx`).
- Design tokens wired in Tailwind v4 (`tailwind.config.ts`, `src/app/globals.css`).
- Unit + mocked integration tests for pure logic and import API boundary.

**Top gaps confirmed (seeds verified)**

| Gap | Evidence |
|-----|----------|
| No toast / global mutation feedback | Inline `cityMessage`, `actionMessage`, `importStatus` in `src/components/admin-workspace.tsx` (~L87–103, ~L429–433, ~L673–676); login inline alert in `src/app/admin/login/page.tsx` (~L70–76) |
| Native `window.confirm` for delete | `src/components/admin-workspace.tsx` ~L221–224 |
| Edit forces scroll to composer | `beginEdit()` (~L159–171) sets `editingActionId` + `draft`; composer is above table (~L540–679 vs ~L682–779) |
| `ActionTable` unused on public viewer | `src/components/action-table.tsx` exists; zero imports repo-wide; `PublicCityDashboard` shows aggregates only |
| Admin loads 500 rows, no table controls | `src/app/admin/page.tsx` ~L39–44 (`limit: 500`); no sort/filter/pagination UI in `admin-workspace.tsx` |
| Import “Review in editor →” friction | `promoteImportDraftToEditor()` ~L307–316; parsed preview ~L485–536 |
| Monolithic admin (~783 lines) | Single `admin-workspace.tsx` owns profile, import, composer, table |
| Duplicated onboarding/error panels | `DatabaseMissingMessage`, `DatabaseConnectMessage`, seed states duplicated in `src/app/page.tsx`, `src/app/city/[slug]/page.tsx`, `src/app/admin/page.tsx` |
| No shared branded UI primitives | Repeated inline Tailwind on buttons/inputs across admin + pages |
| Header lacks active route | `src/components/site-header.tsx` — `Public` always `text-brand-accent`; no `usePathname` |
| Testing/DX gaps | No ESLint/Prettier/CI (no `.github/`); `vitest.config.ts` excludes all `src/components/**` and app routes |
| DB sort/keyset ready but UI not wired | `listClimateActionsForCityKeyset` + `climateActionsOrderBySql` in `src/server/db.ts` / `src/lib/sorting.ts`; only offset list used from pages |

**Additional findings**

- **Import API is unauthenticated:** `POST /api/import-action` has no admin gate — anyone can hit Ollama/Gemini (`src/app/api/import-action/route.ts`). Acceptable for assessment demo; v2 should gate or rate-limit.
- **Public viewer does not enumerate actions:** Sector bars aggregate reductions; users cannot scan individual initiatives without admin access.
- **Client-side re-sort duplicates server order:** `sortedActions` useMemo in admin (~L110–116) re-sorts data already ordered by DB.
- **`ActionTable` React keys:** Uses `` `${action.title}-${action.startYear}` `` (~L29) — fragile if titles collide; admin table correctly uses `action.id`.
- **Typography substitute:** `layout.tsx` uses Space Grotesk for Archia (documented); acceptable but not exact design-system match.
- **Metadata still Greenville-centric:** `src/app/layout.tsx` description string.
- **No optimistic UI:** Every mutation calls `router.refresh()` (~L118–121) — full server round-trip per save.
- **Keyset pagination limited:** `listClimateActionsForCityKeyset` throws for non-`startYear` sorts (`src/server/db.ts` ~L274–277).
- **No sector/status DB filter helpers yet:** Sort whitelist exists; filter predicates would need new safe SQL builders for admin UI.

---

## Prioritized backlog

### P0 — UX polish (ship first)

| # | Finding | Category | Evidence | Proposed v2 solution | Risk to main |
|---|---------|----------|----------|----------------------|--------------|
| P0-1 | No toast notifications for mutations | UX | `admin-workspace.tsx` inline messages; login page inline alert | Add design-system `ToastProvider` + `toast.success/error()` hooks; fire on create/update/delete, city profile save, city switch, import parse/save, login success/failure. Auto-dismiss + optional action link (“View table”). | none |
| P0-2 | Native delete confirmation | UX / design | `window.confirm` ~L221 | Branded `ConfirmDialog` (dark glass, Archia heading, destructive warm accent `#ffb877`, focus trap, Esc cancel). Replace all native confirms. | none |
| P0-3 | Site header no active route | UX / design | `site-header.tsx` static classes | Client sub-component with `usePathname()`: highlight Public for `/` and `/city/*`, Admin for `/admin/*`; underline or filled pill per design-system tab rules. | none |
| P0-4 | Shared UI primitives missing | Design / architecture | Repeated button/input classes across admin + login | `src/components/ui/` — `Button`, `Input`, `Select`, `Textarea`, `Label`, `Dialog`, `Toast` with brand tokens from `tailwind.config.ts`. Compose admin/login from these. | none |

### P1 — Admin workflow

| # | Finding | Category | Evidence | Proposed v2 solution | Risk to main |
|---|---------|----------|----------|----------------------|--------------|
| P1-1 | Edit scrolls away from table | UX | Composer above table; `beginEdit` ~L159 | **Edit-in-modal or slide-over drawer** opened from row actions; same Zod fields + Server Actions; table stays in viewport; highlight updated row after save. Keep composer for create-only or merge into “New action” modal. | none |
| P1-2 | Admin table scale UX | UX / performance | `limit: 500`, no controls | Paginated admin table: page size (25/50/100), column sort headers mapped to `ClimateActionSortKey`, optional sector/status filters. Prefer `listClimateActionsForCityKeyset` for next/prev; expose via Server Action or route handler returning `{ rows, nextCursor }`. | none |
| P1-3 | Import review friction | UX | `promoteImportDraftToEditor` ~L307 | **Import review modal:** show parsed preview + editable fields + “Save to Postgres” / “Discard”; optional “Save directly” skipping composer. Preserve review-before-save invariant. | none |
| P1-4 | Monolithic admin workspace | Architecture | `admin-workspace.tsx` ~783 lines | Decompose: `AdminCitySelector`, `CityProfileForm`, `ImportPanel`, `ActionComposer` (create), `ActionTable` (admin variant with edit/delete), `ActionEditModal`, `useAdminMutations` hook for shared pending/toast wiring. Thin orchestrator `<AdminWorkspace>`. | none |
| P1-5 | City switch silent success | UX | `handleCityChange` ~L124–138 clears messages, no success feedback | Toast on successful switch; reset import/editor state (already partially done via `beginCreate`). | none |
| P1-6 | Duplicated error/onboarding panels | Architecture / docs | Three page files with copy-paste panels | Extract `src/components/system-states/` — `DatabaseConfigRequired`, `DatabaseConnectionFailed`, `SeedDataMissing`, `AdminLoginRequired`. Single source for copy + styling. | none |

### P2 — Public viewer

| # | Finding | Category | Evidence | Proposed v2 solution | Risk to main |
|---|---------|----------|----------|----------------------|--------------|
| P2-1 | Dead public action list | UX / product | `action-table.tsx` unused; `PublicCityDashboard` no action enumeration | Wire `ActionTable` (or paginated variant) below sector breakdown / above fold in “Climate initiatives” section. Server-fetch with same sort as admin; paginate if >50 rows. | none |
| P2-2 | No public city picker | UX | Home links to `/city/greenville`; no city index | Optional `/cities` or header dropdown using `listCitiesSummary` (read-only public API or RSC fetch). Link from hero. | none |
| P2-3 | Import API unauthenticated | Architecture / performance | `route.ts` open POST | Require demo admin cookie/Bearer for parse in gated deployments; return 401 when `ADMIN_DEMO_SECRET` set. | none |
| P2-4 | Public pages load 500 actions | Performance | `page.tsx`, `city/[slug]/page.tsx` `limit: 500` | For dashboard aggregates, consider SQL `SUM`/group queries; for action list UI, paginate. Avoid shipping full list to client when table paginates. | none |
| P2-5 | Layout metadata stale | Docs | `layout.tsx` description | Dynamic or generic metadata; per-city titles on slug routes via `generateMetadata`. | none |

### P3 — Infrastructure / stretch

| # | Finding | Category | Evidence | Proposed v2 solution | Risk to main |
|---|---------|----------|----------|----------------------|--------------|
| P3-1 | No ESLint / Prettier | DX | No eslint/prettier config in repo | Add `eslint-config-next`, Prettier, format-on-save docs; `npm run lint` script. | none |
| P3-2 | No CI pipeline | Testing / DX | No `.github/workflows` | GitHub Action: `npm test`, `npm run build`, optional lint on `v2.0` only. | none |
| P3-3 | No component or E2E tests | Testing | `vitest.config.ts` excludes components + app pages | React Testing Library for `ConfirmDialog`, toast, admin table; Playwright smoke for login → create → delete on v2 branch. | none |
| P3-4 | Verified JWT / OAuth | Architecture | `admin-auth.ts` demo secret only; `admin-jwt-peek.ts` unverified | Optional v2 stretch: JWKS verifier middleware, OAuth callback route, map `city_id` claim to `admin_city_id`. Keep demo path as fallback. | none |
| P3-5 | Optimistic updates | UX / performance | `router.refresh()` after every mutation | useOptimistic or local row patch + background revalidate; rollback on Server Action failure + error toast. | none |
| P3-6 | Import progress / streaming | UX | `parseImport` blocking fetch ~L241 | SSE or staged UI (“ contacting Ollama…”, “ validating… ”); optional streaming Ollama if API supports it later. | none |
| P3-7 | Per-city metadata | Product | `cities` table minimal | Stretch: hero image URL, population, region — new migration + admin profile section + public hero. | none |
| P3-8 | Extended keyset + filters in DB | Performance | Keyset only for `startYear`; no filter SQL | Add whitelisted `sector`/`status` WHERE builders; extend keyset to `title`/`sector` sorts or document offset-only for those. | none |
| P3-9 | Archia font hosting | Design | Space Grotesk substitute in `layout.tsx` | Self-host Archia woff2 if license permits; else document permanent substitute. | none |
| P3-10 | Sector breakdown a11y | a11y | Bars without `aria-valuenow` | Add `role="progressbar"`, labelled values for screen readers. | none |

---

## Recommended implementation phases

### Phase A — Foundation (shared UI + feedback)

**Scope:** Design-system UI primitives (`Button`, `Input`, `Dialog`, `Toast`), `ConfirmDialog`, toast provider wired into root layout, replace `window.confirm`, header active states, extract system-state panels.

**Touches:** `src/components/ui/*`, `site-header.tsx`, `layout.tsx`, new `system-states/*`, minimal changes to `admin-workspace.tsx` for toast/confirm only.

**Exit criteria:** Delete shows branded dialog; successful save shows toast visible without scrolling; header reflects route; no duplicated DB error JSX across three pages.

### Phase B — Admin workflow refactor

**Scope:** Decompose `admin-workspace.tsx`; edit-in-modal; paginated/sorted admin table wired to `listClimateActionsForCityKeyset` + filters; import review modal with direct save.

**Touches:** New admin subcomponents, optional `src/app/api/admin/actions/route.ts` or expanded Server Actions for paginated reads, `admin/page.tsx` props slimming.

**Exit criteria:** Edit row without leaving table context; 100+ row cities paginate; import saves from modal; file under ~200 lines per component.

### Phase C — Public viewer completeness

**Scope:** Integrate `ActionTable` (or paginated list) into `PublicCityDashboard`; optional public city picker; tighten public fetch limits; dynamic metadata.

**Touches:** `public-city-dashboard.tsx`, `page.tsx`, `city/[slug]/page.tsx`, possibly new `src/app/cities/page.tsx`.

**Exit criteria:** Public user can read full action list; city navigation discoverable; aggregates still correct.

### Phase D — Quality bar + stretch

**Scope:** ESLint/Prettier, CI on `v2.0`, component tests, Playwright admin smoke; optional JWT/OAuth, optimistic mutations, import progress UI.

**Touches:** Tooling configs, `.github/workflows`, `tests/e2e/*`, auth module extensions.

**Exit criteria:** CI green on branch; critical admin path covered by automated test; stretch items tracked separately if time-boxed.

---

## Out of scope for v2

- **Merging v2 into `main`** or rewriting assessment deliverable history.
- **Mobile-native app** — web-only per project constraints.
- **Replacing Postgres** or removing Ollama-first import architecture.
- **Multi-tenant SaaS billing, roles, or audit logs** beyond demo admin gate.
- **Real-time collaboration** or WebSocket action feeds.
- **Charting library overhaul** — trajectory + sector visuals are sufficient unless a explicit gap emerges.
- **Breaking schema changes without migration** — any new city metadata requires numbered SQL under `migrations/`.
- **Exposing LLM API keys to the browser** — server-only remains mandatory.

---

## Open questions for operator

1. ~~**Edit surface:** Prefer **modal** (faster, keeps table visible) or **side drawer**?~~ **Decided:** modal (edit + import review share `ActionFormModal`).
2. ~~**Toast library:** Build minimal custom toast on design tokens, or adopt a headless primitive?~~ **Decided:** custom `ToastProvider` on brand tokens.
3. ~~**Admin pagination default:** Page size 25 vs 50? Offset vs keyset?~~ **Decided:** 25/page, offset + URL searchParams (keyset deferred).
4. ~~**Public action list:** Show all or paginate?~~ **Decided:** client pagination at 25/page in `ActionTable`.
5. ~~**Import API auth:** Gate when `ADMIN_DEMO_SECRET` is set?~~ **Decided:** yes — operator confirmed secret is set; route returns 401 without admin session.
6. **v2 merge strategy:** Keep `v2.0` forever forked, or cherry-pick slices later?
7. **Archia font:** Self-host if licensed, or keep Space Grotesk substitute?
8. **Stretch priority:** Rank JWT/OAuth vs optimistic UI vs import streaming for Phase D.

---

## Verification baseline (audit run)

| Check | Result |
|-------|--------|
| `npm test` | 48 passed (8 files) |
| `npm run build` | Success — routes: `/`, `/admin`, `/admin/login`, `/admin/logout`, `/api/import-action`, `/city/[slug]` |
| Branch | `v2.0` from `main`, working tree clean before doc add |
| Design tokens | `brand-*` colors, fonts, shadows present in `tailwind.config.ts` + `globals.css` |
