# Current Status

## Real

- Repository exists and has initial project guidance for the OEF AI-Native Software Engineer Exercise.
- `docs/OEF AI-Native Software Engineer Exercise.pdf` is the source-of-truth assessment document.
- `docs/assessment-notes.md` summarizes the assessment plus personal implementation notes.
- `docs/DEVELOPER_PROFILE.md` documents local development preferences, clean code standards, Git etiquette, and local-first LLM implementation style.
- `docs/DESIGN_SYSTEM.md` documents the Open Earth / CityCatalyst visual system from live site inspection.
- `docs/PROJECT_STRUCTURE.md` documents the lean repo structure.
- `.cursorrules` defines project-specific agent rules, including no `git commit` / `git push`.
- `docs/TODO.md` breaks the work into 30-minute sprints.
- `docs/PROGRESS.md` tracks what is done and what is next.
- Structure now targets Next.js, TypeScript, PostgreSQL, and local-first Ollama with optional Gemini fallback.
- Empty implementation placeholder folders were removed. Implementation folders should be created only when real files are added.

## Planned

- Create the Next.js App Router shell at the repo root.
- Add PostgreSQL migrations under `migrations/` when schema work starts.
- Add shared climate action schemas under `src/lib/schemas.ts`.
- Add local-first LLM orchestration under `src/server/llm.ts`.
- Build City Admin CRUD/import and Public Viewer dashboard.
- Write the one-page AI workflow response required by the PDF.

## Operator Actions

- Review the generated profile and design system before implementation starts.
- Review `.cursorrules`, `docs/TODO.md`, and `docs/PROGRESS.md`.
- Commit and push manually when ready.
