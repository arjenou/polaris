import type { NextConfig } from "next";

// The CMS admin panel is a separate app hosted on Cloudflare Pages (see /cms).
// It's proxied here so editors can reach it at /admin on the public domain
// instead of needing a separate subdomain.
const CMS_ORIGIN = "https://polaris.api.yingmu-tech.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/admin", destination: `${CMS_ORIGIN}/admin` },
      { source: "/admin/:path*", destination: `${CMS_ORIGIN}/admin/:path*` },
      { source: "/api/auth/:path*", destination: `${CMS_ORIGIN}/api/auth/:path*` },
      { source: "/api/admin/:path*", destination: `${CMS_ORIGIN}/api/admin/:path*` },
    ];
  },
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
