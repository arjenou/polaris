import PageShell from "@/components/layout/PageShell";
import EventsListPageSkeleton from "@/components/events/EventsListPageSkeleton";

export default function Loading() {
  return (
    <PageShell locale="ja">
      <EventsListPageSkeleton />
    </PageShell>
  );
}
