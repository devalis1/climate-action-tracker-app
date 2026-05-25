# Open Earth Foundation — Code & Feature Port Plan

Investigation date: Monday, May 25, 2026 · Branch: `v2.0` · Method: remote survey via `gh`, raw GitHub reads, and **live API probes** against `openclimate.network` and `citycatalyst.openearth.dev` (no OEF repos vendored into this project).

**Verification baseline (this branch):** `npm test` — 52/52 pass · `npm run build` — success (Next.js 16.2.6).

---

## Summary — live integrations first (demo impress factor)

The goal for v2 is not “looks like CityCatalyst.” It is **“calls their live products.”** When you show OEF your code, the pitch is:

> *I read your cc-poc-template and CityCatalyst source, saw you integrate OpenClimate for actor/target data and CityCatalyst for HIAP/CCRA/inventory — so I wired our Climate Action Progress Tracker to **openclimate.network** (no auth) and optionally **citycatalyst.openearth.dev** (OAuth) to enrich our local Postgres actions with your live platform data.*

### Tier 1 — OpenClimate live API (no credentials, ship first)

**Public, production, Apache-2.0.** Probed working May 2026.

| What you call | Live endpoint | Demo payoff |
|---------------|---------------|-------------|
| Actor search | `GET https://openclimate.network/api/v1/search/actor?name=Chicago&type=city` | Resolve city → `US CHI` UNLOCODE; show in admin “link to OpenClimate” |
| Actor profile | `GET …/api/v1/actor/{actor_id}` | Population, area, **official climate targets** (Chicago: 25% by 2020, 62% by 2040, 80% by 2050) |
| Benchmark emissions | `GET …/api/v1/actor/{actor_id}/emissions` | CDP citywide + Carbon Monitor Cities time series — compare vs our `baseline_emissions_tons_per_year` |
| Geographic context | `GET …/api/v1/actor/{actor_id}/path` | “Chicago → Illinois → USA → Earth” breadcrumb |
| Platform stats | `GET …/api/v1/coverage/stats` | Footer/hero: “114k cities, 5.8k with emissions, 4k targets — via OpenClimate” |

**Lightweight slice (~1–2 days):** server proxy `src/server/openclimate.ts` + `cities.openclimate_actor_id` migration + public panel **“Official data (OpenClimate)”** showing target gap: *our tracked reductions vs their published target %*.

**Talking point:** *“Our actions live in Postgres, but baseline/target context comes from your OpenClimate actor API — same pattern as CityCatalyst’s `openclimateCityDataSlice`.”*

### Tier 2 — CityCatalyst live API (OAuth required, highest impress)

**Live backend:** `https://citycatalyst.openearth.dev/api/v1/` (confirmed responding). cc-poc-template documents the exact integration paths.

| What you call | cc-poc / CC source | Demo payoff |
|---------------|-------------------|-------------|
| OAuth PKCE login | `cc-poc-template/CityCatalyst-OAuth-Integration-Guide.md`, `server/routes.ts` | “Login with CityCatalyst” replaces demo secret |
| User cities + inventories | `GET /api/v0/user/cities/` (`server/services/cityService.ts`) | Pick a real CC city/inventory in admin |
| GPC inventory download | `GET /api/v0/inventory/{id}/download` | Show **real sector emissions** beside our 5 assessment sectors |
| **HIAP ranked actions** | `GET /api/v0/inventory/{id}/hiap?actionType=mitigation&lng=en` | **Live ML-ranked recommendations** — the cc-poc “Climate Action Progress Tracker” use case |
| CCRA risk dashboard | `GET /api/v0/city/{cityId}/modules/ccra/dashboard?inventoryId=…` | Climate hazard scores panel |
| City boundary GeoJSON | `GET /api/v0/city/{locode}/boundary` | Optional map on public viewer |

**Lightweight slice (~2–3 days with credentials):** OAuth spike + one admin “Connect CityCatalyst inventory” dropdown + sidebar **“HIAP suggestions (live)”** that fetches `rankedActions[]` and shows rank, cost, timeline next to our manually entered actions.

**Talking point:** *“I followed your cc-poc-template API.md — our app proxies the same HIAP endpoint your template uses in `useHIAPData`.”*

**Blocker:** needs `OAUTH_CLIENT_ID` (+ redirect URI) from CityCatalyst platform. Without it, Tier 2 stays documented only.

### Tier 3 — Cross-product “progress tracker” logic (where both meet)

Combine **our Postgres actions** + **OpenClimate targets/emissions** + **(optional) CityCatalyst HIAP**:

1. **Target gap chart** — OpenClimate official `% reduction by 2040` vs sum of our `annual_reduction_tons_per_year` projected to target year.
2. **Benchmark sanity check** — flag when our city baseline diverges >X% from OpenClimate CDP reported emissions (data quality story).
3. **HIAP overlap** — if Tier 2 live: highlight when a tracked action title/sector matches a HIAP `rankedActions[n]` entry (“you’re already doing their #2 recommendation”).
4. **Provenance footer** — cite OpenClimate `datasource_id` + publisher (CDP, Wikidata population) per OpenClimate-Schema `DataSource` model.

**Talking point:** *“Progress tracker = local CRUD + OpenClimate public benchmarks + optional CityCatalyst HIAP — exactly the remix use case in your cc-poc README.”*

### What is NOT worth faking

| Avoid | Do instead |
|-------|------------|
| Static HIAP JSON mock | Call live HIAP if OAuth available; else show OpenClimate targets only |
| UI-only drawer/toast ports as “OEF integration” | Mention as UX polish, not ecosystem integration |
| Full GHGI import wizard | Wrong product — we parse free-text actions, not GPC spreadsheets |
| CAP-Plan-Creator Python service | Separate deployment; mention as future stretch |

### Recommended demo build order (functional)

1. **OpenClimate proxy + enrichment panel** (Tier 1 — no blockers)
2. **Target gap / benchmark comparison** (Tier 3 — uses Tier 1 data)
3. **Admin actor linker** — search OpenClimate, save `openclimate_actor_id` on city
4. **CityCatalyst OAuth + live HIAP sidebar** (Tier 2 — needs credentials)
5. **CCRA panel** (Tier 2 optional — same OAuth session)

---

## Summary — full ranked list (functional + UX)

| Rank | Feature | Type | Status on `v2.0` |
|------|---------|------|------------------|
| 1 | **OpenClimate live actor/target/emissions proxy** | **Live API** | Not started |
| 2 | **Target gap: our reductions vs OpenClimate official targets** | **Live logic** | Not started |
| 3 | **CityCatalyst OAuth + live HIAP ranked actions** | **Live API** | Not started (needs CLIENT_ID) |
| 4 | **CityCatalyst GPC inventory sector comparison** | **Live API** | Not started (needs OAuth) |
| 5 | **OpenClimate actor search in admin (link demo cities)** | **Live API** | Not started |
| 6 | **OpenClimate coverage stats / datasource provenance** | **Live API** | Not started |
| 7 | **CCRA dashboard panel (CityCatalyst)** | **Live API** | Not started (needs OAuth) |
| 8 | Public read-only action drawer | UX (OEF pattern) | Not started |
| 9 | AI import disclaimer + repair visibility | UX + our LLM | Partial |
| 10 | Playwright admin smoke | DX | Not started |

**Already on `v2.0` (local app polish — not OEF live integration):** toasts, confirm dialog, admin modals, public `ActionTable`, import auth gate, decomposed admin workspace.

---

## Repos surveyed

| Repo | License | Key paths reviewed | Relevance |
|------|---------|-------------------|-----------|
| [CityCatalyst](https://github.com/Open-Earth-Foundation/CityCatalyst) | **AGPL-3.0** | `app/src/components/` (`ActionDrawer.tsx`, `ClimateActionCard.tsx`, `BarVisualization.tsx`, `Modals/*`, `steps/GHGI/import/*`, `ChatBot/*`, `HIAP/*`, `RiskCard.tsx`), `app/src/features/city/openclimateCityDataSlice.ts`, `app/e2e/dashboard.spec.ts`, `app/README.md` | Primary UX reference for climate actions, import staging, modals, HIAP |
| [OpenClimate](https://github.com/Open-Earth-Foundation/OpenClimate) | **Apache-2.0** | `api/API.md`, `api/routes/search.routes.ts`, `api/routes/actor.routes.ts`, `api/routes/climate-action.routes.ts`, `ui/src/UI/NotificationProvider.js` | Public REST API for actor search, targets, emissions; legacy UI patterns |
| [cc-poc-template](https://github.com/Open-Earth-Foundation/cc-poc-template) | **AGPL** (per README) | `README.md`, `CityCatalyst-OAuth-Integration-Guide.md`, `API.md`, `client/src/modules/city-information/components/hiap-actions-modal.tsx`, `client/src/core/routing/module-registry.ts` | Official remix blueprint; lists **Climate Action Progress Tracker** as a use case |
| [OpenClimate-Schema](https://github.com/Open-Earth-Foundation/OpenClimate-Schema) | **Apache-2.0** | `README.md`, `tables.txt`, `SQL/` | Actor, Target, EmissionsByScope/Sector, provenance model |
| [CityCatalyst-global-data](https://github.com/Open-Earth-Foundation/CityCatalyst-global-data) | — | README / pipeline layout | ETL reference only — not a port target |
| [CAP-Plan-Creator](https://github.com/Open-Earth-Foundation/CAP-Plan-Creator) | — | `README.md`, `api.py`, `agents/` | Python LLM plan generator — defer |
| Product context | — | [openearth.org/projects/citycatalyst](https://www.openearth.org/projects/citycatalyst), [openearth.org/projects/openclimate](https://www.openearth.org/projects/openclimate) | Visual language already captured in `docs/DESIGN_SYSTEM.md` |

---

## Live integration specs (what to actually build)

### A. OpenClimate proxy — **no auth, ship immediately**

**OEF source:** `OpenClimate/api/API.md`, `api/routes/search.routes.ts`, `api/routes/actor.routes.ts`; CityCatalyst reads same data via `features/city/openclimateCityDataSlice.ts`.

**Live endpoints (probed May 2026):**

```bash
# Search → UNLOCODE
curl 'https://openclimate.network/api/v1/search/actor?name=Chicago&type=city'
# → actor_id: "US CHI", has_data: true

# Official targets + population
curl 'https://openclimate.network/api/v1/actor/US%20CHI'
# → targets: 25% by 2020, 62% by 2040, 80% by 2050; population from Wikidata datasource

# Benchmark emissions (CDP + Carbon Monitor)
curl 'https://openclimate.network/api/v1/actor/US%20CHI/emissions'
# → CDP 2015: 31,550,781 tCO2e; Carbon Monitor 2019–2021 series

# Geographic breadcrumb
curl 'https://openclimate.network/api/v1/actor/US%20CHI/path'
# → Chicago → Illinois → USA → Earth

# Platform scale (great for demo footer)
curl 'https://openclimate.network/api/v1/coverage/stats'
# → 114,887 cities; 5,826 with emissions; 1,681 with targets
```

**Files to create/modify:**

| File | Purpose |
|------|---------|
| `src/server/openclimate.ts` | `searchActors`, `getActor`, `getActorEmissions`, `getCoverageStats`; Zod DTOs |
| `src/app/api/openclimate/search/route.ts` | Server proxy (never expose upstream to browser directly if you want cache control) |
| `src/app/api/openclimate/actor/[id]/route.ts` | Aggregated actor + targets + latest emissions |
| `migrations/004_openclimate_actor_id.sql` | `openclimate_actor_id TEXT` on `cities` |
| `src/components/openclimate-context-panel.tsx` | Public panel: targets, population, datasource citation link |
| `src/components/target-gap-panel.tsx` | Compare our projected reductions vs OpenClimate target % |
| `src/components/admin/openclimate-actor-picker.tsx` | Admin: search + save actor ID on city |

**Demo scope:** One city (e.g. map a demo slug to `US CHI` or `US GV9` Greenville SC) with live panel; others show “Link OpenClimate actor in admin.”

**Effort:** M · **Dependencies:** none · **License:** Apache-2.0 API — safe to call and cache.

---

### B. CityCatalyst OAuth + live HIAP — **needs CLIENT_ID**

**OEF source:** `cc-poc-template/CityCatalyst-OAuth-Integration-Guide.md`, `server/routes.ts`, `server/services/cityService.ts` (`getHIAPData`, `getInventoryDownload`, `getCCRADashboard`).

**Live backend:** `https://citycatalyst.openearth.dev/api/v1/` (welcome message confirmed).

**Key live calls (from cc-poc, same as CityCatalyst app):**

```typescript
// After OAuth — list user's cities/inventories
GET /api/v0/user/cities/

// GPC inventory with sector breakdown
GET /api/v0/inventory/{inventoryId}/download

// LIVE ranked mitigation/adaptation actions (the impress feature)
GET /api/v0/inventory/{inventoryId}/hiap?actionType=mitigation&lng=en

// Climate risk dashboard
GET /api/v0/city/{cityId}/modules/ccra/dashboard?inventoryId={inventoryId}
```

**Files to create/modify:**

| File | Purpose |
|------|---------|
| `src/server/citycatalyst-oauth.ts` | PKCE verifier/challenge, token exchange (port logic from cc-poc `authService.ts`, reimplement) |
| `src/app/api/auth/citycatalyst/initiate/route.ts` | Start OAuth |
| `src/app/api/auth/citycatalyst/callback/route.ts` | Exchange code, store tokens server-side |
| `src/server/citycatalyst.ts` | `getUserCities`, `getInventoryDownload`, `getHiap`, `getCcraDashboard` |
| `src/app/api/citycatalyst/hiap/route.ts` | Proxy HIAP for connected inventory |
| `src/components/hiap-live-panel.tsx` | Show `rankedActions[]` with rank, cost, timeline, co-benefits |
| `src/components/admin/citycatalyst-connect.tsx` | Pick inventory UUID after OAuth |

**Env vars:**

```bash
CITYCATALYST_BASE_URL=https://citycatalyst.openearth.dev
CITYCATALYST_CLIENT_ID=...          # from CityCatalyst platform
CITYCATALYST_REDIRECT_URI=http://localhost:3000/api/auth/citycatalyst/callback
```

**Demo scope:** Admin connects one inventory → public sidebar shows top 5 HIAP mitigation actions with label **“Live from CityCatalyst HIAP API.”**

**Effort:** L · **Blocker:** OAuth app registration with OEF.

---

### C. Progress tracker cross-product logic

**OEF source:** cc-poc README (“Climate Action Progress Tracker” use case); OpenClimate-Schema `Target`, `EmissionsAgg`, `DataSource`.

**Behaviors:**

1. **Target gap** — OpenClimate `targets[]` baseline_year/target_year/target_value vs our `calculateOnTrack` / projected reductions.
2. **Baseline cross-check** — our `baseline_emissions_tons_per_year` vs OpenClimate CDP latest `total_emissions` (show % delta, cite datasource).
3. **HIAP overlap** (if Tier B live) — fuzzy match our action titles to HIAP `rankedActions[].name`.
4. **Provenance** — store `datasource_id` on import metadata; display “Parsed locally · Benchmark: CDP via OpenClimate.”

**Files:** `src/lib/openclimate-comparison.ts` (pure functions + unit tests), extend `public-city-dashboard.tsx`.

**Effort:** M · **Dependencies:** Tier A minimum; Tier B optional for HIAP overlap.

---

### D. Demo script (what to say when showing code)

1. Open public city page → point at **OpenClimate panel**: *“This pulls Chicago’s official targets and CDP emissions from openclimate.network — same actor model as your OpenClimate-Schema.”*
2. Show **target gap chart**: *“Our locally tracked initiatives vs OpenClimate’s published 2040 target — that’s the progress tracker story from cc-poc-template.”*
3. Admin → **Link OpenClimate actor** search: *“I ported the search pattern from your API.md; actor IDs are UNLOCODEs like CityCatalyst stores in openclimateCityDataSlice.”*
4. (If OAuth wired) Admin → **Connect CityCatalyst inventory** → HIAP panel: *“This calls `/api/v0/inventory/{id}/hiap` — identical to your cc-poc `useHIAPData` hook.”*
5. Show `src/server/openclimate.ts` and `src/server/citycatalyst.ts` in IDE — *“Server-only proxies, no keys in the browser, same architecture as cc-poc’s Express proxy routes.”*

---

## Port candidates

| # | Feature (from OEF) | Type | Source repo/path | Port approach | Target in our app | Effort | Priority |
|---|-------------------|------|------------------|---------------|-------------------|--------|----------|
| 1 | **OpenClimate actor/target/emissions proxy** | **Live API** | OpenClimate `api/API.md`, `search.routes.ts`, `actor.routes.ts` | Server proxy + normalize | `src/server/openclimate.ts`, `/api/openclimate/*`, public panel | M | **P0** |
| 2 | **Target gap vs OpenClimate official targets** | **Live logic** | OpenClimate actor `targets[]` + our `calculations.ts` | Pure functions + UI | `target-gap-panel.tsx`, `openclimate-comparison.ts` | M | **P0** |
| 3 | **CityCatalyst OAuth PKCE** | **Live API** | cc-poc `CityCatalyst-OAuth-Integration-Guide.md`, `server/routes.ts` | Reimplement OAuth flow | `/api/auth/citycatalyst/*`, `citycatalyst-oauth.ts` | L | **P1** |
| 4 | **Live HIAP ranked actions** | **Live API** | cc-poc `getHIAPData()`, CC `inventory/{id}/hiap` | Proxy after OAuth | `hiap-live-panel.tsx`, `/api/citycatalyst/hiap` | M | **P1** |
| 5 | **GPC inventory sector comparison** | **Live API** | cc-poc `getInventoryDownload()` | Proxy after OAuth | Compare OC/CC sectors vs our 5 sectors | M | **P1** |
| 6 | **OpenClimate actor search (admin linker)** | **Live API** | OpenClimate search + CC slice pattern | API + admin UI | `openclimate-actor-picker.tsx` | S | **P1** |
| 7 | **CCRA risk dashboard** | **Live API** | cc-poc `getCCRADashboard()` | Proxy after OAuth | Optional public risk cards | M | **P2** |
| 8 | **OpenClimate coverage stats + provenance** | **Live API** | `/api/v1/coverage/stats`, datasource citations | Footer + import metadata | Layout footer, import review | S | **P2** |
| 9 | Public read-only action drawer | UX | CC `ActionDrawer.tsx` | Reimplement (AGPL) | `action-drawer.tsx` | M | **P2** |
| 10 | AI import disclaimer + repair count | UX + LLM | CC `clima-ai-assistant-disclaimer-dialog.tsx` | Reimplement + API metadata | `import-disclaimer-dialog.tsx` | S | **P2** |
| 11 | Unsaved-changes guard | UX | CC `data-loss-warning-modal.tsx` | ConfirmDialog warning tone | `admin-workspace.tsx` | S | **P3** |
| 12 | BarVisualization | UX | CC `BarVisualization.tsx` | Trivial reimplement | `bar-visualization.tsx` | S | **P3** |
| 13 | Playwright admin smoke | DX | CC `app/e2e/dashboard.spec.ts` | Adapt testids | `tests/e2e/admin.spec.ts` | M | **P3** |
| 14 | ~~HIAP mock JSON panel~~ | — | — | **Replace with live HIAP** when OAuth available | — | — | **Skip mock** |
| 15 | Full GHGI import wizard | — | CC `steps/GHGI/import/*` | **Do not port** | — | L | **No** |
| 16 | CAP-Plan-Creator | — | CAP-Plan-Creator `api.py` | **Defer** — separate Python service | — | L | **No** |

---

## Detailed port specs (top candidates)

### 1. OpenClimate city enrichment panel

**Source**

- `OpenClimate/api/API.md` — `GET /api/v1/search/actor?name={name}&type=city`, `GET /api/v1/actor/{actor_id}`
- `OpenClimate/api/routes/search.routes.ts` — actor search with `has_data`, `root_path_geo`, identifiers
- `CityCatalyst/app/src/features/city/openclimateCityDataSlice.ts` — Redux slice storing `{ locode, name, region, country, area }` (pattern reference only)

**What it does in OEF**

CityCatalyst stores OpenClimate city metadata client-side after lookup. OpenClimate returns actor overview with emissions datasources, official targets (`targets[]`), population, and geographic hierarchy.

**Live API probe (May 2026)**

- `GET …/search/actor?name=Chicago&type=city` → `US CHI`, `has_data: true`
- `GET …/actor/US CHI` → area 606 km², 3 targets, emissions keys `CDP_citywide_emissions:2019`, `carbon_monitor_cities:v0325`
- Fictional demo names (`Greenville`, `Riverside`) do not reliably match — use configured `openclimate_actor_id` or mock JSON

**Proposed implementation**

| File | Change |
|------|--------|
| `migrations/004_openclimate_actor_id.sql` | Add nullable `openclimate_actor_id TEXT` on `cities` |
| `src/server/openclimate.ts` | `searchActors(q)`, `getActor(id)`, Zod-normalized DTO |
| `src/app/api/openclimate/search/route.ts` | Server proxy; `Cache-Control` / `revalidate: 86400` |
| `src/app/api/openclimate/actor/[id]/route.ts` | Server proxy; graceful degradation |
| `src/components/openclimate-enrichment-panel.tsx` | Hero side panel: population, latest emissions year, top target |
| `src/components/public-city-dashboard.tsx` | Render panel when enrichment available |
| `src/components/admin/city-profile-form.tsx` | Optional actor ID field for operator |

**Lift vs rewrite**

- **Rewrite** all UI (AGPL-adjacent Redux slice is not useful).
- **API integration** is Apache-2.0 — proxy and normalize freely.
- Seed demo: map one city to `US CHI`; others use mock fixture until operator configures IDs.

**API / env**

```bash
OPENCLIMATE_BASE_URL=https://openclimate.network  # default
OPENCLIMATE_ENRICHMENT=1                          # optional feature flag
```

**Demo scope:** Minimal slice — one enrichment card on public hero with population + nearest net-zero target year. Full emissions breakdown deferred.

**Effort:** M · **Priority:** P0

---

### 2. Public read-only action drawer

**Source**

- `CityCatalyst/app/src/components/ActionDrawer.tsx` — right-side drawer; read-only detail for HIAP actions; uses `BarVisualization` for effectiveness; back button + sector badges
- `CityCatalyst/app/src/components/ClimateActionCard.tsx` — `onSeeMoreClick` opens drawer (cards are not the edit surface)

**What it does in OEF**

Users scan cards/table, tap “See more”, drawer shows full description, GHG reduction potential, adaptation hazards, effectiveness bars. **Edit/delete stay in modals**, not the drawer.

**Proposed implementation**

| File | Change |
|------|--------|
| `src/components/action-drawer.tsx` | Slide-over (CSS transform or headless dialog `variant="drawer"`), fields: title, sector, reduction, status, start year, optional description if added later |
| `src/components/action-table.tsx` | Row click or “Details” button → `setSelectedAction` |
| `src/components/ui/dialog.tsx` | Optional `Drawer` export sharing focus trap with existing dialog |

**Lift vs rewrite**

- **Must rewrite** — AGPL Chakra drawer markup cannot be copied verbatim.
- Logic is simple: our `ClimateAction` schema is smaller than OEF `HIAction` (no adaptation/mitigation split).

**Demo scope:** Read-only detail for our five assessment fields; no PDF export, no HIAP type switching.

**Effort:** M · **Priority:** P0

---

### 3. AI import disclaimer + repair visibility

**Source**

- `CityCatalyst/app/src/components/ChatBot/clima-ai-assistant-disclaimer-dialog.tsx`
- `CityCatalyst/app/src/components/ChatBot/chat-popover.tsx` — `localStorage.getItem("clima-ai-disclaimer-accepted")` gate before opening AI

**What it does in OEF**

First-use modal: verify outputs, local processing, no warranty. Accept persists in localStorage.

**Proposed implementation**

| File | Change |
|------|--------|
| `src/components/admin/import-disclaimer-dialog.tsx` | One-time gate; key `climate-tracker-ai-disclaimer-accepted` |
| `src/components/admin/import-and-create.tsx` | Block parse until accepted; show disclaimer on first click |
| `src/app/api/import-action/route.ts` | Return `{ repairAttempts?: number }` in JSON for review modal copy |

**Lift vs rewrite**

- **Rewrite** copy and dialog using existing `Dialog` primitive (already on branch).
- Disclaimer text should mention Ollama-first + optional Gemini, matching our `src/server/llm.ts` behavior.

**Demo scope:** Modal + one line in import review: “AI corrected format once” when repair ran.

**Effort:** S · **Priority:** P1

---

### 4. Unsaved-changes guard (data-loss warning)

**Source**

- `CityCatalyst/app/src/components/Modals/data-loss-warning-modal.tsx` — warning icon halo, Cancel vs Leave (destructive)

**What it does in OEF**

Intercept navigation when inventory form or import has unsaved edits.

**Proposed implementation**

| File | Change |
|------|--------|
| `src/components/ui/confirm-dialog.tsx` | Add `tone="warning"` variant (warm `#ffb877`, not delete red) |
| `src/components/admin-workspace.tsx` | Track `importDraftDirty` / `modalOpen`; confirm before `selectAdminCity` |
| `src/components/admin/import-and-create.tsx` | Expose dirty state upward |

**Lift vs rewrite**

- **Reimplement** using existing confirm dialog — do not copy CC modal JSX.

**Demo scope:** City switch + closing import review modal with unsaved parsed fields.

**Effort:** S · **Priority:** P1

---

### 5. BarVisualization micro-viz

**Source**

- `CityCatalyst/app/src/components/BarVisualization.tsx` — 3-segment horizontal bar, filled segments = effectiveness level

```tsx
// OEF core idea (~25 lines): Array.from({ length: total }).map segment boxes
```

**Proposed implementation**

| File | Change |
|------|--------|
| `src/components/bar-visualization.tsx` | Pure component: `value`, `total`, map status → segments (`planned`=1, `in progress`=2, `completed`=3) |
| `src/components/action-table.tsx` | Optional Status column bar beside badge |

**Lift vs rewrite**

- **Reimplement** — algorithm is trivial; styling must use `brand-blue` / `white/20`, not Chakra `blue.500` / `gray.200`.

**Effort:** S · **Priority:** P1

---

### 6. HIAP recommendations mock panel

**Source**

- `cc-poc-template/client/src/modules/city-information/components/hiap-actions-modal.tsx` — ranked cards, cost/timeline badges, co-benefit icons
- `CityCatalyst/app/src/components/HIAP/ClimateActionsSection.tsx` — live reprioritize API (too heavy for demo)

**What it does in OEF**

Shows ML-ranked mitigation/adaptation actions with rank, cost, timeline, co-benefits. Requires CityCatalyst inventory + HIAP backend.

**Proposed implementation**

| File | Change |
|------|--------|
| `src/lib/fixtures/hiap-demo-actions.json` | 3–5 static ranked actions |
| `src/components/hiap-suggestions-panel.tsx` | Dark glass panel; label “Example recommendations — not connected to HIAP API” |
| `src/components/public-city-dashboard.tsx` | Sidebar below `TrackStatusPanel` or new section |

**Lift vs rewrite**

- **Rewrite** layout inspired by cc-poc; **no** `useHIAPData` hook or CC API calls.
- AGPL — do not copy component file.

**Demo scope:** Static JSON only; no reprioritize button.

**Effort:** M · **Priority:** P2

---

### 7. Playwright admin smoke test

**Source**

- `CityCatalyst/app/e2e/dashboard.spec.ts` — `data-testid` selectors, onboarding helper, tab visibility assertions

**Proposed implementation**

| File | Change |
|------|--------|
| `playwright.config.ts` | Base URL `http://localhost:3000` |
| `tests/e2e/admin.spec.ts` | Login → create action → edit modal → delete confirm → toast visible |
| Admin components | Add `data-testid` on login form, city selector, action table rows, modals |
| `.github/workflows/v2-ci.yml` | Run on `v2.0` only (optional) |

**Lift vs rewrite**

- **Adapt patterns** — test structure and selector discipline are not license-sensitive.
- Do not port CC onboarding helper — our flow is simpler.

**Effort:** M · **Priority:** P2

---

### 8. CityCatalyst OAuth PKCE (Phase 2)

**Source**

- `cc-poc-template/CityCatalyst-OAuth-Integration-Guide.md` — PKCE sequence, `/api/auth/oauth/initiate`, `/api/auth/oauth/callback`
- cc-poc env: `OAUTH_CLIENT_ID`, `OAUTH_REDIRECT_URI`, `AUTH_BASE_URL`

**Proposed implementation**

| File | Change |
|------|--------|
| `src/app/api/auth/oauth/initiate/route.ts` | Generate PKCE verifier/challenge, redirect URL |
| `src/app/api/auth/oauth/callback/route.ts` | Exchange code, set session, map CC user → `admin_city_id` |
| `src/server/admin-auth.ts` | JWT/session verification; keep demo secret as dev fallback |

**Lift vs rewrite**

- **Reimplement** from guide — cc-poc Express routes are reference, not copy source (AGPL).

**Demo scope:** Spike on branch only; do not merge to `main`.

**Effort:** L · **Priority:** P3

---

## Quick wins (implement first — functional)

1. **OpenClimate proxy + public enrichment panel** — no credentials, live data on demo day.
2. **Target gap panel** — pure math on OpenClimate targets vs our reductions; unit-testable.
3. **Admin OpenClimate actor search** — wire `search/actor` so operator links demo cities to real UNLOCODEs.
4. **Coverage stats footer** — one `fetch` to `/api/v1/coverage/stats`; shows you read their platform docs.
5. **Datasource citation line** — “Benchmark: CDP 2019 via OpenClimate” with link to `data.cdp.net`.

## Larger integrations (phase 2 — needs OEF credentials)

1. **CityCatalyst OAuth PKCE** — “Login with CityCatalyst” (cc-poc pattern).
2. **Live HIAP sidebar** — real `rankedActions` from `/api/v0/inventory/{id}/hiap`.
3. **GPC inventory download** — sector emissions from CityCatalyst vs our simplified 5 sectors.
4. **CCRA dashboard** — hazard/risk scores from `/modules/ccra/dashboard`.
5. **City boundary GeoJSON** — optional Leaflet map from cc-poc `getCityBoundary`.

| Our sector | GPC bucket |
|------------|------------|
| `energy` | GPC I Stationary energy (partial) |
| `buildings` | GPC I buildings subset |
| `transport` | GPC II Transportation |
| `waste` | GPC III Waste |
| `land use` | GPC V AFOLU |

---

## Larger integrations (phase 2)

1. **OpenClimate enrichment proxy** — migration + server routes + public hero panel + admin actor ID field.
2. **Public action drawer** — completes viewer UX loop started by `ActionTable`.
3. **HIAP mock panel** — static recommendations for “native module” storytelling.
4. **Public city picker** — `/cities` index or header dropdown + optional OpenClimate autocomplete in admin.
5. **ClimateActionCard grid** — optional alternative layout to table for mobile/card-first UX.
6. **Playwright + CI** — lock admin CRUD regression on `v2.0`.
7. **CityCatalyst OAuth** — production auth path per cc-poc guide.

---

## Not worth porting (and why)

| OEF feature | Reason |
|-------------|--------|
| Full GHGI import wizard (upload → column mapping → validate → review) | Built for spreadsheet inventory ingest, not free-text climate action parsing |
| Clima AI chat popover | Conversational assistant tied to inventory context — scope creep vs our parse-only import |
| Nested-accounts-map / emissions-grid explorer | 400+ line Redux viz; our trajectory chart + sector breakdown already tell the progress story |
| CityCatalyst-global-data Mage ETL | Pipeline infra, not app UX |
| CAP-Plan-Creator Python service | Separate vector-store LLM deployment; not a Next.js port |
| cc-poc module registry | Overkill for two-route App Router admin/public split |
| TanStack Query migration | Server Actions + `router.refresh()` sufficient for demo scale |
| OpenClimate legacy `NotificationProvider` top banner | CityCatalyst/cc-poc bottom toast pattern is better; we already implemented custom toasts |
| Copying AGPL component source verbatim | Legal risk — reimplement patterns on `docs/DESIGN_SYSTEM.md` tokens |
| OpenClimate org-scoped `climate-action.routes.ts` CRUD | Different data model (org credentials); we own Postgres CRUD already |

---

## Open questions for operator

1. **Can OEF provide a CityCatalyst OAuth `CLIENT_ID`** for demo (redirect `localhost:3000`)? Without it, Tier 2 (live HIAP/CCRA) is blocked.
2. **Which demo city maps to a real OpenClimate actor?** Suggest: add `openclimate_actor_id` — e.g. one slug → `US CHI` (rich data) or Greenville SC → `US GV9` (name match, `has_data: false` but population via Wikidata).
3. **Do you have a CityCatalyst inventory UUID** to demo live HIAP? (cc-poc expects UUID, not LOCODE.)
4. **AGPL comfort:** OK to reimplement cc-poc/CC proxy patterns without copying source files?
5. **Demo narrative:** Lead with OpenClimate (always works) + CityCatalyst HIAP (if OAuth) — acceptable?
6. **Feature flag:** `OPENCLIMATE_ENRICHMENT=1` default on for demo?

---

## Suggested build order (after operator “Go”) — functional first

| Phase | Work | Impress factor |
|-------|------|----------------|
| **I1** | OpenClimate proxy + enrichment panel + actor admin linker | **“We call openclimate.network live”** |
| **I2** | Target gap + baseline cross-check + provenance citations | **“Progress tracker logic using your Target schema”** |
| **I3** | CityCatalyst OAuth + live HIAP panel | **“Same HIAP endpoint as cc-poc-template”** |
| **I4** | GPC inventory + CCRA (optional) | **“Full CityCatalyst module integration”** |
| **UX** | Drawer, disclaimer, Playwright | Polish — mention separately from live integrations |

---

## License notes (AGPL-3.0)

**CityCatalyst** and **cc-poc-template** are **AGPL-3.0**. Practical policy for this repo:

- **Do not** copy component source files, Chakra/shadcn markup, or substantial code blocks into our MIT/assessment codebase.
- **Do** reimplement UX patterns (drawer-for-read, modal-for-edit, staged import review, toast-on-mutation) using our Tailwind + design tokens.
- **Do** integrate **Apache-2.0** OpenClimate API responses via server-side proxy without AGPL contagion.
- **Document** OEF inspiration in README and this port plan.

---

## Cross-reference

- Internal audit: `docs/V2_SCOPE.md` (gap analysis + phased backlog)
- Ecosystem notes: `docs/V2_OEF_ECOSYSTEM.md` (parallel investigation — overlaps consolidated here)
- Design constraint: `docs/DESIGN_SYSTEM.md` (all ported UI must match dark Open Earth aesthetic)
