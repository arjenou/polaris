import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const post = await getPostBySlug("zh", slug);
  return {
    title: post ? `${post.title} | Polaris Group` : "资讯 | Polaris Group",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug("zh", slug);
  if (!post) notFound();

  return (
    <PageShell locale="zh">
      <NewsDetailPage post={post} basePath="/zh/news" labels={{ backLabel: "← 返回资讯列表" }} />
    </PageShell>
  );
}
