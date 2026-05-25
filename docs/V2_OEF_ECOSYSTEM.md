# v2.0 — Open Earth Ecosystem Investigation

Investigation date: Monday, May 25, 2026 · Branch: `v2.0` · Method: remote survey of OEF GitHub sources + live OpenClimate API probes (no OEF code vendored into this repo).

## Executive summary

- **CityCatalyst’s climate-action UX splits concerns well:** card grids for scanability, a **right-side drawer for read-only detail** (`ActionDrawer.tsx`), and **branded dialogs for destructive edits** (`delete-activity-modal.tsx`). Our v2 admin should use a **modal for edit/create/delete** and optionally a **drawer for public “view details”** — not scroll-to-composer.
- **Toast + confirm patterns are table stakes** across CityCatalyst (Chakra `toaster.tsx`), cc-poc-template (shadcn `toast`/`alert-dialog`), and our own `docs/V2_SCOPE.md` P0 items. Reimplement on Open Earth dark tokens; do not copy AGPL Chakra/shadcn markup verbatim.
- **Public viewer gap is real:** `ClimateActionCard` + our unused `action-table.tsx` both solve “enumerate initiatives.” Prefer a **dark glass table first** (already styled), then optional card grid for HIAP-like polish.
- **OpenClimate read-only enrichment (Tier B) is the highest-value external integration:** `/api/v1/search/actor` + `/api/v1/actor/{id}` can add population, official targets, and benchmark emissions beside our Postgres actions. Map demo cities to real actor IDs (Chicago works; fictional Greenville/Riverside need manual `openclimate_actor_id` or mock fallback).
- **Full GHGI import wizard is out of scope** for our assessment app; adopt **staged parse → validate → review** UX from CityCatalyst import steps without file-upload/mapping columns.
- **HIAP reprioritizer / CAP creator / nested-accounts-map** are aspirational (Tier C). A **static “suggested actions” panel** with cc-poc HIAP modal layout is enough for “native OEF module” feel.
- **cc-poc-template explicitly lists “Climate Action Progress Tracker”** as a remix use case — our app is the closest fit; its module registry is inspirational but **overkill** for two-route Next.js App Router.
- **GPC sector taxonomy ≠ our five assessment sectors** — document a mapping table; do not break existing CHECK constraints without migration.
- **AGPL-3.0 (CityCatalyst, cc-poc-template):** pattern reimplementation + attribution in docs only unless operator accepts AGPL obligations.
- **Recommended build order after both v2 reports:** Phase A feedback primitives → admin edit modal + import review modal → public action list → optional OpenClimate enrichment proxy → Playwright smoke.

---

## Repos surveyed

| Repo | License | Relevance (1–5) | Notes |
|------|---------|-----------------|-------|
| [CityCatalyst](https://github.com/Open-Earth-Foundation/CityCatalyst) | AGPL-3.0 | **5** | Primary UX reference: `ActionDrawer`, `ClimateActionCard`, GHGI import steps, Clima AI popover, delete/data-loss modals, Playwright E2E, OpenClimate city slice |
| [cc-poc-template](https://github.com/Open-Earth-Foundation/cc-poc-template) | AGPL (per README/integration) | **5** | Official “remix CityCatalyst” blueprint; lists **Climate Action Progress Tracker**; OAuth PKCE guide, module registry, shadcn UI stack, HIAP modal |
| [OpenClimate](https://github.com/Open-Earth-Foundation/OpenClimate) | Apache-2.0 | **4** | Public REST API + actor search; `NotificationProvider`; nested-accounts map; emissions grid — good for enrichment, not core CRUD |
| [OpenClimate-Schema](https://github.com/Open-Earth-Foundation/OpenClimate-Schema) | Apache-2.0 | **3** | Actor/target/emissions/provenance model; informs future `openclimate_actor_id`, `datasource_id`, scope fields |
| [CityCatalyst-global-data](https://github.com/Open-Earth-Foundation/CityCatalyst-global-data) | — | **1** | ETL/Mage pipelines — reference only |
| [CAP-Plan-Creator](https://github.com/Open-Earth-Foundation/CAP-Plan-Creator) | — | **2** | Script-style CAP generation — defer |
| CityCatalyst live / [openearth.org/projects/citycatalyst](https://www.openearth.org/projects/citycatalyst) | — | **3** | Product narrative + visual language (already captured in `docs/DESIGN_SYSTEM.md`) |

---

## Feature adoption matrix

| Feature (OEF source) | Solves in our app | Tier | Effort | License note | Recommended? |
|----------------------|-------------------|------|--------|--------------|--------------|
| Branded toast notifications (`CityCatalyst/ui/toaster.tsx`, cc-poc `toast`) | Mutation feedback; replaces inline `cityMessage` / `actionMessage` | A | S | AGPL UI — reimplement | **Yes — P0** |
| Delete confirm dialog (`delete-activity-modal.tsx`, cc-poc `alert-dialog`) | Replaces `window.confirm` | A | S | AGPL — reimplement | **Yes — P0** |
| Edit-in-modal / slide-over (`activity-form-modal` pattern; not scroll-to-composer) | Admin edit without losing table context | A | M | AGPL — reimplement | **Yes — P1** |
| Read-only action drawer (`ActionDrawer.tsx`) | Public “view details”; optional admin read mode | A | M | AGPL — reimplement | **Yes — P2** |
| Public action table/cards (`ClimateActionCard`, `action-table.tsx`) | Public viewer cannot list initiatives | A | S–M | AGPL cards — reimplement layout | **Yes — P2** |
| Import review modal + staged progress (`review-confirm-step`, `validation-results-step`) | Import friction; LLM wait visibility | A | M | AGPL — pattern only | **Yes — P1** |
| AI disclaimer + localStorage gate (`clima-ai-assistant-disclaimer-dialog`) | Trust/transparency before LLM import | A | S | AGPL — reimplement copy/flow | **Yes — P1** |
| Data-loss warning (`data-loss-warning-modal.tsx`) | Unsaved import/edit on city switch | A | S | AGPL — reimplement | **Yes — P1** |
| `BarVisualization` segmented bars | Status/effectiveness micro-viz on cards | A | S | AGPL — trivial SVG | **Optional — P2** |
| OpenClimate actor search enrichment (`/api/v1/search/actor`, `openclimateCityDataSlice`) | Demo cities feel isolated; benchmark context | B | M | Apache API — proxy OK | **Yes — Phase C+** |
| OpenClimate targets/emissions on city hero | Compare local actions vs official targets | B | M | Apache API | **Optional** |
| Nested-accounts-map / emissions-grid | Geographic/accounting hierarchy viz | C | L | Apache UI — heavy | **Defer** |
| Full GHGI import wizard (upload → map → validate → review) | Structured inventory ingest | C | L | AGPL | **No** |
| HIAP reprioritizer (`ClimateActionsSection` + API) | ML-ranked action recommendations | C | L | AGPL + backend | **Mock only** |
| Clima AI chat popover (`chat-popover.tsx`) | Conversational assistant | C | L | AGPL | **Defer** |
| CityCatalyst OAuth PKCE (`CityCatalyst-OAuth-Integration-Guide.md`) | Production admin auth | B | L | Platform contract | **Future** |
| cc-poc module registry | Admin/public modular routing | A | S | AGPL | **Skip** (App Router enough) |
| TanStack Query (cc-poc) | Client cache vs Server Actions | A | M | MIT dep | **Defer** — keep Server Actions + `router.refresh()` for demo |
| Playwright E2E (`app/e2e/dashboard.spec.ts`) | Regression on admin CRUD path | A | M | Apache test patterns OK | **Yes — Phase D** |
| GPC / OpenClimate schema alignment docs | Interop vocabulary | A | S | Apache schema | **Yes — docs/migration comment** |

---

## Top 10 recommendations (prioritized)

### 1. Toast notification system (Tier A)

- **Source:** `CityCatalyst/app/src/components/ui/toaster.tsx` (Chakra `createToaster`, bottom-end, loading/success/error); cc-poc `client/src/core/components/ui/toaster.tsx`.
- **Sketch:** Mount `ToastProvider` in root layout; `toast({ title, tone })` from admin mutations, login, import parse/save, city switch. Match `docs/DESIGN_SYSTEM.md` (dark glass, `brand-accent` success, warm `#ffb877` error).
- **Files:** `src/components/ui/toast-provider.tsx`, `src/app/layout.tsx`, `src/components/admin-workspace.tsx`, `src/app/admin/login/page.tsx`.
- **Parallel V2_SCOPE:** Directly implements **P0-1**; may overlap if Phase A already started on `v2.0`.

### 2. Branded confirm dialog for delete (Tier A)

- **Source:** `CityCatalyst/.../delete-activity-modal.tsx` — icon badge, centered copy, full-width destructive CTA, success/error toasts after mutation.
- **Sketch:** `ConfirmDialog` with focus trap, Esc cancel, pending state on Server Action; replace `window.confirm` in delete handler.
- **Files:** `src/components/ui/confirm-dialog.tsx`, `src/components/ui/dialog.tsx`, `admin-workspace.tsx`.
- **Parallel V2_SCOPE:** **P0-2** + **P0-4** shared primitives.

### 3. Admin edit/create in modal — not scroll-to-composer (Tier A)

- **Source:** CityCatalyst inventory uses **modals for edit/delete**; `ActionDrawer` is **read-only detail** opened from cards via `onSeeMoreClick`, not an edit surface.
- **Sketch:** Row “Edit” opens modal with same Zod fields + Server Actions; composer becomes “New action” only or merges into same modal with `mode: 'create' | 'edit'`. Highlight row after save.
- **Files:** New `ActionEditModal.tsx`, decomposed admin subcomponents (**P1-4**), `admin-workspace.tsx`.
- **Parallel V2_SCOPE:** **P1-1** — prefer **modal for edit**, **drawer optional for read-only detail** (resolves operator open question).

### 4. Import: staged review modal + progress states (Tier A)

- **Source:** GHGI steps `upload-file-step` → `mapping-columns-step` → `validation-results-step` → `review-confirm-step`; migrations `20260206120000-add-pdf-and-pending-ai-extraction-to-import.cjs` (`pending_ai_extraction` status enum).
- **Sketch:** Keep single textarea + `POST /api/import-action`. UI stages: (1) idle → (2) “Contacting Ollama…” loading toast/spinner → (3) **review modal** with parsed fields editable → (4) Save/Discard. Optional checkbox “I reviewed AI output” (disclaimer-lite). **Do not** port file upload/mapping for v2.
- **Files:** `ImportReviewModal.tsx`, `admin-workspace.tsx`, optionally `src/server/llm.ts` for richer error codes.
- **Parallel V2_SCOPE:** **P1-3**, **P3-6** (streaming deferred).

### 5. Wire public action list (Tier A)

- **Source:** `ClimateActionCard` (card grid, sector badge, reduction level color); OpenClimate `emissions-grid` (tabular density).
- **Sketch:** Integrate existing `ActionTable` under sector breakdown in `PublicCityDashboard`; paginate if >50 rows; fix keys to use DB `id` when wired from server rows.
- **Files:** `src/components/public-city-dashboard.tsx`, `src/components/action-table.tsx`, `src/app/city/[slug]/page.tsx`.
- **Parallel V2_SCOPE:** **P2-1**, **P2-4**.

### 6. OpenClimate city enrichment panel (Tier B)

- **Source:** `openclimateCityDataSlice.ts` (stores locode, name, region, country, area); API `GET /api/v1/search/actor?name=…` and `GET /api/v1/actor/{actor_id}`.
- **Sketch:** Add optional `openclimate_actor_id` on `cities` (migration 004). Server route `GET /api/openclimate/actor?slug=greenville` proxies to `openclimate.network`, caches 24h. Public hero shows population, latest emissions year, official targets when `has_data`. **Fallback:** static copy when fictional demo cities have no match (Greenville/Riverside `q=` search returned API errors in May 2026 — use configured IDs like `US CHI` for demo enrichment or mock JSON).
- **Files:** `src/app/api/openclimate/[...]/route.ts`, `src/server/openclimate.ts`, migration, `public-city-dashboard.tsx`.
- **Parallel V2_SCOPE:** Extends **P3-7** (per-city metadata) with live data.

### 7. AI disclaimer before first import (Tier A)

- **Source:** `clima-ai-assistant-disclaimer-dialog.tsx` + `localStorage` gate in `chat-popover.tsx`.
- **Sketch:** One-time modal: verify outputs, local Ollama, no warranty; accept stores `climate-tracker-ai-disclaimer-accepted`. Show before first parse in session.
- **Files:** `ImportDisclaimerDialog.tsx`, import panel in admin.
- **Parallel V2_SCOPE:** New; complements **P1-3** import review.

### 8. Unsaved changes guard (Tier A)

- **Source:** `data-loss-warning-modal.tsx` — warning icon, cancel vs destructive “leave”.
- **Sketch:** Track dirty composer/import draft; intercept city switch and navigation with `ConfirmDialog` variant (warning tone, not delete).
- **Files:** `admin-workspace.tsx` or `useAdminMutations` hook.
- **Parallel V2_SCOPE:** Supports **P1-5** city switch UX.

### 9. Simplified `BarVisualization` on public cards (Tier A)

- **Source:** `BarVisualization.tsx` — 3-segment horizontal bars for effectiveness levels.
- **Sketch:** Map `status` → segments (`planned`=1, `in progress`=2, `completed`=3) or reduction magnitude tiers; pure SVG/Tailwind, `brand-blue` filled / `white/20` empty.
- **Files:** `src/components/bar-visualization.tsx`, optional column in `ActionTable`.
- **Parallel V2_SCOPE:** Optional polish on **P2-1**.

### 10. Playwright admin smoke test (Tier A)

- **Source:** `app/e2e/dashboard.spec.ts` — onboarding helper, `data-testid` assertions, tab visibility.
- **Sketch:** `tests/e2e/admin.spec.ts`: login with demo secret → create action → edit in modal → delete with confirm → assert toast. Run in CI on `v2.0` only.
- **Files:** `playwright.config.ts`, `.github/workflows/v2-ci.yml`, test IDs on admin UI.
- **Parallel V2_SCOPE:** **P3-3**.

---

## Integration sketches (no code yet)

### OpenClimate city lookup enrichment

```
Browser → GET /api/openclimate/city?slug=greenville
       → Next.js route (server-only)
       → cities.openclimate_actor_id OR search fallback
       → fetch https://openclimate.network/api/v1/actor/{id}
       → normalize { population, targets[], emissionsLatest }
       → RSC props → PublicCityDashboard side panel
```

- Cache with `next: { revalidate: 86400 }` or in-memory TTL.
- Never expose upstream errors as 500 to public page — degrade gracefully.
- **Probe results (May 2026):** `name=Chicago` → `US CHI`, `has_data: true`, population + targets available; generic `q=Greenville`/`Riverside` failed on production API — configure explicit actor IDs for demos.

### CityCatalyst OAuth (future)

- Follow cc-poc `CityCatalyst-OAuth-Integration-Guide.md`: PKCE, `CLIENT_ID`, callback route, map CC user → `admin_city_id`.
- Replaces `ADMIN_DEMO_SECRET` for production-shaped demo; keep demo secret as dev fallback (**V2_SCOPE P3-4**).

### HIAP mock panel

- Static JSON of 3–5 ranked mitigation actions (title, sector, effectiveness bars) in cc-poc `hiap-actions-modal` layout.
- Label clearly “Example recommendations — not connected to HIAP API.”
- Tier C if real `ClimateActionsSection` reprioritize API is required.

### Action drawer vs import wizard

| Flow | OEF pattern | v2 recommendation |
|------|-------------|-------------------|
| View action detail (public) | `ActionDrawer` read-only | Tier A drawer or expandable row |
| Edit/delete action (admin) | Modal + toast | Tier A modal (**not** drawer) |
| LLM import | 4-step GHGI wizard | Tier A **2-step**: parse progress + review modal |
| PDF import | CC migrations `pending_ai_extraction` | Tier C — document only unless PDF upload added |

---

## Explicitly out of scope for demo

- Full **GHGI inventory** accounting, GPC sub-sectors, Mage ETL (`CityCatalyst-global-data`)
- **HIAP live reprioritization** API and ranked ML actions pipeline
- **CAP-Plan-Creator** document generation
- **Nested-accounts-map** / full OpenClimate geographic explorer
- **Clima AI** conversational popover tied to inventory context
- **CityCatalyst OAuth** in v2 Phase A–C (document as Phase D+ / production)
- **TanStack Query** migration away from Server Actions
- **Copying AGPL component source** wholesale into this repo
- Vendoring OEF repos as git submodules

---

## Cross-reference with `docs/V2_SCOPE.md`

| V2_SCOPE item | OEF investigation adds |
|---------------|------------------------|
| **P0-1 Toasts** | CityCatalyst uses Chakra global toaster with loading type; cc-poc uses shadcn — both validate custom dark toast approach |
| **P0-2 Confirm dialog** | OEF delete modal pattern: icon halo, centered legal copy, single destructive CTA, toast on result |
| **P1-1 Edit modal vs drawer** | **CityCatalyst clarifies:** drawer = read-only detail; **modal = edit/delete**. Recommend modal for admin edit; drawer optional on public viewer |
| **P1-3 Import review** | Align with `review-confirm-step` summary cards, not full upload/map pipeline |
| **P2-1 Public action list** | `ClimateActionCard` grid is alternative to table; table is faster to ship with existing `action-table.tsx` |
| **P3-3 Playwright** | Copy `data-testid` discipline from `dashboard.spec.ts` |
| **P3-4 OAuth** | cc-poc OAuth guide is the canonical integration path |
| **P3-7 City metadata** | OpenClimate actor API is enrichment source for population/targets/emissions |

**Unique to this doc (not in V2_SCOPE):** OpenClimate Tier B proxy, GPC↔assessment sector mapping, HIAP mock panel, AI disclaimer pattern, AGPL attribution policy, cc-poc “Progress Tracker” product positioning.

**Branch note:** Parallel work on `v2.0` may have started Phase A files (`src/components/ui/toast-provider.tsx`, `confirm-dialog.tsx`, `dialog.tsx`). This investigation does **not** modify `admin-workspace.tsx`. At investigation time, `npm test` passed (48/48); `npm run build` failed on a type export in `admin-workspace.tsx` (parallel refactor in progress).

---

## Specific question answers

### UX & admin workflow

**Edit-in-place vs drawer vs modal?**  
CityCatalyst: **cards → drawer (read-only detail)**; inventory **edit/delete → modal**. HIAP actions are not edited inline in the drawer. For our CRUD app: **modal for create/edit**, **confirm dialog for delete**, optional **drawer for public detail**.

**Delete / unsaved-changes vs `window.confirm`?**  
`delete-activity-modal`: branded dialog, loading on confirm, success/error toasts. `data-loss-warning-modal`: warning icon, Cancel vs Leave (destructive). Both are strictly better than native confirm for accessibility and brand.

**Toasts / notifications?**  
CityCatalyst: global Chakra toaster, bottom-end, supports loading + action button. OpenClimate: older top banner `NotificationProvider` — **prefer CityCatalyst/cc-poc bottom toast pattern**, styled dark.

**Multi-step import wizard vs single textarea?**  
Full wizard is for **spreadsheet/GHGI inventory**, not free-text action parsing. For v2: **keep textarea**; add **staged feedback** (spinner, validation summary, review modal) inspired by `validation-results-step` + `review-confirm-step`. PDF/`pending_ai_extraction` from CC migrations is irrelevant until file upload exists.

### Public viewer

**Public action list?**  
**Yes** — wire `ActionTable` first; optionally add card grid later mimicking `ClimateActionCard` density and sector badges.

**OpenClimate actor search for Greenville/Riverside?**  
**Partially.** API works for real cities (Chicago). Fictional assessment cities need **`openclimate_actor_id` column** with real IDs for demo enrichment, or mock fixture. Do not block v2 on API matching fictional names.

**Nested-accounts-map / BarVisualization?**  
`BarVisualization`: **yes**, trivial Tier A. Nested map (441+ lines, Redux): **no** for demo; our trajectory chart already covers progress storytelling.

### Data & API

**OpenClimate-Schema fields we lack:**  
`actor_id`, `datasource_id`, `Target` (type, baseline_year, target_year, percent_achieved), `EmissionsByScope` (1/2/3), `EmissionsBySector`, provenance timestamps, `ActorIdentifier` namespaces. Our model correctly keeps assessment-minimal: city baseline, target year, action title/sector/reduction/status/start year.

**GPC sector taxonomy vs our five sectors:**

| Our sector (`climate_actions`) | GPC / CityCatalyst-ish bucket | Notes |
|-------------------------------|-------------------------------|-------|
| `energy` | GPC I Stationary energy (partial) | CC also splits stationary vs grid |
| `buildings` | GPC I (buildings subset) | Overlaps stationary in GPC |
| `transport` | GPC II Transportation | Direct |
| `waste` | GPC III Waste | Direct |
| `land use` | GPC V AFOLU | Direct conceptual map |

Document mapping in migration comment or `docs/assessment-notes.md`; **do not rename** assessment sectors without migration.

**Minimal OpenClimate proxy route sketch:**

```ts
// GET /api/openclimate/search?q=Chicago&type=city
// Server-only fetch → openclimate.network/api/v1/search/actor?...
// Return { success, data: normalized actors[] }
```

Add `OPENCLIMATE_BASE_URL` env defaulting to `https://openclimate.network`.

### AI / LLM

**Import progress, disclaimer, structured repair?**  
- **Progress:** loading toast + disabled parse button (CityCatalyst import steps).  
- **Disclaimer:** Clima AI first-use dialog → adapt for import panel.  
- **Repair:** we already have bounded retry in `src/server/llm.ts`; surface repair attempt count in review modal (“AI corrected format once”).

**HIAP recommendations?**  
**Static/mock panel only** for v2; live reprioritize requires CityCatalyst inventory + HIAP API (Tier C).

### Architecture & DX

**cc-poc module registry?**  
Nice for 5+ feature modules; **skip** for our admin/public split in App Router.

**TanStack Query vs Server Actions?**  
cc-poc uses Query for CC API caching. Our Postgres mutations via Server Actions + `router.refresh()` are **sufficient for demo**; add Query only if OpenClimate client caching becomes noisy.

**Playwright E2E?**  
**Worth adding** on v2 — copy onboarding/login/testid patterns, not full CC onboarding flow.

---

## Open questions for operator

1. **AGPL comfort:** OK to treat CityCatalyst/cc-poc as **visual/pattern reference only** (no copied files), with attribution in README?
2. **OpenClimate demo data:** Map Greenville → real city actor (e.g. `US GSP` Greenville SC?) and Riverside → `US RIV` Riverside CA?, or keep fictional cities with **mock enrichment JSON**?
3. **Edit surface final call:** Admin **modal** for edit (OEF-aligned) + public **drawer** for detail — acceptable?
4. **OpenClimate proxy:** Enable in demo by default, or feature-flag `OPENCLIMATE_ENRICHMENT=1`?
5. **HIAP mock panel:** Include in v2 public viewer, or admin-only “ inspiration” sidebar?
6. **OAuth timing:** Defer entirely to post-v2, or spike PKCE callback on branch without merging to `main`?
7. **Import API gate:** Align with V2_SCOPE — require admin cookie when `ADMIN_DEMO_SECRET` set before adopting OEF-style “trusted parse” UX?

---

## Suggested implementation order (after operator Go)

1. **Phase A** (V2_SCOPE): toasts, confirm dialog, header active state — matches OEF P0 patterns.  
2. **Phase B:** admin edit modal + import review modal + data-loss guard — OEF modal/disclaimer patterns.  
3. **Phase C:** public `ActionTable` + optional `BarVisualization` + OpenClimate enrichment proxy.  
4. **Phase D:** Playwright smoke + ESLint/CI; OAuth/HIAP live remain stretch.

---

## References (paths surveyed)

- CityCatalyst: `app/src/components/ActionDrawer.tsx`, `ClimateActionCard.tsx`, `HIAP/ClimateActionsSection.tsx`, `Modals/delete-activity-modal.tsx`, `Modals/data-loss-warning-modal.tsx`, `ui/toaster.tsx`, `steps/GHGI/import/*`, `ChatBot/chat-popover.tsx`, `features/city/openclimateCityDataSlice.ts`, `app/e2e/dashboard.spec.ts`
- cc-poc-template: `README.md`, `client/src/core/routing/module-registry.ts`, `CityCatalyst-OAuth-Integration-Guide.md`, `client/src/modules/city-information/components/hiap-actions-modal.tsx`
- OpenClimate: [api/API.md](https://github.com/Open-Earth-Foundation/OpenClimate/blob/develop/api/API.md), `ui/src/UI/NotificationProvider.js`, nested-accounts-map
- OpenClimate-Schema: `README.md`, `tables.txt`
