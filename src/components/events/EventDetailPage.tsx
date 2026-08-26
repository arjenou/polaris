import Image from "next/image";
import type { EventCard, EventDetail } from "@/lib/events";
import Breadcrumb from "@/components/layout/Breadcrumb";
import EventGallery from "./EventGallery";
import EventVideo from "./EventVideo";
import OtherEventsCarousel from "./OtherEventsCarousel";
import styles from "./EventDetailPage.module.css";

export interface EventDetailLabels {
  home: string;
  eventsIndex: string;
  overviewTitle: string;
  overview: {
    eventName: string;
    datetime: string;
    venue: string;
    participants: string;
    content: string;
    organizer: string;
  };
  galleryTitle: string;
  gallerySubtitle: string;
  galleryHint: string;
  otherEventsTitle: string;
}

export const defaultEventDetailLabels: EventDetailLabels = {
  home: "ホーム",
  eventsIndex: "社内イベント",
  overviewTitle: "開催概要",
  overview: {
    eventName: "イベント名",
    datetime: "開催日時",
    venue: "会場",
    participants: "参加者",
    content: "内容",
    organizer: "主催",
  },
  galleryTitle: "イベントギャラリー",
  gallerySubtitle: "当日の楽しい瞬間を写真でご紹介します。",
  galleryHint: "※写真をクリックすると拡大してご覧いただけます。",
  otherEventsTitle: "その他の社内イベント",
};

export default function EventDetailPage({
  event,
  otherEvents,
  basePath,
  homeHref,
  labels = defaultEventDetailLabels,
}: {
  event: EventDetail;
  otherEvents: EventCard[];
  basePath: string;
  homeHref: string;
  labels?: EventDetailLabels;
}) {
  const heroImage = event.heroImage ?? event.image;
  const overview = event.overview;

  return (
    <>
      <Breadcrumb
        items={[
          { label: labels.home, href: homeHref },
          { label: labels.eventsIndex, href: basePath },
          { label: event.title },
        ]}
      />

      <article className={styles.section}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{event.title}</h1>

          <div className={styles.meta}>
            <span className={styles.date}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={styles.metaIcon}
              >
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {event.dateRange ?? event.date}
            </span>
            <span className={styles.tag}>{event.badge}</span>
          </div>

          {event.summary && <p className={styles.summary}>{event.summary}</p>}

          <div className={styles.mainRow}>
            <div className={styles.heroWrap}>
              {event.videoUrl ? (
                <EventVideo url={event.videoUrl} title={event.title} poster={event.videoPosterImage} />
              ) : (
                heroImage && (
                  <Image
                    src={heroImage}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 58vw"
                    className={styles.heroImage}
                  />
                )
              )}
            </div>

            {overview && (
              <div className={styles.overviewBox}>
                <h2 className={styles.overviewTitle}>{labels.overviewTitle}</h2>
                <dl className={styles.overviewList}>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.eventName}</dt>
                    <dd>{overview.eventName}</dd>
                  </div>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.datetime}</dt>
                    <dd>{overview.datetime}</dd>
                  </div>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.venue}</dt>
                    <dd>{overview.venue}</dd>
                  </div>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.participants}</dt>
                    <dd>{overview.participants}</dd>
                  </div>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.content}</dt>
                    <dd>{overview.content}</dd>
                  </div>
                  <div className={styles.overviewRow}>
                    <dt>{labels.overview.organizer}</dt>
                    <dd>{overview.organizer}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {event.gallery && event.gallery.length > 0 && (
            <section className={styles.gallerySection}>
              <h2 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 6l1.5-2h5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {labels.galleryTitle}
              </h2>
              <p className={styles.sectionSubtitle}>{labels.gallerySubtitle}</p>
              <EventGallery images={event.gallery} alt={event.title} />
              <p className={styles.galleryHint}>{labels.galleryHint}</p>
            </section>
          )}

          {otherEvents.length > 0 && (
            <section className={styles.otherSection}>
              <h2 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 12l-8-8H5a1 1 0 0 0-1 1v7l8 8a1 1 0 0 0 1.4 0l6.6-6.6a1 1 0 0 0 0-1.4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                </svg>
                {labels.otherEventsTitle}
              </h2>
              <OtherEventsCarousel events={otherEvents} basePath={basePath} />
            </section>
          )}
        </div>
      </article>
    </>
  );
}
