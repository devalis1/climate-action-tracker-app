import { describe, expect, it } from "vitest";

import {
  climateActionSchema,
  cityProfileSchema,
  sectorSchema,
  statusSchema,
} from "./schemas";

describe("climateActionSchema", () => {
  it("accepts valid actions", () => {
    const parsed = climateActionSchema.parse({
      title: "LED street lighting conversion",
      sector: "energy",
      annualReduction: 9500,
      status: "planned",
      startYear: 2027,
    });
    expect(parsed.annualReduction).toBe(9500);
  });

  it("rejects invalid sectors", () => {
    const r = climateActionSchema.safeParse({
      title: "x",
      sector: "INVALID",
      annualReduction: 1,
      status: "planned",
      startYear: 2025,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative reductions", () => {
    const r = climateActionSchema.safeParse({
      title: "x",
      sector: "energy",
      annualReduction: -1,
      status: "planned",
      startYear: 2025,
    });
    expect(r.success).toBe(false);
  });

  it("rejects out-of-range years", () => {
    const r = climateActionSchema.safeParse({
      title: "x",
      sector: "energy",
      annualReduction: 0,
      status: "planned",
      startYear: 3000,
    });
    expect(r.success).toBe(false);
  });
});

describe("cityProfileSchema", () => {
  it("requires positive baseline", () => {
    const r = cityProfileSchema.safeParse({
      city: "Greenville",
      baselineEmissions: 0,
      targetYear: 2035,
      actions: [],
    });
    expect(r.success).toBe(false);
  });

  it("accepts nested actions array", () => {
    const ok = cityProfileSchema.safeParse({
      city: "Greenville",
      baselineEmissions: 500_000,
      targetYear: 2035,
      actions: [
        {
          title: "x",
          sector: "waste",
          annualReduction: 1,
          status: "in progress",
          startYear: 2024,
        },
      ],
    });
    expect(ok.success).toBe(true);
  });
});

describe("enums", () => {
  it("rejects unknown status literals", () => {
    expect(statusSchema.safeParse("done").success).toBe(false);
  });

  it("accepts land use sector including space", () => {
    expect(sectorSchema.parse("land use")).toBe("land use");
  });
});
