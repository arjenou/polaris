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

  // Prefer the translation linked in the CMS; otherwise fall back to the same
  // slug in the other locale when it exists (legacy content shares slugs).
  const otherSlug = event.translationSlug ?? ((await getEventBySlug("zh", slug)) ? slug : null);
  const alternateHref = otherSlug ? `/zh/events/${otherSlug}` : undefined;

  return (
    <PageShell
      locale="ja"
      alternateHref={alternateHref}
    >
      <EventDetailPage
        event={event}
        otherEvents={await getOtherEvents("ja", slug)}
        basePath="/jp/events"
        homeHref="/jp"
      />
    </PageShell>
  );
}
