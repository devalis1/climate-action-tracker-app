"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
  ActionFormFields,
  emptyActionDraft,
  type ActionDraftBase,
} from "@/components/admin/action-form-fields";
import { saveNewClimateAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { climateActionSchema } from "@/lib/schemas";

type ImportPanelProps = {
  disabled?: boolean;
  onImportReady: (draft: ActionDraftBase) => void;
};

export function ImportPanel({ disabled = false, onImportReady }: ImportPanelProps) {
  const { toast } = useToast();
  const [importText, setImportText] = useState("");
  const [loading, setLoading] = useState(false);

  async function parseImport() {
    setLoading(true);

    try {
      const response = await fetch("/api/import-action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });

      const json: unknown = await response.json();

      if (response.status === 401) {
        toast({
          tone: "error",
          title: "Import blocked",
          description: "Sign in at /admin/login before parsing with the LLM.",
        });
        return;
      }

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
          toast({
            tone: "error",
            title: "Import validation failed",
            description: validated.error.issues
              .map((issue) => issue.message)
              .join(" "),
          });
          return;
        }

        const action = validated.data;
        onImportReady({
          title: action.title,
          sector: action.sector,
          annualReduction: String(action.annualReduction),
          status: action.status,
          startYear: String(action.startYear),
        });
        toast({
          tone: "success",
          title: "Import parsed",
          description: "Review the fields in the modal before saving.",
        });
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

      toast({
        tone: "error",
        title: "Import failed",
        description: errorsPayload,
      });
    } catch {
      toast({
        tone: "error",
        title: "Import unreachable",
        description:
          "Could not reach the import service. Check your network and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-white/15 bg-white/10 p-6 shadow-brand sm:p-7 lg:col-span-5">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
          Free-text import
        </p>
        <h2 className="font-heading text-xl font-semibold text-white">
          Paste narrative, review, then save
        </h2>
        <p className="text-xs leading-relaxed text-white/58">
          Calls <code className="font-mono text-[0.62rem]">POST /api/import-action</code>{" "}
          (gated when <code className="font-mono text-[0.62rem]">ADMIN_DEMO_SECRET</code>{" "}
          is set). Provider keys stay server-side.
        </p>
      </div>

      <FormField className="mt-6" label="Narrative snippet">
        <Textarea
          disabled={disabled || loading}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Example: Greenville is converting streetlights to networked LEDs ..."
          spellCheck={false}
          value={importText}
        />
      </FormField>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          disabled={disabled || loading || importText.trim() === ""}
          onClick={() => void parseImport()}
          variant="outline"
        >
          {loading ? "Parsing…" : "Parse with LLM"}
        </Button>
      </div>
    </div>
  );
}

type ActionCreateFormProps = {
  disabled?: boolean;
  onCreated?: () => void;
};

export function ActionCreateForm({ disabled = false, onCreated }: ActionCreateFormProps) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<ActionDraftBase>(() => emptyActionDraft());
  const [pending, setPending] = useState(false);

  async function submitActionEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await saveNewClimateAction({
      title: draft.title,
      sector: draft.sector,
      annualReduction: draft.annualReduction,
      status: draft.status,
      startYear: draft.startYear,
    });

    setPending(false);

    if (!result.ok) {
      toast({
        tone: "error",
        title: "Action not created",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "Action created",
      description: "The initiative was saved to Postgres.",
    });
    setDraft(emptyActionDraft());
    onCreated?.();
  }

  return (
    <div className="rounded-[10px] border border-white/15 bg-brand-surface/90 p-6 shadow-brand backdrop-blur-sm sm:p-7 lg:col-span-7">
      <div className="flex flex-col gap-2 border-b border-white/12 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-green-soft">
          Action composer
        </p>
        <h2 className="font-heading text-xl font-semibold text-white">
          Create a new initiative
        </h2>
        <p className="text-xs text-white/58">
          Validated with the same Zod contract as LLM imports.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={submitActionEditor}>
        <ActionFormFields draft={draft} idPrefix="create-action" onChange={setDraft} />

        <div className="flex flex-wrap gap-3 pt-2">
          <Button disabled={disabled || pending} type="submit">
            Save to Postgres
          </Button>
          <Button
            disabled={disabled || pending}
            onClick={() => setDraft(emptyActionDraft())}
            type="button"
            variant="secondary"
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
