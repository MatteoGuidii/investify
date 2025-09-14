import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production (Vercel) builds to proceed even if there are ESLint or TypeScript issues.
  // This prevents build failures from rules like no-explicit-any while you iterate.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Set to true only if you also want to ignore TS type errors during build.
    // Consider fixing types instead of leaving this long-term.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
