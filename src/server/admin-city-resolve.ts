import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_CITY_ID_COOKIE,
  parseAdminCityIdCookie,
  pickAdminCityId,
} from "@/lib/admin-city-context";
import { DEMO_GREENVILLE_CITY_NAME } from "@/lib/demo-city";
import { getCityByName, listCitiesSummary } from "@/server/db";

export { ADMIN_CITY_ID_COOKIE };

/**
 * Resolves the city id for the current admin session from HTTP-only `admin_city_id`
 * cookie, defaulting to Greenville when unset or invalid.
 */
export async function resolveAdminContextCityId(): Promise<number> {
  const cookieStore = await cookies();
  const parsedCookie = parseAdminCityIdCookie(
    cookieStore.get(ADMIN_CITY_ID_COOKIE)?.value,
  );

  const greenville = await getCityByName(DEMO_GREENVILLE_CITY_NAME);
  if (!greenville) {
    throw new Error(
      `Demo city "${DEMO_GREENVILLE_CITY_NAME}" was not found. Run npm run db:migrate.`,
    );
  }

  const cities = await listCitiesSummary();
  const validIds = new Set(cities.map((c) => c.id));
  return pickAdminCityId(greenville.id, parsedCookie, validIds);
}
