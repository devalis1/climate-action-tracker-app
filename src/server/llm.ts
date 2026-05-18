import "server-only";

import type { ZodIssue } from "zod";

import { climateActionSchema, type ClimateAction } from "@/lib/schemas";

/**
 * Local-first climate-action import: Ollama HTTP API → Zod (`climateActionSchema`).
 * One bounded repair pass if validation fails (second chat with flattened Zod issues).
 * Optional Gemini only when `ENABLE_CLOUD_FALLBACK` is explicitly truthy and a key is set,
 * after Ollama fails in `local_first` mode. See `.env.example` and `docs/DEVELOPER_PROFILE.md`.
 */

const OLLAMA_CHAT_PATH = "/api/chat";
const SYSTEM_PROMPT = `You are a structured data extractor for a city climate action tracker.

Return ONE JSON object only (no markdown, no prose) with exactly these keys:
- "title": string, short descriptive title for the action
- "sector": one of: "transport", "energy", "buildings", "waste", "land use"
- "annualReduction": number, estimated CO2 reduction in metric tons per year (non-negative)
- "status": one of "planned", "in progress", "completed"
- "startYear": integer year when the action starts or is targeted to start

Infer sector and status from the text. "land use" must include the space. Use concise titles.`;

export type ClimateActionImportProvider = "ollama" | "gemini";

export type ImportClimateActionFromTextResult =
  | { ok: true; action: ClimateAction; provider: ClimateActionImportProvider }
  | { ok: false; errors: string[] };

function inferenceMode(): "local_first" | "platform" {
  const m = process.env.LLM_INFERENCE_MODE?.trim().toLowerCase();
  return m === "platform" ? "platform" : "local_first";
}

function isCloudFallbackEnabled(): boolean {
  const v = process.env.ENABLE_CLOUD_FALLBACK?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function requestTimeoutMs(): number {
  const raw = process.env.LLM_REQUEST_TIMEOUT_MS?.trim();
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n > 0) return Math.min(Math.floor(n), 300_000);
  return 120_000;
}

function ollamaBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/+$/, "");
}

function ollamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || "qwen3.5:latest";
}

function geminiApiKey(): string | undefined {
  const k = process.env.GEMINI_API_KEY?.trim();
  return k || undefined;
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function stripJsonCodeFences(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  return t;
}

function validateClimateActionJson(
  content: string,
  provider: ClimateActionImportProvider,
): ImportClimateActionFromTextResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonCodeFences(content));
  } catch {
    return { ok: false, errors: ["Model output was not valid JSON."] };
  }
  const result = climateActionSchema.safeParse(parsed);
  if (result.success) {
    return { ok: true, action: result.data, provider };
  }
  return {
    ok: false,
    errors: result.error.issues.map(
      (i: ZodIssue) => `${i.path.join(".") || "(root)"}: ${i.message}`,
    ),
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

type OllamaChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function ollamaRequestContent(
  messages: OllamaChatMessage[],
): Promise<{ ok: true; content: string } | { ok: false; errors: string[] }> {
  const base = ollamaBaseUrl();
  const url = `${base}${OLLAMA_CHAT_PATH}`;
  const ms = requestTimeoutMs();
  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel(),
          messages,
          stream: false,
          format: "json",
          // Thinking models (e.g. Qwen 3.x) emit reasoning into `message.thinking` first; extraction
          // reads `message.content` only — without this, timeouts / "empty response" are common defaults.
          think: false,
        }),
      },
      ms,
    );
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      errors: [
        aborted
          ? "Local LLM request timed out."
          : "Could not reach the local LLM. Is Ollama running?",
      ],
    };
  }
  if (!res.ok) {
    const hint = res.status === 404 ? " Check that the model is pulled (`ollama pull`)." : "";
    return {
      ok: false,
      errors: [`Local LLM returned HTTP ${res.status}.${hint}`],
    };
  }
  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return { ok: false, errors: ["Local LLM returned an empty response."] };
  }
  return { ok: true, content };
}

async function geminiRequestContent(userPrompt: string): Promise<
  { ok: true; content: string } | { ok: false; errors: string[] }
> {
  const key = geminiApiKey();
  if (!key) {
    return { ok: false, errors: ["Cloud LLM is not configured."] };
  }
  const model = geminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const ms = requestTimeoutMs();
  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      },
      ms,
    );
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      errors: [aborted ? "Cloud LLM request timed out." : "Cloud LLM request failed."],
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      errors: ["Cloud LLM returned an error."],
    };
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    return { ok: false, errors: ["Cloud LLM returned an empty response."] };
  }
  return { ok: true, content: text };
}

function userMessageForExtraction(sourceText: string): OllamaChatMessage {
  return {
    role: "user",
    content: `City-provided description:\n"""${sourceText.trim()}"""`,
  };
}

function repairUserMessage(
  sourceText: string,
  previousRaw: string,
  validationErrors: string[],
): OllamaChatMessage {
  return {
    role: "user",
    content: `${SYSTEM_PROMPT}

Your previous JSON was invalid. Output ONLY a corrected JSON object.

Validation errors:
${validationErrors.map((e) => `- ${e}`).join("\n")}

Invalid previous output:
${previousRaw}

City-provided description:
"""${sourceText.trim()}"""`,
  };
}

function geminiPromptForExtraction(sourceText: string): string {
  return `${SYSTEM_PROMPT}\n\nCity-provided description:\n"""${sourceText.trim()}"""`;
}

function geminiPromptForRepair(
  sourceText: string,
  previousRaw: string,
  validationErrors: string[],
): string {
  return repairUserMessage(sourceText, previousRaw, validationErrors).content;
}

/** Ollama: first completion + one repair attempt (bounded). */
async function ollamaImportWithRepair(
  sourceText: string,
): Promise<ImportClimateActionFromTextResult> {
  const first = await ollamaRequestContent([
    { role: "system", content: SYSTEM_PROMPT },
    userMessageForExtraction(sourceText),
  ]);
  if (!first.ok) return first;

  const v1 = validateClimateActionJson(first.content, "ollama");
  if (v1.ok) return v1;

  const second = await ollamaRequestContent([
    { role: "system", content: SYSTEM_PROMPT },
    repairUserMessage(sourceText, first.content.trim(), v1.errors),
  ]);
  if (!second.ok) {
    return { ok: false, errors: [...v1.errors, ...second.errors] };
  }
  const v2 = validateClimateActionJson(second.content, "ollama");
  if (v2.ok) return v2;
  return { ok: false, errors: [...v1.errors, ...v2.errors] };
}

/** Gemini: first completion + one repair (same bounds). */
async function geminiImportWithRepair(
  sourceText: string,
): Promise<ImportClimateActionFromTextResult> {
  const p1 = geminiPromptForExtraction(sourceText);
  const first = await geminiRequestContent(p1);
  if (!first.ok) return first;

  const v1 = validateClimateActionJson(first.content, "gemini");
  if (v1.ok) return v1;

  const p2 = geminiPromptForRepair(sourceText, first.content.trim(), v1.errors);
  const second = await geminiRequestContent(p2);
  if (!second.ok) {
    return { ok: false, errors: [...v1.errors, ...second.errors] };
  }
  const v2 = validateClimateActionJson(second.content, "gemini");
  if (v2.ok) return v2;
  return { ok: false, errors: [...v1.errors, ...v2.errors] };
}

/**
 * Parse free text into a validated `ClimateAction`.
 * - `local_first` (default): Ollama with repair; then Gemini with repair only if cloud fallback is enabled.
 * - `platform`: Gemini only (for hosted environments without Ollama).
 */
export async function importClimateActionFromText(
  sourceText: string,
): Promise<ImportClimateActionFromTextResult> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return { ok: false, errors: ["Text is empty."] };
  }

  const mode = inferenceMode();

  if (mode === "platform") {
    return geminiImportWithRepair(trimmed);
  }

  const local = await ollamaImportWithRepair(trimmed);
  if (local.ok) return local;

  if (!isCloudFallbackEnabled()) {
    return local;
  }

  const cloud = await geminiImportWithRepair(trimmed);
  if (cloud.ok) return cloud;

  return {
    ok: false,
    errors: [...local.errors, ...cloud.errors],
  };
}
