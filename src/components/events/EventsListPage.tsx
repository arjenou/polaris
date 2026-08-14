import Image from "next/image";
import Link from "next/link";
import type { EventCard } from "@/lib/events";
import styles from "./EventsListPage.module.css";

export interface EventsListLabels {
  heroTitle: string;
  empty: string;
}

export default function EventsListPage({
  events,
  basePath,
  labels,
}: {
  events: EventCard[];
  basePath: string;
  labels: EventsListLabels;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>{labels.heroTitle}</h1>

        {events.length === 0 ? (
          <p className={styles.empty}>{labels.empty}</p>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <Link key={event.slug} href={`${basePath}/${event.slug}`} className={styles.card}>
                <div className={styles.imageWrap}>
                  {event.image && (
                    <Image
                      src={event.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={styles.image}
                    />
                  )}
                  <span className={styles.badge} style={{ backgroundColor: event.badgeColor }}>
                    {event.badge}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.date}>{event.dateRange ?? event.date}</span>
                  <h2 className={styles.cardTitle}>{event.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
