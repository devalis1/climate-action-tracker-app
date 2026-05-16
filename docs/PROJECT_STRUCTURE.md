# Project Structure

This repository should stay lean until implementation starts. The OEF exercise asks for a small web application, not a large monorepo scaffold.

## Current Planning Structure

```text
climate-action-tracker-app/
  .cursorrules
  docs/
    OEF AI-Native Software Engineer Exercise.pdf
    assessment-notes.md
    DESIGN_SYSTEM.md
    DEVELOPER_PROFILE.md
    PROJECT_STRUCTURE.md
    PROGRESS.md
    TODO.md
    status/
      current.md
```

## Implementation Structure To Create Next

When coding starts, use one focused Next.js app at the repo root:

```text
climate-action-tracker-app/
  .cursorrules
  package.json
  next.config.ts
  tsconfig.json
  postcss.config.mjs
  tailwind.config.ts
  src/
    app/
      page.tsx                 # public viewer dashboard
      admin/
        page.tsx               # city admin workspace
      api/
        import-action/
          route.ts             # server-only LLM import endpoint
    components/
      action-form.tsx
      action-table.tsx
      dashboard-summary.tsx
      sector-breakdown.tsx
    lib/
      calculations.ts          # progress/on-track/projection helpers
      sample-data.ts           # Greenville starter data
      schemas.ts               # shared Zod schemas
      sorting.ts               # sorting/filtering helpers
    server/
      db.ts                    # PostgreSQL connection
      llm.ts                   # Ollama first, Gemini fallback
  migrations/
    001_initial_schema.sql
  docs/
    ...
```

## Why This Shape

- The assessment is a timed 4-hour project, so one app is clearer than a monorepo.
- `src/app` keeps the required public and admin routes obvious.
- `src/lib` is enough for shared schemas, calculations, sorting, and sample data.
- `src/server` separates PostgreSQL and LLM code from browser code.
- `migrations` is created only when the PostgreSQL schema is actually written.
- All markdown planning and assessment files live under `docs/`.

## Not Needed Yet

- Empty `apps/`, `packages/`, `scripts/`, or `db/` folders.
- A separate `packages/llm` package.
- A separate `packages/shared` package.
- `docs/adr`, `docs/design`, or `docs/operations` subfolders before there are real documents for them.
