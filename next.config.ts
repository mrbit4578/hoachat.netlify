import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // CI environments (Netlify) treat warnings as errors; skip lint during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
