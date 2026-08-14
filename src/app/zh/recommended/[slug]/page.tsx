import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const post = await getRecommendedPostBySlug("zh", slug);
  return {
    title: post ? `${post.title} | Polaris Group` : "推荐信息 | Polaris Group",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getRecommendedPostBySlug("zh", slug);
  if (!post) notFound();

  return (
    <PageShell locale="zh">
      <NewsDetailPage post={post} basePath="/zh/recommended" labels={{ backLabel: "← 返回推荐信息列表" }} />
    </PageShell>
  );
}
