import { NextResponse } from "next/server";

import {
  OpenClimateFetchError,
  fetchOpenClimateEnrichment,
  isOpenClimateEnrichmentEnabled,
} from "@/server/openclimate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isOpenClimateEnrichmentEnabled()) {
    return NextResponse.json(
      { ok: false, message: "OpenClimate enrichment is disabled." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const actorId = decodeURIComponent(id).trim();
  if (!actorId) {
    return NextResponse.json(
      { ok: false, message: "Actor id is required." },
      { status: 400 },
    );
  }

  try {
    const enrichment = await fetchOpenClimateEnrichment(actorId);
    if (!enrichment) {
      return NextResponse.json(
        { ok: false, message: "Actor not found in OpenClimate." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, enrichment });
  } catch (error) {
    const message =
      error instanceof OpenClimateFetchError
        ? error.message
        : "OpenClimate actor lookup failed.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
