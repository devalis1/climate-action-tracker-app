"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  ActionFormModal,
  type ActionDraftBase,
} from "@/components/admin/action-form-modal";
import {
  commitClimateActionChanges,
  removeClimateAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import {
  ADMIN_ACTIONS_PAGE_SIZE,
  adminActionsQueryString,
  type AdminActionsListParams,
} from "@/lib/admin-list-params";
import type { ClimateActionSortKey } from "@/lib/sorting";
import {
  SECTOR_OPTIONS,
  STATUS_OPTIONS,
  type ActionDraftBase as DraftBase,
} from "@/components/admin/action-form-fields";
import type { Sector, Status } from "@/lib/schemas";

const numberFormatter = new Intl.NumberFormat("en-US");

export type ManagedClimateActionRow = {
  id: number;
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
};

type AdminActionsTableProps = {
  actions: ManagedClimateActionRow[];
  listParams: AdminActionsListParams;
  totalCount: number;
  disabled?: boolean;
};

const sortHeadings: { key: ClimateActionSortKey; label: string }[] = [
  { key: "title", label: "Action" },
  { key: "sector", label: "Sector" },
  { key: "annualReduction", label: "Reduction" },
  { key: "status", label: "Status" },
  { key: "startYear", label: "Start" },
];

function rowToDraft(row: ManagedClimateActionRow): DraftBase {
  return {
    title: row.title,
    sector: row.sector,
    annualReduction: String(row.annualReductionTonsPerYear),
    status: row.status,
    startYear: String(row.startYear),
  };
}

export function AdminActionsTable({
  actions,
  listParams,
  totalCount,
  disabled = false,
}: AdminActionsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<DraftBase | null>(null);
  const [editActionId, setEditActionId] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedClimateActionRow | null>(
    null,
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_ACTIONS_PAGE_SIZE));
  const pageStart = (listParams.page - 1) * ADMIN_ACTIONS_PAGE_SIZE + 1;
  const pageEnd = Math.min(listParams.page * ADMIN_ACTIONS_PAGE_SIZE, totalCount);

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function toggleSort(key: ClimateActionSortKey) {
    const nextDirection =
      listParams.sort === key && listParams.direction === "desc" ? "asc" : "desc";
    router.push(
      `/admin${adminActionsQueryString(listParams, {
        sort: key,
        direction: nextDirection,
        page: 1,
      })}`,
    );
  }

  function updateList(overrides: Partial<AdminActionsListParams>) {
    router.push(`/admin${adminActionsQueryString(listParams, overrides)}`);
  }

  function applySectorFilter(value: string) {
    updateList({
      page: 1,
      sector: (value || undefined) as Sector | undefined,
    });
  }

  function applyStatusFilter(value: string) {
    updateList({
      page: 1,
      status: (value || undefined) as Status | undefined,
    });
  }

  function openEdit(row: ManagedClimateActionRow) {
    setEditActionId(row.id);
    setEditDraft(rowToDraft(row));
    setEditOpen(true);
  }

  async function submitEdit(draft: ActionDraftBase, actionId?: number) {
    if (!actionId) return;

    const result = await commitClimateActionChanges({
      id: actionId,
      title: draft.title,
      sector: draft.sector,
      annualReduction: draft.annualReduction,
      status: draft.status,
      startYear: draft.startYear,
    });

    if (!result.ok) {
      toast({
        tone: "error",
        title: "Action not updated",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "Action updated",
      description: `"${draft.title}" saved to Postgres.`,
    });
    setEditOpen(false);
    refreshRoute();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const result = await removeClimateAction({ id: deleteTarget.id });
    if (!result.ok) {
      toast({
        tone: "error",
        title: "Action not deleted",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "Action deleted",
      description: `"${deleteTarget.title}" was removed.`,
    });
    setDeleteOpen(false);
    setDeleteTarget(null);
    refreshRoute();
  }

  return (
    <>
      <section className="rounded-[10px] border border-white/15 bg-white/10 p-6 shadow-brand sm:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">
              Persisted initiatives
            </h2>
            <p className="mt-1 text-sm text-white/65">
              {totalCount === 0
                ? "No actions yet — import or compose one, then save."
                : `Showing ${pageStart}–${pageEnd} of ${totalCount} actions.`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Filter sector">
              <Select
                disabled={disabled || isPending}
                onChange={(event) => applySectorFilter(event.target.value)}
                value={listParams.sector ?? ""}
              >
                <option value="">All sectors</option>
                {SECTOR_OPTIONS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Filter status">
              <Select
                disabled={disabled || isPending}
                onChange={(event) => applyStatusFilter(event.target.value)}
                value={listParams.status ?? ""}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-white/12 bg-brand-surface/90 shadow-brand backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/12 text-left">
              <thead className="bg-brand-bg-deep/95">
                <tr>
                  {sortHeadings.map(({ key, label }) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brand-cyan-soft"
                    >
                      <button
                        className="inline-flex items-center gap-2 hover:text-white disabled:opacity-55"
                        disabled={disabled || isPending}
                        onClick={() => toggleSort(key)}
                        type="button"
                      >
                        {label}
                        {listParams.sort === key ? (
                          <span className="text-brand-accent">
                            {listParams.direction === "asc" ? "↑" : "↓"}
                          </span>
                        ) : null}
                      </button>
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brand-cyan-soft"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/12">
                {actions.map((action) => (
                  <tr key={action.id} className="align-top">
                    <td className="px-5 py-4 font-heading text-base font-semibold text-white">
                      {action.title}
                      <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/55">
                        id {action.id}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-white/75">
                      {action.sector}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-brand-accent">
                      {numberFormatter.format(action.annualReductionTonsPerYear)} t/yr
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-white/20 px-3 py-1 font-heading text-xs uppercase tracking-[0.14em] text-white/82">
                        {action.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-white/75">
                      {action.startYear}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={disabled || isPending}
                          onClick={() => openEdit(action)}
                          size="sm"
                          variant="secondary"
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={disabled || isPending}
                          onClick={() => {
                            setDeleteTarget(action);
                            setDeleteOpen(true);
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {actions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/60">
              No actions match these filters.
            </p>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">
              Page {listParams.page} of {totalPages}
            </p>
            <div className="flex flex-wrap gap-2">
              {listParams.page > 1 ? (
                <Link
                  href={`/admin${adminActionsQueryString(listParams, {
                    page: listParams.page - 1,
                  })}`}
                >
                  <Button disabled={isPending} size="sm" variant="secondary">
                    Previous
                  </Button>
                </Link>
              ) : null}
              {listParams.page < totalPages ? (
                <Link
                  href={`/admin${adminActionsQueryString(listParams, {
                    page: listParams.page + 1,
                  })}`}
                >
                  <Button disabled={isPending} size="sm" variant="secondary">
                    Next
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {editDraft ? (
        <ActionFormModal
          actionId={editActionId ?? undefined}
          initialDraft={editDraft}
          mode="edit"
          onOpenChange={setEditOpen}
          onSubmit={submitEdit}
          open={editOpen}
          pending={isPending}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete action"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? This cannot be undone in the demo UI.`
            : ""
        }
        onConfirm={confirmDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={isPending}
        title="Remove initiative?"
      />
    </>
  );
}
