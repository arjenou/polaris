import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NewsListPage from "@/components/news/NewsListPage";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "资讯列表 | Polaris Group",
};

export default function Page() {
  const posts = getAllPosts("zh");

  return (
    <PageShell locale="zh">
      <NewsListPage
        posts={posts}
        basePath="/zh/news"
        labels={{
          heroTitle: "资讯列表",
          empty: "暂无相关资讯。",
        }}
      />
    </PageShell>
  );
}
