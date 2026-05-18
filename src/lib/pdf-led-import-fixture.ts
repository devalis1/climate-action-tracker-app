import { climateActionSchema, type ClimateAction } from "@/lib/schemas";

/**
 * Verbatim assessment copy from `docs/OEF AI-Native Software Engineer Exercise.pdf`
 * (“Example Free Text for Import” — LED street lighting), normalized whitespace.
 */
export const PDF_LED_STREET_LIGHTING_PARAGRAPH =
  "The city council approved a $2M investment to convert all street lighting to LED by " +
  "2027. The energy department estimates this will cut approximately 9,500 tons of CO2 per " +
  "year once fully deployed. The project is currently in the planning phase.";

/** Expected structured output documented beside the PDF example (Sprint 3 golden object). */
export const PDF_LED_STREET_LIGHTING_EXPECTED_ACTION: ClimateAction =
  climateActionSchema.parse({
    title: "LED street lighting conversion",
    sector: "energy",
    annualReduction: 9500,
    status: "planned",
    startYear: 2027,
  });
