"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  ADMIN_CITY_ID_COOKIE,
  citySlugPublicPaths,
} from "@/lib/admin-city-context";
import {
  createClimateActionMutationSchema,
  deleteClimateActionMutationSchema,
  updateCityBaselineMutationSchema,
  updateClimateActionMutationSchema,
} from "@/lib/admin-mutation-schemas";
import { PUBLIC_VIEWER_SLUGS } from "@/lib/public-viewer-slugs";
import { assertDemoAdminWritesAllowed } from "@/server/admin-auth";
import { resolveAdminContextCityId } from "@/server/admin-city-resolve";
import {
  DbConfigurationError,
  deleteClimateAction,
  getCityById,
  insertClimateAction,
  listCitiesSummary,
  updateCityBaselineAndTarget,
  updateClimateAction,
} from "@/server/db";

export type MutationResult =
  | { ok: true }
  | { ok: false; message: string };

function adminCityCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

function publicMessageFromUnknown(reason: unknown, fallback: string): string {
  if (reason instanceof DbConfigurationError) {
    return "Database is not configured. Set DATABASE_URL (see README).";
  }
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : "";
  const safe = message.replace(/\s+/g, " ").trim();
  const looksTechnical =
    /\b(pg|ECONN|EADDR|ENOTFOUND|ECONNREFUSED)\b/i.test(safe);
  return safe && !looksTechnical ? safe : fallback;
}

async function revalidatePublicViewerSurfacesAfterMutation(): Promise<void> {
  revalidatePath("/admin");
  revalidatePath("/");

  try {
    const rows = await listCitiesSummary();
    const slugs = rows.map((row) => row.slug).filter(Boolean);
    for (const path of citySlugPublicPaths(slugs)) {
      revalidatePath(path);
    }
    return;
  } catch {
    /* fall through */
  }

  for (const slug of PUBLIC_VIEWER_SLUGS) {
    revalidatePath(`/city/${slug}`);
  }
}

export async function selectAdminCity(input: unknown): Promise<MutationResult> {
  const parsed = z.coerce.number().int().positive().safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((issue) => issue.message).join(" "),
    };
  }

  try {
    const city = await getCityById(parsed.data);
    if (!city) {
      return { ok: false, message: "City not found." };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_CITY_ID_COOKIE, String(city.id), adminCityCookieOptions());
    revalidatePath("/admin");
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not switch city."),
    };
  }
}

export async function saveCityBaselineAndTarget(input: unknown): Promise<MutationResult> {
  await assertDemoAdminWritesAllowed();
  const parsed = updateCityBaselineMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await resolveAdminContextCityId();
    const updated = await updateCityBaselineAndTarget(cityId, {
      baselineEmissionsTonsPerYear: parsed.data.baselineEmissionsTonsPerYear,
      targetYear: parsed.data.targetYear,
    });
    if (!updated) return { ok: false, message: "City profile was not saved." };

    await revalidatePublicViewerSurfacesAfterMutation();
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not update city profile."),
    };
  }
}

export async function saveNewClimateAction(input: unknown): Promise<MutationResult> {
  await assertDemoAdminWritesAllowed();
  const parsed = createClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await resolveAdminContextCityId();
    await insertClimateAction({
      cityId,
      title: parsed.data.title,
      sector: parsed.data.sector,
      annualReductionTonsPerYear: parsed.data.annualReduction,
      status: parsed.data.status,
      startYear: parsed.data.startYear,
    });
    await revalidatePublicViewerSurfacesAfterMutation();
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not create action."),
    };
  }
}

export async function commitClimateActionChanges(input: unknown): Promise<MutationResult> {
  await assertDemoAdminWritesAllowed();
  const parsed = updateClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await resolveAdminContextCityId();
    const updated = await updateClimateAction({
      id: parsed.data.id,
      cityId,
      title: parsed.data.title,
      sector: parsed.data.sector,
      annualReductionTonsPerYear: parsed.data.annualReduction,
      status: parsed.data.status,
      startYear: parsed.data.startYear,
    });
    if (!updated) {
      return { ok: false, message: "Action not found or not in this city." };
    }
    await revalidatePublicViewerSurfacesAfterMutation();
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not save action."),
    };
  }
}

export async function removeClimateAction(input: unknown): Promise<MutationResult> {
  await assertDemoAdminWritesAllowed();
  const parsed = deleteClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await resolveAdminContextCityId();
    const ok = await deleteClimateAction({
      id: parsed.data.id,
      cityId,
    });
    if (!ok) {
      return { ok: false, message: "Action not found or already removed." };
    }
    await revalidatePublicViewerSurfacesAfterMutation();
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not delete action."),
    };
  }
}
