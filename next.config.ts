import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    browserDebugInfoInTerminal: true,
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
