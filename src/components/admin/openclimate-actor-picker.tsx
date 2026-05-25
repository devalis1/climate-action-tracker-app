"use client";

import { useState } from "react";

import { saveCityOpenClimateActor } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import type { OpenClimateSearchResult } from "@/lib/openclimate-types";

type OpenClimateActorPickerProps = {
  initialActorId: string | null;
  cityName: string;
  disabled?: boolean;
  onSaved?: () => void;
};

export function OpenClimateActorPicker({
  initialActorId,
  cityName,
  disabled = false,
  onSaved,
}: OpenClimateActorPickerProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState(cityName);
  const [linkedActorId, setLinkedActorId] = useState(initialActorId ?? "");
  const [results, setResults] = useState<OpenClimateSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  async function searchActors() {
    setSearching(true);
    try {
      const params = new URLSearchParams({ name: query.trim(), type: "city" });
      const response = await fetch(`/api/openclimate/search?${params.toString()}`);
      const json: unknown = await response.json();

      if (
        !response.ok ||
        typeof json !== "object" ||
        !json ||
        !("ok" in json) ||
        (json as { ok?: boolean }).ok !== true
      ) {
        toast({
          tone: "error",
          title: "OpenClimate search failed",
          description:
            typeof json === "object" && json && "message" in json
              ? String((json as { message?: unknown }).message)
              : "Could not reach OpenClimate search.",
        });
        setResults([]);
        return;
      }

      setResults((json as { results?: OpenClimateSearchResult[] }).results ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function saveActorId(actorId: string | null) {
    setSaving(true);
    const result = await saveCityOpenClimateActor({
      openclimateActorId: actorId ?? "",
    });
    setSaving(false);

    if (!result.ok) {
      toast({
        tone: "error",
        title: "OpenClimate link not saved",
        description: result.message,
      });
      return;
    }

    setLinkedActorId(actorId ?? "");
    toast({
      tone: "success",
      title: actorId ? "OpenClimate actor linked" : "OpenClimate link cleared",
      description: actorId
        ? `Public viewer will enrich from ${actorId}.`
        : "Live enrichment disabled for this city.",
    });
    onSaved?.();
  }

  return (
    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green-soft">
          OpenClimate linkage
        </p>
        <p className="mt-2 text-sm text-white/58">
          Search{" "}
          <a
            className="text-brand-accent underline-offset-4 hover:underline"
            href="https://openclimate.network/"
            rel="noreferrer"
            target="_blank"
          >
            openclimate.network
          </a>{" "}
          and link a UNLOCODE actor for live targets, population, and benchmark emissions on the
          public viewer.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FormField className="flex-1" label="Search city name">
          <Input
            disabled={disabled || searching || saving}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chicago"
            value={query}
          />
        </FormField>
        <Button
          disabled={disabled || searching || saving || !query.trim()}
          onClick={() => void searchActors()}
          type="button"
          variant="secondary"
        >
          {searching ? "Searching…" : "Search OpenClimate"}
        </Button>
      </div>

      {linkedActorId ? (
        <p className="font-mono text-xs text-white/55">
          Linked actor:{" "}
          <span className="text-brand-accent">{linkedActorId}</span>
          <Button
            className="ml-3"
            disabled={disabled || saving}
            onClick={() => void saveActorId(null)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="space-y-2">
          {results.slice(0, 8).map((result) => (
            <li
              key={result.actorId}
              className="flex flex-col gap-2 rounded-[8px] border border-white/12 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading text-base font-semibold text-white">{result.name}</p>
                <p className="font-mono text-xs text-white/50">
                  {result.actorId}
                  {result.geographicPath.length > 0
                    ? ` · ${result.geographicPath.join(" → ")}`
                    : ""}
                  {result.hasData === true ? " · has data" : ""}
                </p>
              </div>
              <Button
                disabled={disabled || saving}
                onClick={() => void saveActorId(result.actorId)}
                size="sm"
                type="button"
              >
                Link actor
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
