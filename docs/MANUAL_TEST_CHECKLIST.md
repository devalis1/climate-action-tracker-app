# Manual test checklist (browser → API → Postgres)

Use after `docker compose up -d`, `npm run db:migrate`, `npm run db:check`, and `npm run dev`.

## Public Viewer (`/`)

- [ ] Page loads without onboarding errors when `DATABASE_URL` is set.
- [ ] KPI strip shows baseline, target year, reductions vs baseline.
- [ ] Sector breakdown lists expected sectors for Greenville seed.
- [ ] Track panel shows on-track / needs acceleration messaging.
- [ ] Projected emissions trajectory card renders (linear glide to net-zero year).

## City Admin (`/admin`)

- [ ] Adjust baseline and/or target year → Save → refresh `/` and confirm values.
- [ ] Create a new climate action (all fields) → Save → appears on `/` after refresh.
- [ ] Edit an existing action → Save → changes visible on `/`.
- [ ] Delete an action (if exposed in UI) → confirm removal on `/`.

## Import (LLM)

- [ ] Paste the PDF LED street lighting paragraph (`src/lib/pdf-led-import-fixture.ts`) → Parse → structured fields populate.
- [ ] Edit if needed → **review-before-save** → Save to Postgres → row appears in admin list and `/`.
- [ ] If Ollama is down: expect a clear error from `POST /api/import-action`; optional Gemini fallback only when `ENABLE_CLOUD_FALLBACK` + `GEMINI_API_KEY` are set per `.env.example`.

## API / scripts (operator)

- [ ] `npm run db:smoke` — Greenville counts + prints optional `curl` for import API.
- [ ] With dev server running: `curl` POST to `/api/import-action` (see script output or `README.md`) returns JSON `{ ok, action? }` when LLM succeeds.

## Database

- [ ] `npm run db:check` → `ok: true`, six Greenville actions (after seed).
- [ ] Optional: `docker compose exec postgres psql …` per `README.md` to inspect rows.
