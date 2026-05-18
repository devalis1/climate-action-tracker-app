import { describe, expect, it } from "vitest";

import {
  PDF_LED_STREET_LIGHTING_EXPECTED_ACTION,
  PDF_LED_STREET_LIGHTING_PARAGRAPH,
} from "./pdf-led-import-fixture";
import { climateActionSchema } from "./schemas";

describe("PDF LED import golden fixture", () => {
  it("keeps paragraph text aligned with assessment PDF wording", () => {
    expect(PDF_LED_STREET_LIGHTING_PARAGRAPH).toContain(
      "convert all street lighting to LED",
    );
    expect(PDF_LED_STREET_LIGHTING_PARAGRAPH).toContain("9,500");
  });

  it("parses golden object through climateActionSchema", () => {
    const parsed = climateActionSchema.parse(PDF_LED_STREET_LIGHTING_EXPECTED_ACTION);
    expect(parsed).toEqual(PDF_LED_STREET_LIGHTING_EXPECTED_ACTION);
  });

  it("documents PDF-expected numeric and enum fields", () => {
    expect(PDF_LED_STREET_LIGHTING_EXPECTED_ACTION).toMatchObject({
      annualReduction: 9500,
      sector: "energy",
      status: "planned",
      startYear: 2027,
    });
  });
});
