import { describe, expect, it } from "vitest";

import {
  adminActionsQueryString,
  parseAdminActionsListParams,
} from "@/lib/admin-list-params";

describe("parseAdminActionsListParams", () => {
  it("defaults page, sort, and direction", () => {
    expect(parseAdminActionsListParams({})).toEqual({
      page: 1,
      sort: "startYear",
      direction: "desc",
      sector: undefined,
      status: undefined,
    });
  });

  it("parses filters and pagination", () => {
    expect(
      parseAdminActionsListParams({
        page: "2",
        sort: "title",
        direction: "asc",
        sector: "energy",
        status: "planned",
      }),
    ).toEqual({
      page: 2,
      sort: "title",
      direction: "asc",
      sector: "energy",
      status: "planned",
    });
  });

  it("builds query strings without default params", () => {
    expect(
      adminActionsQueryString({
        page: 2,
        sort: "title",
        direction: "asc",
        sector: "energy",
      }),
    ).toBe("?page=2&sort=title&direction=asc&sector=energy");
  });
});
