import { z } from "zod";

import { CITY_SLUG_PATTERN } from "@/lib/city-slug";
import { climateActionSchema } from "@/lib/schemas";

export const updateCityBaselineMutationSchema = z.object({
  baselineEmissionsTonsPerYear: z.coerce.number().positive().lte(9007199254740991),
  targetYear: z.coerce.number().int().min(1900).max(2200),
});

export const updateOpenClimateActorMutationSchema = z.object({
  openclimateActorId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((value) => (value ? value : null)),
});

export const createCityMutationSchema = z.object({
  name: z.string().trim().min(1, "City name is required.").max(120),
  slug: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((value) => (value ? value.toLowerCase() : undefined))
    .refine((value) => value === undefined || CITY_SLUG_PATTERN.test(value), {
      message: "Slug must use lowercase letters, numbers, and hyphens only.",
    }),
  baselineEmissionsTonsPerYear: z.coerce.number().positive().lte(9007199254740991),
  targetYear: z.coerce.number().int().min(1900).max(2200),
  openclimateActorId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((value) => (value ? value : null)),
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
