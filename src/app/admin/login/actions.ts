"use server";

import { cookies } from "next/headers";

function adminDemoCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export type LoginAttemptResult =
  | { ok: true }
  | { ok: false; message: string };

export async function submitAdminDemoLogin(formData: FormData): Promise<LoginAttemptResult> {
  const secret = process.env.ADMIN_DEMO_SECRET?.trim();
  if (!secret) {
    return { ok: false, message: "ADMIN_DEMO_SECRET is not configured on the server." };
  }

  const password = String(formData.get("password") ?? "").trim();
  if (password !== secret) {
    return { ok: false, message: "That secret does not match ADMIN_DEMO_SECRET." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_demo", secret, adminDemoCookieOptions());
  return { ok: true };
}
