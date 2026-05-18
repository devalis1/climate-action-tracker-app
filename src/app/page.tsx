import {
  DashboardSummary,
  TrackStatusPanel,
} from "@/components/dashboard-summary";
import { SectorBreakdown } from "@/components/sector-breakdown";
import { DEMO_GREENVILLE_CITY_NAME } from "@/lib/demo-city";
import { cityAndClimateRowsToCityProfile } from "@/lib/profile-map";
import {
  DbConfigurationError,
  DbQueryError,
  getCityByName,
  listClimateActionsForCityOffset,
} from "@/server/db";

const shellX = "px-5 sm:px-8 lg:px-10";

export const dynamic = "force-dynamic";

export default async function PublicViewerPage() {
  try {
    const city = await getCityByName(DEMO_GREENVILLE_CITY_NAME);
    if (!city) {
      return <ViewerMissingSeedState />;
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

    return (
      <>
        <section className="relative overflow-hidden border-b border-white/10 bg-brand-bg-deep">
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-7rem] top-[-9rem] z-0 h-[28rem] w-[28rem] rounded-full border border-brand-accent/20 bg-[radial-gradient(circle_at_35%_35%,#62f58a_0,#2352dc_38%,transparent_70%)] opacity-75 blur-[0.5px] md:right-[-5rem] md:h-[32rem] md:w-[32rem]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-10rem] left-[-7rem] z-0 h-[22rem] w-[22rem] rounded-full border border-white/8 bg-brand-blue/18 md:h-[26rem] md:w-[26rem]"
          />

          <div
            className={`relative z-10 mx-auto grid max-w-7xl gap-12 pb-16 pt-16 sm:gap-14 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:pb-24 lg:pt-24 ${shellX}`}
          >
            <div className="max-w-2xl lg:max-w-none">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
                Public viewer
              </p>
              <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                {profile.city} climate action progress
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
                Postgres-backed totals for the Greenville demo footprint: inventoried
                programs, summed modeled reductions, sector exposure, and a transparent
                on-track glide path versus the baseline.
              </p>
            </div>

            <div className="relative rounded-[10px] border border-white/15 bg-[linear-gradient(145deg,rgba(35,82,220,0.55)_0%,rgba(20,39,95,0.72)_55%,rgba(1,1,45,0.85)_100%)] p-7 shadow-brand backdrop-blur-md sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-brand-accent/35 bg-[radial-gradient(circle,#62f58a33_0%,transparent_70%)]"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green-soft">
                City profile
              </p>
              <p className="mt-6 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {profile.city}
              </p>
              <dl className="mt-6 space-y-3 text-sm leading-relaxed text-white/76">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                    Baseline
                  </dt>
                  <dd className="font-mono text-base tabular-nums text-white">
                    {Intl.NumberFormat("en-US").format(profile.baselineEmissions)}{" "}
                    tCO2e / yr
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                    Net-zero year
                  </dt>
                  <dd className="font-mono text-base tabular-nums text-white">
                    {profile.targetYear}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className={`mx-auto max-w-7xl py-12 sm:py-14 lg:py-16 ${shellX}`}>
          <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-8 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
                Inventory snapshot
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">
                Emissions context
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/55">
              Figures update live from PostgreSQL alongside the City Admin tooling;
              monospace numerals keep scan-ready comparisons aligned with Sprint 4 scope.
            </p>
          </div>

          <DashboardSummary profile={profile} />

          <div className="mt-10 flex flex-col gap-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="order-2 lg:order-1 lg:col-span-8">
              <SectorBreakdown actions={profile.actions} />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-4 lg:sticky lg:top-[6.75rem]">
              <TrackStatusPanel profile={profile} />
            </div>
          </div>
        </section>
      </>
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

function ViewerMissingSeedState() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-brand-accent/40 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
          Seed missing
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
          Greenville baseline data not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/72">
          Run{" "}
          <code className="font-mono text-[0.7rem]">npm run db:migrate</code> and refresh.
        </p>
      </div>
    </div>
  );
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
        The public viewer now reads Postgres. Copy{" "}
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
