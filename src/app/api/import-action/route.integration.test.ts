import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/llm", () => ({
  importClimateActionFromText: vi.fn(),
}));

import { POST } from "./route";
import { importClimateActionFromText } from "@/server/llm";

describe("POST /api/import-action", () => {
  beforeEach(() => {
    vi.mocked(importClimateActionFromText).mockReset();
  });

  it("returns 400 when POST body is not valid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/import-action", {
        method: "POST",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("proxies LLM success without calling live Ollama (mocked)", async () => {
    vi.mocked(importClimateActionFromText).mockResolvedValue({
      ok: true,
      provider: "ollama",
      action: {
        title: "LED street lighting conversion",
        sector: "energy",
        annualReduction: 9500,
        status: "planned",
        startYear: 2027,
      },
    });

    const res = await POST(
      new Request("http://localhost/api/import-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "mock paragraph",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; action?: { title: string } };
    expect(body.ok).toBe(true);
    expect(body.action?.title).toBe("LED street lighting conversion");
    expect(importClimateActionFromText).toHaveBeenCalledTimes(1);
  });

  it("returns 422 when import pipeline fails", async () => {
    vi.mocked(importClimateActionFromText).mockResolvedValue({
      ok: false,
      errors: ["validation failed"],
    });

    const res = await POST(
      new Request("http://localhost/api/import-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "x" }),
      }),
    );

    expect(res.status).toBe(422);
  });
});
