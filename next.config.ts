import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  onDemandEntries: {
    maxInactiveAge: 300 * 1000,
    pagesBufferLength: 10,
  },
  async redirects() {
    return [
      { source: '/voucher', destination: '/shop?tab=vouchers', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/signup', destination: '/register' },
    ];
  },
};

export default nextConfig;
