import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  /**
   * Next 16 streams metadata behind an internal suspense/hidden-wrapper tree; in dev we’ve seen SSR vs
   * first client render disagree on those wrapper attrs. Treat all UAs like “blocking metadata” bots so
   * metadata is served consistently (fewer hydration warnings). See streaming-metadata UA logic in Next.
   */
  htmlLimitedBots: /.*/,
};

export default nextConfig;
