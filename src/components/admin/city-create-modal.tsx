"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { createAdminCity } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { deriveCitySlugFromName } from "@/lib/city-slug";
import { publicCityPath } from "@/lib/public-default-city";

type CityCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  onCreated?: () => void;
};

export function CityCreateModal({
  open,
  onOpenChange,
  disabled = false,
  onCreated,
}: CityCreateModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [baselineInput, setBaselineInput] = useState("400000");
  const [targetYearInput, setTargetYearInput] = useState("2045");
  const [openclimateActorId, setOpenclimateActorId] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setSlug("");
    setSlugTouched(false);
    setBaselineInput("400000");
    setTargetYearInput("2045");
    setOpenclimateActorId("");
  }, [open]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(deriveCitySlugFromName(name));
  }, [name, slugTouched]);

  async function submitCreateCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await createAdminCity({
      name,
      slug: slug.trim() || undefined,
      baselineEmissionsTonsPerYear: baselineInput,
      targetYear: targetYearInput,
      openclimateActorId: openclimateActorId.trim() || undefined,
    });

    setPending(false);

    if (!result.ok) {
      toast({
        tone: "error",
        title: "City not created",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: `${result.name} created`,
      description: `Public dashboard: ${publicCityPath(result.slug)}`,
    });
    onOpenChange(false);
    onCreated?.();
  }

  const derivedSlug = deriveCitySlugFromName(name);
  const slugPreview = slug.trim() || derivedSlug;

  return (
    <Dialog
      description="Creates a new Postgres city row with a public /city/[slug] dashboard. You are switched into the new city immediately."
      footer={
        <>
          <Button
            disabled={disabled || pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button disabled={disabled || pending} form="city-create-form" type="submit">
            {pending ? "Creating…" : "Create city"}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title="Add city"
    >
      <form className="space-y-4" id="city-create-form" onSubmit={submitCreateCity}>
        <FormField label="City name">
          <Input
            disabled={disabled || pending}
            onChange={(event) => setName(event.target.value)}
            placeholder="Austin"
            required
            value={name}
          />
        </FormField>

        <div className="space-y-2">
          <FormField label="Public slug">
            <Input
              disabled={disabled || pending}
              mono
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder={derivedSlug || "austin"}
              value={slug}
            />
          </FormField>
          <p className="font-mono text-xs text-white/45">
            {slugPreview
              ? `Public route: /city/${slugPreview}`
              : "Slug auto-derives from the city name."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Baseline (tCO2e / year)">
            <Input
              disabled={disabled || pending}
              inputMode="numeric"
              mono
              onChange={(event) => setBaselineInput(event.target.value)}
              required
              value={baselineInput}
            />
          </FormField>

          <FormField label="Target year">
            <Input
              disabled={disabled || pending}
              inputMode="numeric"
              mono
              onChange={(event) => setTargetYearInput(event.target.value)}
              required
              value={targetYearInput}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <FormField label="OpenClimate actor ID">
            <Input
              disabled={disabled || pending}
              mono
              onChange={(event) => setOpenclimateActorId(event.target.value)}
              placeholder="US AUS"
              value={openclimateActorId}
            />
          </FormField>
          <p className="text-xs text-white/45">
            Optional — link OpenClimate now or use OpenClimate linkage after create.
          </p>
        </div>
      </form>
    </Dialog>
  );
}
