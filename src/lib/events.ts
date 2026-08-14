export type EventLocale = "ja" | "zh";

export interface EventOverview {
  eventName: string;
  datetime: string;
  venue: string;
  participants: string;
  content: string;
  organizer: string;
}

export interface EventCard {
  slug: string;
  title: string;
  date: string;
  dateRange: string | null;
  badge: string;
  badgeColor: string;
  image: string | null;
}

export interface EventDetail extends EventCard {
  summary: string | null;
  heroImage: string | null;
  videoUrl: string | null;
  overview: EventOverview | null;
  gallery: string[];
}

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

/** Event pages are revalidated periodically so edits made in the CMS admin
 * show up without a full redeploy of the Vercel site. */
const REVALIDATE_SECONDS = 300;

export async function getAllEvents(locale: EventLocale): Promise<EventCard[]> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/events?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAllEventSlugs(locale: EventLocale): Promise<string[]> {
  const events = await getAllEvents(locale);
  return events.map((event) => event.slug);
}

export async function getEventBySlug(locale: EventLocale, slug: string): Promise<EventDetail | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/events?locale=${locale}&slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getOtherEvents(locale: EventLocale, slug: string): Promise<EventCard[]> {
  const events = await getAllEvents(locale);
  return events.filter((event) => event.slug !== slug);
}
