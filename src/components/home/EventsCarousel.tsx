"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { companyEvents as defaultEvents, type CompanyEvent } from "@/data/events";
import styles from "./EventsCarousel.module.css";

function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 600) setCount(1);
      else if (w <= 900) setCount(2);
      else if (w <= 1100) setCount(3);
      else setCount(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

interface EventsCarouselLabels {
  title: string;
  subtitle: string;
}

const defaultLabels: EventsCarouselLabels = {
  title: "社内イベント",
  subtitle:
    "忘年会・社内イベントなど、ポラリスグループの活動風景をご紹介します（写真・日程はサンプルです）",
};

export default function EventsCarousel({
  labels = defaultLabels,
  events = defaultEvents,
  basePath = "/events",
}: {
  labels?: EventsCarouselLabels;
  events?: CompanyEvent[];
  basePath?: string;
}) {
  const visibleCount = useVisibleCount();
  const [startIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, events.length - visibleCount);

  useEffect(() => {
    setStartIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const goPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  return (
    <section id="events" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.bar} />
            {labels.title}
          </h2>
          <p className={styles.subtitle}>{labels.subtitle}</p>
        </div>

        <div className={styles.carouselWrap}>
          {startIndex > 0 && (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnPrev}`}
              onClick={goPrev}
              aria-label="前へ"
            >
              ‹
            </button>
          )}

          <div className={styles.track}>
            <div
              className={styles.trackInner}
              style={{
                transform: `translateX(-${(startIndex * 100) / visibleCount}%)`,
              }}
            >
              {events.map((event) => (
                <div
                  key={event.slug}
                  className={styles.card}
                  style={{ flexBasis: `${100 / visibleCount}%` }}
                >
                  <Link href={`${basePath}/${event.slug}`} className={styles.cardLink}>
                    <div className={styles.photo}>
                      <Image
                        src={event.photo}
                        alt={event.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 25vw"
                        className={styles.photoImage}
                      />
                      <span
                        className={styles.badge}
                        style={{ backgroundColor: event.badgeColor }}
                      >
                        {event.badge}
                      </span>
                    </div>
                    <div className={styles.eventTitle}>{event.title}</div>
                    <div className={styles.eventDate}>{event.date}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {startIndex < maxStart && (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              onClick={goNext}
              aria-label="次へ"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
