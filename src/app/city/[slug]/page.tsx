import { notFound } from "next/navigation";

import { PublicCityDashboard } from "@/components/public-city-dashboard";
import {
  DatabaseConfigRequired,
  DatabaseConnectionFailed,
} from "@/components/system-states";
import { cityAndClimateRowsToCityProfile } from "@/lib/profile-map";
import {
  DbConfigurationError,
  DbQueryError,
  getCityBySlug,
  listClimateActionsForCityOffset,
} from "@/server/db";
import {
  fetchOpenClimateCoverageStats,
  loadOpenClimateDashboardContext,
} from "@/server/openclimate";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function CitySlugViewerPage(props: PageProps) {
  const { slug } = await props.params;

  try {
    const city = await getCityBySlug(slug);
    if (!city) {
      notFound();
    }

    const actionRows = await listClimateActionsForCityOffset({
      cityId: city.id,
      limit: 500,
      sort: "startYear",
      direction: "desc",
    });

    const profile = cityAndClimateRowsToCityProfile(
      {
        name: city.name,
        baselineEmissionsTonsPerYear: city.baselineEmissionsTonsPerYear,
        targetYear: city.targetYear,
      },
      actionRows.map((row) => ({
        title: row.title,
        sector: row.sector,
        annualReductionTonsPerYear: row.annualReductionTonsPerYear,
        status: row.status,
        startYear: row.startYear,
      })),
    );

    const [openClimate, coverageStats] = await Promise.all([
      loadOpenClimateDashboardContext({
        actorId: city.openclimateActorId,
        profile,
      }),
      fetchOpenClimateCoverageStats(),
    ]);

    return (
      <PublicCityDashboard
        coverageStats={coverageStats}
        eyebrow="Public viewer"
        introBody={
          <>
            Postgres-backed totals for {profile.city}: inventoried programs, summed modeled
            reductions, sector exposure, and a transparent glide path versus the inventoried
            baseline. Switch cities anytime with the selector in the header.
          </>
        }
        openClimate={openClimate}
        profile={profile}
      />
    );
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
