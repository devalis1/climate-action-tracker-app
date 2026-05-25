import { describe, expect, it } from "vitest";

import {
  deriveCitySlugFromName,
  isValidCitySlug,
  normalizeCitySlugInput,
} from "@/lib/city-slug";

describe("city slug helpers", () => {
  it("derives slugs from display names", () => {
    expect(deriveCitySlugFromName("  Austin  ")).toBe("austin");
    expect(deriveCitySlugFromName("San Diego")).toBe("san-diego");
    expect(deriveCitySlugFromName("Portland   OR")).toBe("portland-or");
  });

  it("normalizes slug input", () => {
    expect(normalizeCitySlugInput("  Austin-TX  ")).toBe("austin-tx");
  });

  it("validates slug pattern", () => {
    expect(isValidCitySlug("austin")).toBe(true);
    expect(isValidCitySlug("san-diego")).toBe(true);
    expect(isValidCitySlug("Austin")).toBe(true);
    expect(isValidCitySlug("")).toBe(false);
    expect(isValidCitySlug("austin_tx")).toBe(false);
    expect(isValidCitySlug("-austin")).toBe(false);
  });
});
