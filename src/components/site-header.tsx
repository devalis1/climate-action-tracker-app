import Link from "next/link";

import { PublicCityPicker } from "@/components/public-city-picker";
import { SiteHeaderShell, SiteNavLinks } from "@/components/site-nav";
import {
  publicCityPath,
  resolveDefaultPublicCitySlug,
} from "@/lib/public-default-city";
import { listCitiesSummary } from "@/server/db";

export async function SiteHeader() {
  let cities: Awaited<ReturnType<typeof listCitiesSummary>> = [];
  try {
    cities = await listCitiesSummary();
  } catch {
    cities = [];
  }

  const defaultSlug = resolveDefaultPublicCitySlug(cities);
  const homeHref = defaultSlug ? publicCityPath(defaultSlug) : "/";

  return (
    <SiteHeaderShell>
      <Link href={homeHref} className="group flex items-center gap-3">
        <span className="h-9 w-9 rounded-full border border-brand-accent bg-[radial-gradient(circle_at_35%_35%,#62f58a_0,#2352dc_45%,#00001f_76%)] shadow-glow" />
        <span className="font-heading text-sm font-semibold uppercase tracking-[0.22em] text-white">
          City Climate Tracker
        </span>
      </Link>

      <div className="flex flex-wrap items-end justify-end gap-3 sm:gap-4">
        <PublicCityPicker cities={cities} />
        <SiteNavLinks defaultPublicHref={homeHref} />
      </div>
    </SiteHeaderShell>
  );
}
