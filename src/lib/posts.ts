import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { imageSize } from "image-size";

export type PostLocale = "ja" | "zh";

export interface PostFrontmatter {
  title: string;
  date: string;
  tag: string;
  image: string;
  excerpt: string;
}

export interface PostSummary extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostSummary {
  contentHtml: string;
  imageWidth: number;
  imageHeight: number;
}

const postsDirectory = path.join(process.cwd(), "content", "posts");
const publicDirectory = path.join(process.cwd(), "public");

/** Reads the real pixel dimensions of a `public/`-relative image path so the
 * detail page can render it at its native aspect ratio instead of cropping. */
function getImageDimensions(imagePath: string): { width: number; height: number } {
  const fallback = { width: 1200, height: 800 };
  try {
    const fullPath = path.join(publicDirectory, imagePath);
    const buffer = fs.readFileSync(fullPath);
    const { width, height } = imageSize(buffer);
    return width && height ? { width, height } : fallback;
  } catch {
    return fallback;
  }
}

function localeDir(locale: PostLocale) {
  return path.join(postsDirectory, locale);
}

export function getAllSlugs(locale: PostLocale): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllPosts(locale: PostLocale): PostSummary[] {
  const slugs = getAllSlugs(locale);
  const posts = slugs.map((slug) => {
    const fullPath = path.join(localeDir(locale), `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return { slug, ...(data as PostFrontmatter) };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(locale: PostLocale, slug: string): Post | null {
  const fullPath = path.join(localeDir(locale), `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processed = remark().use(remarkHtml).processSync(content);
  const frontmatter = data as PostFrontmatter;
  const { width, height } = getImageDimensions(frontmatter.image);

  return {
    slug,
    ...frontmatter,
    contentHtml: processed.toString(),
    imageWidth: width,
    imageHeight: height,
  };
}
