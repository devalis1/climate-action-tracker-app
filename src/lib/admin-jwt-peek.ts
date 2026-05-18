import { Buffer } from "node:buffer";

/**
 * **Unsafe** JWT payload peek — no signature verification. For IdP-backed flows,
 * verify externally first (e.g. `jose` + JWKS). Until verification exists in this
 * app or upstream, treat claims as untrusted; demo writes use `ADMIN_DEMO_SECRET` only.
 */

export type AdminJwtClaimsShape = Readonly<{
  sub: string;
  /** RFC/custom tenant hint (OAuth resource scope placeholder). */
  city_id?: number;
}>;

export function peekUnverifiedJwtClaims(token: string): AdminJwtClaimsShape | null {
  const segments = token.split(".");
  if (segments.length !== 3 || !segments[1]) return null;

  try {
    const json = Buffer.from(segments[1], "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;

    const sub = rec.sub;
    if (typeof sub !== "string" || sub.trim() === "") return null;

    const cityRaw = rec.city_id;
    let city_id: number | undefined;
    if (typeof cityRaw === "number" && Number.isFinite(cityRaw)) {
      city_id = Math.trunc(cityRaw);
    } else if (typeof cityRaw === "string") {
      const n = Number.parseInt(cityRaw, 10);
      if (Number.isFinite(n)) city_id = n;
    }

    return city_id !== undefined ? { sub, city_id } : { sub };
  } catch {
    return null;
  }
}
