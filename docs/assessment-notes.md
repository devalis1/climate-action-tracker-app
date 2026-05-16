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
