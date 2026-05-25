import { describe, expect, it } from "vitest";

import {
  createClimateActionMutationSchema,
  createCityMutationSchema,
  deleteClimateActionMutationSchema,
  updateCityBaselineMutationSchema,
  updateClimateActionMutationSchema,
} from "@/lib/admin-mutation-schemas";

describe("admin mutation schemas — string coercion", () => {
  it("parses baseline + target updates from numeric strings", () => {
    const r = updateCityBaselineMutationSchema.safeParse({
      baselineEmissionsTonsPerYear: "490000",
      targetYear: "2034",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.baselineEmissionsTonsPerYear).toBe(490000);
      expect(r.data.targetYear).toBe(2034);
    }
  });

  it("creates actions when annualReduction and startYear are strings", () => {
    const r = createClimateActionMutationSchema.safeParse({
      title: "Bike share expansion",
      sector: "transport",
      annualReduction: "8000",
      status: "planned",
      startYear: "2027",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.annualReduction).toBe(8000);
      expect(r.data.startYear).toBe(2027);
    }
  });

  it("updates actions with coerced id and numeric fields", () => {
    const r = updateClimateActionMutationSchema.safeParse({
      id: "3",
      title: "Organic waste composting program",
      sector: "waste",
      annualReduction: "8000",
      status: "completed",
      startYear: "2022",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe(3);
  });

  it("deletes actions with coerced id", () => {
    const r = deleteClimateActionMutationSchema.safeParse({ id: "2" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe(2);
  });

  it("rejects malformed numerics surfaced as Zod failures", () => {
    const r = updateCityBaselineMutationSchema.safeParse({
      baselineEmissionsTonsPerYear: "two-hundred",
      targetYear: 2035,
    });
    expect(r.success).toBe(false);
  });

  it("creates cities with coerced baseline and optional slug", () => {
    const r = createCityMutationSchema.safeParse({
      name: "Austin",
      baselineEmissionsTonsPerYear: "520000",
      targetYear: "2045",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.baselineEmissionsTonsPerYear).toBe(520000);
      expect(r.data.targetYear).toBe(2045);
      expect(r.data.slug).toBeUndefined();
    }
  });

  it("rejects invalid city slugs", () => {
    const r = createCityMutationSchema.safeParse({
      name: "Austin",
      slug: "austin_tx",
      baselineEmissionsTonsPerYear: 520000,
      targetYear: 2045,
    });
    expect(r.success).toBe(false);
  });
});
