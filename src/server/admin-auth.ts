import { cookies } from "next/headers";

/**
 * Demo/admin write gate compatible with future OAuth/JWT:
 * - When `ADMIN_DEMO_SECRET` is unset, mutations stay open (timed exercise default).
 * - When set, HTTP-only cookie `admin_demo` must match the secret (session-token sketch).
 * Map JWT/OAuth `sub`/`city_id` claims here later instead of a shared secret.
 */
export async function assertDemoAdminWritesAllowed(): Promise<void> {
  const secret = process.env.ADMIN_DEMO_SECRET?.trim();
  if (!secret) {
    return;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_demo")?.value;
  if (token !== secret) {
    throw new Error(
      "Admin writes require cookie admin_demo matching ADMIN_DEMO_SECRET (OAuth/JWT hook point).",
    );
  }
}
