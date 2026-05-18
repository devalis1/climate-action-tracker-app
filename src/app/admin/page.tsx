import Link from "next/link";

import {
  AdminWorkspace,
  type AdminCityOption,
  type ManagedClimateActionRow,
} from "@/components/admin-workspace";
import { isDemoAdminAuthenticated } from "@/server/admin-auth";
import { resolveAdminContextCityId } from "@/server/admin-city-resolve";
import {
  DbConfigurationError,
  DbQueryError,
  getCityById,
  listCitiesSummary,
  listClimateActionsForCityOffset,
} from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const demoAuthEnabled = Boolean(process.env.ADMIN_DEMO_SECRET?.trim());

  if (!(await isDemoAdminAuthenticated())) {
    return <AdminLoginRequired />;
  }

  try {
    const cities = await listCitiesSummary();
    if (cities.length === 0) {
      return <MissingSeedState />;
    }

    const selectedId = await resolveAdminContextCityId();
    const city = await getCityById(selectedId);
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

    const cityOptions: AdminCityOption[] = cities.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));

    return (
      <AdminWorkspace
        cityOptions={cityOptions}
        demoAuthEnabled={demoAuthEnabled}
        demoCityLabel={city.name}
        initialActions={initialActions}
        initialBaselineTonsPerYear={city.baselineEmissionsTonsPerYear}
        initialTargetYear={city.targetYear}
        selectedCityId={city.id}
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

function AdminLoginRequired() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-brand-accent/45 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
          Authentication required
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
          Admin workspace is gated
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/72">
          This deployment has{" "}
          <code className="font-mono text-[0.7rem]">ADMIN_DEMO_SECRET</code> set.
          Sign in with the same value to continue (stored as an HTTP-only{" "}
          <code className="font-mono text-[0.7rem]">admin_demo</code> cookie).
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-brand-accent/90 px-6 py-3 font-heading text-xs uppercase tracking-[0.16em] text-[#07130c] shadow-[0_14px_40px_-18px_rgba(98,245,138,0.55)] hover:bg-brand-accent"
            href="/admin/login"
          >
            Sign in
          </Link>
          <Link
            className="rounded-full border border-white/35 px-5 py-3 font-heading text-xs uppercase tracking-[0.16em] text-white hover:border-white"
            href="/"
          >
            Public viewer
          </Link>
        </div>
      </div>
    </div>
  );
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
          No cities found in the database
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
