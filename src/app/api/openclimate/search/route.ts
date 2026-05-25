import { NextResponse } from "next/server";

import {
  OpenClimateFetchError,
  isOpenClimateEnrichmentEnabled,
  searchOpenClimateActors,
} from "@/server/openclimate";

export async function GET(request: Request) {
  if (!isOpenClimateEnrichmentEnabled()) {
    return NextResponse.json(
      { ok: false, message: "OpenClimate enrichment is disabled." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const type = url.searchParams.get("type")?.trim() || "city";

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "Query parameter `name` is required." },
      { status: 400 },
    );
  }

  try {
    const results = await searchOpenClimateActors({ name, type });
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message =
      error instanceof OpenClimateFetchError
        ? error.message
        : "OpenClimate search failed.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
