import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import EventsListPage from "@/components/events/EventsListPage";
import { getAllEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "公司活动列表 | Polaris Group",
};

export default async function Page() {
  const events = await getAllEvents("zh");

  return (
    <PageShell locale="zh">
      <EventsListPage
        events={events}
        basePath="/zh/events"
        labels={{
          heroTitle: "公司活动列表",
          empty: "暂无相关活动。",
        }}
      />
    </PageShell>
  );
}
