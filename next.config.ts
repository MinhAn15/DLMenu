import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@dilinh/types', '@dilinh/validation'],
};

export default nextConfig;
