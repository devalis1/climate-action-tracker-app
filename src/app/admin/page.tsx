import Link from "next/link";

import {
  AdminWorkspace,
  type AdminCityOption,
  type ManagedClimateActionRow,
} from "@/components/admin-workspace";
import {
  AdminDatabaseConfigRequired,
  AdminDatabaseUnreachable,
  AdminLoginRequired,
  AdminSeedMissing,
} from "@/components/system-states/admin";
import {
  ADMIN_ACTIONS_PAGE_SIZE,
  parseAdminActionsListParams,
} from "@/lib/admin-list-params";
import { isDemoAdminAuthenticated } from "@/server/admin-auth";
import { resolveAdminContextCityId } from "@/server/admin-city-resolve";
import {
  DbConfigurationError,
  DbQueryError,
  countClimateActionsForCity,
  getCityById,
  listCitiesSummary,
  listClimateActionsForCityOffset,
} from "@/server/db";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const demoAuthEnabled = Boolean(process.env.ADMIN_DEMO_SECRET?.trim());

  if (!(await isDemoAdminAuthenticated())) {
    return <AdminLoginRequired />;
  }

  const listParams = parseAdminActionsListParams(await searchParams);

  try {
    const cities = await listCitiesSummary();
    if (cities.length === 0) {
      return <AdminSeedMissing />;
    }

    const selectedId = await resolveAdminContextCityId();
    const city = await getCityById(selectedId);
    if (!city) {
      return <AdminSeedMissing />;
    }

    const offset = (listParams.page - 1) * ADMIN_ACTIONS_PAGE_SIZE;
    const [actions, totalActionCount] = await Promise.all([
      listClimateActionsForCityOffset({
        cityId: city.id,
        limit: ADMIN_ACTIONS_PAGE_SIZE,
        offset,
        sort: listParams.sort,
        direction: listParams.direction,
        sector: listParams.sector,
        status: listParams.status,
      }),
      countClimateActionsForCity(city.id, {
        sector: listParams.sector,
        status: listParams.status,
      }),
    ]);

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
        initialOpenClimateActorId={city.openclimateActorId}
        initialTargetYear={city.targetYear}
        listParams={listParams}
        selectedCityId={city.id}
        totalActionCount={totalActionCount}
      />
    );
  } catch (cause) {
    if (cause instanceof DbConfigurationError) {
      return <AdminDatabaseConfigRequired />;
    }
    if (cause instanceof DbQueryError) {
      return <AdminDatabaseUnreachable />;
    }

    throw cause;
  }
}
