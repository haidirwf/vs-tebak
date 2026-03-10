import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  onDemandEntries: {
    // Keep fewer pages in memory during dev to reduce RAM spikes.
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
