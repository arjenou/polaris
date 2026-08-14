import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NewsListPage from "@/components/news/NewsListPage";
import { getAllRecommendedPosts } from "@/lib/recommended";

export const metadata: Metadata = {
  title: "おすすめ情報一覧 | ポラリス・グループ",
};

export default async function Page() {
  const posts = await getAllRecommendedPosts("ja");

  return (
    <PageShell locale="ja">
      <NewsListPage
        posts={posts}
        basePath="/recommended"
        labels={{
          heroTitle: "おすすめ情報一覧",
          empty: "現在おすすめ情報はありません。",
        }}
      />
    </PageShell>
  );
}
