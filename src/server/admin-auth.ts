import { cookies, headers } from "next/headers";

export type { AdminJwtClaimsShape } from "@/lib/admin-jwt-peek";


async function bearerOrCookieAdminToken(): Promise<string | undefined> {
  const headerList = await headers();
  const rawAuth = headerList.get("authorization")?.trim();
  const bearer = rawAuth?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  const cookieStore = await cookies();
  const cookieTok = cookieStore.get("admin_demo")?.value;

  return bearer ?? cookieTok ?? undefined;
}

/** When `ADMIN_DEMO_SECRET` is unset, admin UI stays open (exercise default). */
export async function isDemoAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_DEMO_SECRET?.trim();
  if (!secret) {
    return true;
  }
  const token = await bearerOrCookieAdminToken();
  return token === secret;
}

/**
 * Demo/admin write gate compatible with OAuth/JWT follow-on:
 * - When `ADMIN_DEMO_SECRET` is unset, mutations stay open (timed exercise default).
 * - When set, `Authorization: Bearer <secret>` OR HTTP-only cookie `admin_demo` must match.
 * JWT path: verify signatures/JWKS in infrastructure, then optionally use `peekUnverifiedJwtClaims` for `city_id`.
 */
export async function assertDemoAdminWritesAllowed(): Promise<void> {
  const secret = process.env.ADMIN_DEMO_SECRET?.trim();
  if (!secret) {
    return;
  }

  const token = await bearerOrCookieAdminToken();
  if (token !== secret) {
    throw new Error(
      "Admin writes require Bearer token or admin_demo cookie matching ADMIN_DEMO_SECRET (verify JWT externally; peekUnverifiedJwtClaims maps city_id placeholder).",
    );
  }
}
