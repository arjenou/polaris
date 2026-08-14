import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import NewsDetailPage from "@/components/news/NewsDetailPage";
import { getAllRecommendedSlugs, getRecommendedPostBySlug } from "@/lib/recommended";

export async function generateStaticParams() {
  const slugs = await getAllRecommendedSlugs("ja");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getRecommendedPostBySlug("ja", slug);
  return {
    title: post ? `${post.title} | ポラリス・グループ` : "おすすめ情報 | ポラリス・グループ",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getRecommendedPostBySlug("ja", slug);
  if (!post) notFound();

  return (
    <PageShell locale="ja">
      <NewsDetailPage post={post} basePath="/recommended" labels={{ backLabel: "← おすすめ情報一覧に戻る" }} />
    </PageShell>
  );
}
