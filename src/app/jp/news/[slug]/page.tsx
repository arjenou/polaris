import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import NewsDetailPage from "@/components/news/NewsDetailPage";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("ja");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug("ja", slug);
  return {
    title: post ? `${post.title} | ポラリス・グループ` : "お知らせ | ポラリス・グループ",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug("ja", slug);
  if (!post) notFound();

  // Prefer the translation linked in the CMS; otherwise fall back to the same
  // slug in the other locale when it exists (legacy content shares slugs).
  const otherSlug = post.translationSlug ?? ((await getPostBySlug("zh", slug)) ? slug : null);
  const alternateHref = otherSlug ? `/zh/news/${otherSlug}` : undefined;

  return (
    <PageShell
      locale="ja"
      alternateHref={alternateHref}
    >
      <NewsDetailPage post={post} basePath="/jp/news" labels={{ backLabel: "← お知らせ一覧に戻る" }} />
    </PageShell>
  );
}
