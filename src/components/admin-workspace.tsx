"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  commitClimateActionChanges,
  removeClimateAction,
  saveCityBaselineAndTarget,
  saveNewClimateAction,
} from "@/app/admin/actions";
import { climateActionSchema, type Sector, type Status } from "@/lib/schemas";

const numberFormatter = new Intl.NumberFormat("en-US");

const SECTOR_OPTIONS: Sector[] = [
  "transport",
  "energy",
  "buildings",
  "waste",
  "land use",
];

const STATUS_OPTIONS: Status[] = ["planned", "in progress", "completed"];

export type ManagedClimateActionRow = {
  id: number;
  title: string;
  sector: Sector;
  annualReductionTonsPerYear: number;
  status: Status;
  startYear: number;
};

type AdminWorkspaceProps = {
  demoCityLabel: string;
  initialBaselineTonsPerYear: number;
  initialTargetYear: number;
  initialActions: ManagedClimateActionRow[];
};

type ActionDraftBase = {
  title: string;
  sector: Sector;
  annualReduction: string;
  status: Status;
  startYear: string;
};

const emptyDraft = (): ActionDraftBase => ({
  title: "",
  sector: "transport",
  annualReduction: "",
  status: "planned",
  startYear: new Date().getFullYear().toString(),
});

export function AdminWorkspace({
  demoCityLabel,
  initialBaselineTonsPerYear,
  initialTargetYear,
  initialActions,
}: AdminWorkspaceProps) {
  const router = useRouter();
  const [isSaving, startTransition] = useTransition();

  const [baselineInput, setBaselineInput] = useState(
    String(initialBaselineTonsPerYear),
  );
  const [targetYearInput, setTargetYearInput] = useState(
    String(initialTargetYear),
  );
  const [cityMessage, setCityMessage] = useState<string | null>(null);

  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<
    | { tone: "idle" }
    | { tone: "loading" }
    | { tone: "error"; text: string }
    | { tone: "parsed" }
  >({ tone: "idle" });
  const [importDraft, setImportDraft] = useState<ActionDraftBase | null>(null);

  const [draft, setDraft] = useState<ActionDraftBase>(() => emptyDraft());
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setBaselineInput(String(initialBaselineTonsPerYear));
    setTargetYearInput(String(initialTargetYear));
  }, [initialBaselineTonsPerYear, initialTargetYear]);

  const sortedActions = useMemo(
    () =>
      [...initialActions].sort(
        (a, b) => b.startYear - a.startYear || b.id - a.id,
      ),
    [initialActions],
  );

  function bumpRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function submitCityProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCityMessage(null);

    const result = await saveCityBaselineAndTarget({
      baselineEmissionsTonsPerYear: baselineInput,
      targetYear: targetYearInput,
    });

    if (!result.ok) {
      setCityMessage(result.message);
      return;
    }

    setCityMessage("Saved city profile.");
    bumpRoute();
  }

  function beginEdit(row: ManagedClimateActionRow) {
    setActionMessage(null);
    setImportDraft(null);
    setImportStatus({ tone: "idle" });
    setEditingActionId(row.id);
    setDraft({
      title: row.title,
      sector: row.sector,
      annualReduction: String(row.annualReductionTonsPerYear),
      status: row.status,
      startYear: String(row.startYear),
    });
  }

  function beginCreate() {
    setActionMessage(null);
    setImportDraft(null);
    setImportStatus({ tone: "idle" });
    setEditingActionId(null);
    setDraft(emptyDraft());
  }

  async function submitActionEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage(null);

    const payload =
      editingActionId === null
        ? {
            title: draft.title,
            sector: draft.sector,
            annualReduction: draft.annualReduction,
            status: draft.status,
            startYear: draft.startYear,
          }
        : {
            id: editingActionId,
            title: draft.title,
            sector: draft.sector,
            annualReduction: draft.annualReduction,
            status: draft.status,
            startYear: draft.startYear,
          };

    const result =
      editingActionId === null
        ? await saveNewClimateAction(payload)
        : await commitClimateActionChanges(payload);

    if (!result.ok) {
      setActionMessage(result.message);
      return;
    }

    setActionMessage(
      editingActionId === null ? "Action created." : "Action updated.",
    );
    beginCreate();
    bumpRoute();
  }

  async function handleDelete(row: ManagedClimateActionRow) {
    const ok = window.confirm(
      `Delete action "${row.title}"? This cannot be undone in the demo UI.`,
    );
    if (!ok) return;

    setActionMessage(null);
    const result = await removeClimateAction({ id: row.id });
    if (!result.ok) {
      setActionMessage(result.message);
      return;
    }

    if (editingActionId === row.id) {
      beginCreate();
    }

    setActionMessage("Action deleted.");
    bumpRoute();
  }

  async function parseImport() {
    setImportStatus({ tone: "loading" });
    setImportDraft(null);
    setActionMessage(null);

    try {
      const response = await fetch("/api/import-action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });

      const json: unknown = await response.json();

      if (
        typeof json === "object" &&
        json &&
        "ok" in json &&
        (json as { ok?: unknown }).ok === true &&
        "action" in json
      ) {
        const validated = climateActionSchema.safeParse(
          (json as { action: unknown }).action,
        );

        if (!validated.success) {
          setImportStatus({
            tone: "error",
            text: validated.error.issues
              .map((issue) => issue.message)
              .join(" "),
          });
          return;
        }

        const action = validated.data;
        setImportDraft({
          title: action.title,
          sector: action.sector,
          annualReduction: String(action.annualReduction),
          status: action.status,
          startYear: String(action.startYear),
        });
        setImportStatus({ tone: "parsed" });
        return;
      }

      const errorsPayload =
        typeof json === "object" &&
        json &&
        "errors" in json &&
        Array.isArray((json as { errors?: unknown }).errors)
          ? (json as { errors: unknown[] }).errors
              .map((item) => (typeof item === "string" ? item : "Invalid error"))
              .join(" ")
          : "Import service returned an unexpected response.";

      setImportStatus({ tone: "error", text: errorsPayload });
    } catch {
      setImportStatus({
        tone: "error",
        text: "Could not reach the import service. Check your network and try again.",
      });
    }
  }

  function promoteImportDraftToEditor() {
    if (!importDraft) return;
    setEditingActionId(null);
    setDraft(importDraft);
    setImportStatus({ tone: "idle" });
    setImportDraft(null);
    setActionMessage(
      "Review the fields below, then save to persist this action to Postgres.",
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <section className="mb-8 rounded-[10px] border border-white/15 bg-brand-surface p-8 shadow-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
              City Admin
            </p>
            <h1 className="mt-4 font-heading text-5xl font-semibold text-white">
              {demoCityLabel} action workspace
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Sprint 4 persists baseline, target year, and climate actions to
              PostgreSQL. Review LLM imports before saving — nothing is written
              until you confirm.
            </p>
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
            Values flow to the public dashboard and on-track heuristic as soon as
            you save.
          </p>
        </div>

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={submitCityProfile}
        >
          <label className="flex flex-col gap-2 text-sm text-white/70">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
              Baseline (tCO2e / year)
            </span>
            <input
              className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 font-mono text-sm text-white outline-hidden ring-brand-accent/40 focus:ring-2"
              inputMode="numeric"
              name="baselineEmissionsTonsPerYear"
              onChange={(event) => setBaselineInput(event.target.value)}
              value={baselineInput}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-white/70">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
              Target year
            </span>
            <input
              className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 font-mono text-sm text-white outline-hidden ring-brand-accent/40 focus:ring-2"
              inputMode="numeric"
              name="targetYear"
              onChange={(event) => setTargetYearInput(event.target.value)}
              value={targetYearInput}
            />
          </label>

          <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              className="rounded-full bg-brand-accent/90 px-6 py-3 font-heading text-xs uppercase tracking-[0.16em] text-[#07130c] shadow-[0_14px_40px_-18px_rgba(98,245,138,0.55)] hover:bg-brand-accent disabled:opacity-55"
              disabled={isSaving}
              type="submit"
            >
              Save city profile
            </button>
            {cityMessage ? (
              <p className="text-xs text-brand-cyan-soft" role="status">
                {cityMessage}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mb-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="rounded-[10px] border border-white/15 bg-white/10 p-6 shadow-brand sm:p-7 lg:col-span-5">
          <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
              Free-text import
            </p>
            <h2 className="font-heading text-xl font-semibold text-white">
              Paste narrative, review, then save
            </h2>
            <p className="text-xs leading-relaxed text-white/58">
              Calls the Sprint 3 server route (<code className="font-mono text-[0.62rem]">
                POST /api/import-action
              </code>
              ); outputs never touch the browser network stack with provider keys.
            </p>
          </div>

          <label className="mt-6 flex flex-col gap-2 text-sm text-white/70">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
              Narrative snippet
            </span>
            <textarea
              className="min-h-[156px] rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 text-sm leading-relaxed text-white outline-hidden ring-brand-accent/40 focus:ring-2"
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Example: Greenville is converting streetlights to networked LEDs ..."
              spellCheck={false}
              value={importText}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-full border border-brand-accent/80 px-4 py-2 font-heading text-[0.72rem] uppercase tracking-[0.14em] text-brand-accent hover:bg-brand-accent/10 disabled:opacity-55"
              disabled={importStatus.tone === "loading" || importText.trim() === ""}
              onClick={() => void parseImport()}
              type="button"
            >
              {importStatus.tone === "loading" ? "Parsing…" : "Parse with LLM"}
            </button>
          </div>

          {importStatus.tone === "error" ? (
            <p className="mt-4 rounded-[10px] border border-[#ffb877]/50 bg-brand-bg-deep/70 p-4 text-xs text-[#ffb877]" role="alert">
              {importStatus.text}
            </p>
          ) : null}

          {importDraft ? (
            <div className="mt-6 space-y-3 rounded-[10px] border border-white/15 bg-brand-surface/60 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brand-green-soft">
                Parsed preview
              </p>
              <dl className="space-y-3 text-xs text-white/75">
                <div>
                  <dt className="font-mono uppercase tracking-[0.16em] text-brand-cyan-soft">
                    Title
                  </dt>
                  <dd className="font-heading text-sm text-white">{importDraft.title}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="font-mono uppercase tracking-[0.16em] text-brand-cyan-soft">
                      Reduction (t/yr)
                    </dt>
                    <dd className="font-mono tabular-nums text-white">{importDraft.annualReduction}</dd>
                  </div>
                  <div>
                    <dt className="font-mono uppercase tracking-[0.16em] text-brand-cyan-soft">
                      Sector
                    </dt>
                    <dd className="capitalize">{importDraft.sector}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="font-mono uppercase tracking-[0.16em] text-brand-cyan-soft">
                      Status
                    </dt>
                    <dd>{importDraft.status}</dd>
                  </div>
                  <div>
                    <dt className="font-mono uppercase tracking-[0.16em] text-brand-cyan-soft">
                      Start year
                    </dt>
                    <dd className="font-mono tabular-nums">{importDraft.startYear}</dd>
                  </div>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  className="rounded-full bg-brand-accent/90 px-4 py-2 font-heading text-[0.72rem] uppercase tracking-[0.14em] text-[#07130c] hover:bg-brand-accent disabled:opacity-55"
                  onClick={promoteImportDraftToEditor}
                  type="button"
                >
                  Review in editor →
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[10px] border border-white/15 bg-brand-surface/90 p-6 shadow-brand backdrop-blur-sm sm:p-7 lg:col-span-7">
          <div className="flex flex-col gap-2 border-b border-white/12 pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-green-soft">
              Action composer
            </p>
            <h2 className="font-heading text-xl font-semibold text-white">
              {editingActionId === null ? "Create a new initiative" : "Edit initiative"}
            </h2>
            <p className="text-xs text-white/58">
              {editingActionId === null
                ? "Validated with the same Zod contract as Sprint 3 imports."
                : `Editing record ${editingActionId}.`}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submitActionEditor}>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                Title
              </span>
              <input
                className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 text-sm text-white outline-hidden ring-brand-accent/35 focus:ring-2"
                name="title"
                onChange={(event) =>
                  setDraft((state) => ({ ...state, title: event.target.value }))
                }
                value={draft.title}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                  Sector
                </span>
                <select
                  className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 text-sm text-white capitalize outline-hidden ring-brand-accent/35 focus:ring-2"
                  name="sector"
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      sector: event.target.value as Sector,
                    }))
                  }
                  value={draft.sector}
                >
                  {SECTOR_OPTIONS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/70">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                  Status
                </span>
                <select
                  className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 text-sm text-white outline-hidden ring-brand-accent/35 focus:ring-2"
                  name="status"
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      status: event.target.value as Status,
                    }))
                  }
                  value={draft.status}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                  Annual modeled reduction (t/yr)
                </span>
                <input
                  className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 font-mono text-sm text-white outline-hidden ring-brand-accent/35 focus:ring-2"
                  inputMode="numeric"
                  name="annualReduction"
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      annualReduction: event.target.value,
                    }))
                  }
                  value={draft.annualReduction}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-white/70">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
                  Start year
                </span>
                <input
                  className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 font-mono text-sm text-white outline-hidden ring-brand-accent/35 focus:ring-2"
                  inputMode="numeric"
                  name="startYear"
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      startYear: event.target.value,
                    }))
                  }
                  value={draft.startYear}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                className="rounded-full bg-brand-accent px-6 py-2 font-heading text-xs uppercase tracking-[0.16em] text-[#07130c] hover:bg-brand-accent/90 disabled:opacity-55"
                disabled={isSaving}
                type="submit"
              >
                Save to Postgres
              </button>
              <button
                className="rounded-full border border-white/35 px-5 py-2 font-heading text-xs uppercase tracking-[0.16em] text-white hover:border-white disabled:opacity-55"
                onClick={() => beginCreate()}
                type="button"
              >
                Clear
              </button>
            </div>

            {actionMessage ? (
              <p className="text-xs text-brand-cyan-soft" role="status">
                {actionMessage}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="rounded-[10px] border border-white/15 bg-white/10 p-6 shadow-brand sm:p-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">
              Persisted initiatives
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Ordered by earliest activity year (recent first).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-brand-accent/65 px-4 py-2 font-heading text-xs uppercase tracking-[0.14em] text-brand-accent hover:bg-brand-accent/10 disabled:opacity-55"
              onClick={() => beginCreate()}
              type="button"
            >
              New action
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-white/12 bg-brand-surface/90 shadow-brand backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/12 text-left">
              <thead className="bg-brand-bg-deep/95">
                <tr>
                  {["Action", "Sector", "Reduction", "Status", "Start", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brand-cyan-soft"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/12">
                {sortedActions.map((action) => {
                  const highlighted = editingActionId === action.id;
                  return (
                    <tr
                      key={action.id}
                      className={`align-top ${highlighted ? "bg-brand-accent/10" : ""}`}
                    >
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
                          <button
                            className="rounded-full border border-white/35 px-3 py-2 font-heading text-[0.65rem] uppercase tracking-[0.12em] text-white hover:bg-white/10 disabled:opacity-55"
                            onClick={() => beginEdit(action)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full border border-[#ffb877]/50 px-3 py-2 font-heading text-[0.65rem] uppercase tracking-[0.12em] text-[#ffb877] hover:bg-[#ffb877]/10 disabled:opacity-55"
                            onClick={() => void handleDelete(action)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sortedActions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/60">
              No actions yet — import from narrative or compose one manually,
              then confirm a save.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
