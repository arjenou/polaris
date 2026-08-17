import PageShell from "@/components/layout/PageShell";
import NewsDetailPageSkeleton from "@/components/news/NewsDetailPageSkeleton";

export default function Loading() {
  return (
    <PageShell locale="ja">
      <NewsDetailPageSkeleton />
    </PageShell>
  );
}
