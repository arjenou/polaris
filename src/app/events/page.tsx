import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import EventsListPage from "@/components/events/EventsListPage";
import { getAllEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "社内イベント一覧 | ポラリス・グループ",
};

export default async function Page() {
  const events = await getAllEvents("ja");

  return (
    <PageShell locale="ja">
      <EventsListPage
        events={events}
        basePath="/events"
        labels={{
          heroTitle: "社内イベント一覧",
          empty: "現在イベントはありません。",
        }}
      />
    </PageShell>
  );
}
