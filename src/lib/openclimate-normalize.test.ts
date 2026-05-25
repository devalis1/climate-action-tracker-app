import { describe, expect, it } from "vitest";

import {
  normalizeActorOverview,
  normalizeSearchResults,
} from "@/lib/openclimate-normalize";

describe("normalizeSearchResults", () => {
  it("maps OpenClimate search payload into UI rows", () => {
    const rows = normalizeSearchResults({
      success: true,
      data: [
        {
          actor_id: "US CHI",
          name: "Chicago",
          type: "city",
          has_data: true,
          root_path_geo: [{ name: "Illinois" }, { name: "United States of America" }],
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.actorId).toBe("US CHI");
    expect(rows[0]?.geographicPath).toEqual(["Illinois", "United States of America"]);
  });
});

describe("normalizeActorOverview", () => {
  it("extracts targets, population, and preferred benchmark", () => {
    const enrichment = normalizeActorOverview(
      {
        success: true,
        data: {
          actor_id: "US CHI",
          name: "Chicago",
          type: "city",
          area: 606,
          has_data: true,
          population: [{ population: 2_746_388, year: 2020 }],
          targets: [
            {
              target_type: "Absolute emission reduction",
              target_year: 2040,
              target_value: "62",
              baseline_year: 2005,
            },
          ],
        },
      },
      ["Chicago", "Illinois", "United States of America"],
      {
        success: true,
        data: {
          "CDP_citywide_emissions:2019": {
            datasource_id: "CDP_citywide_emissions:2019",
            name: "2019 - City-wide Emissions",
            publisher: "CDP",
            URL: "https://example.com",
            data: [{ year: 2019, total_emissions: 31_550_781 }],
          },
        },
      },
    );

    expect(enrichment?.actorId).toBe("US CHI");
    expect(enrichment?.population?.population).toBe(2_746_388);
    expect(enrichment?.targets[0]?.targetValue).toBe(62);
    expect(enrichment?.benchmarkEmissions?.totalEmissions).toBe(31_550_781);
  });
});
