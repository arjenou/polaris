import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NewsListPage from "@/components/news/NewsListPage";
import { getAllRecommendedPosts } from "@/lib/recommended";

export const metadata: Metadata = {
  title: "推荐信息列表 | Polaris Group",
};

export default async function Page() {
  const posts = await getAllRecommendedPosts("zh");

  return (
    <PageShell locale="zh">
      <NewsListPage
        posts={posts}
        basePath="/zh/recommended"
        labels={{
          heroTitle: "推荐信息列表",
          empty: "暂无推荐信息。",
        }}
      />
    </PageShell>
  );
}
