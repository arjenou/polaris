import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/posts";
import { getAllRecommendedSlugs } from "@/lib/recommended";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const jaPaths = [
  "",
  "/business-headquarters",
  "/assets-management",
  "/business-headquarters-2",
  "/entrepreneurship-support",
  "/monthly-magazine",
  "/enterprise-intelligence",
  "/contact",
  "/news",
  "/recommended",
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jaSlugs, zhSlugs, jaRecommendedSlugs, zhRecommendedSlugs] = await Promise.all([
    getAllSlugs("ja"),
    getAllSlugs("zh"),
    getAllRecommendedSlugs("ja"),
    getAllRecommendedSlugs("zh"),
  ]);
  const jaNewsPaths = jaSlugs.map((slug) => `/news/${slug}`);
  const zhNewsPaths = zhSlugs.map((slug) => `/zh/news/${slug}`);
  const jaRecommendedPaths = jaRecommendedSlugs.map((slug) => `/recommended/${slug}`);
  const zhRecommendedPaths = zhRecommendedSlugs.map((slug) => `/zh/recommended/${slug}`);

  const allPaths = [
    ...jaPaths,
    ...jaNewsPaths,
    ...jaRecommendedPaths,
    ...zhPaths,
    ...zhNewsPaths,
    ...zhRecommendedPaths,
  ];

  return allPaths.map((pathname) => ({
    url: `${SITE_URL}${pathname}`,
    lastModified: new Date(),
    changeFrequency: pathname.includes("/news/") || pathname.includes("/recommended/") ? "monthly" : "weekly",
    priority: pathname === "" || pathname === "/zh" ? 1 : 0.7,
  }));
}
