import { NextResponse } from "next/server";

import { ADMIN_CITY_ID_COOKIE } from "@/lib/admin-city-context";

function expireCookie() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/admin/login", url.origin));
  response.cookies.set("admin_demo", "", expireCookie());
  response.cookies.set(ADMIN_CITY_ID_COOKIE, "", expireCookie());
  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
