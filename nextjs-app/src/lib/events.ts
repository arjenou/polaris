import { companyEvents, type CompanyEvent } from "@/data/events";
import { companyEventsZh } from "@/data/events.zh";

export type EventLocale = "ja" | "zh";

function eventsFor(locale: EventLocale): CompanyEvent[] {
  return locale === "zh" ? companyEventsZh : companyEvents;
}

export function getAllEventSlugs(locale: EventLocale): string[] {
  return eventsFor(locale).map((event) => event.slug);
}

export function getEventBySlug(locale: EventLocale, slug: string): CompanyEvent | null {
  return eventsFor(locale).find((event) => event.slug === slug) ?? null;
}

export function getOtherEvents(locale: EventLocale, slug: string): CompanyEvent[] {
  return eventsFor(locale).filter((event) => event.slug !== slug);
}
