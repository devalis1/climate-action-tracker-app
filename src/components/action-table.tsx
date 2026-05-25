"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ClimateAction } from "@/lib/schemas";

const numberFormatter = new Intl.NumberFormat("en-US");
const DEFAULT_PAGE_SIZE = 25;

type ActionTableProps = {
  actions: ClimateAction[];
  pageSize?: number;
  title?: string;
};

export function ActionTable({
  actions,
  pageSize = DEFAULT_PAGE_SIZE,
  title = "Climate initiatives",
}: ActionTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(actions.length / pageSize));

  const safePage = Math.min(page, totalPages);
  const pageActions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return actions.slice(start, start + pageSize);
  }, [actions, pageSize, safePage]);

  return (
    <section className="mt-12 rounded-[10px] border border-white/12 bg-white/10 p-6 shadow-brand sm:p-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-accent">
            Action inventory
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white/58">
            {actions.length === 0
              ? "No initiatives recorded yet."
              : `${actions.length} tracked initiative${actions.length === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-white/15 bg-brand-surface/90 shadow-brand">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-brand-bg-deep/95">
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
              {pageActions.map((action) => (
                <tr key={`${action.title}-${action.startYear}-${action.sector}`} className="align-top">
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

        {actions.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/60">
            Once city admins add programs, they appear here for public transparency.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              size="sm"
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              disabled={safePage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              size="sm"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
