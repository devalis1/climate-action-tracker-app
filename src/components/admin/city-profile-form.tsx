"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { saveCityBaselineAndTarget } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

type CityProfileFormProps = {
  initialBaselineTonsPerYear: number;
  initialTargetYear: number;
  disabled?: boolean;
  onSaved?: () => void;
};

export function CityProfileForm({
  initialBaselineTonsPerYear,
  initialTargetYear,
  disabled = false,
  onSaved,
}: CityProfileFormProps) {
  const { toast } = useToast();
  const [baselineInput, setBaselineInput] = useState(
    String(initialBaselineTonsPerYear),
  );
  const [targetYearInput, setTargetYearInput] = useState(
    String(initialTargetYear),
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setBaselineInput(String(initialBaselineTonsPerYear));
    setTargetYearInput(String(initialTargetYear));
  }, [initialBaselineTonsPerYear, initialTargetYear]);

  async function submitCityProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await saveCityBaselineAndTarget({
      baselineEmissionsTonsPerYear: baselineInput,
      targetYear: targetYearInput,
    });

    setPending(false);

    if (!result.ok) {
      toast({
        tone: "error",
        title: "City profile not saved",
        description: result.message,
      });
      return;
    }

    toast({
      tone: "success",
      title: "City profile saved",
      description: "Baseline and target year updated in Postgres.",
    });
    onSaved?.();
  }

  return (
    <form
      className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={submitCityProfile}
    >
      <FormField label="Baseline (tCO2e / year)">
        <Input
          disabled={disabled || pending}
          inputMode="numeric"
          mono
          name="baselineEmissionsTonsPerYear"
          onChange={(event) => setBaselineInput(event.target.value)}
          value={baselineInput}
        />
      </FormField>

      <FormField label="Target year">
        <Input
          disabled={disabled || pending}
          inputMode="numeric"
          mono
          name="targetYear"
          onChange={(event) => setTargetYearInput(event.target.value)}
          value={targetYearInput}
        />
      </FormField>

      <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
        <Button disabled={disabled || pending} size="lg" type="submit">
          Save city profile
        </Button>
      </div>
    </form>
  );
}
