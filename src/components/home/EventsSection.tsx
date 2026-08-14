import EventsCarousel from "./EventsCarousel";
import { getAllEvents } from "@/lib/events";
import type { PostLocale } from "@/lib/posts";

interface EventsCarouselLabels {
  title: string;
  subtitle: string;
  more?: string;
}

/** Server-component wrapper that feeds `EventsCarousel` with the events
 * actually published in the CMS, instead of a hardcoded list. */
export default async function EventsSection({
  locale,
  labels,
}: {
  locale: PostLocale;
  labels?: EventsCarouselLabels;
}) {
  const events = await getAllEvents(locale);
  const basePath = locale === "zh" ? "/zh/events" : "/events";

  return <EventsCarousel labels={labels} events={events} basePath={basePath} />;
}
