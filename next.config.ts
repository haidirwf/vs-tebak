import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  onDemandEntries: {
    maxInactiveAge: 300 * 1000,
    pagesBufferLength: 10,
  },
  async rewrites() {
    return [
      { source: '/signup', destination: '/register' },
    ];
  },
};

export default nextConfig;
