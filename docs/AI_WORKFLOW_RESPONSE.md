# AI workflow (one page max)

Questions below are quoted from `docs/OEF AI-Native Software Engineer Exercise.pdf` (“How You Build It Matters” / write-up bullet list).

## 1. Which AI tools you used and your general workflow with them

- **Primary:** Cursor with chat/agent for implementation across Next.js App Router, PostgreSQL wiring, Zod contracts, and the Ollama-first import pipeline.
- **Workflow:** Keep the assessment PDF and `docs/assessment-notes.md` in view; drive phased delivery (sprints in `docs/TODO.md`) and update `docs/PROGRESS.md` after each milestone; use `.cursorrules` + `docs/DESIGN_SYSTEM.md` so generated UI stays on-brand rather than default gray/SaaS templates.
- **Iteration loop:** ask for small, reviewable diffs; run `npm run build` after structural changes; use `npm run db:check` when touching persistence; defer production-only concerns (full IdP, multi-tenant routing) with explicit extension points.

## 2. One moment where AI saved you significant time — what did you prompt, what did it generate, why was it good?

- **Situation:** Next.js 16 + Tailwind v4 misconfiguration caused spacing/brand utilities not to emit (legacy `@tailwind` directives and v4 not loading `tailwind.config.ts`).
- **Prompt (intent):** “Diagnose why Tailwind utilities are missing in a Next.js App Router app using Tailwind v4; fix `globals.css` and config wiring.”
- **What it produced:** A minimal `@import "tailwindcss"` + `@config` pattern aligned with v4, restoring `p-*`, `gap-*`, and `brand-*` colors.
- **Why it mattered:** Fast, targeted fix compared to spelunking v4 migration docs under time pressure; unblocked credible Open Earth styling for the dashboard.

## 3. One moment where you overrode or corrected the AI — what did it get wrong, how did you catch it, what did you do instead?

- **Problem:** Local Ollama import returned empty JSON content for a thinking-capable model (structured output landed in a separate “thinking” channel while `message.content` stayed empty), causing flaky `/api/import-action` results.
- **How caught:** Server logs and the Ollama `/api/chat` response shape showed reasoning text outside `message.content`; the Zod path never ran despite HTTP 200.
- **Fix:** Set `think: false` (or equivalent) in the Ollama request body so JSON stays in `message.content`, keeping the Zod + single repair-retry contract intact—rather than parsing alternate fields in application code.

## 4. How you structured your session — context up front? Rules/instructions files? How did you break down the work?

- **Up-front context:** Assessment PDF as source of truth; `.cursorrules` encodes stack (Next/TS/Postgres, server-only LLM keys, scalability notes); design tokens in `docs/DESIGN_SYSTEM.md`.
- **Breakdown:** Sprint 1 scaffold + design system → Sprint 2 schema/migrations/seed → Sprint 3 Ollama + Zod import → Sprint 4 Postgres-backed `/` and `/admin` CRUD + review-before-save import → Sprint 5 Vitest coverage + docs + trajectory chart stretch + optional admin cookie gate.
- **Rules / docs:** `docs/TODO.md` for scope and timing; `docs/PROGRESS.md` for what is real vs. next; `README.md` + `.env.example` as the operator entrypoint for build, DB, and LLM configuration.
