import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import NewsListPage from "@/components/news/NewsListPage";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "お知らせ一覧 | ポラリス・グループ",
};

export default async function Page() {
  const posts = await getAllPosts("ja");

  return (
    <PageShell locale="ja">
      <NewsListPage
        posts={posts}
        basePath="/news"
        labels={{
          heroTitle: "お知らせ一覧",
          empty: "現在お知らせはありません。",
        }}
      />
    </PageShell>
  );
}
