import type { Post, PostLocale, PostSummary } from "./posts";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
// Independent content type from news, but with the identical shape, so the
// types/behavior below intentionally mirror lib/posts.ts.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

/** "おすすめ情報" lists/detail pages are revalidated periodically so edits made
 * in the CMS admin show up without a full redeploy of the Vercel site. */
const REVALIDATE_SECONDS = 300;

export async function getAllRecommendedPosts(locale: PostLocale): Promise<PostSummary[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/recommended?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAllRecommendedSlugs(locale: PostLocale): Promise<string[]> {
  const posts = await getAllRecommendedPosts(locale);
  return posts.map((post) => post.slug);
}

export interface RecommendedCardItem {
  tag: string;
  title: string;
  excerpt: string;
  image: string | null;
  href: string;
}

/** Used by the homepage "おすすめ情報" card grid. */
export async function getLatestRecommendedItems(locale: PostLocale, limit = 3): Promise<RecommendedCardItem[]> {
  const posts = await getAllRecommendedPosts(locale);
  const basePath = locale === "zh" ? "/zh/recommended" : "/recommended";

  return posts.slice(0, limit).map((post) => ({
    tag: post.tag,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    href: `${basePath}/${post.slug}`,
  }));
}

export async function getRecommendedPostBySlug(locale: PostLocale, slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/recommended?locale=${locale}&slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const post = await res.json();

    // `content` is authored as sanitized HTML by the CMS's rich text editor
    // (see /cms), so it can be rendered directly without markdown parsing.
    return {
      ...post,
      contentHtml: post.content,
    };
  } catch {
    return null;
  }
}
