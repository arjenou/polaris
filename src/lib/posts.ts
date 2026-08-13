import { remark } from "remark";
import remarkHtml from "remark-html";

export type PostLocale = "ja" | "zh";

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  image: string | null;
}

export interface Post extends PostSummary {
  content: string;
  contentHtml: string;
  imageWidth: number;
  imageHeight: number;
}

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

/** News lists/detail pages are revalidated periodically so edits made in the
 * CMS admin show up without a full redeploy of the Vercel site. */
const REVALIDATE_SECONDS = 300;

export async function getAllPosts(locale: PostLocale): Promise<PostSummary[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/news?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAllSlugs(locale: PostLocale): Promise<string[]> {
  const posts = await getAllPosts(locale);
  return posts.map((post) => post.slug);
}

export async function getPostBySlug(locale: PostLocale, slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/news?locale=${locale}&slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const post = await res.json();
    const processed = remark().use(remarkHtml).processSync(post.content);

    return {
      ...post,
      contentHtml: processed.toString(),
    };
  } catch {
    return null;
  }
}
