import { z } from "zod";

export const sectorSchema = z.enum([
  "transport",
  "energy",
  "buildings",
  "waste",
  "land use"
]);

export const statusSchema = z.enum(["planned", "in progress", "completed"]);

export const climateActionSchema = z.object({
  title: z.string().min(1),
  sector: sectorSchema,
  annualReduction: z.number().nonnegative(),
  status: statusSchema,
  startYear: z.number().int().min(1900).max(2200)
});

export const cityProfileSchema = z.object({
  city: z.string().min(1),
  baselineEmissions: z.number().positive(),
  targetYear: z.number().int().min(1900).max(2200),
  actions: z.array(climateActionSchema)
});

export type Sector = z.infer<typeof sectorSchema>;
export type Status = z.infer<typeof statusSchema>;
export type ClimateAction = z.infer<typeof climateActionSchema>;
export type CityProfile = z.infer<typeof cityProfileSchema>;
