import { describe, expect, it } from "vitest";

import {
  ADMIN_CITY_ID_COOKIE,
  citySlugPublicPaths,
  parseAdminCityIdCookie,
  pickAdminCityId,
} from "./admin-city-context";

describe("admin-city-context", () => {
  it("exports a stable cookie name", () => {
    expect(ADMIN_CITY_ID_COOKIE).toBe("admin_city_id");
  });

  it("parseAdminCityIdCookie accepts positive integers only", () => {
    expect(parseAdminCityIdCookie(undefined)).toBeNull();
    expect(parseAdminCityIdCookie("")).toBeNull();
    expect(parseAdminCityIdCookie("abc")).toBeNull();
    expect(parseAdminCityIdCookie("0")).toBeNull();
    expect(parseAdminCityIdCookie("-3")).toBeNull();
    expect(parseAdminCityIdCookie("  42 ")).toBe(42);
    expect(parseAdminCityIdCookie("7")).toBe(7);
  });

  it("pickAdminCityId prefers a valid cookie id", () => {
    const ids = new Set([1, 2, 3]);
    expect(pickAdminCityId(1, 2, ids)).toBe(2);
  });

  it("pickAdminCityId falls back to default when cookie is invalid", () => {
    const ids = new Set([10, 20]);
    expect(pickAdminCityId(20, 999, ids)).toBe(20);
    expect(pickAdminCityId(20, null, ids)).toBe(20);
  });

  it("pickAdminCityId uses smallest id when default is missing", () => {
    const ids = new Set([8, 3, 12]);
    expect(pickAdminCityId(99, null, ids)).toBe(3);
  });

  it("pickAdminCityId throws when no cities exist", () => {
    expect(() => pickAdminCityId(1, null, new Set())).toThrow(
      /No cities in database/,
    );
  });

  it("citySlugPublicPaths normalizes slugs into routes", () => {
    expect(citySlugPublicPaths([" Greenville ", "RiverSide", ""])).toEqual([
      "/city/greenville",
      "/city/riverside",
    ]);
  });
});
