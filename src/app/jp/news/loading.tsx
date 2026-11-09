import PageShell from "@/components/layout/PageShell";
import NewsListPageSkeleton from "@/components/news/NewsListPageSkeleton";

export default function Loading() {
  return (
    <PageShell locale="ja">
      <NewsListPageSkeleton />
    </PageShell>
  );
}
