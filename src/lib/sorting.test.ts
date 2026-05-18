import { describe, expect, it } from "vitest";

import {
  type ClimateActionSortKey,
  type SortDirection,
  climateActionsOrderBySql,
} from "./sorting";

const keys: ClimateActionSortKey[] = [
  "startYear",
  "title",
  "sector",
  "status",
  "annualReduction",
];
const dirs: SortDirection[] = ["asc", "desc"];

describe("climateActionsOrderBySql", () => {
  it("matches fixed whitelist snapshots for every SortKey × direction", () => {
    const snapshot: Record<string, string> = {};
    for (const k of keys) {
      for (const d of dirs) {
        snapshot[`${k}_${d}`] = climateActionsOrderBySql(k, d);
      }
    }
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "annualReduction_asc": "annual_reduction_tons_per_year ASC, id ASC",
        "annualReduction_desc": "annual_reduction_tons_per_year DESC, id DESC",
        "sector_asc": "sector ASC, id ASC",
        "sector_desc": "sector DESC, id DESC",
        "startYear_asc": "start_year ASC, id ASC",
        "startYear_desc": "start_year DESC, id DESC",
        "status_asc": "status ASC, id ASC",
        "status_desc": "status DESC, id DESC",
        "title_asc": "title ASC, id ASC",
        "title_desc": "title DESC, id DESC",
      }
    `);
  });

  it("does not interpolate untrusted input (API is keyed)", () => {
    const sql = climateActionsOrderBySql("sector", "asc");
    expect(sql).not.toMatch(/;/);
    expect(sql.toLowerCase()).not.toContain("drop");
  });
});
