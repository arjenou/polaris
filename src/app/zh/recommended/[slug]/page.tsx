import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageFallbackNotice from "@/components/layout/LanguageFallbackNotice";
import PageShell from "@/components/layout/PageShell";
import NewsDetailPage from "@/components/news/NewsDetailPage";
import { getAllRecommendedSlugs, getRecommendedPostBySlug } from "@/lib/recommended";

export async function generateStaticParams() {
  const slugs = await getAllRecommendedSlugs("zh");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const own = await getRecommendedPostBySlug("zh", slug);
  const post = own ?? (await getRecommendedPostBySlug("ja", slug));
  return {
    title: post ? `${post.title} | Polaris Group` : "推荐信息 | Polaris Group",
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
  const own = await getRecommendedPostBySlug("zh", slug);
  // No Chinese version: show the Japanese original instead of a 404, so the
  // language switch always stays on the same article.
  const post = own ?? (await getRecommendedPostBySlug("ja", slug));
  if (!post) notFound();

  // Link to the translation linked in the CMS, else to the same slug in the
  // other locale (which itself falls back to this article if it has none).
  const alternateHref = `/jp/recommended/${own ? (post.translationSlug ?? slug) : slug}`;

  return (
    <PageShell
      locale="zh"
      alternateHref={alternateHref}
    >
      {!own && <LanguageFallbackNotice locale="zh" />}
      <NewsDetailPage post={post} basePath="/zh/recommended" labels={{ backLabel: "← 返回推荐信息列表" }} />
    </PageShell>
  );
}
