import type { ClimateAction, Sector } from "@/lib/schemas";

const sectorLabels: Record<Sector, string> = {
  transport: "Transport",
  energy: "Energy",
  buildings: "Buildings",
  waste: "Waste",
  "land use": "Land Use"
};

const numberFormatter = new Intl.NumberFormat("en-US");

type SectorBreakdownProps = {
  actions: ClimateAction[];
};

export function SectorBreakdown({ actions }: SectorBreakdownProps) {
  const totals = actions.reduce<Record<Sector, number>>(
    (accumulator, action) => {
      accumulator[action.sector] += action.annualReduction;
      return accumulator;
    },
    {
      transport: 0,
      energy: 0,
      buildings: 0,
      waste: 0,
      "land use": 0
    }
  );

  const maxReduction = Math.max(...Object.values(totals), 1);

  return (
    <section className="rounded-[10px] border border-white/12 bg-[linear-gradient(180deg,rgba(1,1,45,0.92)_0%,rgba(0,0,31,0.72)_100%)] p-7 shadow-brand sm:p-8 lg:p-9">
      <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-accent">
            Sector breakdown
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Annual modeled reductions by sector
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/58">
            Horizontal bars scale to the largest contributor so you can compare
            relative effort between program areas.
          </p>
        </div>
        <div
          aria-hidden
          className="mx-auto h-[5.5rem] w-[5.5rem] shrink-0 rounded-full border border-brand-accent/45 bg-[radial-gradient(circle_at_35%_35%,#62f58a_0,#2352dc_42%,transparent_72%)] opacity-90 shadow-[0_0_28px_rgba(98,245,138,0.25)] sm:mx-0"
        />
      </div>

      <div className="space-y-6">
        {(Object.keys(totals) as Sector[]).map((sector) => {
          const reduction = totals[sector];
          const width = `${Math.max((reduction / maxReduction) * 100, 4)}%`;

          return (
            <div key={sector}>
              <div className="mb-2.5 flex items-baseline justify-between gap-4">
                <p className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  {sectorLabels[sector]}
                </p>
                <p className="font-mono text-sm tabular-nums text-brand-cyan-soft">
                  {numberFormatter.format(reduction)} t/yr
                </p>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-cyan-soft"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
