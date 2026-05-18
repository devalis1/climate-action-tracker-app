import { z } from "zod";

import { climateActionSchema } from "@/lib/schemas";

export const updateCityBaselineMutationSchema = z.object({
  baselineEmissionsTonsPerYear: z.coerce.number().positive().lte(9007199254740991),
  targetYear: z.coerce.number().int().min(1900).max(2200),
});

/**
 * Forms + JS clients send numeric fields as strings; coerce before climateActionSchema validators.
 */
const climateActionFormInputSchema = climateActionSchema.extend({
  annualReduction: z.coerce.number().nonnegative(),
  startYear: z.coerce.number().int().min(1900).max(2200),
});

/** Insert uses the same canonical fields as UI + imports. */
export const createClimateActionMutationSchema = climateActionFormInputSchema;

export const updateClimateActionMutationSchema =
  climateActionFormInputSchema.extend({
    id: z.coerce.number().int().positive(),
  });

export const deleteClimateActionMutationSchema = z.object({
  id: z.coerce.number().int().positive(),
});
