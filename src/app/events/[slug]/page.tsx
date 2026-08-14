import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import EventDetailPage from "@/components/events/EventDetailPage";
import { getAllEventSlugs, getEventBySlug, getOtherEvents } from "@/lib/events";

export async function generateStaticParams() {
  return (await getAllEventSlugs("ja")).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug("ja", slug);
  return {
    title: event ? `${event.title} | ポラリス・グループ` : "社内イベント | ポラリス・グループ",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug("ja", slug);
  if (!event) notFound();

  return (
    <PageShell locale="ja">
      <EventDetailPage
        event={event}
        otherEvents={await getOtherEvents("ja", slug)}
        basePath="/events"
        homeHref="/"
      />
    </PageShell>
  );
}
