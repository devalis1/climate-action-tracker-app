/**
 * Integration-style DB sanity: Greenville counts + copy-paste curl for import API.
 * Does not start Next.js or Ollama — suitable for CI / operator smoke.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const r = spawnSync(process.execPath, ["scripts/db-check.mjs"], {
  cwd: root,
  stdio: "inherit",
});

if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.log("\n--- Optional HTTP checks (dev server must be running) ---\n");
console.log(
  "Import API (requires Ollama or Gemini fallback for non-mocked responses):",
);
console.log(
  `curl -sS -X POST http://localhost:3000/api/import-action -H 'Content-Type: application/json' ` +
    `-d '{"text":"The city council approved LED retrofit by 2027, ~9500 tons/year savings, planning phase."}'`,
);
console.log("");
