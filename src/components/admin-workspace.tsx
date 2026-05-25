"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  AdminActionsTable,
  type ManagedClimateActionRow,
} from "@/components/admin/admin-actions-table";

export type { ManagedClimateActionRow };
import {
  ActionFormModal,
  type ActionDraftBase,
} from "@/components/admin/action-form-modal";
import {
  ActionCreateForm,
  ImportPanel,
} from "@/components/admin/import-and-create";
import { CityCreateModal } from "@/components/admin/city-create-modal";
import { CityProfileForm } from "@/components/admin/city-profile-form";
import { OpenClimateActorPicker } from "@/components/admin/openclimate-actor-picker";
import { saveNewClimateAction, selectAdminCity } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import type { AdminActionsListParams } from "@/lib/admin-list-params";

export type AdminCityOption = {
  id: number;
  name: string;
  slug: string;
};

type AdminWorkspaceProps = {
  demoCityLabel: string;
  cityOptions: AdminCityOption[];
  selectedCityId: number;
  demoAuthEnabled: boolean;
  initialBaselineTonsPerYear: number;
  initialTargetYear: number;
  initialOpenClimateActorId: string | null;
  initialActions: ManagedClimateActionRow[];
  listParams: AdminActionsListParams;
  totalActionCount: number;
};

export function AdminWorkspace({
  demoCityLabel,
  cityOptions,
  selectedCityId,
  demoAuthEnabled,
  initialBaselineTonsPerYear,
  initialTargetYear,
  initialOpenClimateActorId,
  initialActions,
  listParams,
  totalActionCount,
}: AdminWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [importOpen, setImportOpen] = useState(false);
  const [importDraft, setImportDraft] = useState<ActionDraftBase | null>(null);
  const [cityCreateOpen, setCityCreateOpen] = useState(false);

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCityChange(nextId: number) {
    if (nextId === selectedCityId) return;

    const result = await selectAdminCity(nextId);
    if (!result.ok) {
      toast({
        tone: "error",
        title: "City switch failed",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "City switched",
      description: "Admin context updated for the selected city.",
    });
    refreshRoute();
  }

  async function submitImport(draft: ActionDraftBase) {
    const result = await saveNewClimateAction({
      title: draft.title,
      sector: draft.sector,
      annualReduction: draft.annualReduction,
      status: draft.status,
      startYear: draft.startYear,
    });

    if (!result.ok) {
      toast({
        tone: "error",
        title: "Import not saved",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "Import saved",
      description: `"${draft.title}" persisted to Postgres.`,
    });
    setImportOpen(false);
    setImportDraft(null);
    refreshRoute();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <section className="mb-8 rounded-[10px] border border-white/15 bg-brand-surface p-8 shadow-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
                City Admin
              </p>
              <h1 className="mt-4 font-heading text-5xl font-semibold text-white">
                {demoCityLabel} action workspace
              </h1>
              <p className="mt-4 max-w-2xl text-white/70">
                PostgreSQL-backed baseline, target year, and climate actions. Link an OpenClimate
                actor for live targets and benchmark data on the public viewer.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <FormField className="max-w-xs flex-1" label="Managing city">
                <Select
                  disabled={isPending}
                  onChange={(event) => {
                    void handleCityChange(Number(event.target.value));
                  }}
                  value={selectedCityId}
                >
                  {cityOptions.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.slug})
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button
                disabled={isPending}
                onClick={() => setCityCreateOpen(true)}
                type="button"
                variant="secondary"
              >
                New city
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            {demoAuthEnabled ? (
              <a href="/admin/logout">
                <Button variant="secondary">Log out</Button>
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-[10px] border border-white/15 bg-white/10 p-6 shadow-brand sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green-soft">
            City profile
          </p>
          <h2 className="font-heading text-2xl font-semibold text-white">
            Baseline inventory &amp; net-zero planning year
          </h2>
          <p className="text-sm text-white/60">
            Values flow to the public dashboard and on-track heuristic as soon as you save.
          </p>
        </div>

        <CityProfileForm
          disabled={isPending}
          initialBaselineTonsPerYear={initialBaselineTonsPerYear}
          initialTargetYear={initialTargetYear}
          onSaved={refreshRoute}
        />

        <OpenClimateActorPicker
          cityName={demoCityLabel}
          disabled={isPending}
          initialActorId={initialOpenClimateActorId}
          onSaved={refreshRoute}
        />
      </section>

      <section className="mb-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <ImportPanel
          disabled={isPending}
          onImportReady={(draft) => {
            setImportDraft(draft);
            setImportOpen(true);
          }}
        />
        <ActionCreateForm disabled={isPending} onCreated={refreshRoute} />
      </section>

      <AdminActionsTable
        actions={initialActions}
        disabled={isPending}
        listParams={listParams}
        totalCount={totalActionCount}
      />

      {importDraft ? (
        <ActionFormModal
          initialDraft={importDraft}
          mode="import"
          onOpenChange={(open) => {
            setImportOpen(open);
            if (!open) setImportDraft(null);
          }}
          onSubmit={submitImport}
          open={importOpen}
          pending={isPending}
        />
      ) : null}

      <CityCreateModal
        disabled={isPending}
        onCreated={refreshRoute}
        onOpenChange={setCityCreateOpen}
        open={cityCreateOpen}
      />
    </div>
  );
}
