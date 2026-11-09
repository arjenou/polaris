import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type RevalidateKind =
  | "news"
  | "recommended"
  | "team"
  | "events"
  | "gallery"
  | "advantages"
  | "group-companies"
  | "contact"
  | "home-hero"
  | "maintenance-page";

/** Pages (besides the content type's own list/detail pages) that render a
 * card fed by the CMS, and therefore also need revalidating on every change. */
const PAGES_WITH_CARD: Record<RevalidateKind, { ja: string[]; zh: string[] }> = {
  news: {
    ja: ["/jp", "/jp/assets-management", "/jp/business-headquarters", "/jp/business-headquarters-2"],
    zh: ["/zh", "/zh/assets-management", "/zh/business-headquarters", "/zh/business-headquarters-2"],
  },
  recommended: {
    ja: ["/jp"],
    zh: ["/zh"],
  },
  // "team" has no dedicated list/detail page — it only ever appears in the
  // homepage carousel.
  team: {
    ja: ["/jp"],
    zh: ["/zh"],
  },
  events: {
    ja: ["/jp"],
    zh: ["/zh"],
  },
  // "gallery" and "advantages" are handled separately below via
  // PAGE_KEY_PATHS (keyed by pageKey, not locale) — these entries only exist
  // to satisfy the Record type.
  gallery: {
    ja: [],
    zh: [],
  },
  advantages: {
    ja: [],
    zh: [],
  },
  // "group-companies" has no dedicated list/detail page — it only ever
  // appears on グループ情報 (enterprise-intelligence).
  "group-companies": {
    ja: ["/jp/enterprise-intelligence"],
    zh: ["/zh/enterprise-intelligence"],
  },
  // "contact" is handled directly below (fixed /jp/contact + /zh/contact
  // paths, shared across locales like "gallery") — this entry only exists
  // to satisfy the Record type.
  contact: {
    ja: [],
    zh: [],
  },
  // "home-hero" is handled directly below (fixed /jp + /zh paths) — this
  // entry only exists to satisfy the Record type.
  "home-hero": {
    ja: [],
    zh: [],
  },
  // "maintenance-page" is handled directly below.
  "maintenance-page": {
    ja: [],
    zh: [],
  },
};

const BASE_PATH: Partial<Record<RevalidateKind, { ja: string; zh: string }>> = {
  news: { ja: "/jp/news", zh: "/zh/news" },
  recommended: { ja: "/jp/recommended", zh: "/zh/recommended" },
  events: { ja: "/jp/events", zh: "/zh/events" },
};

/** The three fixed pages managed by "gallery" and "advantages" content
 * (不動産取引 / リノベーション / 不動産管理). */
const PAGE_KEY_PATHS: Record<string, { ja: string; zh: string }> = {
  "real-estate": { ja: "/jp/business-headquarters", zh: "/zh/business-headquarters" },
  renovation: { ja: "/jp/business-headquarters-2", zh: "/zh/business-headquarters-2" },
  "asset-management": { ja: "/jp/assets-management", zh: "/zh/assets-management" },
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

  let body: { kind?: RevalidateKind; locale?: "ja" | "zh"; slug?: string; pageKey?: string } = {};
  try {
    body = await request.json();
  } catch {
    // no body — fall back to revalidating both news lists below
  }

  const kind: RevalidateKind =
    body.kind === "recommended"
      ? "recommended"
      : body.kind === "team"
        ? "team"
        : body.kind === "events"
          ? "events"
          : body.kind === "gallery"
            ? "gallery"
            : body.kind === "advantages"
              ? "advantages"
              : body.kind === "group-companies"
                ? "group-companies"
                : body.kind === "contact"
                  ? "contact"
                  : body.kind === "home-hero"
                    ? "home-hero"
                    : body.kind === "maintenance-page"
                      ? "maintenance-page"
                      : "news";

  if (kind === "contact") {
    const paths = ["/jp/contact", "/zh/contact"];
    for (const path of paths) revalidatePath(path);
    return NextResponse.json({ revalidated: true, paths });
  }

  // Headline text differs per locale but slides are shared, so simplest to
  // always revalidate both homepage paths together on any hero change.
  if (kind === "home-hero") {
    const paths = ["/jp", "/zh"];
    for (const path of paths) revalidatePath(path);
    return NextResponse.json({ revalidated: true, paths });
  }

  if (kind === "maintenance-page") {
    const paths = [
      "/jp/monthly-magazine",
      "/jp/entrepreneurship-support",
      "/zh/monthly-magazine",
      "/zh/entrepreneurship-support",
    ];
    for (const path of paths) revalidatePath(path);
    return NextResponse.json({ revalidated: true, paths });
  }

  if (kind === "gallery" || kind === "advantages") {
    const pagePaths = body.pageKey ? PAGE_KEY_PATHS[body.pageKey] : undefined;
    // Gallery images are shared across ja/zh, so both language pages are
    // always revalidated together. Advantages text differs per locale, so
    // only the affected locale's page is revalidated.
    const paths = pagePaths
      ? kind === "gallery"
        ? [pagePaths.ja, pagePaths.zh]
        : [pagePaths[body.locale === "zh" ? "zh" : "ja"]]
      : [];
    for (const path of paths) revalidatePath(path);
    return NextResponse.json({ revalidated: true, paths });
  }

  const { locale, slug } = body;
  const locales = locale === "ja" || locale === "zh" ? [locale] : (["ja", "zh"] as const);

  const paths = new Set<string>();
  for (const l of locales) {
    const prefix = BASE_PATH[kind]?.[l];
    if (prefix) {
      paths.add(prefix);
      if (slug) paths.add(`${prefix}/${slug}`);
    }
    for (const page of PAGES_WITH_CARD[kind][l]) {
      paths.add(page);
    }
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths: [...paths] });
}
