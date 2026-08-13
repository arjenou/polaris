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

  return (
    <PageShell locale="ja">
      <NewsDetailPage post={post} basePath="/news" labels={{ backLabel: "← お知らせ一覧に戻る" }} />
    </PageShell>
  );
}
