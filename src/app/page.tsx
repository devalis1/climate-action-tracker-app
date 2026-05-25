import { redirect } from "next/navigation";

import {
  DatabaseConfigRequired,
  DatabaseConnectionFailed,
  SeedDataMissing,
} from "@/components/system-states";
import {
  publicCityPath,
  resolveDefaultPublicCitySlug,
} from "@/lib/public-default-city";
import {
  DbConfigurationError,
  DbQueryError,
  listCitiesSummary,
} from "@/server/db";

export const dynamic = "force-dynamic";

/** Public entry always routes into the multi-city slug dashboard. */
export default async function PublicViewerPage() {
  try {
    const cities = await listCitiesSummary();
    const slug = resolveDefaultPublicCitySlug(cities);

    if (!slug) {
      return (
        <SeedDataMissing
          detail={
            <p>
              Run <code className="font-mono text-[0.7rem]">npm run db:migrate</code> and
              refresh.
            </p>
          }
          title="No cities found in the database"
        />
      );
    }

    redirect(publicCityPath(slug));
  } catch (cause) {
    if (cause instanceof DbConfigurationError) {
      return <DatabaseConfigRequired />;
    }
    if (cause instanceof DbQueryError) {
      return <DatabaseConnectionFailed />;
    }

    throw cause;
  }
}
