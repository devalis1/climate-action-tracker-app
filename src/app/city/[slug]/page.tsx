import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicCityDashboard } from "@/components/public-city-dashboard";
import { DEMO_GREENVILLE_CITY_NAME } from "@/lib/demo-city";
import { cityAndClimateRowsToCityProfile } from "@/lib/profile-map";
import {
  DbConfigurationError,
  DbQueryError,
  getCityBySlug,
  listClimateActionsForCityOffset,
} from "@/server/db";

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

    const introBody =
      city.name === DEMO_GREENVILLE_CITY_NAME ? (
        <>
          Postgres-backed totals for {profile.city}: inventoried programs, summed modeled
          reductions, sector exposure, and the same transparent glide heuristic as the home
          viewer. Default demo also lives at{" "}
          <Link
            href="/"
            className="font-mono text-brand-accent underline-offset-4 hover:underline"
          >
            /
          </Link>
          .
        </>
      ) : (
        <>
          Postgres-backed totals for {profile.city}: inventoried programs, summed modeled
          reductions, sector exposure, and a transparent glide path versus the inventoried
          baseline.
        </>
      );

    return (
      <PublicCityDashboard
        eyebrow={`City · ${city.slug}`}
        introBody={introBody}
        profile={profile}
      />
    );
  } catch (cause) {
    if (cause instanceof DbConfigurationError) {
      return (
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <DatabaseMissingMessage />
        </div>
      );
    }
    if (cause instanceof DbQueryError) {
      return (
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <DatabaseConnectMessage />
        </div>
      );
    }

    throw cause;
  }
}

function DatabaseMissingMessage() {
  return (
    <div className="rounded-[12px] border border-brand-accent/40 bg-brand-surface p-10 shadow-brand">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
        Database unavailable
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
        Configure DATABASE_URL
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/72">
        The public viewer reads Postgres. Copy{" "}
        <code className="font-mono text-[0.7rem]">.env.example</code>{" "}
        to <code className="font-mono text-[0.7rem]">.env.local</code>, start Docker Postgres,
        and run migrations.
      </p>
    </div>
  );
}

function DatabaseConnectMessage() {
  return (
    <div className="rounded-[12px] border border-[#ffb877]/55 bg-brand-surface p-10 shadow-brand">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ffb877]">
        Connection failure
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
        Cannot reach Postgres
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/72">
        Confirm Compose is healthy and <code className="font-mono text-[0.7rem]">DATABASE_URL</code>{" "}
        matches your local port/user/database.
      </p>
    </div>
  );
}
