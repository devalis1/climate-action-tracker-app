import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.ts",
        "**/*.integration.test.ts",
        "**/*.d.ts",
        // Presentation-only surfaces; keep coverage focused on exercised `lib/` + API handlers.
        "src/components/**",
        "src/app/page.tsx",
        "src/app/layout.tsx",
        "src/app/admin/page.tsx",
        "src/app/admin/actions.ts",
        "src/app/city/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(repoRoot, "./src"),
    },
  },
});
