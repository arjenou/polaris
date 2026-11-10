import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageFallbackNotice from "@/components/layout/LanguageFallbackNotice";
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
  const own = await getEventBySlug("ja", slug);
  const event = own ?? (await getEventBySlug("zh", slug));
  return {
    title: event ? `${event.title} | ポラリス・グループ` : "社内イベント | ポラリス・グループ",
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
  const own = await getEventBySlug("ja", slug);
  // No Japanese version: show the Chinese original instead of a 404, so the
  // language switch always stays on the same article.
  const event = own ?? (await getEventBySlug("zh", slug));
  if (!event) notFound();

  // Link to the translation linked in the CMS, else to the same slug in the
  // other locale (which itself falls back to this article if it has none).
  const alternateHref = `/zh/events/${own ? (event.translationSlug ?? slug) : slug}`;

  return (
    <PageShell
      locale="ja"
      alternateHref={alternateHref}
    >
      {!own && <LanguageFallbackNotice locale="ja" />}
      <EventDetailPage
        event={event}
        otherEvents={await getOtherEvents("ja", slug)}
        basePath="/jp/events"
        homeHref="/jp"
      />
    </PageShell>
  );
}
