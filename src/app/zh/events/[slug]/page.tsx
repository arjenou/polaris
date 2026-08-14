import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import EventDetailPage from "@/components/events/EventDetailPage";
import { getAllEventSlugs, getEventBySlug, getOtherEvents } from "@/lib/events";

const labelsZh = {
  home: "首页",
  eventsIndex: "公司活动",
  overviewTitle: "活动概要",
  overview: {
    eventName: "活动名称",
    datetime: "举办时间",
    venue: "举办地点",
    participants: "参加人数",
    content: "活动内容",
    organizer: "主办方",
  },
  galleryTitle: "活动相册",
  gallerySubtitle: "为您展示当天精彩瞬间。",
  galleryHint: "※点击照片可查看大图。",
  otherEventsTitle: "其他公司活动",
};

export async function generateStaticParams() {
  return (await getAllEventSlugs("zh")).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug("zh", slug);
  return {
    title: event ? `${event.title} | Polaris Group` : "公司活动 | Polaris Group",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug("zh", slug);
  if (!event) notFound();

  return (
    <PageShell locale="zh">
      <EventDetailPage
        event={event}
        otherEvents={await getOtherEvents("zh", slug)}
        basePath="/zh/events"
        homeHref="/zh"
        labels={labelsZh}
      />
    </PageShell>
  );
}
