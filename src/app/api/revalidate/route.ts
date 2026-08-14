import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** Pages (besides the content type's own list/detail pages) that render a
 * card fed by the CMS, and therefore also need revalidating on every change. */
const PAGES_WITH_CARD: Record<"news" | "recommended", { ja: string[]; zh: string[] }> = {
  news: {
    ja: ["/", "/assets-management", "/business-headquarters", "/business-headquarters-2"],
    zh: ["/zh", "/zh/assets-management", "/zh/business-headquarters", "/zh/business-headquarters-2"],
  },
  recommended: {
    ja: ["/"],
    zh: ["/zh"],
  },
};

const BASE_PATH: Record<"news" | "recommended", { ja: string; zh: string }> = {
  news: { ja: "/news", zh: "/zh/news" },
  recommended: { ja: "/recommended", zh: "/zh/recommended" },
};

/**
 * On-demand ISR revalidation, called by the CMS (see cms/functions/_lib/revalidate.ts)
 * right after a post is created/updated/deleted, so edits show up on the
 * public site immediately instead of waiting for the 5-minute timed revalidation.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { kind?: "news" | "recommended"; locale?: "ja" | "zh"; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // no body — fall back to revalidating both news lists below
  }

  const kind = body.kind === "recommended" ? "recommended" : "news";
  const { locale, slug } = body;
  const locales = locale === "ja" || locale === "zh" ? [locale] : (["ja", "zh"] as const);

  const paths = new Set<string>();
  for (const l of locales) {
    const prefix = BASE_PATH[kind][l];
    paths.add(prefix);
    if (slug) paths.add(`${prefix}/${slug}`);
    for (const page of PAGES_WITH_CARD[kind][l]) {
      paths.add(page);
    }
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths: [...paths] });
}
