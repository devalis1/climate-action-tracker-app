"use server";

import { revalidatePath } from "next/cache";

import {
  createClimateActionMutationSchema,
  deleteClimateActionMutationSchema,
  updateCityBaselineMutationSchema,
  updateClimateActionMutationSchema,
} from "@/lib/admin-mutation-schemas";
import { DEMO_GREENVILLE_CITY_NAME } from "@/lib/demo-city";
import {
  assertDemoAdminWritesAllowed,
  DbConfigurationError,
  deleteClimateAction,
  getCityByName,
  insertClimateAction,
  updateCityBaselineAndTarget,
  updateClimateAction,
} from "@/server/db";

export type MutationResult =
  | { ok: true }
  | { ok: false; message: string };

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

async function greenvilleDemoCityId(): Promise<number> {
  const city = await getCityByName(DEMO_GREENVILLE_CITY_NAME);
  if (!city) {
    throw new Error(
      `Demo city "${DEMO_GREENVILLE_CITY_NAME}" was not found. Run npm run db:migrate.`,
    );
  }
  return city.id;
}

export async function saveCityBaselineAndTarget(input: unknown): Promise<MutationResult> {
  assertDemoAdminWritesAllowed();
  const parsed = updateCityBaselineMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await greenvilleDemoCityId();
    const updated = await updateCityBaselineAndTarget(cityId, {
      baselineEmissionsTonsPerYear: parsed.data.baselineEmissionsTonsPerYear,
      targetYear: parsed.data.targetYear,
    });
    if (!updated) return { ok: false, message: "City profile was not saved." };

    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not update city profile."),
    };
  }
}

export async function saveNewClimateAction(input: unknown): Promise<MutationResult> {
  assertDemoAdminWritesAllowed();
  const parsed = createClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await greenvilleDemoCityId();
    await insertClimateAction({
      cityId,
      title: parsed.data.title,
      sector: parsed.data.sector,
      annualReductionTonsPerYear: parsed.data.annualReduction,
      status: parsed.data.status,
      startYear: parsed.data.startYear,
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not create action."),
    };
  }
}

export async function commitClimateActionChanges(input: unknown): Promise<MutationResult> {
  assertDemoAdminWritesAllowed();
  const parsed = updateClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await greenvilleDemoCityId();
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
      return { ok: false, message: "Action not found or not in this demo city." };
    }
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not save action."),
    };
  }
}

export async function removeClimateAction(input: unknown): Promise<MutationResult> {
  assertDemoAdminWritesAllowed();
  const parsed = deleteClimateActionMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  try {
    const cityId = await greenvilleDemoCityId();
    const ok = await deleteClimateAction({
      id: parsed.data.id,
      cityId,
    });
    if (!ok) {
      return { ok: false, message: "Action not found or already removed." };
    }
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (reason) {
    return {
      ok: false,
      message: publicMessageFromUnknown(reason, "Could not delete action."),
    };
  }
}
