import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // News images are served by the Polaris CMS (Cloudflare Pages + R2). See /cms.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "polaris.api.yingmu-tech.com",
        pathname: "/media/**",
      },
      {
        // Fallback while the custom domain is still being provisioned.
        protocol: "https",
        hostname: "*.pages.dev",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
