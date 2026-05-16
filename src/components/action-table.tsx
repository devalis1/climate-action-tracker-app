import type { ClimateAction } from "@/lib/schemas";

const numberFormatter = new Intl.NumberFormat("en-US");

type ActionTableProps = {
  actions: ClimateAction[];
};

export function ActionTable({ actions }: ActionTableProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-white/15 bg-white/10 shadow-brand">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left">
          <thead className="bg-brand-surface">
            <tr>
              {["Action", "Sector", "Reduction", "Status", "Start"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brand-cyan-soft"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {actions.map((action) => (
              <tr key={`${action.title}-${action.startYear}`} className="align-top">
                <td className="px-5 py-4 font-heading text-base font-semibold text-white">
                  {action.title}
                </td>
                <td className="px-5 py-4 text-sm capitalize text-white/75">
                  {action.sector}
                </td>
                <td className="px-5 py-4 font-mono text-sm text-brand-accent">
                  {numberFormatter.format(action.annualReduction)} t/yr
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-white/20 px-3 py-1 font-heading text-xs uppercase tracking-[0.14em] text-white/80">
                    {action.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-sm text-white/75">
                  {action.startYear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
