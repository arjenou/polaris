import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/posts";
import { getAllRecommendedSlugs } from "@/lib/recommended";
import { getAllEventSlugs } from "@/lib/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const jaPaths = [
  "/jp",
  "/jp/business-headquarters",
  "/jp/assets-management",
  "/jp/business-headquarters-2",
  "/jp/entrepreneurship-support",
  "/jp/monthly-magazine",
  "/jp/enterprise-intelligence",
  "/jp/contact",
  "/jp/news",
  "/jp/recommended",
  "/jp/events",
];

const zhPaths = [
  "/zh",
  "/zh/business-headquarters",
  "/zh/assets-management",
  "/zh/business-headquarters-2",
  "/zh/entrepreneurship-support",
  "/zh/monthly-magazine",
  "/zh/enterprise-intelligence",
  "/zh/contact",
  "/zh/news",
  "/zh/recommended",
  "/zh/events",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jaSlugs, zhSlugs, jaRecommendedSlugs, zhRecommendedSlugs, jaEventSlugs, zhEventSlugs] = await Promise.all([
    getAllSlugs("ja"),
    getAllSlugs("zh"),
    getAllRecommendedSlugs("ja"),
    getAllRecommendedSlugs("zh"),
    getAllEventSlugs("ja"),
    getAllEventSlugs("zh"),
  ]);
  const jaNewsPaths = jaSlugs.map((slug) => `/jp/news/${slug}`);
  const zhNewsPaths = zhSlugs.map((slug) => `/zh/news/${slug}`);
  const jaRecommendedPaths = jaRecommendedSlugs.map((slug) => `/jp/recommended/${slug}`);
  const zhRecommendedPaths = zhRecommendedSlugs.map((slug) => `/zh/recommended/${slug}`);
  const jaEventPaths = jaEventSlugs.map((slug) => `/jp/events/${slug}`);
  const zhEventPaths = zhEventSlugs.map((slug) => `/zh/events/${slug}`);

  const allPaths = [
    ...jaPaths,
    ...jaNewsPaths,
    ...jaRecommendedPaths,
    ...jaEventPaths,
    ...zhPaths,
    ...zhNewsPaths,
    ...zhRecommendedPaths,
    ...zhEventPaths,
  ];

  return allPaths.map((pathname) => ({
    url: `${SITE_URL}${pathname}`,
    lastModified: new Date(),
    changeFrequency:
      pathname.includes("/news/") || pathname.includes("/recommended/") || pathname.includes("/events/")
        ? "monthly"
        : "weekly",
    priority: pathname === "/jp" || pathname === "/zh" ? 1 : 0.7,
  }));
}
