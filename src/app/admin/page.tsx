import {
  AdminWorkspace,
  type ManagedClimateActionRow,
} from "@/components/admin-workspace";
import { DEMO_GREENVILLE_CITY_NAME } from "@/lib/demo-city";
import {
  DbConfigurationError,
  DbQueryError,
  getCityByName,
  listClimateActionsForCityOffset,
} from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const city = await getCityByName(DEMO_GREENVILLE_CITY_NAME);
    if (!city) {
      return <MissingSeedState />;
    }

    const actions = await listClimateActionsForCityOffset({
      cityId: city.id,
      limit: 500,
      sort: "startYear",
      direction: "desc",
    });

    const initialActions: ManagedClimateActionRow[] = actions.map((row) => ({
      id: row.id,
      title: row.title,
      sector: row.sector,
      annualReductionTonsPerYear: row.annualReductionTonsPerYear,
      status: row.status,
      startYear: row.startYear,
    }));

    return (
      <AdminWorkspace
        demoCityLabel={city.name}
        initialActions={initialActions}
        initialBaselineTonsPerYear={city.baselineEmissionsTonsPerYear}
        initialTargetYear={city.targetYear}
      />
    );
  } catch (cause) {
    if (cause instanceof DbConfigurationError) {
      return <DatabaseConfigurationHelp />;
    }
    if (cause instanceof DbQueryError) {
      return <DatabaseUnreachable />;
    }

    throw cause;
  }
}

function DatabaseConfigurationHelp() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-brand-accent/40 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
          Database unavailable
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
          Set DATABASE_URL to enable admin writes
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Copy <code className="font-mono text-[0.7rem]">.env.example</code>{" "}
          to <code className="font-mono text-[0.7rem]">.env.local</code>, boot
          Docker Postgres, run{" "}
          <code className="font-mono text-[0.7rem]">npm run db:migrate</code>, then
          refresh this page.
        </p>
      </div>
    </div>
  );
}

function DatabaseUnreachable() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-[#ffb877]/55 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ffb877]">
          Connection failure
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
          Postgres did not respond
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/72">
          Ensure <code className="font-mono text-[0.7rem]">docker compose up -d</code>{" "}
          is healthy and <code className="font-mono text-[0.7rem]">DATABASE_URL</code>{" "}
          points at localhost.
        </p>
      </div>
    </div>
  );
}

function MissingSeedState() {
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
          <code className="font-mono text-[0.7rem]">npm run db:migrate</code> and{" "}
          <code className="font-mono text-[0.7rem]">npm run db:check</code>, then reload.
        </p>
      </div>
    </div>
  );
}
