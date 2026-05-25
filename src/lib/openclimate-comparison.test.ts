import { describe, expect, it } from "vitest";

import {
  compareBaselineToOpenClimate,
  computeTargetGap,
  pickNearestOfficialTarget,
  pickPreferredBenchmark,
} from "@/lib/openclimate-comparison";
import type { OpenClimateBenchmarkEmissions, OpenClimateTarget } from "@/lib/openclimate-types";
import type { ClimateAction } from "@/lib/schemas";

const sampleActions: ClimateAction[] = [
  {
    title: "Solar program",
    sector: "energy",
    annualReduction: 50_000,
    status: "in progress",
    startYear: 2024,
  },
  {
    title: "Transit expansion",
    sector: "transport",
    annualReduction: 30_000,
    status: "planned",
    startYear: 2025,
  },
];

const targets: OpenClimateTarget[] = [
  {
    targetType: "Absolute emission reduction",
    targetYear: 2030,
    targetValue: 40,
    baselineYear: 2005,
  },
  {
    targetType: "Absolute emission reduction",
    targetYear: 2040,
    targetValue: 62,
    baselineYear: 2005,
  },
];

describe("pickNearestOfficialTarget", () => {
  it("chooses the target year closest to the planning horizon", () => {
    const nearest = pickNearestOfficialTarget(targets, 2035);
    expect(nearest?.targetYear).toBe(2030);
  });

  it("returns null when no targets exist", () => {
    expect(pickNearestOfficialTarget([], 2035)).toBeNull();
  });
});

describe("pickPreferredBenchmark", () => {
  it("prefers CDP citywide datasets", () => {
    const benchmarks: OpenClimateBenchmarkEmissions[] = [
      {
        datasourceId: "carbon_monitor",
        datasourceName: "Near-real-time daily estimates",
        publisher: "Carbon Monitor",
        year: 2021,
        totalEmissions: 100,
        url: null,
      },
      {
        datasourceId: "cdp",
        datasourceName: "2019 - City-wide Emissions",
        publisher: "CDP",
        year: 2019,
        totalEmissions: 200,
        url: null,
      },
    ];

    expect(pickPreferredBenchmark(benchmarks)?.datasourceId).toBe("cdp");
  });
});

describe("computeTargetGap", () => {
  it("marks local reductions ahead of the nearest official target", () => {
    const gap = computeTargetGap({
      actions: sampleActions,
      baselineEmissions: 500_000,
      planningTargetYear: 2035,
      officialTargets: targets,
    });

    expect(gap.localReductionPercent).toBe(16);
    expect(gap.officialTargetPercent).toBe(40);
    expect(gap.narrative).toBe("behind");
    expect(gap.gapPercentPoints).toBe(-24);
  });

  it("returns no_official_target when OpenClimate has no targets", () => {
    const gap = computeTargetGap({
      actions: sampleActions,
      baselineEmissions: 500_000,
      planningTargetYear: 2035,
      officialTargets: [],
    });

    expect(gap.narrative).toBe("no_official_target");
    expect(gap.officialTargetPercent).toBeNull();
  });
});

describe("compareBaselineToOpenClimate", () => {
  it("computes delta between local baseline and reported emissions", () => {
    const comparison = compareBaselineToOpenClimate({
      localBaselineTons: 500_000,
      benchmark: {
        datasourceId: "cdp",
        datasourceName: "CDP citywide",
        publisher: "CDP",
        year: 2019,
        totalEmissions: 400_000,
        url: null,
      },
    });

    expect(comparison.deltaPercent).toBe(25);
    expect(comparison.reportedEmissionsTons).toBe(400_000);
  });
});
