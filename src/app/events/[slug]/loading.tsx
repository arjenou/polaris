import PageShell from "@/components/layout/PageShell";
import EventDetailPageSkeleton from "@/components/events/EventDetailPageSkeleton";

export default function Loading() {
  return (
    <PageShell locale="ja">
      <EventDetailPageSkeleton />
    </PageShell>
  );
}
