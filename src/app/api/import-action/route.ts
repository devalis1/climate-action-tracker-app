import { NextResponse } from "next/server";
import { z } from "zod";

import { importClimateActionFromText } from "@/server/llm";

const bodySchema = z.object({
  text: z.string().min(1, "Text is required."),
});

/**
 * POST /api/import-action
 * Body: `{ "text": "<free-form city description>" }`
 * Response: `{ ok: true, action }` or `{ ok: false, errors: string[] }`
 *
 * Server-only: uses Ollama (and optional Gemini fallback); never exposes secrets.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false as const, errors: ["Request body must be JSON."] },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (i) => `${i.path.join(".") || "body"}: ${i.message}`,
    );
    return NextResponse.json({ ok: false as const, errors }, { status: 400 });
  }

  const result = await importClimateActionFromText(parsed.data.text);
  if (!result.ok) {
    return NextResponse.json({ ok: false as const, errors: result.errors }, { status: 422 });
  }

  return NextResponse.json({
    ok: true as const,
    action: result.action,
  });
}
