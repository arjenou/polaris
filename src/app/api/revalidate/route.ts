import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** Pages (besides /news and /news/[slug]) that render a "latest news" card
 * fed by the CMS, and therefore also need revalidating on every news change. */
const JA_PAGES_WITH_NEWS_CARD = ["/", "/assets-management", "/business-headquarters", "/business-headquarters-2"];
const ZH_PAGES_WITH_NEWS_CARD = [
  "/zh",
  "/zh/assets-management",
  "/zh/business-headquarters",
  "/zh/business-headquarters-2",
];

/**
 * On-demand ISR revalidation, called by the CMS (see cms/functions/_lib/revalidate.ts)
 * right after a news post is created/updated/deleted, so edits show up on the
 * public site immediately instead of waiting for the 5-minute timed revalidation.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { locale?: "ja" | "zh"; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // no body — fall back to revalidating both news lists below
  }

  const { locale, slug } = body;
  const locales = locale === "ja" || locale === "zh" ? [locale] : (["ja", "zh"] as const);

  const paths = new Set<string>();
  for (const l of locales) {
    const prefix = l === "zh" ? "/zh/news" : "/news";
    paths.add(prefix);
    if (slug) paths.add(`${prefix}/${slug}`);
    for (const page of l === "zh" ? ZH_PAGES_WITH_NEWS_CARD : JA_PAGES_WITH_NEWS_CARD) {
      paths.add(page);
    }
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths: [...paths] });
}
