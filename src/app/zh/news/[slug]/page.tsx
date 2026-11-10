import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageFallbackNotice from "@/components/layout/LanguageFallbackNotice";
import PageShell from "@/components/layout/PageShell";
import NewsDetailPage from "@/components/news/NewsDetailPage";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("zh");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const own = await getPostBySlug("zh", slug);
  const post = own ?? (await getPostBySlug("ja", slug));
  return {
    title: post ? `${post.title} | Polaris Group` : "资讯 | Polaris Group",
    // The other language's original stands in when there is no translation;
    // keep that duplicate out of search results.
    robots: own ? undefined : { index: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const own = await getPostBySlug("zh", slug);
  // No Chinese version: show the Japanese original instead of a 404, so the
  // language switch always stays on the same article.
  const post = own ?? (await getPostBySlug("ja", slug));
  if (!post) notFound();

  // Link to the translation linked in the CMS, else to the same slug in the
  // other locale (which itself falls back to this article if it has none).
  const alternateHref = `/jp/news/${own ? (post.translationSlug ?? slug) : slug}`;

  return (
    <PageShell
      locale="zh"
      alternateHref={alternateHref}
    >
      {!own && <LanguageFallbackNotice locale="zh" />}
      <NewsDetailPage post={post} basePath="/zh/news" labels={{ backLabel: "← 返回资讯列表" }} />
    </PageShell>
  );
}
