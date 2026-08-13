import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths: [...paths] });
}
