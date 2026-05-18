# Current Status

## Real

- **Phase 1 / Sprint 1** is complete and verified against the assessment scope.
- **Phase 2 / Sprint 2** is **complete and operator-verified**: Docker Postgres, migrations, Greenville seed, `db:check`, and `npm run build` passed on the operator machine earlier; UI smoke for `/` and `/admin` was OK relative to Phase 3 scope (fixtures).
- **Phase 3 / Sprint 3 complete (operator sanity)**: `src/server/llm.ts` (Ollama + Zod + one repair pass + optional Gemini; **`think: false`** for Qwen-style thinking models), `POST /api/import-action`, `src/lib/pdf-led-import-fixture.ts`, `.env.example` LLM vars. Import route intentionally **parses-only** unless `/admin` saves.
- **Phase 4 / Sprint 4 (operator-verified Monday, May 18, 2026)**: Postgres reads for **`/`** + **`/admin`**, Greenville demo resolution via `src/lib/demo-city.ts`, **baseline/target edits**, **`climate_actions` CRUD**, **review-before-save import** wired to **`src/components/admin-workspace.tsx`** + **`src/app/admin/actions.ts`**, **linear glide heuristic** replacing the placeholder **`isOnTrack`**, onboarding states when **`DATABASE_URL` is missing**; **`z.coerce`** on composer numeric fields prevents **`expected number, received string`** on save (`src/lib/admin-mutation-schemas.ts`). See **`docs/TODO.md`** Sprint 4 **Phase 4 (implementation)** timing (Started / Completed / Elapsed).
- Repository exists with `docs/OEF AI-Native Software Engineer Exercise.pdf` as the source-of-truth assessment plus supporting docs + `.cursorrules`.
- Sprint 1 is implemented as a root-level Next.js App Router app.
- Tailwind CSS v4 respects `tailwind.config.ts` via `@config` wiring in `src/app/globals.css` with Open Earth / CityCatalyst brand tokens.
- `src/lib/schemas.ts`, `src/lib/sorting.ts`, `src/server/db.ts` mutations + reads, fixtures (`src/lib/sample-data.ts`), and LLM/import modules remain foundational for tests + parity checks.

## Planned

- **Sprint 5**: Vitest on pure helpers (no `npm test` script yet—add harness here), optional formal DB smoke script, finalize README polish + assessment write-up sections.
- **Stretch**: trajectory chart, hardened OAuth-compatible admin middleware, multi-city tenancy.

## Operator Actions

- **`git commit` / `git push`** when satisfied after your final diff review (**agents must not commit**).
- Tweak **`docs/TODO.md`** and **`docs/PROGRESS.md` → Timing** Phase 4 lines if your wall clock differs from the recorded Sprint 4 window.
