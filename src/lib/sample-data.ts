import { cityProfileSchema } from "@/lib/schemas";

export const greenvilleProfile = cityProfileSchema.parse({
  city: "Greenville",
  baselineEmissions: 500000,
  targetYear: 2035,
  actions: [
    {
      title: "Expand bike lane network",
      sector: "transport",
      annualReduction: 12000,
      status: "in progress",
      startYear: 2024
    },
    {
      title: "Solar panel incentive program",
      sector: "energy",
      annualReduction: 45000,
      status: "in progress",
      startYear: 2023
    },
    {
      title: "Municipal building retrofits",
      sector: "buildings",
      annualReduction: 18000,
      status: "planned",
      startYear: 2026
    },
    {
      title: "Organic waste composting program",
      sector: "waste",
      annualReduction: 8000,
      status: "completed",
      startYear: 2022
    },
    {
      title: "Urban reforestation initiative",
      sector: "land use",
      annualReduction: 15000,
      status: "planned",
      startYear: 2025
    },
    {
      title: "EV fleet transition for public transit",
      sector: "transport",
      annualReduction: 30000,
      status: "planned",
      startYear: 2026
    }
  ]
});
