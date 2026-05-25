import { describe, expect, it } from "vitest";

import {
  DEFAULT_PUBLIC_CITY_SLUG,
  publicCityPath,
  resolveDefaultPublicCitySlug,
  slugFromPublicCityPath,
} from "@/lib/public-default-city";

describe("public-default-city", () => {
  it("prefers greenville when present", () => {
    expect(
      resolveDefaultPublicCitySlug([
        { slug: "riverside" },
        { slug: DEFAULT_PUBLIC_CITY_SLUG },
      ]),
    ).toBe("greenville");
  });

  it("falls back to first city", () => {
    expect(resolveDefaultPublicCitySlug([{ slug: "riverside" }])).toBe("riverside");
  });

  it("builds encoded city paths", () => {
    expect(publicCityPath("greenville")).toBe("/city/greenville");
  });

  it("parses slug from pathname", () => {
    expect(slugFromPublicCityPath("/city/riverside")).toBe("riverside");
    expect(slugFromPublicCityPath("/admin")).toBeNull();
  });
});
