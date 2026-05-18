import { describe, expect, it } from "vitest";

import type { ClimateAction } from "@/lib/schemas";

import {
  glidePathStartYearFromActions,
  isOnTrack,
  percentOfBaseline,
  projectedAnnualEmissionsTonsForYear,
  projectedLinearAnnualReductionDemand,
  totalAnnualReduction,
} from "./calculations";

const baseAction = (partial: Partial<ClimateAction>): ClimateAction => ({
  title: "t",
  sector: "energy",
  annualReduction: 1000,
  status: "planned",
  startYear: 2025,
  ...partial,
});

describe("totalAnnualReduction", () => {
  it("sums reductions", () => {
    expect(
      totalAnnualReduction([
        baseAction({ annualReduction: 100 }),
        baseAction({ annualReduction: 50 }),
      ]),
    ).toBe(150);
  });

  it("returns 0 for empty actions", () => {
    expect(totalAnnualReduction([])).toBe(0);
  });
});

describe("percentOfBaseline", () => {
  it("returns 0 when baseline is non-positive", () => {
    expect(percentOfBaseline(100, 0)).toBe(0);
    expect(percentOfBaseline(100, -10)).toBe(0);
  });

  it("computes percentage", () => {
    expect(percentOfBaseline(50_000, 500_000)).toBeCloseTo(10, 5);
  });
});

describe("glidePathStartYearFromActions", () => {
  it("uses earliest action start year capped before target", () => {
    expect(
      glidePathStartYearFromActions(
        [baseAction({ startYear: 2024 }), baseAction({ startYear: 2028 })],
        2035,
      ),
    ).toBe(2024);
  });

  it("uses nominal planning window when there are no actions", () => {
    expect(glidePathStartYearFromActions([], 2035)).toBe(2023);
  });

  it("returns 1900 when target year is at the lower boundary", () => {
    expect(glidePathStartYearFromActions([], 1901)).toBe(1900);
  });
});

describe("projectedLinearAnnualReductionDemand", () => {
  const baseline = 500_000;
  const glideStart = 2020;
  const target = 2040;

  it("returns 0 when baseline is non-positive", () => {
    expect(
      projectedLinearAnnualReductionDemand(0, glideStart, target, 2030),
    ).toBe(0);
  });

  it("is 0 before glide start", () => {
    expect(
      projectedLinearAnnualReductionDemand(baseline, glideStart, target, 2019),
    ).toBe(0);
  });

  it("reaches full baseline demand by target year", () => {
    expect(
      projectedLinearAnnualReductionDemand(baseline, glideStart, target, 2040),
    ).toBe(baseline);
  });

  it("interpolates midpoint", () => {
    const span = target - glideStart;
    const half = glideStart + Math.floor(span / 2);
    expect(
      projectedLinearAnnualReductionDemand(baseline, glideStart, target, half),
    ).toBeCloseTo(baseline / 2, 5);
  });
});

describe("isOnTrack", () => {
  it("flags ahead of glide as on track", () => {
    expect(isOnTrack(250_000, 500_000, 2040, 2020, 2030)).toBe(true);
  });

  it("flags behind glide as off track", () => {
    expect(isOnTrack(1, 500_000, 2040, 2020, 2035)).toBe(false);
  });
});

describe("projectedAnnualEmissionsTonsForYear", () => {
  it("holds baseline before glide and hits zero at target", () => {
    const b = 500_000;
    const g = 2020;
    const t = 2030;
    expect(projectedAnnualEmissionsTonsForYear(b, g, t, 2019)).toBe(b);
    expect(projectedAnnualEmissionsTonsForYear(b, g, t, 2020)).toBe(b);
    expect(projectedAnnualEmissionsTonsForYear(b, g, t, 2030)).toBe(0);
  });

  it("linearly declines between glide start and target", () => {
    const b = 100;
    const g = 2020;
    const t = 2030;
    expect(projectedAnnualEmissionsTonsForYear(b, g, t, 2025)).toBe(50);
  });

  it("handles degenerate span (target <= glide) as step to zero at target", () => {
    expect(projectedAnnualEmissionsTonsForYear(100, 2030, 2030, 2029)).toBe(100);
    expect(projectedAnnualEmissionsTonsForYear(100, 2030, 2030, 2030)).toBe(0);
  });
});
