import { ActionTable } from "@/components/action-table";
import { greenvilleProfile } from "@/lib/sample-data";

const numberFormatter = new Intl.NumberFormat("en-US");

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <section className="mb-8 rounded-[10px] border border-white/15 bg-brand-surface p-8 shadow-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
              City Admin
            </p>
            <h1 className="mt-4 font-heading text-5xl font-semibold text-white">
              Greenville action workspace
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Phase 1 is a read-only shell. Data is loaded from the Greenville
              fixture while persistence, auth, CRUD, and LLM import are reserved
              for later sprints.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-white/15 bg-white/10 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand-cyan-soft">
                Baseline
              </p>
              <p className="mt-2 font-heading text-2xl text-white">
                {numberFormatter.format(greenvilleProfile.baselineEmissions)} tCO2e
              </p>
            </div>
            <div className="rounded-[10px] border border-white/15 bg-white/10 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand-cyan-soft">
                Target Year
              </p>
              <p className="mt-2 font-heading text-2xl text-white">
                {greenvilleProfile.targetYear}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 flex flex-col gap-4 rounded-[10px] border border-white/15 bg-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-white">
            Climate actions
          </h2>
          <p className="mt-1 text-sm text-white/65">
            Read-only table seeded from assessment sample data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Add action", "Edit selected", "Delete selected", "Import from text"].map(
            (label) => (
              <button
                key={label}
                disabled
                className="cursor-not-allowed rounded-full border border-brand-accent/50 px-4 py-2 font-heading text-xs uppercase tracking-[0.14em] text-brand-accent/60"
                type="button"
              >
                {label}
              </button>
            )
          )}
        </div>
      </section>

      <ActionTable actions={greenvilleProfile.actions} />
    </div>
  );
}
