import type { NextConfig } from "next";

// The CMS admin panel is a separate app hosted on Cloudflare Pages (see /cms).
// It's proxied here so editors can reach it at /admin on the public domain
// instead of needing a separate subdomain.
const CMS_ORIGIN = "https://polaris.api.yingmu-tech.com";

// Japanese pages live under /jp (Chinese under /zh). These are the pre-/jp
// Japanese URLs, kept alive as redirects so existing links, bookmarks and
// search results keep working.
const LEGACY_JA_SECTIONS = [
  "news",
  "events",
  "recommended",
  "business-headquarters",
  "business-headquarters-2",
  "assets-management",
  "entrepreneurship-support",
  "monthly-magazine",
  "enterprise-intelligence",
  "contact",
  "move-out-request",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Root has no content of its own; temporary so it can later become
      // language-aware (e.g. by Accept-Language) without cached redirects.
      { source: "/", destination: "/jp", permanent: false },
      ...LEGACY_JA_SECTIONS.map((section) => ({
        source: `/${section}/:path*`,
        destination: `/jp/${section}/:path*`,
        permanent: true,
      })),
    ];
  },
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
