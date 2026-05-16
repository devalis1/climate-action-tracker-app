# Developer Profile

This profile captures the working patterns observed across local projects and adapts them to the OEF AI-Native Software Engineer Exercise.

## Preferred Project Structure

For this assessment, keep the repo simple:

```text
climate-action-tracker-app/
  .cursorrules
  src/                 # created when implementation starts
  migrations/          # PostgreSQL migrations, created when needed
  docs/                # assessment, planning, design, progress, write-up
```

The usual preference for `apps/*` and `packages/*` is useful for larger projects, but this timed exercise benefits from a single focused Next.js app.

## Clean Code Standards

- Build in phases. Document the phase, implement the minimum needed to validate it, then update `docs/PROGRESS.md`.
- Prefer explicit contracts over loose data: TypeScript types, Zod schemas, structured JSON outputs, and narrow helper functions.
- Keep browser-safe and server-only code separate. PostgreSQL credentials and LLM keys must stay server-only.
- Make expected failure modes visible. Use bounded timeouts, labeled errors, and clear user-facing messages that do not leak raw env names or stack traces.
- Favor App Router conventions, Tailwind tokens from `docs/DESIGN_SYSTEM.md`, and small components over broad abstractions.
- Use `.env.example` for names and safe defaults only. Do not commit real keys, database credentials, LLM keys, tokens, or browser session artifacts.
- Keep tests proportional to risk. Progress calculations, schema parsing, sorting helpers, and LLM import parsing deserve deterministic tests.

## Git Etiquette

- The human owner handles commits and pushes.
- Agents may edit files, run checks, and report `git status`, but must not create commits, amend commits, push branches, or rewrite history.
- Before finishing meaningful work, summarize changed files and verification performed so the owner can make the commit.
- Do not stage secrets or generated build outputs. Keep `.next/`, local env files, screenshots, cache folders, and transient logs out of Git.

## LLM Implementation Style

Default to a local-first LLM pipeline:

1. Try local inference first through Ollama.
2. Require structured JSON from the model and validate it with a schema.
3. Attempt bounded repair retries when local output is malformed.
4. Use Gemini only as an explicit cloud fallback or platform-only deployment path.
5. Keep the cloud fallback disabled by default unless the feature requires hosted inference.

Recommended environment shape:

```text
LLM_INFERENCE_MODE=local_first
LLM_LOCAL_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5:latest
ENABLE_CLOUD_FALLBACK=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

For hosted jobs, CI, or serverless paths where local Ollama is unavailable, switch deliberately to `LLM_INFERENCE_MODE=platform` and call Gemini server-side only. The schema and downstream product contract should remain unchanged between local and platform modes.

## Agent Working Rules

- Read the assessment PDF and `docs/assessment-notes.md` before implementing.
- Keep `docs/PROGRESS.md` current after significant tasks.
- Prefer small, reviewable changes over broad rewrites.
- Explain assumptions when product or architecture scope is unclear.
- Preserve local-first developer experience even if production later runs on Vercel or another hosted platform.
