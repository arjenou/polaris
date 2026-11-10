import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageFallbackNotice from "@/components/layout/LanguageFallbackNotice";
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
  const own = await getEventBySlug("zh", slug);
  const event = own ?? (await getEventBySlug("ja", slug));
  return {
    title: event ? `${event.title} | Polaris Group` : "公司活动 | Polaris Group",
    // The other language's original stands in when there is no translation;
    // keep that duplicate out of search results.
    robots: own ? undefined : { index: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const own = await getEventBySlug("zh", slug);
  // No Chinese version: show the Japanese original instead of a 404, so the
  // language switch always stays on the same article.
  const event = own ?? (await getEventBySlug("ja", slug));
  if (!event) notFound();

  // Link to the translation linked in the CMS, else to the same slug in the
  // other locale (which itself falls back to this article if it has none).
  const alternateHref = `/jp/events/${own ? (event.translationSlug ?? slug) : slug}`;

  return (
    <PageShell
      locale="zh"
      alternateHref={alternateHref}
    >
      {!own && <LanguageFallbackNotice locale="zh" />}
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
