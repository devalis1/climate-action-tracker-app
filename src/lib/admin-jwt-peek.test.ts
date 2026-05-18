import { Buffer } from "node:buffer";

import { describe, expect, it } from "vitest";

import { peekUnverifiedJwtClaims } from "@/lib/admin-jwt-peek";

function jwtFromPayload(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig-placeholder`;
}

describe("peekUnverifiedJwtClaims", () => {
  it("extracts sub and numeric city_id", () => {
    const tok = jwtFromPayload({ sub: "admin-demo", city_id: 42 });
    expect(peekUnverifiedJwtClaims(tok)).toEqual({ sub: "admin-demo", city_id: 42 });
  });

  it("coerces string city_id to number", () => {
    const tok = jwtFromPayload({ sub: "u1", city_id: "12" });
    expect(peekUnverifiedJwtClaims(tok)).toEqual({ sub: "u1", city_id: 12 });
  });

  it("returns sub only when city_id omitted", () => {
    const tok = jwtFromPayload({ sub: "anon" });
    expect(peekUnverifiedJwtClaims(tok)).toEqual({ sub: "anon" });
  });

  it("rejects non-JWT-ish tokens", () => {
    expect(peekUnverifiedJwtClaims("not-a-jwt")).toBeNull();
  });
});
